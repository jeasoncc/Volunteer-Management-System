# 设备同步 WebSocket 功能 - 快速启动指南

## 🚀 5分钟快速体验

### 1. 启动服务（2分钟）

```bash
# 终端 1：启动后端
cd apps/api
bun run dev

# 终端 2：启动前端
cd apps/web
bun run dev
```

等待服务启动完成，看到类似输出：
```
✓ Built in XXXms
➜  Local:   http://localhost:5173/
```

### 2. 访问新页面（1分钟）

打开浏览器访问：
```
http://localhost:5173/devices-new
```

检查页面标题下方是否显示：
```
实时同步义工数据到考勤设备 ● 已连接
```

如果显示绿色的 "● 已连接"，说明 WebSocket 连接成功！

### 3. 执行测试同步（2分钟）

#### 方式 1：单个用户同步
1. 在"单个同步"输入框中输入：`LHZ0001`
2. 点击"同步"按钮
3. 观察 Toast 提示

#### 方式 2：批量同步
1. 选择"增量同步"策略
2. 选择"HTTP 地址"格式
3. 点击"开始同步"按钮
4. 观察实时进度更新

### 4. 查看效果

#### 实时进度
- ✅ 进度条实时更新（无延迟）
- ✅ 日志实时滚动
- ✅ 统计数据实时变化
- ✅ 预计剩余时间动态计算

#### Toast 提示
- ✅ 批次开始：蓝色 Toast "正在下发 X 个人员信息..."
- ✅ 用户失败：红色 Toast "XXX 同步失败：原因"
- ✅ 批次完成：绿色/黄色 Toast "同步完成：统计"

#### 通知中心
1. 点击右上角的铃铛图标
2. 查看"设备同步"类型的通知
3. 点击通知可以跳转回设备页面

---

## 🆚 对比测试

### 打开两个页面对比

**旧版页面（轮询）**：
```
http://localhost:5173/devices
```

**新版页面（WebSocket）**：
```
http://localhost:5173/devices-new
```

### 执行相同的同步任务

在两个页面中同时执行批量同步，观察：

| 对比项 | 旧版（轮询） | 新版（WebSocket） |
|--------|-------------|------------------|
| 进度更新 | 1-2秒延迟 | 实时（< 100ms） |
| 网络请求 | 每秒1次 | 仅1个连接 |
| 用户反馈 | 无 | 实时 Toast + 通知 |
| 服务器负载 | 高 | 低 |

---

## 🔍 调试技巧

### 查看 WebSocket 消息

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 点击 WS（WebSocket）过滤器
4. 选择 `sync-progress` 连接
5. 切换到 Messages 标签

你会看到实时消息：
```json
{
  "type": "batch_start",
  "data": {
    "batchId": "SYNC-20241128-143022-a1b2",
    "total": 10,
    "strategy": "unsynced",
    "photoFormat": "url"
  }
}

{
  "type": "progress",
  "data": {
    "total": 10,
    "sent": 5,
    "confirmed": 3,
    "failed": 0,
    "skipped": 0,
    "status": "syncing",
    ...
  }
}

{
  "type": "user_feedback",
  "data": {
    "lotusId": "LHZ0001",
    "name": "张三",
    "status": "success",
    "code": 0,
    "message": "同步成功",
    "timestamp": "2024-11-28T14:30:25.123Z"
  }
}

{
  "type": "batch_complete",
  "data": {
    "batchId": "SYNC-20241128-143022-a1b2",
    "total": 10,
    "confirmed": 8,
    "failed": 2,
    "skipped": 0,
    "duration": 45
  }
}
```

### 查看服务端日志

后端控制台会显示详细日志：
```
📊 共查询到 10 个义工用于同步考勤机
📸 照片格式: HTTP URL
🌐 照片服务器地址: http://localhost:3000
⏱️  同步间隔: 300ms/人
📏 图片大小限制: 200KB，超过将自动压缩

📤 已发送: 张三(LHZ0001)，等待考勤机确认...
✅ 考勤机确认成功: LHZ0001

📤 已发送: 李四(LHZ0002)，等待考勤机确认...
❌ 考勤机返回失败: 李四(LHZ0002) - [错误码:11] 没有找到有效人脸

🎉 同步完成！成功 8，失败 2，跳过 0
```

---

## ❓ 常见问题

### Q: WebSocket 显示"未连接"？
**A**: 
1. 检查后端服务是否启动
2. 检查端口是否正确（默认 3000）
3. 查看浏览器控制台是否有错误

### Q: 进度不更新？
**A**: 
1. 检查 WebSocket 连接状态
2. 刷新页面重新连接
3. 查看浏览器控制台的 WebSocket 消息

### Q: Toast 不显示？
**A**: 
1. 检查页面是否有 `<Toaster />` 组件
2. 查看浏览器控制台是否有错误
3. 尝试手动调用 `toast.info("测试")`

### Q: 通知中心没有记录？
**A**: 
1. 检查 LocalStorage 中的 `app-notifications`
2. 查看浏览器控制台是否有错误
3. 尝试手动添加一条通知测试

---

## 📚 更多文档

- [完整实施文档](../features/DEVICE_SYNC_WEBSOCKET_IMPLEMENTATION.md)
- [详细测试指南](./DEVICE_SYNC_WEBSOCKET_TESTING.md)
- [方案设计文档](../features/DEVICE_SYNC_WEBSOCKET_REALTIME.md)
- [总结文档](../../DEVICE_SYNC_WEBSOCKET_SUMMARY.md)

---

## 🎉 开始使用

现在你已经了解了基本用法，可以：

1. ✅ 在开发环境中测试新功能
2. ✅ 对比新旧版本的差异
3. ✅ 查看实时通信效果
4. ✅ 体验通知中心集成

如果一切正常，可以考虑将新版页面作为默认页面使用！
