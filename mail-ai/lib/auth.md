# 认证工具使用说明

## 概述

`lib/auth.ts` 提供了统一的JWT认证功能，用于验证API请求中的Authorization header。

## 功能

### 1. `authenticateRequest(req: NextRequest): Promise<AuthResult>`

直接验证请求的认证信息。

**参数:**
- `req`: NextRequest对象

**返回值:**
```typescript
interface AuthResult {
  user: any;        // 用户信息（验证成功时）
  error?: string;   // 错误信息（验证失败时）
}
```

**使用示例:**
```typescript
import { authenticateRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user, error } = await authenticateRequest(req);
  
  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  // 继续处理业务逻辑
  // user.id 可以获取用户ID
}
```

### 2. `withAuth(handler: Function): Function`

高阶函数，自动处理认证逻辑。

**参数:**
- `handler`: 实际的API处理函数，接收 `(req: NextRequest, user: any)` 参数

**返回值:**
- 包装后的处理函数，自动处理认证失败的情况

**使用示例:**
```typescript
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: any) => {
  // 这里已经通过了认证，可以直接使用 user 对象
  const userId = user.id;
  
  // 处理业务逻辑
  return NextResponse.json({ success: true });
});
```

## 错误处理

认证失败时会自动返回401状态码和错误信息：

```json
{
  "success": false,
  "error": "Authorization header is required"
}
```

可能的错误信息：
- "Authorization header is required" - 缺少Authorization header
- "Bearer token is required" - 缺少Bearer token
- "Invalid or expired token" - 无效或过期的token
- "Authentication failed" - 认证过程发生错误

## 最佳实践

1. **推荐使用 `withAuth` 高阶函数**，它提供了更简洁的API和统一的错误处理。

2. **在需要自定义认证逻辑时使用 `authenticateRequest`**，比如需要特殊的错误处理或额外的验证步骤。

3. **确保前端发送正确的Authorization header**：
   ```javascript
   const response = await fetch('/api/endpoint', {
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## 示例API路由

### 使用 withAuth（推荐）
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, user: any) => {
  // 用户已通过认证
  return NextResponse.json({ 
    success: true, 
    userId: user.id 
  });
});

export const POST = withAuth(async (req: NextRequest, user: any) => {
  const data = await req.json();
  // 处理数据...
  return NextResponse.json({ success: true });
});
```

### 使用 authenticateRequest
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { user, error } = await authenticateRequest(req);
  
  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  return NextResponse.json({ 
    success: true, 
    userId: user.id 
  });
}
``` 