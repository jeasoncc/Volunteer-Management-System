# 网络配置说明

## 配置文件位置

`src/config/network.ts`

## 快速切换环境

只需要修改一行代码：

```typescript
// 在 src/config/network.ts 中
export const CURRENT_ENV: Environment = 'lan';  // 改成你需要的环境
```

### 可选环境

- `'development'` - 本机开发（localhost）
- `'lan'` - 局域网访问（192.168.5.4，用于手机扫码）
- `'production'` - 外网访问（61.144.183.96）

## 环境配置

```typescript
export const NETWORK_CONFIG = {
  // 开发环境（本机）
  development: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3001',
  },
  // 局域网环境
  lan: {
    frontend: 'http://192.168.5.4:3002',
    backend: 'http://192.168.5.4:3001',
  },
  // 生产环境（外网）
  production: {
    frontend: 'http://61.144.183.96:3000',
    backend: 'http://61.144.183.96:3001',
  },
};
```

## 修改地址

如果需要修改某个环境的地址，直接编辑 `NETWORK_CONFIG` 对象：

```typescript
// 修改局域网IP
lan: {
  frontend: 'http://192.168.1.100:3002',  // 改成新IP
  backend: 'http://192.168.1.100:3001',
},

// 修改外网地址
production: {
  frontend: 'http://your-domain.com',
  backend: 'http://your-domain.com/api',
},
```

## 如何查看电脑IP地址

### Linux/Mac
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# 或
ifconfig | grep "inet "
```

### Windows
```cmd
ipconfig
```
查找 "IPv4 地址"

## 配置项说明

### LOCAL_IP
你的电脑在局域网中的IP地址。手机需要通过这个IP访问电脑。

### PORTS
- `frontend`: 前端服务端口（默认3002，可能会自动变化）
- `backend`: 后端API服务端口（固定3001）

## 使用场景

### 场景1：本机开发
```typescript
export const CURRENT_ENV: Environment = 'development';
```
- 前端：http://localhost:3000
- 后端：http://localhost:3001
- 适用于：单机开发调试

### 场景2：局域网测试（手机扫码）
```typescript
export const CURRENT_ENV: Environment = 'lan';
```
- 前端：http://192.168.5.4:3002
- 后端：http://192.168.5.4:3001
- 适用于：手机扫码上传、局域网内多设备测试

### 场景3：外网部署
```typescript
export const CURRENT_ENV: Environment = 'production';
```
- 前端：http://61.144.183.96:3000
- 后端：http://61.144.183.96:3001
- 适用于：生产环境、外网访问

## 自动应用到

这个配置会自动应用到：
- ✅ 手机扫码上传的二维码链接
- ✅ 手机端上传页面的API请求
- ✅ 所有axios请求（通过api.ts）
- ✅ 所有需要跨设备访问的功能

## 调试

在浏览器控制台运行：
```javascript
import { getNetworkInfo } from '@/config/network';
console.log(getNetworkInfo());
```

会显示所有网络配置信息。

## 注意事项

1. **确保手机和电脑在同一WiFi网络**
2. **防火墙可能需要允许端口访问**（3001和3002）
3. **IP地址可能会变化**（如果使用DHCP），需要重新配置

## 生产环境

生产环境部署时，建议：
1. 使用域名代替IP地址
2. 配置环境变量 `VITE_API_BASE_URL`
3. 使用反向代理（如Nginx）统一前后端端口
