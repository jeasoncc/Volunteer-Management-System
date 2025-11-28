# 设备同步 WebSocket 实时推送优化方案

## 当前实现

### 前端
- 使用 React Query 每秒轮询 `/sync/progress` 接口
- 优点：实现简单，不需要维护 WebSocket 连接
- 缺点：有1秒延迟，服务器压力较大

### 后端
- `sync-progress-manager.ts` 已经有订阅机制
- `subscribe()` 和 `notifyListeners()` 方法已实现
- 但目前没有 WebSocket 端点暴露给前端

## 优化方案：WebSocket 实时推送

### 架构设计

```
考勤机 ──WebSocket──> 后端服务器 ──WebSocket──> Web前端
         (设备连接)                    (进度推送)

流程：
1. 考勤机通过 /ws 连接到后端
2. Web前端通过 /ws/sync-progress 连接到后端
3. 后端收到考勤机的 addUserRet 消息
4. 后端更新 syncProgressManager
5. syncProgressManager.notifyListeners() 触发
6. 后端通过 WebSocket 推送进度到所有连接的前端
7. 前端实时更新UI
```

### 后端实现

#### 1. 添加前端 WebSocket 端点

```typescript
// apps/api/src/modules/ws/index.ts

// 存储所有连接的前端客户端
const frontendClients: Set<any> = new Set();

export const wsModule = new Elysia()
  // ... 现有代码 ...

  // 新增：前端进度推送 WebSocket
  .ws('/ws/sync-progress', {
    open(ws) {
      frontendClients.add(ws);
      logger.info('前端客户端已连接到进度推送');
      
      // 立即发送当前进度
      const currentProgress = WebSocketService.getSyncProgress();
      ws.send(JSON.stringify({
        type: 'progress',
        data: currentProgress,
      }));
    },

    close(ws) {
      frontendClients.delete(ws);
      logger.info('前端客户端已断开进度推送');
    },

    message(ws, message: any) {
      // 前端可以发送 ping 保持连接
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    },
  });
```

#### 2. 订阅进度更新并广播

```typescript
// apps/api/src/modules/ws/service.ts

// 在模块初始化时订阅进度更新
syncProgressManager.subscribe((progress) => {
  // 广播给所有连接的前端客户端
  broadcastProgressToFrontend(progress);
});

function broadcastProgressToFrontend(progress: SyncProgress) {
  const message = JSON.stringify({
    type: 'progress',
    data: progress,
  });
  
  frontendClients.forEach((client) => {
    try {
      client.send(message);
    } catch (error) {
      logger.error('发送进度到前端失败:', error);
      frontendClients.delete(client);
    }
  });
}
```

### 前端实现

#### 1. 创建 WebSocket Hook

```typescript
// apps/web/src/hooks/useSyncProgress.ts

import { useEffect, useState, useRef } from 'react';
import { getBackendUrl } from '@/config/network';

export function useSyncProgress() {
  const [progress, setProgress] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 只在有同步任务时连接
    if (!progress || progress.status === 'idle') {
      return;
    }

    const backendUrl = getBackendUrl();
    const wsUrl = backendUrl.replace('http', 'ws') + '/ws/sync-progress';

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ 进度推送已连接');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'progress') {
            setProgress(message.data);
          }
        } catch (error) {
          console.error('解析进度消息失败:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };

      ws.onclose = () => {
        console.log('❌ 进度推送已断开');
        // 如果还在同步中，5秒后重连
        if (progress?.status === 'syncing') {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    // 清理
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [progress?.status]);

  return { progress, setProgress };
}
```

#### 2. 在页面中使用

```typescript
// apps/web/src/routes/devices.tsx

// 替换现有的轮询逻辑
const { progress: syncProgress, setProgress: setSyncProgress } = useSyncProgress();

// 删除 React Query 的轮询代码
// const { data: progressData, isError } = useQuery({...});
```

## 实施步骤

### 阶段1：后端准备（1-2小时）
1. ✅ 在 `ws/index.ts` 添加 `/ws/sync-progress` 端点
2. ✅ 实现前端客户端管理（Set 存储）
3. ✅ 订阅 `syncProgressManager` 并广播
4. ✅ 测试 WebSocket 连接和消息推送

### 阶段2：前端实现（1-2小时）
1. ✅ 创建 `useSyncProgress` hook
2. ✅ 实现 WebSocket 连接和重连逻辑
3. ✅ 替换现有的轮询代码
4. ✅ 测试实时进度更新

### 阶段3：测试和优化（1小时）
1. ✅ 测试多客户端同时连接
2. ✅ 测试网络断开重连
3. ✅ 测试同步完成后的清理
4. ✅ 性能测试和优化

## 优势对比

### 轮询方案（当前）
- ✅ 实现简单
- ✅ 不需要维护连接
- ❌ 有延迟（1秒）
- ❌ 服务器压力大（每秒一次请求）
- ❌ 浪费带宽

### WebSocket 方案（优化后）
- ✅ 实时更新（0延迟）
- ✅ 服务器压力小（只在变化时推送）
- ✅ 节省带宽
- ✅ 更好的用户体验
- ❌ 需要维护连接
- ❌ 需要处理重连逻辑

## 兼容性考虑

### 降级方案
如果 WebSocket 连接失败，自动降级到轮询：

```typescript
const [useWebSocket, setUseWebSocket] = useState(true);

// WebSocket 连接失败3次后降级
if (wsFailCount >= 3) {
  setUseWebSocket(false);
}

// 降级到轮询
const { data: progressData } = useQuery({
  queryKey: ["sync", "progress"],
  queryFn: () => deviceService.getSyncProgress(),
  enabled: !useWebSocket && syncProgress?.status === "syncing",
  refetchInterval: 1000,
});
```

## 安全考虑

### 认证
WebSocket 连接需要携带认证信息：

```typescript
const token = localStorage.getItem('auth_token');
const ws = new WebSocket(`${wsUrl}?token=${token}`);
```

### 权限验证
后端验证用户权限：

```typescript
.ws('/ws/sync-progress', {
  open(ws, request) {
    const token = request.headers.get('authorization');
    if (!isValidToken(token)) {
      ws.close(1008, 'Unauthorized');
      return;
    }
    frontendClients.add(ws);
  },
});
```

## 总结

WebSocket 实时推送是更优的方案，建议在下一个迭代中实现。当前的轮询方案可以继续使用，但应该作为临时方案。

实施优先级：**中等**（功能可用但不是最优）

预计工作量：**4-5小时**
