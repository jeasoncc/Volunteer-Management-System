# 照片同步调试增强

## 问题描述

在同步义工到考勤机时，经常出现"照片下载错误，请检查照片链接是否能访问"的错误，但日志中没有显示具体的照片URL，导致难以排查问题。

## 改进内容

### 1. 在构建命令时打印照片URL

**位置**: `buildAddUserCommand` 方法

```typescript
// ✅ 新增：打印每个用户的照片URL
if (photoUrl) {
  logger.info(`📸 ${user.name}(${user.lotusId}) 照片URL: ${photoUrl}`)
} else {
  logger.warn(`⚠️  ${user.name}(${user.lotusId}) 没有照片`)
}
```

**输出示例**:
```
📸 张三(LZ-V-1234567) 照片URL: http://localhost:3000/upload/avatar/abc123.jpg
```

### 2. 在同步失败时打印详细信息

**位置**: `handleAddUserResult` 方法

```typescript
// ✅ 新增：照片相关错误时打印详细信息
if (code === 1 || errorMessage.includes('照片') || errorMessage.includes('人脸')) {
  const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, userId))
  if (user?.avatar) {
    const photoUrl = `${this.BASE_URL}${user.avatar}`
    logger.error(`🔗 照片URL: ${photoUrl}`)
    logger.error(`💡 请在浏览器中访问此URL检查照片是否可访问`)
    logger.error(`💡 请确保考勤机能访问服务器地址: ${this.BASE_URL}`)
  } else {
    logger.error(`⚠️  用户没有照片记录`)
  }
}
```

**输出示例**:
```
❌ 考勤机返回失败: 张三(LZ-V-1234567) - [错误码:1] 照片下载错误，请检查照片链接是否能访问
🔗 照片URL: http://localhost:3000/upload/avatar/abc123.jpg
💡 请在浏览器中访问此URL检查照片是否可访问
💡 请确保考勤机能访问服务器地址: http://localhost:3000
```

### 3. 在同步开始时提供诊断提示

**位置**: `addAllUsers` 方法

```typescript
// ✅ 新增：提供详细的诊断提示
logger.info(`🌐 照片服务器地址: ${this.BASE_URL}`)
logger.info(`💡 提示: 请确保考勤机能访问此地址`)
logger.info(`💡 照片URL格式示例: ${this.BASE_URL}/upload/avatar/xxx.jpg`)
logger.info(`💡 如果考勤机报"照片下载错误"，可能原因：`)
logger.info(`   1. 考勤机无法访问服务器地址 ${this.BASE_URL}`)
logger.info(`   2. 照片文件不存在或已被删除`)
logger.info(`   3. 照片格式不符合考勤机要求（建议使用JPG格式）`)
logger.info(`   4. 网络防火墙阻止了考勤机访问`)
```

**输出示例**:
```
📊 共查询到 50 个义工用于同步考勤机
🌐 照片服务器地址: http://localhost:3000
💡 提示: 请确保考勤机能访问此地址
💡 照片URL格式示例: http://localhost:3000/upload/avatar/xxx.jpg
💡 如果考勤机报"照片下载错误"，可能原因：
   1. 考勤机无法访问服务器地址 http://localhost:3000
   2. 照片文件不存在或已被删除
   3. 照片格式不符合考勤机要求（建议使用JPG格式）
   4. 网络防火墙阻止了考勤机访问
```

## 完整的日志输出示例

### 成功的情况

```
📸 张三(LZ-V-1234567) 照片URL: http://localhost:3000/upload/avatar/abc123.jpg
📋 下发命令: {
  "cmd": "addUser",
  "mode": 0,
  "name": "张三",
  "user_id": "LZ-V-1234567",
  "face_template": "http://localhost:3000/upload/avatar/abc123.jpg",
  ...
}
📤 已发送: 张三(LZ-V-1234567)，等待考勤机确认...
✅ 考勤机确认成功: LZ-V-1234567
```

### 失败的情况

```
📸 李四(LZ-V-7654321) 照片URL: http://localhost:3000/upload/avatar/xyz789.jpg
📋 下发命令: {
  "cmd": "addUser",
  "mode": 0,
  "name": "李四",
  "user_id": "LZ-V-7654321",
  "face_template": "http://localhost:3000/upload/avatar/xyz789.jpg",
  ...
}
📤 已发送: 李四(LZ-V-7654321)，等待考勤机确认...
❌ 考勤机返回失败: 李四(LZ-V-7654321) - [错误码:1] 照片下载错误，请检查照片链接是否能访问
🔗 照片URL: http://localhost:3000/upload/avatar/xyz789.jpg
💡 请在浏览器中访问此URL检查照片是否可访问
💡 请确保考勤机能访问服务器地址: http://localhost:3000
```

## 排查步骤

当看到"照片下载错误"时，按以下步骤排查：

### 1. 检查照片URL是否可访问

从日志中复制照片URL，在浏览器中打开：
```
http://localhost:3000/upload/avatar/abc123.jpg
```

- ✅ 如果能看到照片：说明照片文件存在，问题在考勤机端
- ❌ 如果404错误：说明照片文件不存在或路径错误
- ❌ 如果无法访问：说明服务器配置有问题

### 2. 检查考勤机网络连接

确认考勤机能否访问服务器：

```bash
# 在考勤机所在网络的电脑上测试
ping <服务器IP>
curl http://<服务器IP>:3000/upload/avatar/test.jpg
```

### 3. 检查服务器地址配置

确认 `BASE_URL` 配置正确：

```typescript
// apps/api/src/config/network.ts
export function getBackendUrl(): string {
  return process.env.BACKEND_URL || 'http://localhost:3000'
}
```

**常见问题**：
- ❌ 使用 `localhost` 或 `127.0.0.1`：考勤机无法访问
- ✅ 使用局域网IP（如 `http://192.168.1.100:3000`）：考勤机可以访问

### 4. 检查照片格式

考勤机可能对照片有特定要求：
- 格式：JPG（推荐）、PNG
- 大小：不超过 2MB
- 尺寸：建议 600x800 像素
- 人脸：清晰可见，正面照

### 5. 检查防火墙设置

确保防火墙允许考勤机访问服务器端口（默认3000）：

```bash
# Linux 防火墙配置
sudo ufw allow 3000/tcp

# 或者
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 0 | 成功 | - |
| 1 | 照片下载错误 | 检查照片URL是否可访问 |
| 11 | 没有找到有效人脸 | 更换清晰的正面照 |
| 12 | 人脸宽度不符合标准 | 调整照片尺寸 |
| 13 | 人脸高度不符合标准 | 调整照片尺寸 |
| 14 | 人脸清晰度不符合标准 | 使用更清晰的照片 |
| 15 | 人脸亮度不符合标准 | 调整照片亮度 |
| 16 | 人脸亮度标准差不符合标准 | 调整照片对比度 |

## 修改的文件

- `apps/api/src/modules/ws/service.ts`

## 测试建议

1. 运行同步功能
2. 观察日志输出，确认每个用户的照片URL都被打印
3. 对于失败的用户，复制照片URL在浏览器中测试
4. 根据日志提示排查问题

## 总结

通过添加详细的日志输出，现在可以：
1. 看到每个用户的完整照片URL
2. 了解失败的具体原因和错误码
3. 获得排查问题的具体步骤
4. 快速定位是服务器问题还是考勤机问题
