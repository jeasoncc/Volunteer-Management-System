# Design Document

## Overview

本设计文档描述了如何使用 better-auth 库在志愿者管理系统中实现账号密码认证功能。设计采用 better-auth 的 Drizzle 适配器与现有数据库集成，使用 username 插件支持账号密码登录，并通过 Elysia 框架提供 RESTful API。

## Architecture

### 系统架构图

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────────────────────────────┐
│         Elysia Server               │
│  ┌───────────────────────────────┐  │
│  │   Better-Auth Handler         │  │
│  │  /api/auth/*                  │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   Better-Auth Core            │  │
│  │  - Session Management         │  │
│  │  - Password Hashing (bcrypt)  │  │
│  │  - Username Plugin            │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   Drizzle Adapter             │  │
│  │  - User CRUD                  │  │
│  │  - Session CRUD               │  │
│  └───────────┬───────────────────┘  │
└──────────────┼───────────────────────┘
               │
       ┌───────▼────────┐
       │  MySQL Database│
       │  - user        │
       │  - session     │
       │  - account     │
       │  - volunteer   │
       └────────────────┘
```

### 技术栈

- **Better-Auth**: 认证核心库
- **Drizzle ORM**: 数据库 ORM
- **Elysia**: Web 框架
- **MySQL**: 数据库
- **bcrypt**: 密码加密（better-auth 内置）

## Components and Interfaces

### 1. Better-Auth 配置 (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 不需要邮箱验证
  },
  plugins: [
    username(), // 启用用户名登录
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7天
    updateAge: 60 * 60 * 24, // 每天更新一次
  },
  advanced: {
    generateId: false, // 使用数据库自增 ID
  },
});
```

### 2. 认证路由模块 (`src/modules/auth/index.ts`)

```typescript
import { Elysia } from 'elysia';
import { auth } from '../../lib/auth';

export const authModule = new Elysia({ prefix: '/api/auth' })
  .all('*', ({ request }) => auth.handler(request));
```

### 3. 认证中间件 (`src/modules/auth/middleware.ts`)

```typescript
import { Elysia } from 'elysia';
import { auth } from '../../lib/auth';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .derive(async ({ request, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    
    return {
      session: session,
      user: session?.user,
      requireAuth: () => {
        if (!session) {
          set.status = 401;
          throw new Error('Unauthorized');
        }
        return session;
      },
    };
  });
```

### 4. 数据库 Schema 扩展

Better-auth 需要以下表结构（会自动创建）：

```typescript
// Better-auth 会自动创建这些表
// - user: 用户基础信息
// - session: 会话信息
// - account: 账号信息（用于多种登录方式）
// - verification: 验证信息（如果启用邮箱验证）
```

我们需要将 better-auth 的 user 表与现有的 volunteer 表关联：

```typescript
// src/db/schema.ts 中添加
export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
  // 关联到 volunteer 表
  volunteerId: int('volunteer_id').references(() => volunteer.id),
});
```

## Data Models

### 注册请求模型

```typescript
interface SignUpRequest {
  name: string;        // 用户名（账号）
  email: string;       // 邮箱（可以使用假邮箱格式）
  password: string;    // 密码（明文，会被加密）
  image?: string;      // 可选头像
}
```

### 登录请求模型

```typescript
interface SignInRequest {
  email: string;       // 邮箱或用户名
  password: string;    // 密码
}
```

### 会话响应模型

```typescript
interface SessionResponse {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    emailVerified: boolean;
  };
}
```

## API Endpoints

### 1. 用户注册

**Endpoint**: `POST /api/auth/sign-up/email`

**Request Body**:
```json
{
  "name": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "password123",
  "image": "https://example.com/avatar.jpg"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "name": "zhangsan",
    "email": "zhangsan@example.com",
    "emailVerified": false
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 用户登录

**Endpoint**: `POST /api/auth/sign-in/email`

**Request Body**:
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "name": "zhangsan",
    "email": "zhangsan@example.com"
  },
  "session": {
    "token": "session_token_here",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 获取当前会话

**Endpoint**: `GET /api/auth/get-session`

**Headers**:
```
Cookie: better-auth.session_token=xxx
```

**Response** (200):
```json
{
  "user": {
    "id": "user_123",
    "name": "zhangsan",
    "email": "zhangsan@example.com"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4. 用户登出

**Endpoint**: `POST /api/auth/sign-out`

**Response** (200):
```json
{
  "success": true
}
```

## Error Handling

### 错误响应格式

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}
```

### 常见错误

1. **账号已存在** (400)
```json
{
  "error": "ACCOUNT_EXISTS",
  "message": "账号已存在",
  "status": 400
}
```

2. **账号不存在** (400)
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "账号或密码错误",
  "status": 400
}
```

3. **密码错误** (400)
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "账号或密码错误",
  "status": 400
}
```

4. **未授权** (401)
```json
{
  "error": "UNAUTHORIZED",
  "message": "未登录或会话已过期",
  "status": 401
}
```

5. **密码强度不足** (400)
```json
{
  "error": "WEAK_PASSWORD",
  "message": "密码至少需要6个字符",
  "status": 400
}
```

## Security Considerations

### 1. 密码安全
- 使用 bcrypt 算法加密密码（better-auth 内置）
- 密码最小长度：6个字符
- 不在任何响应中返回密码或密码哈希

### 2. 会话安全
- 使用 HTTP-only Cookie 存储会话令牌
- 会话令牌使用加密算法生成
- 会话有效期：7天
- 支持会话刷新机制

### 3. CORS 配置
- 配置允许的源域名
- 允许携带凭证（credentials: true）

### 4. 输入验证
- 验证邮箱格式
- 验证密码强度
- 防止 SQL 注入（使用 ORM）
- 防止 XSS 攻击

## Integration with Existing System

### 与 Volunteer 表的集成

1. **注册时创建关联**：
   - 用户通过 better-auth 注册后，在 user 表创建记录
   - 同时在 volunteer 表创建对应记录
   - 通过 volunteerId 字段关联

2. **登录后获取完整信息**：
   - 通过 better-auth 验证身份
   - 根据 user.volunteerId 查询 volunteer 表获取完整信息
   - 返回合并后的用户信息

3. **角色权限管理**：
   - 从 volunteer.lotusRole 获取用户角色
   - 从 admin 表获取管理员权限
   - 在中间件中进行权限验证

### 迁移现有用户

对于已存在的 volunteer 记录，需要：
1. 为每个 volunteer 创建对应的 user 记录
2. 设置初始密码（可以是随机密码，要求首次登录修改）
3. 建立 user 和 volunteer 的关联关系

## Testing Strategy

### 单元测试
- 测试密码加密和验证
- 测试会话创建和验证
- 测试输入验证逻辑

### 集成测试
- 测试完整的注册流程
- 测试完整的登录流程
- 测试会话管理
- 测试登出功能
- 测试错误处理

### 测试用例

1. **注册测试**
   - 成功注册新用户
   - 重复账号注册失败
   - 密码过短注册失败
   - 无效邮箱格式注册失败

2. **登录测试**
   - 正确凭证登录成功
   - 错误密码登录失败
   - 不存在的账号登录失败
   - 登录后获取会话成功

3. **会话测试**
   - 有效会话访问受保护资源成功
   - 无效会话访问受保护资源失败
   - 过期会话自动刷新
   - 登出后会话失效

## Performance Considerations

1. **数据库查询优化**
   - 在 user.email 字段添加索引
   - 在 session.token 字段添加索引
   - 使用连接池管理数据库连接

2. **会话缓存**
   - 考虑使用 Redis 缓存活跃会话
   - 减少数据库查询次数

3. **密码验证**
   - bcrypt 验证是 CPU 密集型操作
   - 考虑限制登录尝试次数
   - 实施速率限制

## Deployment Considerations

1. **环境变量**
   - `BETTER_AUTH_SECRET`: 用于加密会话令牌
   - `BETTER_AUTH_URL`: 应用的基础 URL
   - `DATABASE_URL`: 数据库连接字符串

2. **数据库迁移**
   - 运行 better-auth 的数据库迁移
   - 创建必要的表和索引

3. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 确保 Cookie 的 secure 标志启用
