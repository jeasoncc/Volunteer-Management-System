# 环境切换指南

## 🚀 快速切换

打开 `src/config/network.ts`，修改这一行：

```typescript
export const CURRENT_ENV: Environment = 'lan';  // 改这里！
```

## 📋 环境对照表

| 环境 | 值 | 前端地址 | 后端地址 | 使用场景 |
|------|------|----------|----------|----------|
| 开发环境 | `'development'` | localhost:3000 | localhost:3001 | 本机开发 |
| 局域网 | `'lan'` | 192.168.5.4:3002 | 192.168.5.4:3001 | 手机扫码、局域网测试 |
| 生产环境 | `'production'` | 61.144.183.96:3000 | 61.144.183.96:3001 | 外网访问 |

## 💡 使用建议

### 日常开发
```typescript
export const CURRENT_ENV: Environment = 'development';
```
- ✅ 速度快
- ✅ 不需要配置IP
- ❌ 手机无法访问

### 测试手机功能
```typescript
export const CURRENT_ENV: Environment = 'lan';
```
- ✅ 手机可以扫码
- ✅ 局域网内所有设备可访问
- ❌ 需要在同一WiFi

### 部署到服务器
```typescript
export const CURRENT_ENV: Environment = 'production';
```
- ✅ 外网可访问
- ✅ 不受网络限制
- ⚠️ 需要配置服务器

## 🔧 修改地址

如果IP地址变了，修改 `src/config/network.ts` 中的配置：

```typescript
export const NETWORK_CONFIG = {
  lan: {
    frontend: 'http://新IP:3002',  // 改这里
    backend: 'http://新IP:3001',   // 改这里
  },
  production: {
    frontend: 'http://新域名或IP:3000',
    backend: 'http://新域名或IP:3001',
  },
};
```

## 🐛 调试

在浏览器控制台运行：

```javascript
// 查看当前配置
import { getNetworkInfo } from './src/config/network';
console.table(getNetworkInfo());
```

## ⚠️ 注意事项

1. **修改后需要重启开发服务器**
2. **确保后端服务器也在对应地址运行**
3. **防火墙需要开放对应端口**
4. **生产环境建议使用域名而不是IP**

## 📝 检查清单

切换环境后，检查：

- [ ] 修改了 `CURRENT_ENV`
- [ ] 重启了前端服务器
- [ ] 后端服务器在运行
- [ ] 可以正常登录
- [ ] API请求正常
- [ ] 手机可以访问（如果是lan或production）
