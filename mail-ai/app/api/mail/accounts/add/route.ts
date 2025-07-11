import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";


// 只允许 POST
export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const name = user.id;

    // 解析 JSON body
    const data = await req.json();
    console.log(data);
    const password = data.password;
    const emailAddress = data.emailAddress;
    const imapServerAddress = data.imapServerAddress;
    const imapServerPort = data.imapServerPort;
    const imapEncryption = data.imapEncryption;
    const smtpServerAddress = data.smtpServerAddress;
    const smtpServerPort = data.smtpServerPort;
    const smtpEncryption = data.smtpEncryption;

    // 在同一个事务中执行加密和插入
    await db.transaction(async (tx) => {
      const result = await tx.execute(
        sql`SELECT vault.create_secret(${password}, ${emailAddress},${name})`
      );
      const createdSecret = (result as any)[0];
      const secretId = createdSecret.create_secret;

      await tx.insert(emailAccounts).values({
        userId: name,
        emailAddress: emailAddress,
        encryptedPassword: secretId,
        imapServerAddress: imapServerAddress,
        imapServerPort: imapServerPort,
        imapEncryption: imapEncryption,
        smtpServerAddress: smtpServerAddress,
        smtpServerPort: smtpServerPort,
        smtpEncryption: smtpEncryption,
      });
    });



    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
});
