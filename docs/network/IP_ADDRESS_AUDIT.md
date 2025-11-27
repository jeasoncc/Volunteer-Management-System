# 后端 API IP 地址管理审查报告

## 📋 审查范围

审查后端 API 项目中所有涉及 IP 地址、URL 和网络配置的地方。

## ✅ 已正确使用统一配置的文件

### 1. WebSocket 服务 ✅
**文件**: `apps/api/src/modules/ws/service.ts`

```typescript
import { getBackendUrl } from '../../config/network'

export class WebSocketService {
  // ✅ 使用统一配置
  private static readonly BASE_URL = getBackendUrl()
}
```

**用途**：
- 构建照片 URL 发送给考勤机
- 照片预检查
- 图片广告
- 访客二维码

**状态**: ✅ 正确

### 2. 网络配置文件 ✅
**文件**: `apps/api/src/config/network.ts`

```typescript
export const NETWORK_CONFIG = {
  development: {
    backend: 'http://localhost:3001',
  },
  lan: {
    backend: 'http://192.168.5.4:3001',  // 当前局域网IP
  },
  production: {
    backend: 'http://61.144.183.96:3001',
  },
}

export const CURRENT_ENV = 'lan'

export const getBackendUrl = (): string => {
  // 优先使用环境变量
  if (process.env.ATTENDANCE_DEVICE_BASE_URL) {
    return process.env.ATTENDANCE_DEVICE_BASE_URL
  }
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL
  }
  
  // 否则使用配置文件
  return NETWORK_CONFIG[CURRENT_ENV].backend
}
```

**状态**: ✅ 正确

## 🔧 已修复的文件

### 1. 测试脚本 - test-user-sync.ts ✅
**文件**: `apps/api/scripts/test-user-sync.ts`

```typescript
// ❌ 之前：硬编码旧IP
const BASE_URL = 'http://192.168.101.100:3001'

// ✅ 现在：使用统一配置
const { getBackendUrl } = await import('../src/config/network')
const BASE_URL = getBackendUrl()
```

**状态**: ✅ 已修复

### 2. 照片测试脚本 - test-photo-url.ts ✅
**文件**: `apps/api/scripts/test-photo-url.ts`

```typescript
// ❌ 之前：硬编码旧IP
const BASE_URL = 'http://192.168.101.100:3001'

// ✅ 现在：使用统一配置
import { getBackendUrl } from '../src/config/network'
const BASE_URL = getBackendUrl()
```

**状态**: ✅ 已修复

## 📝 无需修改的文件

### 1. 服务器启动日志 ℹ️
**文件**: `apps/api/src/index.ts`

```typescript
logger.info(`🦊 Server is running at:`)
logger.info(`   - Local:   http://${hostname}:${port}`)
logger.info(`   - Network: http://${ip}:${port}`)
```

**说明**: 这是动态获取的本机IP，用于显示日志，无需修改。

**状态**: ℹ️ 正确（动态获取）

### 2. Swagger 文档配置 ℹ️
**文件**: `apps/api/src/config/swagger.ts`

```typescript
servers: [
  {
    url: 'http://localhost:3001',
    description: '开发环境',
  },
  {
    url: 'https://api.temple.org/{version}',
    description: '生产环境',
  },
]
```

**说明**: Swagger 文档的服务器配置，仅用于 API 文档展示，不影响实际运行。

**状态**: ℹ️ 无需修改（文档配置）

### 3. 数据库连接 ℹ️
**文件**: `apps/api/src/db/index.ts`

```typescript
const pool = mysql.createPool({
  uri: process.env.CURR_DATABASE_URL!,
  // ...
})
```

**说明**: 使用环境变量，不涉及硬编码IP。

**状态**: ℹ️ 正确（环境变量）

## 📊 统计总结

| 类别 | 数量 | 状态 |
|------|------|------|
| 使用统一配置 | 1 | ✅ 正确 |
| 已修复 | 2 | ✅ 已修复 |
| 动态获取 | 1 | ℹ️ 正确 |
| 文档配置 | 1 | ℹ️ 无需修改 |
| 环境变量 | 1 | ℹ️ 正确 |
| **总计** | **6** | **✅ 全部正确** |

## 🎯 IP 地址管理架构

### 配置层级

```
1. 环境变量（最高优先级）
   ├─ ATTENDANCE_DEVICE_BASE_URL
   └─ PUBLIC_URL

2. 配置文件（次优先级）
   └─ apps/api/src/config/network.ts
      ├─ CURRENT_ENV = 'lan'
      └─ NETWORK_CONFIG[CURRENT_ENV].backend

3. 默认值（最低优先级）
   └─ 配置文件中的默认环境
```

### 使用方式

```typescript
// ✅ 正确：使用统一配置
import { getBackendUrl } from './config/network'
const BASE_URL = getBackendUrl()

// ❌ 错误：硬编码IP
const BASE_URL = 'http://192.168.5.4:3001'
```

## 🔄 切换环境的方法

### 方法 1：修改配置文件（推荐）

```typescript
// apps/api/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan'  // 或 'development' 或 'production'
```

### 方法 2：使用环境变量

```bash
# 设置环境变量
export ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001

# 或在 .env 文件中
ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001
```

### 方法 3：修改 IP 地址

```typescript
// apps/api/src/config/network.ts
lan: {
  backend: 'http://192.168.x.x:3001',  // 修改这里
}
```

## 📝 最佳实践

### ✅ 应该做的

1. **使用统一配置**
   ```typescript
   import { getBackendUrl } from './config/network'
   const url = getBackendUrl()
   ```

2. **支持环境变量覆盖**
   ```typescript
   const url = process.env.CUSTOM_URL || getBackendUrl()
   ```

3. **记录使用的URL**
   ```typescript
   logger.info(`使用的服务器地址: ${BASE_URL}`)
   ```

### ❌ 不应该做的

1. **硬编码IP地址**
   ```typescript
   // ❌ 不好
   const url = 'http://192.168.5.4:3001'
   ```

2. **重复定义配置**
   ```typescript
   // ❌ 不好
   const BASE_URL = 'http://...'  // 每个文件都定义一次
   ```

3. **忘记同步前后端配置**
   ```typescript
   // ❌ 不好
   // 前端: 192.168.5.4
   // 后端: 192.168.101.100  // 不一致！
   ```

## 🧪 验证方法

### 1. 检查配置是否生效

```bash
cd apps/api
bun run scripts/test-user-sync.ts
```

查看输出的照片URL是否正确。

### 2. 检查所有硬编码IP

```bash
# 搜索硬编码的IP地址
grep -r "192\.168\." apps/api/src --include="*.ts"
grep -r "localhost" apps/api/src --include="*.ts"
```

### 3. 测试环境切换

```bash
# 修改 CURRENT_ENV
# 重启服务
# 检查日志中的服务器地址
```

## 🔍 潜在问题检查清单

- [x] WebSocket 服务使用统一配置
- [x] 测试脚本使用统一配置
- [x] 没有硬编码的旧IP地址
- [x] 前后端配置一致
- [x] 支持环境变量覆盖
- [x] 有清晰的配置文档

## 📚 相关文件

### 核心配置
- `apps/api/src/config/network.ts` - 网络配置（核心）
- `apps/web/src/config/network.ts` - 前端配置（保持一致）

### 使用配置的文件
- `apps/api/src/modules/ws/service.ts` - WebSocket 服务
- `apps/api/scripts/test-user-sync.ts` - 测试脚本
- `apps/api/scripts/test-photo-url.ts` - 照片测试脚本

### 文档
- `PHOTO_URL_FIX.md` - 照片URL修复说明
- `IP_ADDRESS_AUDIT.md` - 本文档

## 🎉 审查结论

✅ **所有IP地址管理已统一**

- 核心服务使用统一配置
- 测试脚本已修复
- 无遗漏的硬编码IP
- 支持灵活的环境切换
- 前后端配置一致

## 📅 审查时间

2025-11-27

## 👤 审查人

Kiro AI Assistant
