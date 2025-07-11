import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const { content, status, due_at, email_address, email_uid } = body;
    const user_id = user.id;
    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 401 });
    }
    const result = await db.execute(sql`
      INSERT INTO public."ToDos" (user_id, content, status, due_at, email_address, email_uid)
      VALUES (${user_id}, ${content}, ${status}, ${due_at}, ${email_address}, ${email_uid})
      RETURNING *
    `);
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("[ToDos Add] Error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
});
