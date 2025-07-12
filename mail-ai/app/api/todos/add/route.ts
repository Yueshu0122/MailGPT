import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const { uuid, content, status, due_at, email_address, email_uid } = body;
    const user_id = user.id;
    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 401 });
    }

    let result;
    
    // 如果传入了uuid，先查询是否存在
    if (uuid) {
      const existingTodo = await db.execute(sql`
        SELECT * FROM public."ToDos" 
        WHERE uuid = ${uuid} AND user_id = ${user_id}
      `);
      
      if (existingTodo[0]) {
        // 存在则更新
        result = await db.execute(sql`
          UPDATE public."ToDos"
          SET content = ${content}, status = ${status}, due_at = ${due_at}, 
              email_address = ${email_address}, email_uid = ${email_uid}, updated_at = NOW()
          WHERE uuid = ${uuid} AND user_id = ${user_id}
          RETURNING *
        `);
      } else {
        // 不存在则插入
        result = await db.execute(sql`
          INSERT INTO public."ToDos" (user_id, content, status, due_at, email_address, email_uid)
          VALUES (${user_id}, ${content}, ${status}, ${due_at}, ${email_address}, ${email_uid})
          RETURNING *
        `);
      }
    } else {
      // 没有传入uuid，直接插入
      result = await db.execute(sql`
        INSERT INTO public."ToDos" (user_id, content, status, due_at, email_address, email_uid)
        VALUES (${user_id}, ${content}, ${status}, ${due_at}, ${email_address}, ${email_uid})
        RETURNING *
      `);
    }
    
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[ToDos Add] Error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
});
