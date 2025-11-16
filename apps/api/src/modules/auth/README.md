# Auth 模块

认证模块，处理用户注册、登录、登出等认证相关功能。

## 📁 模块结构

```
src/modules/auth/
├── index.ts      # Controller - 路由定义和请求处理
├── model.ts      # DTO/Schema - 数据传输对象和验证规则
├── errors.ts     # 自定义错误类
├── config.ts     # 路由配置
└── README.md     # 本文档
```

## 🎯 职责划分

### Controller (`index.ts`)
- ✅ 定义认证路由
- ✅ 参数验证
- ✅ 调用 lib/auth.ts 中的认证逻辑
- ✅ JWT token 生成和管理
- ✅ Cookie 管理

### Service Layer (`src/lib/auth.ts`)
- ✅ 用户注册逻辑
- ✅ 用户登录验证
- ✅ 密码加密（bcrypt）
- ✅ 数据库操作

### Model (`model.ts`)
- ✅ DTO Schema 定义
- ✅ 请求验证规则
- ✅ 响应类型定义

### Errors (`errors.ts`)
- ✅ 自定义错误类
- ✅ 错误响应格式化

## 📡 API 端点

### 1. 用户注册
```
POST /api/auth/register
```

**请求体：**
```json
{
  "account": "zhangsan",
  "password": "password123",
  "name": "张三",
  "phone": "13800138000",
  "gender": "male",
  "idNumber": "110101199001011234",
  "email": "zhangsan@example.com"
}
```

**响应：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": 1,
    "account": "zhangsan",
    "name": "张三"
  }
}
```

### 2. 用户登录
```
POST /api/auth/login
```

**请求体：**
```json
{
  "account": "zhangsan",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "account": "zhangsan",
      "name": "张三",
      "role": "volunteer",
      "avatar": null,
      "email": "zhangsan@example.com"
    },
    "adminInfo": null,
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 3. 用户登出
```
POST /api/auth/logout
```

**响应：**
```json
{
  "success": true,
  "message": "登出成功"
}
```

### 4. 获取当前用户
```
GET /api/auth/me
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account": "zhangsan",
    "role": "volunteer"
  }
}
```

## 🔐 安全特性

1. **密码加密**
   - 使用 bcrypt 算法
   - 10轮加密强度
   - 密码最小长度6个字符

2. **JWT Token**
   - 有效期7天
   - 存储在 HTTP-only Cookie 中
   - 包含用户 ID、账号、角色信息

3. **输入验证**
   - 账号最小长度3个字符
   - 密码最小长度6个字符
   - 身份证号18位
   - 手机号最小11位

4. **错误处理**
   - 统一的错误响应格式
   - 不泄露敏感信息
   - 账号和密码错误统一提示

## 🔧 使用示例

### 在其他模块中验证用户身份

```typescript
import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';

const protectedRoute = new Elysia()
  .use(jwt({ 
    name: 'jwt',
    secret: process.env.AUTH_PROFILE!,
    exp: '7d' 
  }))
  .derive(async ({ jwt, cookie: { auth }, set }) => {
    if (!auth.value) {
      set.status = 401;
      throw new Error('未登录');
    }

    const payload = await jwt.verify(auth.value);
    if (!payload) {
      set.status = 401;
      throw new Error('登录已过期');
    }

    return { user: payload };
  })
  .get('/protected', ({ user }) => {
    return {
      message: '这是受保护的资源',
      user,
    };
  });
```

## 📝 错误代码

| 错误代码 | HTTP 状态码 | 说明 |
|---------|-----------|------|
| `UNAUTHORIZED` | 401 | 未登录或登录已过期 |
| `INVALID_CREDENTIALS` | 401 | 账号或密码错误 |
| `ACCOUNT_EXISTS` | 409 | 账号已存在 |
| `ID_NUMBER_EXISTS` | 409 | 身份证号已被注册 |
| `WEAK_PASSWORD` | 400 | 密码强度不足 |
| `MODULE_ACCESS_DENIED` | 403 | 无权访问模块 |

## ⚠️ 注意事项

1. **环境变量**：需要配置 `AUTH_PROFILE` 作为 JWT 密钥
2. **Cookie 安全**：生产环境应启用 HTTPS 和 secure 标志
3. **密码验证**：登录失败不区分账号不存在还是密码错误
4. **Token 刷新**：当前未实现 token 刷新机制，过期需重新登录

## 🔄 架构说明

### 为什么认证逻辑在 lib/auth.ts？

认证逻辑（密码加密、用户验证）放在 `src/lib/auth.ts` 中，而不是 `service.ts`，原因是：

1. **复用性**：认证逻辑可能被多个模块使用
2. **独立性**：认证是基础功能，应该独立于业务模块
3. **清晰性**：Controller 只负责路由和响应，lib 负责核心逻辑

### 模块职责

```
Controller (index.ts)
  ↓ 路由定义、参数验证、响应格式化
Lib (lib/auth.ts)
  ↓ 认证逻辑、密码加密、用户验证
Database (db/schema)
  ↓ 数据持久化
```

## 📝 TODO

- [ ] 添加 token 刷新机制
- [ ] 添加登录失败次数限制
- [ ] 添加验证码功能
- [ ] 添加找回密码功能
- [ ] 添加双因素认证


## 🔄 最近更新 (2024-11-15)

### 统一错误处理

所有认证错误现在继承自 `AppError` 基类，提供统一的错误响应格式：

```typescript
import { UnauthorizedError } from '../../lib/errors/base';

throw new UnauthorizedError('未登录，请先登录');
```

### 可复用认证中间件

认证逻辑已提取为独立中间件，可在任何模块中使用：

```typescript
import { authMiddleware } from '../../lib/middleware/auth';

export const myModule = new Elysia()
  .use(authMiddleware)  // 强制认证
  .get('/protected', ({ user }) => {
    // user 自动注入
    return { userId: user.id };
  });
```

### 可选认证中间件

对于不强制登录的接口：

```typescript
import { optionalAuthMiddleware } from '../../lib/middleware/auth';

export const myModule = new Elysia()
  .use(optionalAuthMiddleware)
  .get('/public', ({ user, isAuthenticated }) => {
    if (isAuthenticated) {
      return { message: '欢迎回来', user };
    }
    return { message: '欢迎访客' };
  });
```

### 角色检查中间件

检查用户角色权限：

```typescript
import { requireRole } from '../../lib/middleware/auth';

export const adminModule = new Elysia()
  .use(requireRole(['admin', 'super']))
  .get('/admin-only', () => {
    return { message: '管理员专属' };
  });
```

### 安全性增强

- ✅ 提供 `.env.example` 模板
- ✅ 建议使用强密钥（64+ 字符）
- ✅ .env 已加入 .gitignore
- ✅ 统一错误响应格式
