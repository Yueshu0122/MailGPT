import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const todoId = body.id;
    const user_id = user.id;
    if (!todoId || !user_id) {
      return NextResponse.json({ success: false, error: "Missing id or user_id" }, { status: 400 });
    }
    // 检查todo是否属于当前用户
    const check = await db.execute(sql`
      SELECT id FROM public."ToDos" WHERE id = ${todoId} AND user_id = ${user_id}
    `);
    if (!check || check.length === 0) {
      return NextResponse.json({ success: false, error: "ToDo not found or unauthorized" }, { status: 403 });
    }
    // 删除todo
    await db.execute(sql`
      DELETE FROM public."ToDos" WHERE id = ${todoId} AND user_id = ${user_id}
    `);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ToDos Delete] Error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}); 