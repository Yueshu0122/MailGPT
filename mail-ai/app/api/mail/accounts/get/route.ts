import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";

// 只允许 GET
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    // 获取当前用户的所有邮箱账户
    const accounts = await db
      .select()
      .from(emailAccounts)
      .where(sql`${emailAccounts.userId} = ${user.id}`);

    return NextResponse.json({ 
      success: true, 
      accounts 
    });
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
});
