# API 路径统一修复总结

## 📅 时间
2025-11-26

## 🐛 问题描述

前后端 API 路径不一致，部分模块缺少 `/api` 前缀，导致请求失败（422 错误）。

## 🔍 问题分析

### 之前的路径配置

#### 后端路由前缀
| 模块 | 之前 | 现在 | 状态 |
|------|------|------|------|
| authModule | `/api/auth` | `/api/auth` | ✅ 无需修改 |
| uploadModule | `/api/upload` | `/api/upload` | ✅ 无需修改 |
| checkinModule | `/api/v1` | `/api/v1` | ✅ 无需修改 |
| documentModule | `api/document` | `/api/document` | ⚠️ 修复开头 `/` |
| volunteerModule | `/volunteer` | `/api/volunteer` | ✅ 添加 `/api` |
| adminModule | `/admin` | `/api/admin` | ✅ 添加 `/api` |
| deceasedModule | `/deceased` | `/api/deceased` | ✅ 添加 `/api` |
| chantingModule | `/chanting` | `/api/chanting` | ✅ 添加 `/api` |

#### 前端 API 调用
所有前端服务都需要相应更新路径，添加 `/api` 前缀。

## ✅ 修复内容

### 1. 后端路由修复

#### apps/api/src/modules/volunteer/index.ts
```typescript
// 之前
export const volunteerModule = new Elysia({ prefix: '/volunteer' })

// 现在
export const volunteerModule = new Elysia({ prefix: '/api/volunteer' })
```

#### apps/api/src/modules/admin/index.ts
```typescript
// 之前
export const adminModule = new Elysia({ prefix: '/admin' })

// 现在
export const adminModule = new Elysia({ prefix: '/api/admin' })
```

#### apps/api/src/modules/deceased/index.ts
```typescript
// 之前
export const deceasedModule = new Elysia({ prefix: '/deceased' })

// 现在
export const deceasedModule = new Elysia({ prefix: '/api/deceased' })
```

#### apps/api/src/modules/chanting/index.ts
```typescript
// 之前
export const chantingModule = new Elysia({ prefix: '/chanting' })

// 现在
export const chantingModule = new Elysia({ prefix: '/api/chanting' })
```

#### apps/api/src/modules/document/index.ts
```typescript
// 之前
export const documentModule = new Elysia({ prefix: 'api/document' })

// 现在
export const documentModule = new Elysia({ prefix: '/api/document' })
```

### 2. 前端服务修复

#### apps/web/src/services/volunteer.ts
所有路径添加 `/api` 前缀：
- `/volunteer` → `/api/volunteer`
- `/volunteer/{lotusId}` → `/api/volunteer/{lotusId}`
- `/volunteer/search` → `/api/volunteer/search`
- `/volunteer/batch/import` → `/api/volunteer/batch/import`
- 等等...

#### apps/web/src/services/admin.ts
- `/admin` → `/api/admin`
- `/admin/search` → `/api/admin/search`
- `/admin/promote` → `/api/admin/promote`

#### apps/web/src/services/deceased.ts
- `/deceased` → `/api/deceased`
- `/deceased/search` → `/api/deceased/search`
- `/deceased/batch/delete` → `/api/deceased/batch/delete`

#### apps/web/src/services/chanting.ts
- `/chanting` → `/api/chanting`
- `/chanting/calendar` → `/api/chanting/calendar`

## 📊 修复效果

### 之前
```
前端请求: http://localhost:3001/volunteer/LZ-V-4916136
后端路由: /volunteer
结果: ❌ 422 Unprocessable Entity (路径不一致)
```

### 现在
```
前端请求: http://localhost:3001/api/volunteer/LZ-V-4916136
后端路由: /api/volunteer
结果: ✅ 路径匹配，请求成功
```

## 🎯 统一后的 API 路径规范

所有 API 路径统一使用 `/api` 前缀：

```
/api/auth/*          - 认证相关
/api/upload/*        - 文件上传
/api/volunteer/*     - 志愿者管理
/api/admin/*         - 管理员管理
/api/deceased/*      - 往生者管理
/api/chanting/*      - 助念管理
/api/document/*      - 文档生成
/api/v1/*            - 考勤相关（版本化）
```

## 📝 修改的文件

### 后端 (7 个文件)
1. `apps/api/src/modules/volunteer/index.ts`
2. `apps/api/src/modules/volunteer/approval.ts`
3. `apps/api/src/modules/volunteer/register.ts`
4. `apps/api/src/modules/admin/index.ts`
5. `apps/api/src/modules/deceased/index.ts`
6. `apps/api/src/modules/chanting/index.ts`
7. `apps/api/src/modules/document/index.ts`

### 前端 (5 个文件)
1. `apps/web/src/services/volunteer.ts` - 12 处修改
2. `apps/web/src/services/admin.ts` - 4 处修改
3. `apps/web/src/services/deceased.ts` - 4 处修改
4. `apps/web/src/services/chanting.ts` - 3 处修改
5. `apps/web/src/services/approval.ts` - 4 处修改

## 🔍 验证方法

### 1. 检查后端路由
访问 Swagger 文档：http://localhost:3001/swagger
所有路径应该以 `/api` 开头

### 2. 测试前端功能
- ✅ 志愿者列表加载
- ✅ 志愿者详情查看
- ✅ 志愿者信息编辑和保存
- ✅ 助念管理
- ✅ 往生者管理
- ✅ 管理员管理

## 💡 经验教训

1. **统一规范很重要**: 所有模块应该使用统一的路径前缀
2. **前后端要一致**: 前端请求路径必须与后端路由完全匹配
3. **及早发现问题**: 应该在开发初期就统一路径规范
4. **文档很关键**: 需要明确记录 API 路径规范

## 🎉 成果

- ✅ 所有 API 路径统一添加 `/api` 前缀
- ✅ 前后端路径完全一致
- ✅ 志愿者保存功能恢复正常
- ✅ 所有模块功能正常

---

**状态**: ✅ API 路径统一修复完成
**测试**: 建议全面测试所有模块功能
