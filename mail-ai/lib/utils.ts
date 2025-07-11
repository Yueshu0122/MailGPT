import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";
import Imap from "node-imap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 验证邮箱账户归属
 */
export async function verifyEmailAccount(accountId: string, userId: string) {
  const account = await db
    .select()
    .from(emailAccounts)
    .where(sql`${emailAccounts.id} = ${accountId} AND ${emailAccounts.userId} = ${userId}`)
    .limit(1);

  if (account.length === 0) {
    return null;
  }
  return account[0];
}

/**
 * 获取邮箱账户的解密密码
 */
export async function getEmailAccountPassword(encryptedPasswordId: string) {
  const secretResult = await db.execute(
    sql`SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = ${encryptedPasswordId}`
  );
  if (!secretResult || !secretResult[0] || !secretResult[0].decrypted_secret) {
    return null;
  }
  return secretResult[0].decrypted_secret as string;
}

/**
 * 创建 IMAP 连接实例
 */
export function createImapConnection(emailAccount: any, password: string) {
  return new Imap({
    user: emailAccount.emailAddress!,
    password: password,
    host: emailAccount.imapServerAddress!,
    port: emailAccount.imapServerPort!,
    tls: emailAccount.imapEncryption === "SSL/TLS",
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
    connTimeout: 10000,
    keepalive: true,
  });
}
