# 照片同步问题排查指南

## 问题现象

考勤机返回错误：`照片下载错误，请检查照片链接是否能访问`

但是在浏览器中可以正常访问照片URL。

## 根本原因分析

虽然你的电脑可以访问照片URL，但**考勤机无法访问**。可能的原因：

### 1. 网络连接问题

考勤机可能：
- 无法访问服务器IP `192.168.5.4`
- 网络配置有问题（网关、DNS等）
- 与服务器不在同一局域网

### 2. 照片格式问题

考勤机对照片有特定要求：
- **格式**：必须是 JPG 格式（不支持 JPEG、PNG等）
- **大小**：建议不超过 500KB
- **尺寸**：建议 600x800 像素
- **人脸**：必须清晰可见，正面照

### 3. 批量同步导致超时

日志显示：
```
[2025/11/27 21:13:11] ℹ️ WebSocket 连接已关闭: 1000 - 重连前断开
```

这说明考勤机在处理大量请求时断开了连接。

## 排查步骤

### 步骤1：检查网络连通性

在考勤机所在网络的电脑上测试：

```bash
# 测试能否ping通服务器
ping 192.168.5.4

# 测试能否访问服务器端口
telnet 192.168.5.4 3001

# 测试能否下载照片
curl -I http://192.168.5.4:3001/upload/avatar/test.jpg
```

**预期结果**：
- ✅ ping 通
- ✅ telnet 连接成功
- ✅ curl 返回 200 OK

**如果失败**：
- 检查考勤机和服务器是否在同一局域网
- 检查服务器防火墙设置
- 检查路由器配置

### 步骤2：检查照片格式

从日志中看到的照片URL：
```
http://192.168.5.4:3001/upload/avatar/mobile-1764209276728-du2vs.jpeg  ❌ JPEG格式
http://192.168.5.4:3001/upload/avatar/LZ-V-9464751-fc8f74be.jpg        ✅ JPG格式
```

**问题**：大部分失败的照片都是 `.jpeg` 格式，考勤机可能不支持！

**解决方案**：将所有照片转换为 `.jpg` 格式

### 步骤3：检查照片大小

```bash
# 检查照片文件大小
ls -lh apps/api/public/upload/avatar/mobile-*.jpeg

# 如果文件太大，需要压缩
```

**建议**：
- 照片大小不超过 500KB
- 如果太大，使用图片压缩工具

### 步骤4：检查服务器防火墙

```bash
# 检查防火墙状态
sudo ufw status

# 如果端口3001未开放，执行：
sudo ufw allow 3001/tcp
sudo ufw reload

# 或者使用 firewalld
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### 步骤5：检查考勤机配置

在考勤机管理界面检查：
- IP地址配置
- 网关配置
- DNS配置
- 网络连接状态

## 解决方案

### 方案1：转换照片格式（推荐）

创建一个脚本将所有 `.jpeg` 照片转换为 `.jpg`：

```bash
#!/bin/bash
# 转换照片格式
cd apps/api/public/upload/avatar

for file in *.jpeg; do
  if [ -f "$file" ]; then
    # 使用 ImageMagick 转换
    convert "$file" "${file%.jpeg}.jpg"
    echo "转换: $file -> ${file%.jpeg}.jpg"
  fi
done
```

或者使用 Node.js 脚本：

```typescript
import { readdirSync, renameSync } from 'fs'
import { join } from 'path'

const avatarDir = 'apps/api/public/upload/avatar'
const files = readdirSync(avatarDir)

files.forEach(file => {
  if (file.endsWith('.jpeg')) {
    const oldPath = join(avatarDir, file)
    const newPath = join(avatarDir, file.replace('.jpeg', '.jpg'))
    renameSync(oldPath, newPath)
    console.log(`转换: ${file} -> ${file.replace('.jpeg', '.jpg')}`)
  }
})
```

### 方案2：修改上传逻辑

修改照片上传时的文件扩展名：

```typescript
// apps/api/src/modules/upload/service.ts
// 确保所有上传的照片都保存为 .jpg 格式

const fileExtension = '.jpg'  // 强制使用 .jpg
const filename = `${prefix}-${uniqueId}${fileExtension}`
```

### 方案3：减慢同步速度

如果是因为批量同步导致超时，可以添加延迟：

```typescript
// apps/api/src/modules/ws/service.ts
// 在批量同步时添加延迟

for (const user of users) {
  // ... 发送命令
  
  // 添加延迟，避免考勤机处理不过来
  await new Promise(resolve => setTimeout(resolve, 100))  // 延迟100ms
}
```

### 方案4：使用公网IP（如果有）

如果服务器有公网IP，修改配置：

```typescript
// apps/api/src/config/network.ts
export const CURRENT_ENV: Environment = 'production'
```

或者设置环境变量：

```bash
export ATTENDANCE_DEVICE_BASE_URL=http://61.144.183.96:3001
```

## 快速修复

### 立即可以尝试的方案

1. **重命名照片文件**：
```bash
cd apps/api/public/upload/avatar
for f in *.jpeg; do mv "$f" "${f%.jpeg}.jpg"; done
```

2. **更新数据库中的照片路径**：
```sql
UPDATE volunteer 
SET avatar = REPLACE(avatar, '.jpeg', '.jpg') 
WHERE avatar LIKE '%.jpeg';
```

3. **重新同步**：
在前端点击"同步到考勤机"按钮

## 验证修复

修复后，检查日志应该看到：

```
✅ 考勤机确认成功: LZ-V-XXXXXXX
```

而不是：

```
❌ 考勤机返回失败: XXX - [错误码:1] 照片下载错误
```

## 预防措施

### 1. 上传时统一格式

修改上传接口，确保所有照片都保存为 `.jpg` 格式。

### 2. 照片验证

在上传时验证照片：
- 格式：JPG
- 大小：< 500KB
- 尺寸：600x800
- 人脸检测：确保有清晰人脸

### 3. 网络监控

添加网络连通性检查：
```typescript
// 定期检查考勤机是否在线
setInterval(() => {
  const isOnline = ConnectionManager.isOnline('YET88476')
  if (!isOnline) {
    logger.warn('⚠️  考勤机离线')
  }
}, 60000)  // 每分钟检查一次
```

## 总结

最可能的原因是**照片格式问题**（`.jpeg` vs `.jpg`）。

**立即行动**：
1. 将所有 `.jpeg` 照片重命名为 `.jpg`
2. 更新数据库中的照片路径
3. 重新同步

如果还是失败，按照排查步骤逐一检查网络连通性。
