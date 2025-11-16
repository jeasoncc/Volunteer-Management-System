# WebSocket 模块

WebSocket 模块，处理考勤设备的 WebSocket 连接和设备命令管理。

## 📁 模块结构

```
src/modules/ws/
├── index.ts                # Controller - 路由定义和 WebSocket 处理
├── service.ts              # Service - 业务逻辑层
├── connection-manager.ts   # 连接管理器 - WebSocket 连接管理
├── model.ts                # DTO/Schema - 数据传输对象
├── types.ts                # TypeScript 类型定义
├── errors.ts               # 自定义错误类
├── config.ts               # 路由配置
├── utils.ts                # 工具函数（已废弃，保留兼容）
└── README.md               # 本文档
```

## 🎯 职责划分

### Controller (`index.ts`)
- ✅ WebSocket 连接处理
- ✅ HTTP 路由定义
- ✅ 参数验证
- ✅ 调用 Service 层
- ✅ 错误处理

### Service (`service.ts`)
- ✅ 业务逻辑
- ✅ 数据库查询
- ✅ 命令构建
- ✅ 调用 ConnectionManager

### ConnectionManager (`connection-manager.ts`)
- ✅ WebSocket 连接管理
- ✅ 设备注册/注销
- ✅ 命令发送
- ✅ 连接状态查询

## 🔌 WebSocket 连接

### 连接地址
```
ws://localhost:3001/ws
```

### 设备声明消息
设备连接后需要发送声明消息：

```json
{
  "cmd": "declare",
  "type": "device",
  "sn": "YET88476",
  "ip": "192.168.101.22",
  "version_code": "20000015",
  "version_name": "7.9.17",
  "timestamp": 1763200800,
  "token": ""
}
```

### 心跳消息
设备需要定期发送心跳：

```json
{
  "cmd": "ping",
  "sn": "YET88476",
  "timestamp": 1763200830
}
```

服务器会响应：

```json
{
  "cmd": "pong"
}
```

## 📡 HTTP API 端点

### 1. 添加单个用户
```
POST /send/adduser
```

**请求体：**
```json
{
  "lotusId": "VOL-001"
}
```

**响应：**
```json
{
  "success": true,
  "message": "用户添加成功",
  "data": {
    "lotusId": "VOL-001",
    "name": "张三"
  }
}
```

### 2. 批量添加所有用户
```
POST /send/addAllUser
```

**响应：**
```json
{
  "success": true,
  "message": "批量添加完成",
  "data": {
    "total": 100,
    "successCount": 98,
    "failCount": 2
  }
}
```

### 3. 删除所有用户
```
POST /send/delAllUser
```

### 4. 在线授权
```
POST /send/onlineAuthorization
```

### 5. 添加图片广告
```
POST /send/addImageAd
```

**请求体：**
```json
{
  "id": "ad001",
  "duration": "3000",
  "imageUrl": "http://192.168.101.100:3001/public/ad.jpg"
}
```

### 6. 设置访客申请二维码
```
POST /send/setVisitorApplyValue
```

**请求体：**
```json
{
  "value": 0,
  "photoUrl": "http://192.168.101.100:3001/public/qr.jpg"
}
```

### 7. 获取设备状态
```
GET /device/status
```

**响应：**
```json
{
  "success": true,
  "data": {
    "attendanceDevice": {
      "sn": "YET88476",
      "online": true
    },
    "onlineDevices": ["YET88476"],
    "totalOnline": 1
  }
}
```

## 🔧 使用示例

### 在其他模块中使用 ConnectionManager

```typescript
import { ConnectionManager } from '../ws/connection-manager';

// 检查设备是否在线
const isOnline = ConnectionManager.isOnline('YET88476');

// 发送命令到设备
const success = ConnectionManager.sendCommand('YET88476', {
  cmd: 'customCommand',
  data: {...}
});

// 获取所有在线设备
const devices = ConnectionManager.getOnlineDevices();
```

### 在其他模块中使用 Service

```typescript
import { WebSocketService } from '../ws/service';

// 添加用户
const result = await WebSocketService.addUser('VOL-001');

// 获取设备状态
const status = WebSocketService.getDeviceStatus();
```

## 🔄 设备命令格式

所有发送到设备的命令都会被包装成以下格式：

```json
{
  "cmd": "to_device",
  "from": "server",
  "to": "YET88476",
  "data": {
    // 实际命令内容
  }
}
```

## ⚠️ 注意事项

1. **连接管理**：使用 ConnectionManager 统一管理所有 WebSocket 连接
2. **设备注册**：设备必须先发送 declare 消息才能被识别
3. **心跳机制**：设备需要定期发送心跳保持连接
4. **错误处理**：所有错误都会被统一捕获和格式化
5. **命令发送**：命令发送失败会抛出 DeviceNotConnectedError

## 🔄 迁移说明

### 从旧代码迁移

**旧代码：**
```typescript
import { commandFn } from './utils';
commandFn(attendanceDevice, command);
```

**新代码：**
```typescript
import { ConnectionManager } from './connection-manager';
ConnectionManager.sendToAttendanceDevice(command);
```

### 主要改进

1. ✅ 移除全局变量 `attendanceDevice`
2. ✅ 使用 ConnectionManager 统一管理连接
3. ✅ 支持多设备连接
4. ✅ 完善的错误处理
5. ✅ 清晰的职责分离

## 📝 TODO

- [ ] 添加设备心跳超时检测
- [ ] 添加命令执行结果回调
- [ ] 添加设备状态变更通知
- [ ] 完善设备管理界面
- [ ] 添加命令队列机制
