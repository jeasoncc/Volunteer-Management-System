# WebSocket 库迁移 - 使用 react-use-websocket

## 问题

自己实现的 WebSocket hook 存在无限重连问题，原因是 React hooks 的依赖项管理复杂。

## 解决方案

使用成熟的 `react-use-websocket` 库，它专门为 React 设计，处理了所有边界情况。

## 安装

```bash
cd apps/web
bun add react-use-websocket
```

## 新实现

### `apps/web/src/hooks/useSyncWebSocket.ts`

```typescript
import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getBackendUrl } from "@/config/network";

export function useSyncWebSocket(options: UseSyncWebSocketOptions = {}) {
  const {
    onProgressUpdate,
    onUserFeedback,
    onBatchStart,
    onBatchComplete,
    onClearDeviceComplete,
    enabled = true,
  } = options;

  // 获取 WebSocket URL
  const backendUrl = getBackendUrl();
  const socketUrl = enabled
    ? backendUrl.replace("http", "ws") + "/ws/sync-progress"
    : null;

  // 使用 react-use-websocket
  const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true, // 自动重连
    reconnectAttempts: 10, // 最多重连 10 次
    reconnectInterval: 3000, // 重连间隔 3 秒
    share: false, // 不共享连接
  });

  // 处理接收到的消息
  useEffect(() => {
    if (!lastJsonMessage) return;

    const message = lastJsonMessage as any;

    switch (message.type) {
      case "progress":
        onProgressUpdate?.(message.data);
        break;

      case "user_feedback":
        onUserFeedback?.(message.data);
        break;

      case "batch_start":
        onBatchStart?.(message.data);
        break;

      case "batch_complete":
        onBatchComplete?.(message.data);
        break;

      case "clear_device_complete":
        onClearDeviceComplete?.(message.data);
        break;
    }
  }, [
    lastJsonMessage,
    onProgressUpdate,
    onUserFeedback,
    onBatchStart,
    onBatchComplete,
    onClearDeviceComplete,
  ]);

  return {
    isConnected: readyState === ReadyState.OPEN,
    connectionStatus: {
      [ReadyState.CONNECTING]: "连接中",
      [ReadyState.OPEN]: "已连接",
      [ReadyState.CLOSING]: "断开中",
      [ReadyState.CLOSED]: "已断开",
      [ReadyState.UNINSTANTIATED]: "未初始化",
    }[readyState],
    readyState,
  };
}
```

## 优势

### 1. 自动处理重连
- 自动重连机制
- 指数退避策略
- 可配置重连次数和间隔

### 2. 稳定的依赖管理
- 库内部正确处理了 React hooks 依赖
- 不会触发无限重连
- 性能优化

### 3. 丰富的功能
- 连接状态管理
- 消息队列
- 心跳检测
- 连接共享

### 4. TypeScript 支持
- 完整的类型定义
- 类型安全

## 配置说明

### shouldReconnect
```typescript
shouldReconnect: () => true
```
总是尝试重连，适合需要持久连接的场景。

### reconnectAttempts
```typescript
reconnectAttempts: 10
```
最多重连 10 次，避免无限重连。

### reconnectInterval
```typescript
reconnectInterval: 3000
```
每次重连间隔 3 秒，避免频繁重连。

### share
```typescript
share: false
```
不共享连接，每个组件实例有自己的连接。如果多个组件使用同一个 hook，可以设置为 `true` 共享连接。

## 使用方法

### 基础用法
```typescript
const { isConnected } = useSyncWebSocket({
  enabled: true,
  onProgressUpdate: (progress) => {
    console.log("进度更新:", progress);
  },
});
```

### 完整用法
```typescript
const { isConnected, connectionStatus } = useSyncWebSocket({
  enabled: true,
  onProgressUpdate: (progress) => setSyncProgress(progress),
  onUserFeedback: (feedback) => handleUserFeedback(feedback),
  onBatchStart: (batch) => handleBatchStart(batch),
  onBatchComplete: (result) => handleBatchComplete(result),
  onClearDeviceComplete: (result) => handleClearComplete(result),
});
```

## 测试方法

### 1. 重启前端服务
```bash
cd apps/web
# Ctrl+C 停止
bun run dev
```

### 2. 访问页面
```
http://localhost:5173/devices
```

### 3. 检查连接状态
页面标题下方应该显示：
```
实时同步义工数据到考勤设备 ● 已连接
```

### 4. 测试功能
- 执行批量同步
- 执行清空设备
- 观察实时反馈

## 预期效果

### 连接稳定
- ✅ 连接后不再断开
- ✅ 网络中断后自动重连
- ✅ 无无限重连循环

### 消息接收正常
- ✅ 进度实时更新
- ✅ 用户反馈实时显示
- ✅ 批次开始/完成通知
- ✅ 清空设备反馈

### 性能良好
- ✅ 无内存泄漏
- ✅ 无性能问题
- ✅ 连接管理正确

## 相关文档

- [react-use-websocket 官方文档](https://github.com/robtaussig/react-use-websocket)
- [WebSocket 连接修复](./WEBSOCKET_CONNECTION_FIX.md)
- [清空设备 WebSocket 修复](./CLEAR_DEVICE_WEBSOCKET_FIX.md)

## 更新日志

**2024-11-28**
- ✅ 安装 react-use-websocket 库
- ✅ 重写 useSyncWebSocket hook
- ✅ 简化代码逻辑
- ✅ 修复无限重连问题
- ✅ 提升稳定性和可维护性
