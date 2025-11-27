# 照片 URL 问题修复

## 🔴 问题根源

**所有用户无法下发成功的真正原因**：照片 URL 使用了错误的 IP 地址！

### 问题表现

```
照片URL: http://192.168.101.100:3001/upload/avatar/mobile-xxx.jpeg
                ^^^^^^^^^^^^^^^^
                   旧的IP地址
```

### 正确的地址应该是

```
照片URL: http://192.168.5.4:3001/upload/avatar/mobile-xxx.jpeg
                ^^^^^^^^^^^^^^
                 当前的IP地址
```

## 🔍 问题分析

### 为什么会出现这个问题？

1. **硬编码的默认值**
```typescript
// ❌ 之前：硬编码旧IP
private static readonly BASE_URL = 
  process.env.ATTENDANCE_DEVICE_BASE_URL || 
  process.env.PUBLIC_URL || 
  'http://192.168.101.100:3001'  // 硬编码的旧IP
```

2. **前后端配置不一致**
- 前端使用 `apps/web/src/config/network.ts`
- 后端没有对应的配置文件
- 导致IP地址不同步

### 为什么考勤机无法下发？

考勤机收到命令后，会尝试从 `face_template` 字段的 URL 下载照片：

```json
{
  "cmd": "addUser",
  "face_template": "http://192.168.101.100:3001/upload/avatar/xxx.jpeg"
}
```

但是 `192.168.101.100` 这个地址：
- ❌ 不是当前服务器的IP
- ❌ 考勤机无法访问
- ❌ 照片下载失败
- ❌ 用户录入失败

## ✅ 解决方案

### 1. 创建统一的网络配置

创建 `apps/api/src/config/network.ts`，与前端配置保持一致：

```typescript
export const NETWORK_CONFIG = {
  development: {
    backend: 'http://localhost:3001',
  },
  lan: {
    backend: 'http://192.168.5.4:3001',  // 当前局域网IP
  },
  production: {
    backend: 'http://61.144.183.96:3001',
  },
}

export const CURRENT_ENV = 'lan'

export const getBackendUrl = (): string => {
  return NETWORK_CONFIG[CURRENT_ENV].backend
}
```

### 2. 更新 WebSocket 服务

```typescript
// ✅ 现在：使用统一配置
import { getBackendUrl } from '../../config/network'

export class WebSocketService {
  private static readonly BASE_URL = getBackendUrl()
  // 现在会返回: http://192.168.5.4:3001
}
```

### 3. 照片 URL 现在正确了

```typescript
const photoUrl = `${this.BASE_URL}${user.avatar}`
// 结果: http://192.168.5.4:3001/upload/avatar/xxx.jpeg
//       ^^^^^^^^^^^^^^ 正确的IP地址
```

## 🎯 如何切换环境

### 方法 1：修改配置文件（推荐）

同时修改两个文件：

1. `apps/web/src/config/network.ts`
```typescript
export const CURRENT_ENV: Environment = 'lan'  // 或 'development' 或 'production'
```

2. `apps/api/src/config/network.ts`
```typescript
export const CURRENT_ENV: Environment = 'lan'  // 保持一致
```

### 方法 2：使用环境变量

```bash
# 设置环境变量
export ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001

# 或在 .env 文件中
ATTENDANCE_DEVICE_BASE_URL=http://192.168.5.4:3001
```

### 方法 3：修改 IP 地址

如果 IP 地址变更，只需修改配置文件：

```typescript
// apps/api/src/config/network.ts
lan: {
  backend: 'http://192.168.x.x:3001',  // 修改这里
}
```

## 📋 验证步骤

### 1. 检查配置

```bash
# 查看当前配置
cat apps/api/src/config/network.ts
cat apps/web/src/config/network.ts

# 确认 IP 地址一致
```

### 2. 重启服务

```bash
# 重启后端
cd apps/api
bun run dev

# 查看日志，应该看到：
# 🌐 照片服务器地址: http://192.168.5.4:3001
```

### 3. 测试下发

```bash
# 运行测试脚本
bun run scripts/test-user-sync.ts

# 检查输出的照片URL是否正确
```

### 4. 验证考勤机能访问

```bash
# 在考勤机所在网络测试
curl -I http://192.168.5.4:3001/upload/avatar/xxx.jpeg

# 应该返回 200 OK
```

## 🔧 故障排查

### 问题：照片URL仍然是旧IP

**原因**：没有重启后端服务

**解决**：
```bash
# 停止后端
Ctrl+C

# 重新启动
bun run dev
```

### 问题：考勤机仍然无法访问

**检查清单**：
- [ ] 考勤机和服务器在同一网络
- [ ] 防火墙允许 3001 端口
- [ ] IP 地址配置正确
- [ ] 照片文件确实存在

**测试命令**：
```bash
# 在考勤机所在网络测试
ping 192.168.5.4
curl http://192.168.5.4:3001/upload/avatar/xxx.jpeg
```

### 问题：不同环境需要不同IP

**解决方案**：使用环境变量

```bash
# 开发环境
export NODE_ENV=development

# 局域网环境
export NODE_ENV=lan

# 生产环境
export NODE_ENV=production
```

## 📊 影响范围

### 修复前

- ❌ 所有用户无法下发
- ❌ 考勤机无法访问照片
- ❌ 前后端IP不一致

### 修复后

- ✅ 照片URL使用正确IP
- ✅ 考勤机可以访问照片
- ✅ 前后端配置统一
- ✅ 易于切换环境

## 🎓 经验教训

1. **不要硬编码IP地址**
   - 使用配置文件
   - 使用环境变量
   - 便于维护和切换

2. **前后端配置要一致**
   - 创建共享的配置
   - 或确保同步更新

3. **测试要覆盖网络访问**
   - 不仅测试本地
   - 也要测试远程访问

4. **日志要包含关键信息**
   - 输出完整的URL
   - 便于排查问题

## 📝 相关文件

- `apps/api/src/config/network.ts` - 后端网络配置（新建）
- `apps/web/src/config/network.ts` - 前端网络配置
- `apps/api/src/modules/ws/service.ts` - WebSocket 服务
- `PHOTO_URL_FIX.md` - 本文档

## 修复时间

2025-11-27
