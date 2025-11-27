# 网络配置管理总结

## 🎯 项目概述

这是一个 Turbo Monorepo 项目，包含前端（Web）和后端（API）两个应用。

## ✅ 审查结论

**所有 IP 地址和 URL 配置已完全统一管理，无遗漏！**

## 📊 审查结果

### 后端 API 项目

| 项目 | 状态 | 详情 |
|------|------|------|
| 核心配置 | ✅ | `apps/api/src/config/network.ts` |
| WebSocket 服务 | ✅ | 使用 `getBackendUrl()` |
| 测试脚本 | ✅ | 已修复，使用统一配置 |
| 硬编码IP | ✅ | 无遗漏 |

**详细报告**: `IP_ADDRESS_AUDIT.md`

### 前端 Web 项目

| 项目 | 状态 | 详情 |
|------|------|------|
| 核心配置 | ✅ | `apps/web/src/config/network.ts` |
| API 客户端 | ✅ | 使用 `getBackendUrl()` |
| 手机上传 | ✅ | 使用 `getFrontendUrl()` |
| 硬编码IP | ✅ | 无遗漏 |

**详细报告**: `FRONTEND_IP_AUDIT.md`

## 🏗️ 配置架构

### 目录结构

```
项目根目录/
├── apps/
│   ├── web/                          # 前端应用
│   │   └── src/
│   │       ├── config/
│   │       │   └── network.ts        # 前端网络配置 ⭐
│   │       └── lib/
│   │           └── api.ts            # API 客户端（使用配置）
│   │
│   └── api/                          # 后端应用
│       └── src/
│           ├── config/
│           │   └── network.ts        # 后端网络配置 ⭐
│           └── modules/
│               └── ws/
│                   └── service.ts    # WebSocket 服务（使用配置）
│
├── IP_ADDRESS_AUDIT.md               # 后端审查报告
├── FRONTEND_IP_AUDIT.md              # 前端审查报告
└── NETWORK_CONFIG_SUMMARY.md         # 本文档
```

### 配置文件对比

#### 前端配置 (`apps/web/src/config/network.ts`)

```typescript
export const NETWORK_CONFIG = {
  development: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3001',
  },
  lan: {
    frontend: 'http://192.168.5.4:3000',
    backend: 'http://192.168.5.4:3001',
  },
  production: {
    frontend: 'http://61.144.183.96:3000',
    backend: 'http://61.144.183.96:3001',
  },
}

export const CURRENT_ENV: Environment = 'lan'

export const getBackendUrl = (): string => {
  return getCurrentConfig().backend
}

export const getFrontendUrl = (forMobile = false): string => {
  return getCurrentConfig().frontend
}
```

#### 后端配置 (`apps/api/src/config/network.ts`)

```typescript
export const NETWORK_CONFIG = {
  development: {
    backend: 'http://localhost:3001',
  },
  lan: {
    backend: 'http://192.168.5.4:3001',
  },
  production: {
    backend: 'http://61.144.183.96:3001',
  },
}

export const CURRENT_ENV: Environment = 'lan'

export const getBackendUrl = (): string => {
  if (process.env.ATTENDANCE_DEVICE_BASE_URL) {
    return process.env.ATTENDANCE_DEVICE_BASE_URL
  }
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL
  }
  return NETWORK_CONFIG[CURRENT_ENV].backend
}
```

## 🔄 环境切换指南

### 快速切换

1. **修改前端配置**
   ```bash
   vim apps/web/src/config/network.ts
   # 修改 CURRENT_ENV = 'development' | 'lan' | 'production'
   ```

2. **修改后端配置**
   ```bash
   vim apps/api/src/config/network.ts
   # 修改 CURRENT_ENV = 'development' | 'lan' | 'production'
   ```

3. **重启服务**
   ```bash
   # 前端
   cd apps/web && npm run dev
   
   # 后端
   cd apps/api && bun run dev
   ```

### 环境说明

| 环境 | 用途 | IP地址 | 端口 |
|------|------|--------|------|
| development | 本地开发 | localhost | 3000/3001 |
| lan | 局域网访问 | 192.168.5.4 | 3000/3001 |
| production | 外网访问 | 61.144.183.96 | 3000/3001 |

## 📝 使用示例

### 后端使用

```typescript
// apps/api/src/modules/ws/service.ts
import { getBackendUrl } from '../../config/network'

export class WebSocketService {
  private static readonly BASE_URL = getBackendUrl()
  
  // 使用 BASE_URL 构建照片 URL
  const photoUrl = `${this.BASE_URL}${user.avatar}`
}
```

### 前端使用

```typescript
// apps/web/src/lib/api.ts
import { getBackendUrl } from '@/config/network'

const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || getBackendUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
})
```

```typescript
// apps/web/src/components/MobileUploadDialog.tsx
import { getFrontendUrl } from '@/config/network'

const uploadUrl = `${getFrontendUrl(true)}/mobile-upload?token=${token}`
```

## 🎯 配置优先级

### 后端

```
1. ATTENDANCE_DEVICE_BASE_URL（环境变量）
2. PUBLIC_URL（环境变量）
3. NETWORK_CONFIG[CURRENT_ENV].backend（配置文件）
```

### 前端

```
1. VITE_API_BASE_URL（环境变量）
2. NETWORK_CONFIG[CURRENT_ENV].backend（配置文件）
3. window.location.origin（动态获取，仅前端URL）
```

## 🔧 环境变量配置

### 前端 (.env)

```bash
# apps/web/.env
VITE_API_BASE_URL=http://192.168.5.4:3001
```

### 后端 (.env)

```bash
# apps/api/.env
ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001
PUBLIC_URL=http://192.168.5.4:3001
```

## ✅ 检查清单

### 前后端配置一致性

- [x] CURRENT_ENV 值相同
- [x] IP 地址相同
- [x] 端口号正确（前端 3000，后端 3001）
- [x] 协议一致（http/https）

### 代码使用规范

- [x] 无硬编码 IP 地址
- [x] 使用统一配置函数
- [x] 支持环境变量覆盖
- [x] 有清晰的文档

### 功能验证

- [x] API 请求正常
- [x] WebSocket 连接正常
- [x] 手机上传二维码正确
- [x] 考勤机照片 URL 正确

## 🚀 最佳实践

### 1. 统一配置

所有 IP 地址和 URL 都通过配置文件管理，不要硬编码。

```typescript
// ✅ 好
import { getBackendUrl } from './config/network'
const url = getBackendUrl()

// ❌ 不好
const url = 'http://192.168.5.4:3001'
```

### 2. 环境变量优先

支持通过环境变量覆盖配置文件，便于部署。

```typescript
// ✅ 好
const url = process.env.API_URL || getBackendUrl()

// ❌ 不好
const url = getBackendUrl()  // 无法覆盖
```

### 3. 前后端同步

修改配置时，同时更新前后端配置文件。

```bash
# ✅ 好
# 同时修改两个文件
vim apps/web/src/config/network.ts
vim apps/api/src/config/network.ts

# ❌ 不好
# 只修改一个
vim apps/web/src/config/network.ts
```

### 4. 文档更新

配置变更后，更新相关文档。

## 📚 相关文档

- `IP_ADDRESS_AUDIT.md` - 后端 IP 地址审查报告
- `FRONTEND_IP_AUDIT.md` - 前端 IP 地址审查报告
- `PHOTO_URL_FIX.md` - 照片 URL 修复说明
- `NETWORK_CONFIG_SUMMARY.md` - 本文档

## 🎉 总结

✅ **项目网络配置管理完善**

- 前后端配置统一
- 无硬编码 IP 地址
- 支持灵活的环境切换
- 有完整的文档

## 📅 审查时间

2025-11-27

## 👤 审查人

Kiro AI Assistant
