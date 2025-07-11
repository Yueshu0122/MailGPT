import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/db";
import { emailAccounts } from "@/db/schema";
import { sql } from "drizzle-orm";

// 只允许 PUT
export async function PUT(req: NextRequest) {
  // 使用 authenticateRequest 进行认证
  const { user, error } = await authenticateRequest(req);
  
  if (!user) {
    // 自定义错误响应格式
    return NextResponse.json({ 
      success: false, 
      error: error || "Authentication failed",
      code: "AUTH_ERROR"
    }, { status: 401 });
  }

  try {
    // 解析请求体
    const data = await req.json();
    const accountId = data.id;
    const updates = data.updates;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" }, 
        { status: 400 }
      );
    }

    // 验证用户是否有权限更新这个账户
    const existingAccount = await db
      .select()
      .from(emailAccounts)
      .where(sql`${emailAccounts.id} = ${accountId} AND ${emailAccounts.userId} = ${user.id}`)
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json(
        { success: false, error: "Account not found or access denied" }, 
        { status: 404 }
      );
    }

    // 更新账户信息
    const result = await db
      .update(emailAccounts)
      .set({
        ...updates,
        // 确保不能修改用户ID
        userId: user.id
      })
      .where(sql`${emailAccounts.id} = ${accountId} AND ${emailAccounts.userId} = ${user.id}`)
      .returning();

    return NextResponse.json({ 
      success: true, 
      account: result[0],
      message: "Email account updated successfully" 
    });
  } catch (error) {
    console.error("Error updating email account:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 