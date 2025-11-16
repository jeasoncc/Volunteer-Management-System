# 照片上传功能修复

## 问题

注册页面上传照片时提示"照片上传失败"。

## 原因分析

原有的上传接口 `/api/upload/avatar` 需要登录认证：

```typescript
export const uploadModule = new Elysia({ prefix: '/api/upload' })
  .use(errorHandler)
  .use(authMiddleware) // 需要登录才能上传 ❌
  .post('/avatar', async ({ body }: any) => {
    // ...
  })
```

但注册页面是公开的，用户还没有登录，因此无法上传照片。

## 解决方案

创建一个公开的上传接口 `/api/upload/avatar/public`，不需要登录认证：

```typescript
export const uploadModule = new Elysia({ prefix: '/api/upload' })
  .use(errorHandler)
  
  /**
   * 公开的头像上传接口（用于注册）
   * 不需要登录
   */
  .post('/avatar/public', async ({ body }: any) => {
    const { file } = body

    // 验证文件
    if (!file) {
      throw new ValidationError('请选择文件')
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('只支持 JPG 和 PNG 格式')
    }

    // 验证文件大小（2MB）
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      throw new ValidationError('文件大小不能超过 2MB')
    }

    try {
      // 生成临时文件名
      const timestamp = Date.now()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `temp-${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

      // 保存文件
      const filePath = join(AVATAR_DIR, fileName)
      const buffer = await file.arrayBuffer()
      writeFileSync(filePath, Buffer.from(buffer))

      const url = `/upload/avatar/${fileName}`

      logger.info(`📸 公开照片上传成功: ${fileName}`)

      return {
        success: true,
        message: '照片上传成功',
        data: { url },
      }
    } catch (error) {
      logger.error('照片上传失败:', error)
      throw new ValidationError('照片上传失败')
    }
  })

  .use(authMiddleware) // 以下接口需要登录
  
  .post('/avatar', async ({ body }: any) => {
    // 原有的需要登录的上传接口
  })
```

## 前端调用

更新注册页面的上传接口地址：

```javascript
// 之前
const response = await fetch(`${API_BASE}/upload/avatar`, {
  method: 'POST',
  body: formData
})

// 现在
const response = await fetch(`${API_BASE}/api/upload/avatar/public`, {
  method: 'POST',
  body: formData
})
```

## 测试验证

### 1. 测试上传接口
```bash
curl -X POST http://localhost:3001/api/upload/avatar/public \
  -F "file=@test.jpg"
```

**响应：**
```json
{
  "success": true,
  "message": "照片上传成功",
  "data": {
    "url": "/upload/avatar/temp-1763277817971-689uzd.jpg"
  }
}
```

### 2. 验证文件
```bash
ls -lh public/upload/avatar/temp-*.jpg
```

**结果：**
```
-rw-r--r-- 251k temp-1763277817971-689uzd.jpg
```

### 3. 访问图片
```
http://localhost:3001/upload/avatar/temp-1763277817971-689uzd.jpg
```

## 安全考虑

### 1. 文件验证
- ✅ 文件类型验证（只允许 JPG、PNG）
- ✅ 文件大小限制（最大 2MB）
- ✅ 文件名随机化（防止覆盖）

### 2. 临时文件命名
使用 `temp-` 前缀标识临时上传的文件：
```
temp-{timestamp}-{random}.{ext}
```

注册成功后，可以通过定时任务清理未使用的临时文件。

### 3. 访问控制
- 公开接口：`/api/upload/avatar/public`（不需要登录）
- 私有接口：`/api/upload/avatar`（需要登录）

## 接口对比

| 接口 | 路径 | 认证 | 用途 |
|------|------|------|------|
| 公开上传 | `/api/upload/avatar/public` | ❌ 不需要 | 注册时上传照片 |
| 私有上传 | `/api/upload/avatar` | ✅ 需要登录 | 已登录用户上传/更新照片 |
| 批量上传 | `/api/upload/avatars/batch` | ✅ 需要登录 | 管理员批量上传 |

## 后续优化

### 1. 临时文件清理
创建定时任务，清理超过 24 小时未使用的临时文件：

```typescript
// src/cron/clean-temp-files.ts
import cron from 'node-cron'
import { readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'

const AVATAR_DIR = join(process.cwd(), 'public/upload/avatar')

// 每天凌晨 3 点清理临时文件
cron.schedule('0 3 * * *', () => {
  const files = readdirSync(AVATAR_DIR)
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 小时

  files.forEach(file => {
    if (file.startsWith('temp-')) {
      const filePath = join(AVATAR_DIR, file)
      const stats = statSync(filePath)
      const age = now - stats.mtimeMs

      if (age > maxAge) {
        unlinkSync(filePath)
        console.log(`🗑️  删除临时文件: ${file}`)
      }
    }
  })
})
```

### 2. 图片压缩
添加图片压缩功能，减少存储空间：

```typescript
import sharp from 'sharp'

// 压缩图片
const compressedBuffer = await sharp(buffer)
  .resize(300, 300, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer()

writeFileSync(filePath, compressedBuffer)
```

### 3. 云存储
将图片上传到云存储（如阿里云 OSS、腾讯云 COS）：

```typescript
import OSS from 'ali-oss'

const client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'lotus-avatars'
})

const result = await client.put(`avatars/${fileName}`, buffer)
const url = result.url
```

## 总结

### 问题
- ❌ 注册页面上传照片失败
- ❌ 原因：上传接口需要登录认证

### 解决
- ✅ 创建公开的上传接口
- ✅ 不需要登录即可上传
- ✅ 保持安全验证（文件类型、大小）

### 效果
- ✅ 注册页面可以正常上传照片
- ✅ 上传成功后返回图片 URL
- ✅ 图片可以正常访问和显示

---

**修复时间**: 2024-11-16  
**维护者**: 莲花斋开发团队
