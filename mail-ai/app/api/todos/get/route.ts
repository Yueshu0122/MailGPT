import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const page = parseInt(body.page || "1", 10);
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const user_id = user.id;
    
    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 401 });
    }

    // 使用 Drizzle ORM 查询构建器，性能更好
    const result = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user_id))
      .orderBy(desc(todos.createdAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[ToDos Get] Error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}); 