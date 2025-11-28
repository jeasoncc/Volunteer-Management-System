# WebSocket 连接问题修复

## 问题

前端 WebSocket 无法连接到后端，导致无法接收实时消息。

### 错误日志
```
LibreWolf can't establish a connection to the server at ws://localhost:3000/ws/sync-progress
📊 当前前端客户端数量: 0
```

## 根本原因

**WebSocket URL 配置错误**：

1. **网络配置**（`apps/web/src/config/network.ts`）：
   - `CURRENT_ENV = 'lan'`
   - 后端地址：`http://192.168.5.4:3001`

2. **WebSocket Hook**（`apps/web/src/hooks/useSyncWebSocket.ts`）：
   - 使用硬编码：`http://localhost:3000`
   - 实际应该使用：`http://192.168.5.4:3001`（从配置读取）

3. **端口错误**：
   - WebSocket 连接到 3000 端口（前端端口）
   - 应该连接到 3001 端口（后端端口）

## 解决方案

### 修改 `apps/web/src/hooks/useSyncWebSocket.ts`

#### 之前（错误）
```typescript
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const wsUrl = backendUrl.replace("http", "ws") + "/ws/sync-progress";
```

#### 现在（正确）
```typescript
import { getBackendUrl } from "@/config/network";

const connect = useCallback(() => {
  if (!enabled) return;

  // 从配置获取后端地址
  const backendUrl = getBackendUrl();
  const wsUrl = backendUrl.replace("http", "ws") + "/ws/sync-progress";
  
  console.log("🔌 WebSocket 连接地址:", wsUrl);
  
  // ... 创建 WebSocket 连接
}, [enabled, ...]);
```

## 修复效果

### 之前
```
尝试连接: ws://localhost:3000/ws/sync-progress ❌
错误: 无法连接
前端客户端数量: 0
```

### 现在
```
尝试连接: ws://192.168.5.4:3001/ws/sync-progress ✅
✅ 同步进度 WebSocket 已连接
前端客户端数量: 1
```

## 测试方法

### 1. 重启服务
```bash
# 重启前端（确保新代码生效）
cd apps/web
bun run dev
```

### 2. 打开浏览器控制台
查看连接日志：
```
🔌 WebSocket 连接地址: ws://192.168.5.4:3001/ws/sync-progress
✅ 同步进度 WebSocket 已连接
```

### 3. 执行清空操作
应该看到：
```
📨 收到 WebSocket 消息: {type: "clear_device_complete", ...}
🔔 收到清空设备完成消息: {success: true, ...}
✅ 调用 onClearDeviceComplete 回调
```

### 4. 检查服务端日志
应该看到：
```
📊 当前前端客户端数量: 1  ✅ 不再是 0
```

## 环境配置说明

### 开发环境
```typescript
// apps/web/src/config/network.ts
export const CURRENT_ENV: Environment = 'development';

// WebSocket 将连接到: ws://localhost:3001/ws/sync-progress
```

### 局域网环境
```typescript
// apps/web/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan';

// WebSocket 将连接到: ws://192.168.5.4:3001/ws/sync-progress
```

### 生产环境
```typescript
// apps/web/src/config/network.ts
export const CURRENT_ENV: Environment = 'production';

// WebSocket 将连接到: ws://61.144.183.96:3001/ws/sync-progress
```

## 相关配置

### 网络配置（`apps/web/src/config/network.ts`）
```typescript
export const NETWORK_CONFIG = {
  development: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3001',  // ← WebSocket 使用这个
  },
  lan: {
    frontend: 'http://192.168.5.4:3000',
    backend: 'http://192.168.5.4:3001',  // ← WebSocket 使用这个
  },
  production: {
    frontend: 'http://61.144.183.96:3000',
    backend: 'http://61.144.183.96:3001',  // ← WebSocket 使用这个
  },
};
```

### API 配置（`apps/web/src/lib/api.ts`）
应该也使用 `getBackendUrl()` 来确保一致性。

## 注意事项

1. **环境切换**：修改 `CURRENT_ENV` 后需要重启前端服务
2. **端口一致性**：确保后端实际运行在配置的端口上
3. **防火墙**：局域网环境需要确保防火墙允许 3001 端口
4. **HTTPS**：生产环境如果使用 HTTPS，WebSocket 应该使用 WSS

## 相关文件

- `apps/web/src/hooks/useSyncWebSocket.ts` - WebSocket Hook（已修复）
- `apps/web/src/config/network.ts` - 网络配置
- `apps/api/src/modules/ws/index.ts` - WebSocket 服务端

## 更新日志

**2024-11-28**
- ✅ 修复 WebSocket URL 配置
- ✅ 使用 `getBackendUrl()` 从配置读取地址
- ✅ 添加连接地址日志
- ✅ 支持环境切换
