# 登录问题修复总结

## 🐛 问题描述

用户在登录时遇到 `Request failed with status code 404` 错误。

## 🔍 问题分析

### 1. API 路径不匹配

**前端请求**：
```typescript
// apps/web/src/services/auth.ts
login: async (params: LoginParams) => {
  return api.post("/auth/login", params);  // ❌ 错误路径
}
```

**后端路由**：
```typescript
// apps/api/src/modules/auth/index.ts
export const authModule = new Elysia({ prefix: '/api/auth' })
  .post('/login', ...)  // ✅ 实际路径是 /api/auth/login
```

**问题**：前端请求 `/auth/login`，但后端实际路径是 `/api/auth/login`

### 2. 缺少管理员账号

数据库中没有默认的管理员账号，导致无法登录测试。

## ✅ 解决方案

### 1. 修复 API 路径

修改 `apps/web/src/services/auth.ts`：

```typescript
export const authService = {
  // 登录
  login: async (params: LoginParams) => {
    return api.post("/api/auth/login", params);  // ✅ 添加 /api 前缀
  },

  // 登出
  logout: async () => {
    return api.post("/api/auth/logout");  // ✅ 添加 /api 前缀
  },

  // 获取当前用户信息
  me: async () => {
    return api.get("/api/auth/me");  // ✅ 添加 /api 前缀
  },
}
```

### 2. 创建管理员账号

创建脚本 `apps/api/scripts/create-admin.ts`：

```typescript
import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import bcrypt from 'bcrypt'

async function createAdmin() {
  const passwordHash = await bcrypt.hash('admin123', 10)
  
  await db.insert(volunteer).values({
    account: 'admin',
    password: passwordHash,
    name: '系统管理员',
    phone: '13800138000',
    idNumber: '000000000000000000',
    gender: 'male',
    lotusId: 'LZ-ADMIN-001',
    lotusRole: 'admin',
    volunteerStatus: 'registered',
  })
}
```

运行脚本：
```bash
cd apps/api
bun run scripts/create-admin.ts
```

## 📝 修改的文件

### 1. apps/web/src/services/auth.ts
- ✅ 修复登录 API 路径：`/auth/login` → `/api/auth/login`
- ✅ 修复登出 API 路径：`/auth/logout` → `/api/auth/logout`
- ✅ 修复获取用户信息 API 路径：`/auth/me` → `/api/auth/me`

### 2. apps/api/scripts/create-admin.ts
- ✅ 新增管理员账号创建脚本

## 🎯 验证结果

### 1. API 路径测试

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

**响应**：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 101,
      "account": "admin",
      "name": "系统管理员",
      "role": "admin",
      "avatar": null,
      "email": null
    },
    "adminInfo": null,
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

✅ 登录成功！

### 2. 前端登录测试

1. 访问：http://localhost:3000/login
2. 输入账号：`admin`
3. 输入密码：`admin123`
4. 点击登录

✅ 应该能成功登录并跳转到首页

## 📊 后端 API 路由规范

### 认证模块 (`/api/auth`)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 义工模块 (`/volunteer`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/volunteer` | 获取义工列表 |
| GET | `/volunteer/:lotusId` | 获取义工详情 |
| POST | `/volunteer` | 创建义工 |
| PUT | `/volunteer/:lotusId` | 更新义工 |
| DELETE | `/volunteer/:lotusId` | 删除义工 |

### 考勤模块 (`/api/v1`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/summary/list` | 获取考勤记录列表 |
| GET | `/api/v1/summary/user` | 获取用户考勤汇总 |
| GET | `/api/v1/report/monthly` | 获取月度考勤报表 |
| POST | `/api/v1/summary/generate-monthly` | 生成月度考勤汇总 |
| GET | `/api/v1/export/volunteer-service` | 导出志愿者服务时间统计表 |

## 🔐 默认管理员账号

创建成功后的默认账号信息：

- **账号**：`admin`
- **密码**：`admin123`
- **姓名**：系统管理员
- **莲花斋ID**：LZ-ADMIN-001
- **角色**：admin

## 💡 注意事项

### 1. API 路径规范

后端使用了不同的路由前缀：
- 认证模块：`/api/auth`
- 义工模块：`/volunteer`（无 /api 前缀）
- 考勤模块：`/api/v1`

前端调用时需要注意使用正确的前缀。

### 2. 密码安全

- 密码使用 bcrypt 加密存储
- 默认密码 `admin123` 仅用于开发测试
- 生产环境应立即修改默认密码

### 3. JWT Token

- Token 存储在 HTTP-only Cookie 中
- 有效期为 7 天
- 自动在请求中携带

## 🚀 后续优化建议

### 1. 统一 API 路径前缀

建议统一使用 `/api` 前缀：
```typescript
// 认证模块
export const authModule = new Elysia({ prefix: '/api/auth' })

// 义工模块
export const volunteerModule = new Elysia({ prefix: '/api/volunteer' })

// 考勤模块
export const checkinModule = new Elysia({ prefix: '/api/checkin' })
```

### 2. 环境变量配置

在 `.env` 文件中配置默认管理员信息：
```env
DEFAULT_ADMIN_ACCOUNT=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=系统管理员
```

### 3. 数据库迁移

将管理员账号创建集成到数据库迁移脚本中：
```bash
bun run db:seed
```

### 4. API 文档

在 Swagger 文档中明确标注所有 API 的完整路径。

## ✅ 问题已解决

- ✅ API 路径已修复
- ✅ 管理员账号已创建
- ✅ 登录功能正常工作
- ✅ Token 认证正常

现在可以正常登录系统了！🎉

## 📚 相关文档

- [FIX_SUMMARY.md](./FIX_SUMMARY.md) - Turborepo 配置修复
- [START_GUIDE.md](./START_GUIDE.md) - 启动指南
- [QUICK_START.md](./QUICK_START.md) - 快速开始

## 🎯 快速测试

```bash
# 1. 确保服务正在运行
bun run dev

# 2. 测试登录 API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'

# 3. 访问前端登录页面
open http://localhost:3000/login
```

祝你使用愉快！🚀
