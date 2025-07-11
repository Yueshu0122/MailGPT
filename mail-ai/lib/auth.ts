import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseJwt } from "@/lib/supabase/verifyJwt";

export interface AuthResult {
  user: any;
  error?: string;
}

/**
 * 从请求中解析Authorization header并验证JWT
 * @param req NextRequest对象
 * @returns Promise<AuthResult> 包含用户信息或错误信息
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  try {
    // 1. 解析 Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return { user: null, error: "Authorization header is required" };
    }

    const token = authHeader.replace(/^Bearer /, "");
    if (!token) {
      return { user: null, error: "Bearer token is required" };
    }

    // 2. 校验 JWT
    const { user, error } = await verifySupabaseJwt(token);
    if (!user) {
      return { user: null, error: error || "Invalid or expired token" };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { user: null, error: "Authentication failed" };
  }
}

/**
 * 创建认证中间件，用于API路由
 * @param handler 实际的API处理函数
 * @returns 包装后的处理函数
 */
export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { user, error } = await authenticateRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: error || "Unauthorized" }, 
        { status: 401 }
      );
    }

    return handler(req, user);
  };
} 