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
  }>;
  flags: string[];
  uid: number;
}

// 只允许 GET
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    // 从URL参数获取邮箱账户ID
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" }, 
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
        console.log(`✅ IMAP connection established successfully for ${emailAccount.emailAddress}`);
        
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
          
          console.log(`📬 Opened INBOX for ${emailAccount.emailAddress}`);
          console.log(`📊 Total messages: ${box.messages.total}, Recent: ${box.messages.new}`);

          // 获取邮件列表 - 先尝试获取最近的邮件
          console.log(`🔍 Starting to search for recent emails...`);
          
          // 获取最近的邮件，倒序排列
          imap.search(['ALL'], (err, uids) => {
            if (err) {
              console.error('❌ Search failed:', err);
              imap.end();
              resolve(NextResponse.json(
                { success: false, error: "Failed to search emails" }, 
                { status: 500 }
              ));
              return;
            }
            
            // 倒序排列，获取最新的邮件
            const sortedUids = uids.sort((a, b) => b - a);
            console.log(`✅ Search completed, found ${sortedUids.length} total messages`);
            
            // 只取最近的10条
            const recentUids = sortedUids.slice(0, 10);
            console.log(`📧 Getting latest ${recentUids.length} emails`);
            
            fetchEmailsWithDetails(imap, recentUids, resolve);
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
        console.log(`🔌 IMAP connection ended for ${emailAccount.emailAddress}`);
      });

      imap.connect();
    });

    // 获取邮件内容的函数（只获取头部）
    function fetchEmails(imap: Imap, uids: number[], resolve: any) {
      const messages: EmailMessage[] = [];
      let processedCount = 0;
      
      if (uids.length === 0) {
        imap.end();
        resolve(NextResponse.json({ 
          success: true, 
          emails: [],
          total: 0,
          account: {
            id: emailAccount.id,
            emailAddress: emailAccount.emailAddress,
            imapServer: emailAccount.imapServerAddress,
          }
        }));
        return;
      }

      // 限制处理的邮件数量
      const limitedUids = uids.slice(offset, offset + limit);
      console.log(`📧 Found ${uids.length} emails, processing ${limitedUids.length} emails (offset: ${offset}, limit: ${limit})`);

      limitedUids.forEach((uid) => {
        const fetch = imap.fetch(uid, { bodies: 'HEADER' });
        
        fetch.on('message', (msg, seqno) => {
          let header = '';
          
          msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
              header += chunk.toString('utf8');
            });
          });
          
          msg.once('end', () => {
            try {
              // 解析头部信息
              const emailData = parseEmailHeader(header, uid);
              messages.push(emailData);
              
              // 打印第一条邮件的详细信息
              if (messages.length === 1) {
                console.log('📨 First email details (header only):');
                console.log('  Subject:', emailData.subject);
                console.log('  From:', emailData.from);
                console.log('  To:', emailData.to);
                console.log('  Date:', emailData.date);
                console.log('  UID:', emailData.uid);
                
                // 调试原始头部数据
                console.log('🔍 Raw header data:');
                console.log('  Header text:', header.substring(0, 200) + '...');
              }
            } catch (error) {
              console.error('Error parsing email header:', error);
            }
            
            processedCount++;
            if (processedCount === limitedUids.length) {
              imap.end();
              resolve(NextResponse.json({ 
                success: true, 
                emails: messages,
                total: messages.length,
                account: {
                  id: emailAccount.id,
                  emailAddress: emailAccount.emailAddress,
                  imapServer: emailAccount.imapServerAddress,
                }
              }));
            }
          });
        });
        
        fetch.once('error', (err) => {
          console.error('❌ Fetch error:', err);
          processedCount++;
          if (processedCount === limitedUids.length) {
            imap.end();
            resolve(NextResponse.json({ 
              success: true, 
              emails: messages,
              total: messages.length,
              account: {
                id: emailAccount.id,
                emailAddress: emailAccount.emailAddress,
                imapServer: emailAccount.imapServerAddress,
              }
            }));
          }
        });
      });
    }

    // 获取邮件完整详情的函数
    function fetchEmailsWithDetails(imap: Imap, uids: number[], resolve: any) {
      const messages: EmailMessage[] = [];
      let processedCount = 0;
      
      if (uids.length === 0) {
        imap.end();
        resolve(NextResponse.json({ 
          success: true, 
          emails: [],
          total: 0,
          account: {
            id: emailAccount.id,
            emailAddress: emailAccount.emailAddress,
            imapServer: emailAccount.imapServerAddress,
          }
        }));
        return;
      }

      console.log(`📧 Processing ${uids.length} emails with full details`);

      uids.forEach((uid) => {
        const fetch = imap.fetch(uid, { bodies: ['HEADER', 'TEXT'] });
        
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
              // 解析完整的邮件内容
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
                id: uid.toString(),
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
                uid: uid,
              };
              
              messages.push(emailData);
              
            } catch (error) {
              console.error('Error parsing email:', error);
            }
            
            processedCount++;
            if (processedCount === uids.length) {
              imap.end();
              resolve(NextResponse.json({ 
                success: true, 
                emails: messages,
                total: messages.length,
                account: {
                  id: emailAccount.id,
                  emailAddress: emailAccount.emailAddress,
                  imapServer: emailAccount.imapServerAddress,
                }
              }));
            }
          });
        });
        
        fetch.once('error', (err) => {
          console.error('❌ Fetch error:', err);
          processedCount++;
          if (processedCount === uids.length) {
            imap.end();
            resolve(NextResponse.json({ 
              success: true, 
              emails: messages,
              total: messages.length,
              account: {
                id: emailAccount.id,
                emailAddress: emailAccount.emailAddress,
                imapServer: emailAccount.imapServerAddress,
              }
            }));
          }
        });
      });
    }

    // 解析邮件头部的函数
    function parseEmailHeader(headerText: string, uid: number): EmailMessage {
      const extractHeaderField = (headerText: string, fieldName: string): string => {
        const regex = new RegExp(`^${fieldName}:\\s*(.+)$`, 'im');
        const match = headerText.match(regex);
        return match ? match[1].trim() : '';
      };

      return {
        id: uid.toString(),
        subject: extractHeaderField(headerText, 'Subject') || '(No Subject)',
        from: extractHeaderField(headerText, 'From'),
        to: extractHeaderField(headerText, 'To'),
        date: extractHeaderField(headerText, 'Date') || new Date().toISOString(),
        text: '', // 不获取正文
        html: undefined, // 不获取HTML
        attachments: [], // 不获取附件
        flags: [], // 暂时不获取标志
        uid: uid,
      };
    }

  } catch (error) {
    console.error("Error fetching emails:", error);
    
    // 处理特定的IMAP错误
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
