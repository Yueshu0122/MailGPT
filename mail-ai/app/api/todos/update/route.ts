import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const { id, content, status, due_at, email_address, email_uid } = body;
    const user_id = user.id;
    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing todo id" }, { status: 400 });
    }
    const result = await db.execute(sql`
      UPDATE public."ToDos"
      SET content = ${content}, status = ${status}, due_at = ${due_at}, email_address = ${email_address}, email_uid = ${email_uid}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user_id}
      RETURNING *
    `);
    if (!result[0]) {
      return NextResponse.json({ success: false, error: "ToDo not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[ToDos Update] Error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}); 