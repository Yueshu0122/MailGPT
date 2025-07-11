import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";

// 只允许 DELETE
export const DELETE = withAuth(async (req: NextRequest, user: any) => {
  try {
    // 从URL参数获取账户ID和邮箱地址
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('id');
    const emailAddress = searchParams.get('email');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" }, 
        { status: 400 }
      );
    }

    if (!emailAddress) {
      return NextResponse.json(
        { success: false, error: "Email address is required" }, 
        { status: 400 }
      );
    }

    // 在同一个事务中执行两个删除操作
    const result = await db.transaction(async (tx) => {
      // 1. 删除指定用户的指定邮箱账户（确保只能删除自己的账户）
      const deleteResult = await tx
        .delete(emailAccounts)
        .where(sql`${emailAccounts.id} = ${accountId} AND ${emailAccounts.userId} = ${user.id}`)
        .returning();

      if (deleteResult.length === 0) {
        throw new Error("Account not found or access denied");
      }

      // 2. 删除 vault.secrets 中对应的数据
      await tx.execute(sql`DELETE FROM vault.secrets WHERE name = ${emailAddress} AND description = ${user.id}`);

      return deleteResult;
    });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Account not found or access denied" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email account deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting email account:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}); 