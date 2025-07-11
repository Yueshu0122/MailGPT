import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";
import Imap from "node-imap";
import { simpleParser } from "mailparser";

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  text: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    partID?: string;
    contentId?: string;
  }>;
  flags: string[];
  uid: number;
}

// 只允许 GET
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    // 从URL参数获取邮箱账户ID和邮件UID
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const uid = searchParams.get('uid');
    
    if (!accountId || !uid) {
      return NextResponse.json(
        { success: false, error: "Account ID and UID are required" }, 
        { status: 400 }
      );
    }

    // 1. 验证邮箱账户是否存在且属于当前用户
    const account = await db
      .select()
      .from(emailAccounts)
      .where(sql`${emailAccounts.id} = ${accountId} AND ${emailAccounts.userId} = ${user.id}`)
      .limit(1);

    if (account.length === 0) {
      return NextResponse.json(
        { success: false, error: "Email account not found or access denied" }, 
        { status: 404 }
      );
    }

    const emailAccount = account[0];

    // 2. 从vault获取邮箱密码
    const secretResult = await db.execute(
      sql`SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = ${emailAccount.encryptedPassword}`
    );
    
    if (!secretResult || !secretResult[0] || !secretResult[0].decrypted_secret) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve email password" }, 
        { status: 500 }
      );
    }

    const password = secretResult[0].decrypted_secret as string;

    // 3. 配置IMAP连接
    const imap = new Imap({
      user: emailAccount.emailAddress!,
      password: password,
      host: emailAccount.imapServerAddress!,
      port: emailAccount.imapServerPort!,
      tls: emailAccount.imapEncryption === 'SSL/TLS',
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
      connTimeout: 10000,
      keepalive: true,
    });

    // 4. 使用Promise包装IMAP操作
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        console.log(`✅ IMAP connection established for email detail: ${emailAccount.emailAddress}`);
        
        // 打开收件箱
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('❌ Failed to open INBOX:', err);
            imap.end();
            resolve(NextResponse.json(
              { success: false, error: "Failed to open inbox" }, 
              { status: 500 }
            ));
            return;
          }
          
          console.log(`📬 Opened INBOX for email detail`);

          // 5. 获取指定UID的邮件
          console.log(`🔍 Fetching email with UID: ${uid}`);
          imap.search([['UID', uid]], (err, uids) => {
            if (err) {
              console.error('❌ Search failed:', err);
              imap.end();
              resolve(NextResponse.json(
                { success: false, error: "Failed to search email" }, 
                { status: 500 }
              ));
              return;
            }

            if (uids.length === 0) {
              imap.end();
              resolve(NextResponse.json(
                { success: false, error: "Email not found" }, 
                { status: 404 }
              ));
              return;
            }

            // 获取邮件内容
            const fetch = imap.fetch(uids[0], { bodies: ['HEADER', 'TEXT'] });
            
            fetch.on('message', (msg, seqno) => {
              let header = '';
              let text = '';
              
              msg.on('body', (stream, info) => {
                if (info.which === 'HEADER') {
                  stream.on('data', (chunk) => {
                    header += chunk.toString('utf8');
                  });
                } else if (info.which === 'TEXT') {
                  stream.on('data', (chunk) => {
                    text += chunk.toString('utf8');
                  });
                }
              });
              
              msg.once('end', async () => {
                try {
                  // 6. 解析邮件内容
                  const fullEmail = `${header}\n\n${text}`;
                  const parsed = await simpleParser(fullEmail);

                  // 提取发件人和收件人信息
                  const extractEmailAddress = (addressObj: any) => {
                    if (!addressObj) return '';
                    if (Array.isArray(addressObj)) {
                      return addressObj[0]?.text || addressObj[0]?.address || '';
                    }
                    return addressObj.text || addressObj.address || '';
                  };

                  const emailData: EmailMessage = {
                    id: uids[0].toString(),
                    subject: parsed.subject || '(No Subject)',
                    from: extractEmailAddress(parsed.from),
                    to: extractEmailAddress(parsed.to),
                    date: parsed.date?.toISOString() || new Date().toISOString(),
                    text: parsed.text || '',
                    html: parsed.html || undefined,
                    attachments: parsed.attachments.map((att: any) => ({
                      filename: att.filename || 'unknown',
                      contentType: att.contentType || 'application/octet-stream',
                      size: att.size || 0,
                      partID: att.partId || undefined,
                      contentId: att.contentId || undefined,
                    })),
                    flags: [], // 暂时不获取标志
                    uid: uids[0],
                  };

                  imap.end();
                  console.log(`🔌 IMAP connection closed for email detail`);

                  resolve(NextResponse.json({ 
                    success: true, 
                    email: emailData
                  }));
                } catch (error) {
                  console.error('Error parsing email:', error);
                  imap.end();
                  resolve(NextResponse.json(
                    { success: false, error: "Failed to parse email" }, 
                    { status: 500 }
                  ));
                }
              });
            });
            
            fetch.once('error', (err) => {
              console.error('❌ Fetch error:', err);
              imap.end();
              resolve(NextResponse.json(
                { success: false, error: "Failed to fetch email" }, 
                { status: 500 }
              ));
            });
          });
        });
      });

      imap.once('error', (err) => {
        console.error('❌ IMAP connection error:', err);
        resolve(NextResponse.json(
          { success: false, error: "IMAP connection failed" }, 
          { status: 503 }
        ));
      });

      imap.once('end', () => {
        console.log(`🔌 IMAP connection ended for email detail`);
      });

      imap.connect();
    });

  } catch (error) {
    console.error("Error fetching email detail:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('authentication')) {
      return NextResponse.json(
        { success: false, error: "Invalid email credentials" }, 
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('connection')) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to email server" }, 
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    );
  }
}); 