# 清空设备 WebSocket 实时反馈修复

## 问题描述

清空设备时，前端在 HTTP 请求成功后立即显示"设备用户已清空"的提示，但实际上考勤机还没有确认清空操作。

### 时间线对比

**问题时间线**：
```
20:27:23 - 前端显示 "设备用户已清空" ❌ 过早
20:27:28 - 考勤机返回 delAllUserRet (code: 0) ✅ 实际完成
```

**正确时间线**：
```
20:27:23 - 前端显示 "正在清空设备用户，等待考勤机确认..." ✅
20:27:28 - 考勤机返回 delAllUserRet (code: 0) ✅
20:27:28 - 前端显示 "设备用户已清空" ✅ 正确时机
```

## 根本原因

### 1. 服务端未处理 `delAllUserRet` 消息
服务端的 WebSocket 消息处理中没有处理考勤机返回的 `delAllUserRet` 消息。

### 2. 前端在 HTTP 成功时就显示完成
前端的 `clearMutation.onSuccess` 在 HTTP 请求成功后就显示"设备用户已清空"，而不是等待考勤机确认。

### 3. 数据库更新时机错误
数据库的同步标记在发送命令时就清除了，而不是在考勤机确认后清除。

## 解决方案

### 1. 服务端添加 `delAllUserRet` 处理

#### 添加消息处理（`apps/api/src/modules/ws/index.ts`）
```typescript
// 处理清空所有用户的返回结果
if (dataCmd === 'delAllUserRet') {
  logger.info(`处理清空设备结果: code=${code}, msg=${msg}`)
  await WebSocketService.handleDeleteAllUsersResult(code, msg)
  return
}
```

#### 添加广播函数
```typescript
export function broadcastClearDeviceComplete(result: {
  success: boolean
  code: number
  message: string
}) {
  broadcastToFrontend({
    type: 'clear_device_complete',
    data: result,
  })
}
```

### 2. 服务端添加处理函数（`apps/api/src/modules/ws/service.ts`）

#### 修改 `deleteAllUsers` 方法
```typescript
static async deleteAllUsers() {
  const command: DeleteAllUsersCommand = {
    cmd: 'delAllUser',
  }

  const success = ConnectionManager.sendToAttendanceDevice(command)

  if (!success) {
    throw new DeviceNotConnectedError('YET88476')
  }

  logger.info(`📤 已发送清空设备命令，等待考勤机确认...`)

  return {
    success: true,
    message: '删除命令已发送，等待考勤机确认', // 修改提示
  }
}
```

#### 添加 `handleDeleteAllUsersResult` 方法
```typescript
static async handleDeleteAllUsersResult(code: number, msg: string) {
  try {
    if (code === 0) {
      // 清空成功，清除数据库中所有义工的同步标记
      await db
        .update(volunteer)
        .set({ syncToAttendance: false })
        .where(eq(volunteer.syncToAttendance, true))

      logger.success(`✅ 考勤机确认清空成功，已清除数据库同步标记`)

      // 🔔 广播清空完成到前端
      const { broadcastClearDeviceComplete } = await import('./index')
      broadcastClearDeviceComplete({
        success: true,
        code,
        message: '设备用户已清空，数据库同步标记已重置',
      })
    } else {
      logger.error(`❌ 考勤机返回清空失败: [错误码:${code}] ${msg}`)

      // 🔔 广播清空失败到前端
      const { broadcastClearDeviceComplete } = await import('./index')
      broadcastClearDeviceComplete({
        success: false,
        code,
        message: msg || '清空失败',
      })
    }
  } catch (error) {
    logger.error(`处理清空设备返回结果失败:`, error)
  }
}
```

### 3. 前端添加 WebSocket 回调（`apps/web/src/hooks/useSyncWebSocket.ts`）

#### 添加接口定义
```typescript
interface ClearDeviceResult {
  success: boolean;
  code: number;
  message: string;
}

interface UseSyncWebSocketOptions {
  // ...其他回调
  onClearDeviceComplete?: (result: ClearDeviceResult) => void;
}
```

#### 添加消息处理
```typescript
case "clear_device_complete":
  if (onClearDeviceComplete) {
    onClearDeviceComplete(message.data);
  }
  break;
```

### 4. 前端修改清空逻辑（`apps/web/src/routes/devices.tsx`）

#### 添加 WebSocket 回调
```typescript
onClearDeviceComplete: (result) => {
  if (result.success) {
    toast.success(result.message);
    addNotification({
      type: "warning",
      priority: "high",
      title: "设备已清空",
      message: result.message,
      actionUrl: "/devices",
      actionLabel: "去同步",
    });
    refetchStatus();
  } else {
    toast.error(`清空失败：${result.message}`);
    addNotification({
      type: "warning",
      priority: "high",
      title: "清空设备失败",
      message: `清空设备时发生错误：${result.message}`,
      actionUrl: "/devices",
      actionLabel: "重试",
    });
  }
},
```

#### 修改 `clearMutation`
```typescript
const clearMutation = useMutation({
  mutationFn: () => deviceService.clearAllUsers(),
  onMutate: () => {
    toast.info("正在清空设备用户，等待考勤机确认...");
    addNotification({
      type: "system",
      priority: "normal",
      title: "开始清空设备",
      message: "正在清空考勤机上的所有用户数据，等待考勤机确认...",
      actionUrl: "/devices",
      actionLabel: "查看详情",
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    setShowClearDialog(false);
    // 成功提示移到 WebSocket 回调中（onClearDeviceComplete）
  },
  onError: (error: any) => {
    toast.error(error.message || "发送清空命令失败");
    addNotification({
      type: "warning",
      priority: "high",
      title: "发送清空命令失败",
      message: error.message || "发送清空命令时发生错误",
      actionUrl: "/devices",
      actionLabel: "重试",
    });
  },
})
```

## 工作流程

### 修复后的完整流程

```
1. 用户点击"清空设备"
   ↓
2. 前端发送 HTTP POST /send/delAllUser
   ├─ Toast: "正在清空设备用户，等待考勤机确认..."
   └─ 通知中心: "开始清空设备"
   ↓
3. 服务端发送 delAllUser 命令到考勤机
   └─ 日志: "📤 已发送清空设备命令，等待考勤机确认..."
   ↓
4. 考勤机处理清空操作（需要几秒钟）
   ↓
5. 考勤机返回 delAllUserRet (code: 0, msg: "删除成功")
   ↓
6. 服务端处理返回结果
   ├─ 清除数据库同步标记
   ├─ 日志: "✅ 考勤机确认清空成功，已清除数据库同步标记"
   └─ WebSocket 广播 clear_device_complete
   ↓
7. 前端收到 WebSocket 消息
   ├─ Toast: "设备用户已清空，数据库同步标记已重置"
   ├─ 通知中心: "设备已清空"
   └─ 刷新设备状态
```

## 修复效果

### 之前（错误）
```
20:27:23 - 用户点击清空
20:27:23 - Toast: "正在清空设备用户..." ✅
20:27:23 - Toast: "设备用户已清空..." ❌ 过早！
20:27:23 - 通知中心: "设备已清空" ❌ 过早！
20:27:28 - 考勤机确认清空 ✅
```

### 现在（正确）
```
20:27:23 - 用户点击清空
20:27:23 - Toast: "正在清空设备用户，等待考勤机确认..." ✅
20:27:23 - 通知中心: "开始清空设备" ✅
20:27:28 - 考勤机确认清空 ✅
20:27:28 - Toast: "设备用户已清空，数据库同步标记已重置" ✅ 正确时机！
20:27:28 - 通知中心: "设备已清空" ✅ 正确时机！
```

## 测试方法

### 测试 1：正常清空
1. 访问 `/devices` 页面
2. 点击"清空设备"
3. 确认清空
4. 观察：
   - ✅ 立即显示 Toast "正在清空设备用户，等待考勤机确认..."
   - ✅ 通知中心添加 "开始清空设备"
   - ✅ 等待几秒后显示 Toast "设备用户已清空..."
   - ✅ 通知中心添加 "设备已清空"
   - ✅ 两个 Toast 的时间间隔 = 考勤机处理时间

### 测试 2：查看服务端日志
```bash
# 观察服务端日志
cd apps/api && bun run dev

# 执行清空操作后，应该看到：
📤 已发送清空设备命令，等待考勤机确认...
# ... 几秒后 ...
✅ 考勤机确认清空成功，已清除数据库同步标记
```

### 测试 3：查看考勤机消息
```bash
# 服务端日志应该显示：
📞 收到其他消息: {
  cmd: "to_client",
  data: {
    cmd: "delAllUserRet",
    code: 0,
    msg: "删除成功"
  }
}
```

## 相关文件

- `apps/api/src/modules/ws/index.ts` - 添加 delAllUserRet 处理和广播函数
- `apps/api/src/modules/ws/service.ts` - 修改 deleteAllUsers 和添加处理函数
- `apps/web/src/hooks/useSyncWebSocket.ts` - 添加 onClearDeviceComplete 回调
- `apps/web/src/routes/devices.tsx` - 修改清空逻辑

## 更新日志

**2024-11-28**
- ✅ 服务端添加 delAllUserRet 消息处理
- ✅ 服务端添加 broadcastClearDeviceComplete 广播函数
- ✅ 服务端添加 handleDeleteAllUsersResult 处理函数
- ✅ 前端添加 onClearDeviceComplete WebSocket 回调
- ✅ 前端修改清空逻辑，等待考勤机确认
- ✅ 数据库更新时机修正为考勤机确认后
- ✅ Toast 提示时机修正

## 总结

这个修复确保了清空设备操作的完整性和准确性：
1. **等待确认**：前端等待考勤机确认后才显示成功
2. **实时反馈**：通过 WebSocket 实时接收考勤机反馈
3. **数据一致性**：数据库更新在考勤机确认后进行
4. **用户体验**：清晰的进度提示（开始 → 等待 → 完成）
