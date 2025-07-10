import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";

/**
 * 校验 JWT 并返回用户信息，token 可以是 Bearer token 或裸 token
 * @param token 前端传来的 access_token
 * @returns { user, error }
 */
export async function verifySupabaseJwt(token: string): Promise<{ user: User | null, error: string | null }> {
  if (!token) return { user: null, error: "No token provided" };

  // 创建临时 supabase client，注入 token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      global: {
        headers: {
          Authorization: `Bearer ${token.replace(/^Bearer /, "")}`,
        },
      },
    }
  );

  // 校验 token 并获取用户
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
} 