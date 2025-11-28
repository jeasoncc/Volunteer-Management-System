# 设备 YET88476 未连接问题诊断

## 问题描述

设备 YET88476 显示未连接，无法进行同步操作。

## 系统架构

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   考勤设备      │ ←────────────────────────→ │   后端服务器    │
│   YET88476      │   ws://IP:3001/ws          │   (Elysia)      │
└─────────────────┘                             └─────────────────┘
                                                        ↑
                                                        │ HTTP API
                                                        │ WebSocket
                                                        ↓
                                                ┌─────────────────┐
                                                │   前端页面      │
                                                │   /devices      │
                                                └─────────────────┘
```

## 诊断步骤

### 1. 检查后端服务状态

#### 1.1 确认后端服务正在运行

```bash
# 检查后端进程
ps aux | grep "bun.*api"

# 或者检查端口占用
lsof -i :3001
# 或
netstat -tlnp | grep 3001
```

**预期结果**：应该看到后端服务正在监听 3001 端口

#### 1.2 查看后端日志

```bash
# 进入 API 目录
cd apps/api

# 查看运行日志
# 应该看到类似的启动信息：
# 🦊 Elysia is running at http://0.0.0.0:3001
```

**关键日志**：
- ✅ `WebSocket 连接已建立` - 设备尝试连接
- ✅ `设备 YET88476 已注册` - 设备成功注册
- ❌ 如果没有这些日志，说明设备没有连接到后端

### 2. 检查设备端配置

#### 2.1 设备 WebSocket 配置

设备需要配置正确的 WebSocket 地址：

**开发环境**：
```
ws://localhost:3001/ws
```

**局域网环境**（当前配置）：
```
ws://192.168.5.4:3001/ws
```

**生产环境**：
```
ws://61.144.183.96:3001/ws
```

#### 2.2 检查设备网络连接

1. **确认设备和服务器在同一网络**
   - 设备 IP：需要确认
   - 服务器 IP：192.168.5.4（当前配置）

2. **测试网络连通性**
   ```bash
   # 从服务器 ping 设备
   ping <设备IP>
   
   # 从设备 ping 服务器
   ping 192.168.5.4
   ```

3. **检查防火墙**
   ```bash
   # 检查防火墙状态
   sudo ufw status
   
   # 如果需要，开放 3001 端口
   sudo ufw allow 3001/tcp
   ```

### 3. 检查设备声明消息

设备连接后需要发送声明消息，格式如下：

```json
{
  "cmd": "declare",
  "type": "device",
  "sn": "YET88476",
  "ip": "192.168.x.x",
  "version_code": "20000015",
  "version_name": "2.0.15",
  "timestamp": 1732800000,
  "token": "device_token"
}
```

**检查要点**：
- `cmd` 必须是 `"declare"`
- `type` 必须是 `"device"`
- `sn` 必须是 `"YET88476"`

### 4. 检查连接管理器

#### 4.1 查看连接管理器代码

文件：`apps/api/src/modules/ws/connection-manager.ts`

```typescript
private static readonly ATTENDANCE_DEVICE_SN = 'YET88476'
```

**确认**：硬编码的设备号是 `YET88476`

#### 4.2 检查设备注册逻辑

文件：`apps/api/src/modules/ws/index.ts`

```typescript
// 处理设备声明
if (message.cmd === 'declare' && message.type === 'device') {
  const deviceSn = message.sn
  ConnectionManager.register(deviceSn, ws)
  logger.success(`设备 ${deviceSn} 已注册`)
  return
}
```

### 5. 检查前端显示

#### 5.1 前端网络配置

文件：`apps/web/src/config/network.ts`

```typescript
export const CURRENT_ENV: Environment = 'lan';

export const NETWORK_CONFIG = {
  lan: {
    frontend: 'http://192.168.5.4:3000',
    backend: 'http://192.168.5.4:3001',
  },
};
```

**确认**：当前使用局域网配置

#### 5.2 前端设备状态查询

前端通过以下 API 查询设备状态：

```typescript
// 每 5 秒轮询一次
GET /device/status

// 返回格式
{
  "success": true,
  "data": {
    "devices": [
      {
        "deviceSn": "YET88476",
        "online": true  // ← 这里显示设备是否在线
      }
    ],
    "onlineDevices": ["YET88476"],
    "totalOnline": 1
  }
}
```

#### 5.3 手动测试 API

```bash
# 测试设备状态 API
curl http://192.168.5.4:3001/device/status

# 预期返回（设备在线）
{
  "success": true,
  "data": {
    "devices": [{"deviceSn": "YET88476", "online": true}],
    "onlineDevices": ["YET88476"],
    "totalOnline": 1
  }
}

# 实际返回（设备离线）
{
  "success": true,
  "data": {
    "devices": [{"deviceSn": "YET88476", "online": false}],
    "onlineDevices": [],
    "totalOnline": 0
  }
}
```

## 常见问题排查

### 问题 1：后端日志没有 "设备已注册" 消息

**可能原因**：
1. 设备没有连接到后端
2. 设备 WebSocket 地址配置错误
3. 网络不通
4. 防火墙阻止

**解决方法**：
1. 检查设备的 WebSocket 配置
2. 确认设备和服务器网络连通
3. 检查防火墙设置
4. 查看设备端日志（如果可以访问）

### 问题 2：后端日志有 "WebSocket 连接已建立" 但没有 "设备已注册"

**可能原因**：
1. 设备没有发送 `declare` 消息
2. `declare` 消息格式不正确
3. 设备 SN 不是 `YET88476`

**解决方法**：
1. 在后端添加调试日志，打印收到的所有消息：
   ```typescript
   // apps/api/src/modules/ws/index.ts
   async message(ws, message: any) {
     console.log('📨 收到设备消息:', JSON.stringify(message, null, 2))
     // ...
   }
   ```

2. 检查设备发送的消息格式

### 问题 3：设备连接后很快断开

**可能原因**：
1. 心跳包机制问题
2. 网络不稳定
3. 设备超时

**解决方法**：
1. 检查心跳包处理逻辑：
   ```typescript
   // 处理心跳包
   if (message.cmd === 'ping') {
     const deviceSn = message.sn
     ws.send(JSON.stringify({ cmd: 'pong' }))
     return
   }
   ```

2. 确认设备定期发送心跳包

### 问题 4：设备 SN 不匹配

**可能原因**：
设备实际 SN 不是 `YET88476`

**解决方法**：
1. 查看后端日志中设备注册的 SN
2. 如果不是 `YET88476`，修改连接管理器：
   ```typescript
   // apps/api/src/modules/ws/connection-manager.ts
   private static readonly ATTENDANCE_DEVICE_SN = '实际的设备SN'
   ```

## 调试工具

### 1. WebSocket 测试工具

使用 `wscat` 模拟设备连接：

```bash
# 安装 wscat
npm install -g wscat

# 连接到后端
wscat -c ws://192.168.5.4:3001/ws

# 发送声明消息
{"cmd":"declare","type":"device","sn":"YET88476","ip":"192.168.1.100","version_code":"20000015","version_name":"2.0.15","timestamp":1732800000,"token":"test"}

# 发送心跳包
{"cmd":"ping","sn":"YET88476","timestamp":1732800000}
```

### 2. 后端调试日志

在 `apps/api/src/modules/ws/index.ts` 中添加详细日志：

```typescript
.ws('/ws', {
  open(ws) {
    const clientInfo = {
      remoteAddress: ws.remoteAddress,
      // 其他连接信息
    }
    logger.info('🔌 WebSocket 连接已建立:', clientInfo)
  },

  async message(ws, message: any) {
    logger.debug('📨 收到原始消息:', JSON.stringify(message, null, 2))
    
    // 处理设备声明
    if (message.cmd === 'declare' && message.type === 'device') {
      logger.info('📋 收到设备声明:', {
        sn: message.sn,
        ip: message.ip,
        version: message.version_name,
      })
      // ...
    }
  },
})
```

### 3. 前端调试

在浏览器控制台查看设备状态：

```javascript
// 手动查询设备状态
fetch('http://192.168.5.4:3001/device/status')
  .then(r => r.json())
  .then(data => console.log('设备状态:', data))

// 查看 WebSocket 连接
// Network 标签 → WS 过滤器 → 查看 sync-progress 连接
```

## 解决方案总结

### 快速检查清单

- [ ] 后端服务正在运行（端口 3001）
- [ ] 后端日志显示 "WebSocket 连接已建立"
- [ ] 后端日志显示 "设备 YET88476 已注册"
- [ ] 设备和服务器网络连通
- [ ] 防火墙允许 3001 端口
- [ ] 设备 WebSocket 地址配置正确
- [ ] 设备发送了正确的 declare 消息
- [ ] 设备 SN 是 YET88476
- [ ] 设备定期发送心跳包
- [ ] 前端 API 返回 online: true

### 最可能的原因

根据系统架构和代码分析，设备未连接最可能的原因是：

1. **设备 WebSocket 地址配置错误**（最常见）
   - 设备配置的地址不是 `ws://192.168.5.4:3001/ws`
   - 解决：检查并修改设备配置

2. **网络不通**
   - 设备和服务器不在同一网络
   - 防火墙阻止连接
   - 解决：检查网络连通性和防火墙

3. **设备没有发送声明消息**
   - 设备连接后没有发送 `declare` 消息
   - 解决：检查设备固件或配置

4. **设备 SN 不匹配**
   - 设备实际 SN 不是 YET88476
   - 解决：查看日志确认实际 SN，修改代码

## 下一步行动

1. **立即检查**：
   ```bash
   # 查看后端日志
   cd apps/api
   # 查看是否有设备连接和注册的日志
   ```

2. **测试 API**：
   ```bash
   curl http://192.168.5.4:3001/device/status
   ```

3. **添加调试日志**：
   在 `apps/api/src/modules/ws/index.ts` 中添加详细日志

4. **使用 wscat 测试**：
   模拟设备连接，验证后端逻辑

5. **检查设备配置**：
   确认设备的 WebSocket 地址和 SN

## 相关文件

- `apps/api/src/modules/ws/index.ts` - WebSocket 主入口
- `apps/api/src/modules/ws/connection-manager.ts` - 连接管理器
- `apps/api/src/modules/ws/service.ts` - 业务逻辑
- `apps/web/src/routes/devices.tsx` - 前端设备页面
- `apps/web/src/config/network.ts` - 网络配置

## 更新日志

**2024-11-28**
- ✅ 创建设备连接诊断文档
- ✅ 分析系统架构和连接流程
- ✅ 提供详细的排查步骤
- ✅ 添加调试工具和测试方法
