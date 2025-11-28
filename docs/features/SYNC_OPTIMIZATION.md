# 同步优化功能

## 功能概述

为了提高考勤机同步的成功率，添加了以下优化：

1. **同步间隔** - 每个用户之间添加延迟，避免考勤机处理不过来
2. **图片压缩** - 自动检测并压缩过大的图片

## 同步间隔

### 配置

```typescript
// apps/api/src/modules/ws/image-processor.ts
export const SYNC_CONFIG = {
  // 每个用户之间的延迟（毫秒）
  DELAY_BETWEEN_USERS: 200,  // 200ms
  
  // 批量同步时的批次大小
  BATCH_SIZE: 10,
  
  // 批次之间的延迟（毫秒）
  DELAY_BETWEEN_BATCHES: 1000,
}
```

### 效果

- 50个用户同步预计耗时：50 × 0.2秒 = 10秒
- 100个用户同步预计耗时：100 × 0.2秒 = 20秒

### 日志输出

```
📊 共查询到 50 个义工用于同步考勤机
🌐 照片服务器地址: http://192.168.5.4:3001
⏱️  同步间隔: 200ms/人
📏 图片大小限制: 500KB，超过将自动压缩
```

## 图片压缩

### 配置

```typescript
// 图片大小限制（字节）
const MAX_IMAGE_SIZE = 500 * 1024  // 500KB
const TARGET_IMAGE_SIZE = 300 * 1024  // 压缩目标 300KB
```

### 压缩逻辑

1. **检测图片大小**：检查原图是否超过 500KB
2. **自动压缩**：如果超过，使用 sharp 库压缩
3. **保存缩略图**：压缩后的图片保存到 `public/upload/avatar/thumbnails/`
4. **使用缩略图**：同步时使用压缩后的图片URL

### 压缩参数

| 原图大小 | 压缩质量 | 最大宽度 |
|---------|---------|---------|
| > 1MB | 60% | 600px |
| > 500KB | 70% | 800px |
| ≤ 500KB | 不压缩 | - |

### 日志输出

```
📏 图片过大: /upload/avatar/xxx.jpg (850.5KB > 500KB)
🔄 压缩图片: 张三(LZ-V-1234567)
✅ 图片压缩成功: 850.5KB -> 280.3KB
📦 共压缩 5 张图片
```

### 缩略图目录

```
public/
└── upload/
    └── avatar/
        ├── xxx.jpg           # 原图
        └── thumbnails/
            └── thumb_xxx.jpg  # 缩略图
```

## 依赖

### sharp 库

图片压缩使用 [sharp](https://sharp.pixelplumbing.com/) 库。

安装：
```bash
bun add sharp
```

如果 sharp 不可用，会使用备用方案（不压缩，直接复制）。

## 文件变更

### 新增文件
- `apps/api/src/modules/ws/image-processor.ts` - 图片处理工具

### 修改文件
- `apps/api/src/modules/ws/service.ts` - 集成图片处理和同步延迟

## 配置调整

如果需要调整同步速度或图片大小限制，修改 `image-processor.ts` 中的 `SYNC_CONFIG`：

```typescript
export const SYNC_CONFIG = {
  // 增加延迟（如果考勤机仍然处理不过来）
  DELAY_BETWEEN_USERS: 500,  // 改为 500ms
  
  // 降低图片大小限制（如果仍有图片下载错误）
  MAX_IMAGE_SIZE: 300 * 1024,  // 改为 300KB
}
```

## 注意事项

1. **首次压缩较慢**：第一次压缩图片时需要生成缩略图，后续会使用缓存
2. **缩略图缓存**：缩略图会保留，除非原图更新
3. **sharp 依赖**：需要安装 sharp 库才能进行图片压缩
4. **备用方案**：如果 sharp 不可用，会跳过压缩直接使用原图

## 测试建议

1. 准备一些大于 500KB 的测试图片
2. 运行同步，观察日志中的压缩信息
3. 检查 `public/upload/avatar/thumbnails/` 目录是否生成缩略图
4. 验证考勤机是否能正常下载压缩后的图片
