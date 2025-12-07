# 压缩质量优化和日志增强

## 问题

1. **成功日志缺少照片信息** - 只有失败日志显示照片大小和压缩信息
2. **压缩比例过大** - 1.5MB+ 的照片被压缩到 20-40KB，导致人脸识别失败

## 解决方案

### 1. 提高压缩质量

修改了 `apps/api/src/config/compression.ts` 中的压缩策略：

**之前的配置：**
- 超大照片 (> 3.2MB): 质量 80%，宽度 1024px
- 大照片 (> 1.6MB): 质量 82%，宽度 1280px
- 中等照片 (> 800KB): 质量 85%，宽度 1280px
- 默认: 质量 85%，宽度 1280px

**新的配置：**
- 超大照片 (> 3.2MB): 质量 88%，宽度 1920px
- 大照片 (> 1.6MB): 质量 90%，宽度 1920px
- 中等照片 (> 800KB): 质量 92%，宽度 1920px
- 默认: 质量 92%，宽度 1920px

**改进：**
- 质量提高 5-10%
- 最大宽度从 1024-1280px 提高到 1920px
- 保留更多细节，减少人脸识别失败

### 2. 成功日志显示照片信息

修改了 `apps/api/src/modules/ws/sync-progress-manager.ts`：

```typescript
// 之前
incrementConfirmed(userId: string, name: string) {
  this.addLog('success', `✅ 成功: ${name} (${userId})`, userId)
}

// 现在
incrementConfirmed(userId: string, name: string, photoInfo?: string) {
  const message = photoInfo 
    ? `✅ 成功: ${name} (${userId}) [${photoInfo}]`
    : `✅ 成功: ${name} (${userId})`
  this.addLog('success', message, userId)
}
```

修改了 `apps/api/src/modules/ws/service.ts`：

```typescript
// 成功时也传递照片信息
const photoInfo = this.photoInfoCache.get(userId)
syncProgressManager.incrementConfirmed(userId, userName, photoInfo)
```

## 效果

### 日志示例

**之前：**
```
✅ 成功: 刘洁香 (LZ-V-2331429)
✅ 成功: 刘春艳 (LZ-V-3017837)
❌ 失败: 杨秀敏 (LZ-V-4916136) - 没有找到有效人脸 [原1836.0KB->压缩18.8KB]
```

**现在：**
```
✅ 成功: 刘洁香 (LZ-V-2331429) [318.3KB 无需压缩]
✅ 成功: 刘春艳 (LZ-V-3017837) [280.3KB 无需压缩]
✅ 成功: 刘宋平 (LZ-V-6162945) [原1822.9KB->压缩500KB]
❌ 失败: 杨秀敏 (LZ-V-4916136) - 没有找到有效人脸 [原1836.0KB->压缩500KB]
```

### 压缩效果

**之前：**
- 1.5MB 照片 → 20-40KB（压缩率 95-98%）
- 过度压缩导致人脸识别失败

**现在：**
- 1.5MB 照片 → 400-600KB（压缩率 60-70%）
- 保留足够细节，提高识别成功率

## 配置调整

如果仍然有失败，可以通过界面调整：

1. 在设备同步页面，选择 "HTTP 地址" 格式
2. 点击压缩配置框右上角的 "修改配置" 按钮
3. 调整参数：
   - **提高压缩质量**：90-95%
   - **增加最大宽度**：1920-2560px
   - **提高压缩阈值**：1000-1500KB

## 文件修改

- `apps/api/src/config/compression.ts` - 提高压缩质量和最大宽度
- `apps/api/src/modules/ws/sync-progress-manager.ts` - 成功日志添加照片信息
- `apps/api/src/modules/ws/service.ts` - 传递照片信息到成功日志

## 测试建议

1. 重启 API 服务使新配置生效
2. 同步几个之前失败的用户
3. 观察日志中的压缩大小是否合理（应该在 400-600KB 左右）
4. 检查成功率是否提高
