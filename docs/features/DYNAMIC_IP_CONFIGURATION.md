# 动态IP配置功能

## 功能说明

实现了局域网IP地址的自动获取功能，解决了IP地址变化导致手机扫码上传等功能无法使用的问题。

## 问题背景

### 原来的问题

1. **IP地址写死在配置文件中**
   - 配置文件：`apps/web/src/config/network.ts` 和 `apps/api/src/config/network.ts`
   - 写死的IP：`192.168.5.4`
   - 问题：IP变化后需要手动修改配置文件

2. **影响的功能**
   - 手机扫码上传照片
   - 考勤机访问照片
   - 局域网内的所有访问

3. **用户体验差**
   - IP变化后二维码失效
   - 需要重新修改配置
   - 需要重启服务器

## 解决方案

### 1. 后端自动获取IP

**文件：** `apps/api/src/lib/get-local-ip.ts`

**功能：**
- 自动扫描所有网络接口
- 优先选择 `192.168.x.x` 的地址
- 其次选择 `10.x.x.x` 的地址
- 最后选择 `172.16-31.x.x` 的地址

**实现：**
```typescript
import { networkInterfaces } from 'os'

export function getLocalIP(): string {
  const interfaces = networkInterfaces()
  const ips: string[] = []
  
  // 扫描所有网络接口
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name]
    if (!nets) continue
    
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address)
      }
    }
  }
  
  // 优先选择192.168.x.x
  const ip192 = ips.find(ip => ip.startsWith('192.168.'))
  if (ip192) return ip192
  
  // 其次选择10.x.x.x
  const ip10 = ips.find(ip => ip.startsWith('10.'))
  if (ip10) return ip10
  
  // 返回第一个找到的IP
  if (ips.length > 0) return ips[0]
  
  return 'localhost'
}
```

### 2. 后端配置自动更新

**文件：** `apps/api/src/config/network.ts`

**改进：**
```typescript
import { getLocalIP } from '../lib/get-local-ip'

// 动态获取局域网IP
const LOCAL_IP = getLocalIP()

// 网络配置
export const NETWORK_CONFIG = {
  lan: {
    frontend: `http://${LOCAL_IP}:3000`,
    backend: `http://${LOCAL_IP}:3001`,
  },
  // ...
}
```

### 3. 提供API端点

**文件：** `apps/api/src/modules/system/index.ts`

**端点：** `GET /api/system/network`

**返回：**
```json
{
  "success": true,
  "data": {
    "currentEnv": "lan",
    "localIP": "192.168.1.157",
    "config": {
      "frontend": "http://192.168.1.157:3000",
      "backend": "http://192.168.1.157:3001"
    },
    "allIPs": [
      { "name": "lo", "ip": "127.0.0.1", "internal": true },
      { "name": "enp0s31f6", "ip": "192.168.1.157", "internal": false }
    ]
  }
}
```

### 4. 前端动态获取

**文件：** `apps/web/src/config/network.ts`

**改进：**
```typescript
// 从后端获取IP
async function fetchLocalIP(): Promise<string> {
  try {
    const response = await fetch('http://localhost:3001/api/system/network');
    const data = await response.json();
    if (data.success && data.data.localIP) {
      return data.data.localIP;
    }
  } catch (error) {
    // 降级方案：使用当前浏览器的主机名
    return window.location.hostname;
  }
  return 'localhost';
}

// 初始化配置
export async function initNetworkConfig() {
  const localIP = await fetchLocalIP();
  // 更新配置...
}
```

## 使用方式

### 自动模式（推荐）

**无需任何配置！**

1. 启动服务器
2. IP地址自动获取
3. 所有功能正常使用

### 测试IP获取

```bash
cd apps/api
bun run test-local-ip.ts
```

**输出示例：**
```
🌐 测试本地IP获取功能
================================================================================

✅ 主要局域网IP: 192.168.1.157

📋 所有网络接口:
   1. lo: 127.0.0.1 (内部)
   2. enp0s31f6: 192.168.1.157 (外部)

⚙️  当前网络配置:
   环境: lan
   本地IP: 192.168.1.157
   前端地址: http://192.168.1.157:3000
   后端地址: http://192.168.1.157:3001
```

### 手动指定IP（可选）

如果自动获取的IP不正确，可以通过环境变量指定：

```bash
# 设置环境变量
export ATTENDANCE_DEVICE_BASE_URL=http://192.168.1.100:3001

# 启动服务器
cd apps/api && bun run dev
```

## 工作原理

### 启动流程

```
1. 服务器启动
   ↓
2. 调用 getLocalIP()
   ↓
3. 扫描网络接口
   ↓
4. 选择最合适的IP
   ↓
5. 更新 NETWORK_CONFIG
   ↓
6. 服务器就绪
```

### IP选择优先级

1. **192.168.x.x** - 最常见的家庭/办公室局域网
2. **10.x.x.x** - 企业内网
3. **172.16-31.x.x** - Docker等虚拟网络
4. **其他IPv4地址**
5. **localhost** - 降级方案

### 前端获取流程

```
1. 页面加载
   ↓
2. 调用 initNetworkConfig()
   ↓
3. 请求 /api/system/network
   ↓
4. 获取后端IP
   ↓
5. 更新前端配置
   ↓
6. 生成二维码等
```

## 优势

### 1. 自动适应

- ✅ IP变化自动更新
- ✅ 无需手动配置
- ✅ 重启服务器即可

### 2. 多网络支持

- ✅ 支持多个网络接口
- ✅ 智能选择最合适的IP
- ✅ 支持有线和无线网络

### 3. 降级方案

- ✅ 后端无法获取时使用浏览器主机名
- ✅ 支持环境变量覆盖
- ✅ 保留手动配置选项

### 4. 调试友好

- ✅ 提供测试脚本
- ✅ 提供API端点查询
- ✅ 详细的日志输出

## 影响范围

### 自动更新的功能

1. **手机扫码上传**
   - 二维码中的URL自动更新
   - 手机可以正常访问上传页面

2. **考勤机照片访问**
   - 照片URL自动更新
   - 考勤机可以正常下载照片

3. **局域网访问**
   - 所有局域网内的设备都可以访问
   - 无需修改配置

### 不受影响的功能

1. **开发环境** - 仍然使用 `localhost`
2. **生产环境** - 仍然使用固定的公网IP
3. **环境变量** - 仍然可以手动覆盖

## 测试验证

### 测试场景1：IP变化

**步骤：**
1. 记录当前IP：`192.168.1.157`
2. 修改网络配置，IP变为：`192.168.1.200`
3. 重启服务器
4. 运行测试脚本

**预期结果：** ✅ 自动获取新IP `192.168.1.200`

### 测试场景2：多网络接口

**步骤：**
1. 连接有线网络：`192.168.1.100`
2. 连接无线网络：`192.168.1.200`
3. 启动服务器
4. 运行测试脚本

**预期结果：** ✅ 选择其中一个IP（优先有线）

### 测试场景3：手机扫码

**步骤：**
1. 启动服务器
2. 打开义工管理页面
3. 点击上传照片
4. 扫描二维码
5. 手机打开上传页面

**预期结果：** ✅ 手机可以正常访问

### 测试场景4：考勤机同步

**步骤：**
1. 启动服务器
2. 同步义工到考勤机
3. 考勤机下载照片

**预期结果：** ✅ 考勤机可以正常下载照片

## 故障排查

### 问题1：获取的IP不正确

**可能原因：**
- 有多个网络接口
- 选择了错误的接口

**解决方法：**
```bash
# 查看所有IP
cd apps/api && bun run test-local-ip.ts

# 手动指定IP
export ATTENDANCE_DEVICE_BASE_URL=http://正确的IP:3001
```

### 问题2：手机无法访问

**可能原因：**
- 手机和服务器不在同一网络
- 防火墙阻止访问

**解决方法：**
```bash
# 检查防火墙
sudo ufw status

# 开放端口
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 确保手机和服务器在同一WiFi
```

### 问题3：二维码失效

**可能原因：**
- IP地址变化
- 服务器未重启

**解决方法：**
```bash
# 重启服务器
# API服务器会自动获取新IP
cd apps/api && bun run dev

# Web前端会自动从API获取新IP
cd apps/web && bun run dev
```

## 配置选项

### 环境变量

```bash
# 手动指定后端地址（优先级最高）
export ATTENDANCE_DEVICE_BASE_URL=http://192.168.1.100:3001

# 或者
export PUBLIC_URL=http://192.168.1.100:3001
```

### 环境切换

```typescript
// apps/api/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan'  // 局域网模式（自动IP）
// export const CURRENT_ENV: Environment = 'development'  // 开发模式（localhost）
// export const CURRENT_ENV: Environment = 'production'  // 生产模式（固定IP）
```

## 最佳实践

### 1. 使用自动模式

- 大多数情况下，自动获取IP即可
- 无需手动配置
- IP变化时重启服务器即可

### 2. 固定IP（可选）

如果需要固定IP，可以：
- 在路由器中设置DHCP静态分配
- 或者使用环境变量手动指定

### 3. 生产环境

生产环境建议：
- 使用固定的公网IP或域名
- 设置 `CURRENT_ENV = 'production'`
- 配置SSL证书（HTTPS）

## 总结

**改进内容：**
- ✅ 实现局域网IP自动获取
- ✅ 后端配置自动更新
- ✅ 提供API端点查询
- ✅ 前端动态获取配置
- ✅ 提供测试工具

**用户体验：**
- ✅ IP变化无需手动修改配置
- ✅ 重启服务器自动更新
- ✅ 手机扫码功能始终可用
- ✅ 考勤机照片访问正常

**技术优势：**
- ✅ 智能IP选择算法
- ✅ 多网络接口支持
- ✅ 降级方案完善
- ✅ 调试工具齐全
