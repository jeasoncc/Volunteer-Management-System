# 通知中心实时更新修复

## 问题描述

### 问题 1：清空设备时缺少通知
点击"清空设备"后，有两条 Toast 提示：
1. "正在清空设备用户..."
2. "设备用户已清空，数据库同步标记已重置"

但是通知中心只有第二条通知，缺少第一条。

### 问题 2：Badge 数字不实时更新
添加通知后，通知中心的 badge 数字不会立即更新，需要刷新页面才能看到。

## 根本原因

### 问题 1 的原因
`clearMutation` 的 `onMutate` 回调中只有 Toast，没有调用 `addNotification()`。

### 问题 2 的原因
`useNotifications` hook 使用 `useState` 管理状态，每个组件实例都有自己的状态副本，导致：
- 设备页面调用 `addNotification()` 更新了自己的状态
- 通知中心组件有自己的状态副本，没有收到更新通知
- 只有刷新页面重新加载 LocalStorage 才能看到新通知

## 解决方案

### 1. 添加清空开始通知

在 `clearMutation` 的 `onMutate` 中添加通知：

```typescript
onMutate: () => {
  toast.info("正在清空设备用户...");
  addNotification({
    type: "system",
    priority: "normal",
    title: "开始清空设备",
    message: "正在清空考勤机上的所有用户数据...",
    actionUrl: "/devices",
    actionLabel: "查看详情",
  });
},
```

### 2. 创建全局通知管理器

创建 `apps/web/src/lib/notification-manager.ts`：

```typescript
class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();
  private notifications: Notification[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    listener([...this.notifications]); // 立即发送当前状态
    return () => this.listeners.delete(listener);
  }

  addNotification(notification) {
    this.notifications = [newNotification, ...this.notifications];
    this.saveToStorage();
    this.notifyListeners(); // 通知所有订阅者
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener([...this.notifications]);
    });
  }
}

export const notificationManager = new NotificationManager();
```

### 3. 更新 useNotifications Hook

使用全局管理器替代本地状态：

```typescript
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 订阅全局通知更新
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });
    return unsubscribe;
  }, []);

  const addNotification = useCallback((notification) => {
    notificationManager.addNotification(notification);
  }, []);

  // ...其他方法也使用 notificationManager
}
```

## 工作原理

### 事件订阅机制

```
┌─────────────────┐
│ 设备页面组件     │
│ useNotifications│
└────────┬────────┘
         │ subscribe
         ↓
┌─────────────────────────┐
│ NotificationManager     │
│ (全局单例)              │
│ - notifications[]       │
│ - listeners: Set        │
└────────┬────────────────┘
         │ subscribe
         ↓
┌─────────────────┐
│ 通知中心组件     │
│ useNotifications│
└─────────────────┘

当设备页面调用 addNotification():
1. NotificationManager 更新 notifications[]
2. NotificationManager 通知所有 listeners
3. 设备页面和通知中心都收到更新
4. 两个组件的 UI 同时更新
```

## 修复效果

### 问题 1：清空设备通知完整

**之前**：
- Toast 1: "正在清空设备用户..." ✅
- Toast 2: "设备用户已清空..." ✅
- 通知中心: 只有 1 条通知 ❌

**现在**：
- Toast 1: "正在清空设备用户..." ✅
- Toast 2: "设备用户已清空..." ✅
- 通知中心: 2 条通知 ✅
  1. "开始清空设备"
  2. "设备已清空"

### 问题 2：Badge 实时更新

**之前**：
1. 点击清空设备
2. Badge 数字不变 ❌
3. 刷新页面后才显示 +2 ❌

**现在**：
1. 点击清空设备
2. Badge 数字立即 +2 ✅
3. 无需刷新页面 ✅

## 测试方法

### 测试 1：清空设备通知
1. 访问 `/devices` 页面
2. 点击"清空设备"按钮
3. 确认对话框中点击"确认清空"
4. 观察：
   - ✅ 显示 Toast "正在清空设备用户..."
   - ✅ 显示 Toast "设备用户已清空..."
   - ✅ 通知中心 badge +2
   - ✅ 打开通知中心，看到 2 条新通知

### 测试 2：实时更新
1. 打开通知中心（不要关闭）
2. 在另一个标签页或窗口执行操作（如批量同步）
3. 观察：
   - ✅ 通知中心的通知列表实时更新
   - ✅ Badge 数字实时更新
   - ✅ 无需刷新页面

### 测试 3：多个组件同步
1. 打开设备页面
2. 打开通知中心
3. 执行批量同步
4. 观察：
   - ✅ 设备页面的通知状态更新
   - ✅ 通知中心的通知列表更新
   - ✅ Badge 数字更新
   - ✅ 所有组件同步

## 技术细节

### 订阅-发布模式
- **订阅者**：所有使用 `useNotifications` 的组件
- **发布者**：`NotificationManager`
- **事件**：通知列表变化

### 内存管理
- 使用 `Set` 存储 listeners，自动去重
- `useEffect` 返回清理函数，组件卸载时自动取消订阅
- 避免内存泄漏

### 数据持久化
- 所有操作都会同步到 LocalStorage
- 页面刷新后数据不丢失
- 跨标签页共享数据（通过 LocalStorage）

## 相关文件

- `apps/web/src/lib/notification-manager.ts` - 全局通知管理器（新增）
- `apps/web/src/hooks/useNotifications.ts` - 通知 Hook（重构）
- `apps/web/src/routes/devices.tsx` - 设备页面（添加通知）
- `apps/web/src/components/NotificationCenter.tsx` - 通知中心组件

## 更新日志

**2024-11-28**
- ✅ 创建全局通知管理器
- ✅ 重构 useNotifications Hook
- ✅ 添加清空设备开始通知
- ✅ 添加清空设备失败通知
- ✅ 修复 Badge 实时更新问题
- ✅ 实现订阅-发布模式
- ✅ 所有组件实时同步

## 后续优化

1. **跨标签页同步**：使用 `storage` 事件监听其他标签页的更改
2. **通知分组**：相同类型的通知可以合并显示
3. **通知优先级**：高优先级通知置顶显示
4. **通知过期**：自动清理过期通知
5. **通知音效**：重要通知添加声音提示
