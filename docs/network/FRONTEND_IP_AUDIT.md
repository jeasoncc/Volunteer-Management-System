# 前端 Web 项目 IP 地址管理审查报告

## 📋 审查范围

审查前端 Web 项目（apps/web）中所有涉及 IP 地址、URL 和网络配置的地方。

## ✅ 已正确使用统一配置的文件

### 1. 网络配置文件 ✅
**文件**: `apps/web/src/config/network.ts`

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

export const getBackendUrl = (forMobile = false): string => {
  return getCurrentConfig().backend
}

export const getFrontendUrl = (forMobile = false): string => {
  if (forMobile) {
    return getCurrentConfig().frontend
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return getCurrentConfig().frontend
}
```

**状态**: ✅ 正确（核心配置）

### 2. API 客户端配置 ✅
**文件**: `apps/web/src/lib/api.ts`

```typescript
import { getBackendUrl } from "@/config/network"

// ✅ 使用统一配置
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || getBackendUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
})
```

**用途**: 所有 API 请求的基础 URL

**优先级**:
1. 环境变量 `VITE_API_BASE_URL`（最高）
2. 网络配置 `getBackendUrl()`（次之）

**状态**: ✅ 正确

### 3. 手机上传对话框 ✅
**文件**: `apps/web/src/components/MobileUploadDialog.tsx`

```typescript
import { getFrontendUrl, isLocalhost, LOCAL_IP } from "@/config/network"

// ✅ 使用统一配置
const uploadUrl = `${getFrontendUrl(true)}/mobile-upload?token=${uploadToken}`
const isLocal = isLocalhost()
```

**用途**: 生成手机扫码上传的 URL

**状态**: ✅ 正确

### 4. 调试工具 ✅
**文件**: `apps/web/src/lib/debug.ts`

```typescript
// ✅ 动态获取 API baseURL
console.log('API baseURL:', (api.defaults as any).baseURL)
```

**用途**: 调试时显示当前使用的 API 地址

**状态**: ✅ 正确

## 📝 无需修改的文件

### 1. SVG 命名空间 ℹ️
**文件**: `apps/web/src/components/ui/lotus-logo.tsx`

```typescript
<svg xmlns="http://www.w3.org/2000/svg" ...>
```

**说明**: SVG 标准命名空间，不是实际的 URL

**状态**: ℹ️ 无需修改（标准命名空间）

### 2. 外部资源链接 ℹ️
**文件**: `apps/web/src/routes/login.tsx`

```typescript
<div className="bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')]">
```

**说明**: 外部纹理图片，不是项目配置

**状态**: ℹ️ 无需修改（外部资源）

### 3. 文档链接 ℹ️
**文件**: `apps/web/src/main.tsx`

```typescript
// Learn more: https://bit.ly/CRA-vitals
```

**说明**: 注释中的文档链接

**状态**: ℹ️ 无需修改（注释）

## 📊 统计总结

| 类别 | 数量 | 状态 |
|------|------|------|
| 核心配置 | 1 | ✅ 正确 |
| 使用统一配置 | 3 | ✅ 正确 |
| 标准命名空间 | 1 | ℹ️ 无需修改 |
| 外部资源 | 1 | ℹ️ 无需修改 |
| 注释链接 | 1 | ℹ️ 无需修改 |
| **总计** | **7** | **✅ 全部正确** |

## 🎯 前端 IP 地址管理架构

### 配置层级

```
1. 环境变量（最高优先级）
   └─ VITE_API_BASE_URL

2. 网络配置（次优先级）
   └─ apps/web/src/config/network.ts
      ├─ CURRENT_ENV = 'lan'
      └─ NETWORK_CONFIG[CURRENT_ENV]

3. 动态获取（特殊情况）
   └─ window.location.origin（前端URL）
```

### 使用方式

```typescript
// ✅ 正确：使用统一配置
import { getBackendUrl, getFrontendUrl } from '@/config/network'

// API 请求
const apiUrl = getBackendUrl()

// 前端 URL（手机访问）
const frontendUrl = getFrontendUrl(true)

// ❌ 错误：硬编码IP
const apiUrl = 'http://192.168.5.4:3001'
```

## 🔄 前后端配置对比

### 配置文件对比

| 项目 | 配置文件 | CURRENT_ENV | 状态 |
|------|---------|-------------|------|
| 后端 | `apps/api/src/config/network.ts` | `'lan'` | ✅ |
| 前端 | `apps/web/src/config/network.ts` | `'lan'` | ✅ |

### IP 地址对比

| 环境 | 后端 | 前端 | 状态 |
|------|------|------|------|
| development | localhost:3001 | localhost:3000 | ✅ 一致 |
| lan | 192.168.5.4:3001 | 192.168.5.4:3000 | ✅ 一致 |
| production | 61.144.183.96:3001 | 61.144.183.96:3000 | ✅ 一致 |

**结论**: ✅ 前后端配置完全一致

## 🔄 切换环境的方法

### 方法 1：修改配置文件（推荐）

同时修改两个文件：

```typescript
// apps/web/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan'  // 或 'development' 或 'production'

// apps/api/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan'  // 保持一致
```

### 方法 2：使用环境变量

```bash
# 前端 .env 文件
VITE_API_BASE_URL=http://192.168.5.4:3001

# 后端 .env 文件
ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001
```

### 方法 3：修改 IP 地址

```typescript
// apps/web/src/config/network.ts
lan: {
  frontend: 'http://192.168.x.x:3000',
  backend: 'http://192.168.x.x:3001',
}

// apps/api/src/config/network.ts
lan: {
  backend: 'http://192.168.x.x:3001',
}
```

## 📝 最佳实践

### ✅ 应该做的

1. **使用统一配置**
   ```typescript
   import { getBackendUrl } from '@/config/network'
   const url = getBackendUrl()
   ```

2. **支持环境变量覆盖**
   ```typescript
   const url = import.meta.env.VITE_API_BASE_URL || getBackendUrl()
   ```

3. **前后端配置保持一致**
   ```typescript
   // 前端和后端的 CURRENT_ENV 应该相同
   export const CURRENT_ENV = 'lan'
   ```

### ❌ 不应该做的

1. **硬编码IP地址**
   ```typescript
   // ❌ 不好
   const url = 'http://192.168.5.4:3001'
   ```

2. **直接使用 axios.get**
   ```typescript
   // ❌ 不好
   axios.get('http://192.168.5.4:3001/api/...')
   
   // ✅ 好
   import { api } from '@/lib/api'
   api.get('/api/...')
   ```

3. **忘记同步前后端配置**
   ```typescript
   // ❌ 不好
   // 前端: 192.168.5.4
   // 后端: 192.168.101.100  // 不一致！
   ```

## 🧪 验证方法

### 1. 检查前端配置

```bash
cd apps/web
cat src/config/network.ts | grep CURRENT_ENV
cat src/config/network.ts | grep "192.168"
```

### 2. 检查 API 基础 URL

打开浏览器控制台：

```javascript
// 查看当前使用的 API URL
import { api } from '@/lib/api'
console.log(api.defaults.baseURL)
```

### 3. 检查手机上传 URL

在手机上传对话框中，查看生成的二维码 URL 是否正确。

### 4. 测试环境切换

```bash
# 修改 CURRENT_ENV
# 重启前端
npm run dev

# 检查控制台输出的 API URL
```

## 🔍 潜在问题检查清单

- [x] API 客户端使用统一配置
- [x] 手机上传使用统一配置
- [x] 没有硬编码的IP地址
- [x] 前后端配置一致
- [x] 支持环境变量覆盖
- [x] 有清晰的配置文档

## 📚 相关文件

### 核心配置
- `apps/web/src/config/network.ts` - 前端网络配置（核心）
- `apps/api/src/config/network.ts` - 后端网络配置（保持一致）

### 使用配置的文件
- `apps/web/src/lib/api.ts` - API 客户端
- `apps/web/src/components/MobileUploadDialog.tsx` - 手机上传
- `apps/web/src/lib/debug.ts` - 调试工具

### 文档
- `IP_ADDRESS_AUDIT.md` - 后端审查报告
- `FRONTEND_IP_AUDIT.md` - 本文档

## 🎉 审查结论

✅ **前端所有IP地址管理已统一**

- 核心配置完善 ✅
- API 客户端使用统一配置 ✅
- 手机上传使用统一配置 ✅
- 无硬编码IP地址 ✅
- 前后端配置一致 ✅
- 支持环境变量覆盖 ✅

## 🔗 前后端配置同步

### 同步检查

```bash
# 检查前端配置
grep "CURRENT_ENV" apps/web/src/config/network.ts

# 检查后端配置
grep "CURRENT_ENV" apps/api/src/config/network.ts

# 应该输出相同的值
```

### 同步更新

当需要切换环境时，同时更新两个文件：

```bash
# 1. 更新前端
vim apps/web/src/config/network.ts
# 修改 CURRENT_ENV

# 2. 更新后端
vim apps/api/src/config/network.ts
# 修改 CURRENT_ENV

# 3. 重启服务
# 前端: npm run dev
# 后端: bun run dev
```

## 💡 Turbo 项目特点

作为 Turbo 项目，前后端共享相同的配置结构：

```
项目根目录/
├── apps/
│   ├── web/
│   │   └── src/config/network.ts  ← 前端配置
│   └── api/
│       └── src/config/network.ts  ← 后端配置
└── turbo.json
```

**优点**:
- ✅ 配置结构一致
- ✅ 易于同步更新
- ✅ 统一的环境管理

**建议**:
- 考虑创建共享的配置包（可选）
- 或使用根目录的 .env 文件统一管理

## 📅 审查时间

2025-11-27

## 👤 审查人

Kiro AI Assistant
