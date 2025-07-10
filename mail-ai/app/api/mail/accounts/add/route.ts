import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseJwt } from "@/lib/supabase/verifyJwt";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";


// 只允许 POST
export async function POST(req: NextRequest) {
  // 1. 解析 Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer /, "") || "";

  // 2. 校验 JWT
  const { user, error } = await verifySupabaseJwt(token);
  if (!user) {
    return NextResponse.json({ success: false, error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const name = user.id;

    // 解析 JSON body
    const data = await req.json();
    const password = data.password;
    const email = data.email;
    const imapServerAddress = data.imapServerAddress;
    const imapServerPort = data.imapServerPort;
    const imapEncryption = data.imapEncryption;
    const smtpServerAddress = data.smtpServerAddress;
    const smtpServerPort = data.smtpServerPort;
    const smtpEncryption = data.smtpEncryption;

    // 在同一个事务中执行加密和插入
    await db.transaction(async (tx) => {
      const result = await tx.execute(
        sql`SELECT vault.create_secret(${password}, ${email},${name})`
      );
      const createdSecret = (result as any)[0];
      const secretId = createdSecret.create_secret;

      await tx.insert(emailAccounts).values({
        emailAddress: email,
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
}
