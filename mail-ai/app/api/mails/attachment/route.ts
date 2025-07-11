import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";
import Imap from "node-imap";
import { verifyEmailAccount, getEmailAccountPassword, createImapConnection } from "@/lib/utils";

export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const uid = searchParams.get("uid");
    const partID = searchParams.get("partID");

    if (!accountId || !uid || !partID) {
      return NextResponse.json(
        { success: false, error: "accountId, uid, partID are required" },
        { status: 400 }
      );
    }

    // 1. 验证邮箱账户
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 }
      );
    }
    const emailAccount = await verifyEmailAccount(accountId, user.id);
    if (!emailAccount) {
      return NextResponse.json(
        { success: false, error: "Email account not found or access denied" },
        { status: 404 }
      );
    }

    // 2. 获取密码
    if (!emailAccount.encryptedPassword) {
      return NextResponse.json(
        { success: false, error: "Email account missing encryptedPassword" },
        { status: 500 }
      );
    }
    const password = await getEmailAccountPassword(emailAccount.encryptedPassword);
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve email password" },
        { status: 500 }
      );
    }

    // 3. 连接IMAP
    const imap = createImapConnection(emailAccount, password);


    return new Promise((resolve, reject) => {
      console.log('[IMAP] Promise started');
      imap.once("ready", () => {
        console.log('[IMAP] Connection ready');
        imap.openBox("INBOX", false, (err, box) => {
          if (err) {
            console.error('[IMAP] Failed to open inbox', err);
            imap.end();
            resolve(
              NextResponse.json(
                { success: false, error: "Failed to open inbox" },
                { status: 500 }
              )
            );
            return;
          }
          console.log('[IMAP] INBOX opened');

          imap.search([["UID", uid]], (err, uids) => {
            if (err || uids.length === 0) {
              console.error('[IMAP] Email not found', err, uids);
              imap.end();
              resolve(
                NextResponse.json(
                  { success: false, error: "Email not found" },
                  { status: 404 }
                )
              );
              return;
            }
            console.log('[IMAP] Email UID found:', uids);

            const fetch = imap.fetch(uids[0], { bodies: "", struct: true });

            fetch.on("message", (msg, seqno) => {
              console.log('[IMAP] Fetch message event', seqno);
              let buffer: Buffer[] = [];
              let found = false;

              msg.on("body", async (stream, info) => {
                // 不处理
                console.log('[IMAP] Message body event (not used)');
              });

              msg.once("attributes", async (attrs) => {
                // 列出所有附件（递归支持嵌套数组和对象）
                function listAllAttachments(parts: any[], result: { partID: any; filename: any }[] = []): { partID: any; filename: any }[] {
                  for (const part of parts) {
                    if (Array.isArray(part)) {
                      listAllAttachments(part, result);
                    } else if (part && typeof part === "object") {
                      if (part.disposition && part.disposition.type && part.disposition.type.toUpperCase() === "ATTACHMENT") {
                        result.push({ partID: part.partID, filename: part.disposition.params?.filename });
                      }
                      if (Array.isArray(part.parts)) {
                        listAllAttachments(part.parts, result);
                      }
                    }
                  }
                  return result;
                }
                // 查找附件part（递归支持嵌套数组和对象）
                function findAttachmentPart(parts: any[]): any {
                  for (const part of parts) {
                    if (Array.isArray(part)) {
                      const found = findAttachmentPart(part);
                      if (found) return found;
                    } else if (part && typeof part === "object") {
                      if (
                        part.disposition &&
                        part.disposition.type &&
                        part.disposition.type.toUpperCase() === "ATTACHMENT" &&
                        part.partID == partID
                      ) {
                        return part;
                      }
                      if (Array.isArray(part.parts)) {
                        const found = findAttachmentPart(part.parts);
                        if (found) return found;
                      }
                    }
                  }
                  return null;
                }

                const part = findAttachmentPart(attrs.struct);
                if (!part) {
                  console.error('[IMAP] Attachment not found by partID', partID);
                  imap.end();
                  resolve(
                    NextResponse.json(
                      { success: false, error: "Attachment not found by partID" },
                      { status: 404 }
                    )
                  );
                  return;
                }
                console.log('[IMAP] Attachment part found:', part);

                const encoding = part.encoding;
                const realFilename = part.disposition?.params?.filename ?? 'attachment';
                console.log('[IMAP] Attachment filename:', realFilename, 'encoding:', encoding);

                // 再次fetch附件内容
                const attFetch = imap.fetch(uids[0], { bodies: [partID] });
                attFetch.on("message", (attMsg, attSeqno) => {
                  console.log('[IMAP] Attachment fetch message', attSeqno);
                  attMsg.on("body", (stream, info) => {
                    console.log('[IMAP] Attachment body stream start');
                    stream.on("data", (chunk) => {
                      buffer.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                      console.log('[IMAP] Attachment body chunk received, size:', chunk.length);
                    });
                    stream.on("end", () => {
                      console.log('[IMAP] Attachment body stream end, buffer length:', buffer.reduce((a, b) => a + b.length, 0));
                    });
                  });
                  attMsg.once("end", () => {
                    found = true;
                    console.log('[IMAP] Attachment message end');
                  });
                });
                attFetch.once("error", (err) => {
                  console.error('[IMAP] Attachment fetch error', err);
                  imap.end();
                  resolve(
                    NextResponse.json(
                      { success: false, error: "Attachment fetch error" },
                      { status: 500 }
                    )
                  );
                });
                attFetch.once("end", () => {
                  console.log('[IMAP] Attachment fetch end, found:', found, 'buffer count:', buffer.length);
                  imap.end();
                  if (!found || buffer.length === 0) {
                    console.error('[IMAP] Attachment fetch failed', found, buffer.length);
                    resolve(
                      NextResponse.json(
                        { success: false, error: "Attachment fetch failed" },
                        { status: 500 }
                      )
                    );
                    return;
                  }
                  let fileBuffer = Buffer.concat(buffer);
                  if (encoding && encoding.toUpperCase() === "BASE64") {
                    let base64Str = fileBuffer.toString("utf8");
                    base64Str = base64Str.replace(/\s+/g, ''); // 移除所有空白字符
                    fileBuffer = Buffer.from(base64Str, "base64");
                  }
                  console.log('fileBuffer type:', typeof fileBuffer, 'isBuffer:', Buffer.isBuffer(fileBuffer), 'length:', fileBuffer.length);
                  const encodedFilename = encodeURIComponent(realFilename);
                  const contentDisposition = `attachment; filename*=UTF-8''${encodedFilename}`;
                  const res = new NextResponse(fileBuffer, {
                    status: 200,
                    headers: {
                      "Content-Type": part.type + "/" + part.subtype,
                      "Content-Disposition": contentDisposition,
                      "Content-Length": fileBuffer.length.toString(),
                    },
                  });
                  resolve(res);
                });
              });
            });

            fetch.once("error", (err) => {
              console.error('[IMAP] Fetch error', err);
              imap.end();
              resolve(
                NextResponse.json(
                  { success: false, error: "Fetch error" },
                  { status: 500 }
                )
              );
            });
          });
        });
      });

      imap.once("error", (err) => {
        console.error('[IMAP] Connection error', err);
        resolve(
          NextResponse.json(
            { success: false, error: "IMAP connection failed" },
            { status: 503 }
          )
        );
      });

      imap.connect();
      console.log('[IMAP] Connecting...');
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});

