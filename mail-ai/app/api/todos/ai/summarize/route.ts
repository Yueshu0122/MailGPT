import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const { email } = body;
    const user_id = user.id;

    if (!email || !user_id) {
      return NextResponse.json({ success: false, error: "Missing email or user_id" }, { status: 400 });
    }

    const response = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content: `You are an intelligent email task recognizer. Please analyze the email content and return results in JSON format.

Return format:
{
  "is_task": boolean,
  "content": "Task description (if it's a task) within 140 characters",
  "due_at": "Due date in ISO format (if available)"
}

If the email is not a task (e.g., notification, advertisement, spam), set is_task to false and leave other fields empty.`
        },
        {
          role: "user",
          content: `Analyze the following email content:

${JSON.stringify(email, null, 2)}`
        }
      ],
    });

    let result;
    try {
      // 清理AI返回内容中的markdown代码块格式
      let cleanText = response.text.trim();
      
      // 移除可能的markdown代码块标记
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '');
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '');
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/\s*```$/, '');
      }
      
      result = JSON.parse(cleanText);
      console.log("[AI Summarize] Result:", result);
    } catch (error) {
      console.error("[AI Summarize] Error:", error);
      console.error("[AI Summarize] Raw response:", response.text);
      return NextResponse.json({ success: false, error: "AI response parsing error" }, { status: 500 });
    }

    const { is_task, content, due_at } = result;

    if (is_task && content) {
      const task = {
        user_id,
        email_address: email.to,
        email_uid: email.uid,
        content,
        status: "pending",
        due_at: due_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 保存任务到数据库
      await db.execute(sql`
        INSERT INTO public."ToDos" (user_id, email_address, email_uid, content, status, due_at, created_at, updated_at)
        VALUES (${task.user_id}, ${task.email_address}, ${task.email_uid}, ${task.content}, ${task.status}, ${task.due_at}, ${task.created_at}, ${task.updated_at})
      `);

      return NextResponse.json({ 
        success: true, 
        data: { 
          task,
          message: "Task has been successfully recognized and saved" 
        } 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        data: { 
          is_task: false,
          message: "This email is not a task" 
        } 
      });
    }
  } catch (error) {
    console.error("[AI Summarize] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
});
