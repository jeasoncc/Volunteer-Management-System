# 不压缩下发功能

## 功能说明

在同步失败后，提供"不压缩下发"选项，使用原始照片重试，避免因压缩导致的质量问题。

## 使用场景

### 场景 1：压缩导致清晰度下降

**问题：**
```
❌ 失败: 陈璋 - 人脸清晰度不符合标准 [原1850.5KB->压缩180.2KB]
```

**分析：**
- 原始照片 1850.5KB
- 压缩后 180.2KB（压缩过度）
- 导致人脸清晰度不符合标准

**解决方法：**
点击"不压缩下发"按钮，使用原始照片重试

### 场景 2：压缩后仍然失败

**问题：**
```
❌ 失败: 李四 - 没有找到照片 [原850.5KB->压缩320.8KB]
```

**分析：**
- 压缩后 320.8KB
- 但仍然失败

**解决方法：**
1. 先尝试"不压缩下发"（使用原始照片）
2. 如果还是失败，再尝试"Base64重试"

## 界面说明

### 失败重试区域

当有义工同步失败时，会显示：

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  8 个义工同步失败  可尝试不同方式重试                │
│                                                          │
│                    [不压缩下发]  [Base64重试]           │
└─────────────────────────────────────────────────────────┘
```

### 两个按钮

| 按钮 | 功能 | 适用场景 |
|------|------|---------|
| **不压缩下发** | 使用原始照片重试 | 压缩导致质量问题 |
| **Base64重试** | 使用Base64格式重试 | URL访问问题 |

## 使用方法

### 步骤 1：查看失败日志

点击"失败"卡片（红色），查看失败原因和照片大小：

```
[15:47:17] ❌ 失败: 陈璋 - 人脸清晰度不符合标准 [原1850.5KB->压缩180.2KB]
```

### 步骤 2：判断失败原因

根据照片大小信息判断：

- **压缩过度**（压缩后<200KB）→ 使用"不压缩下发"
- **照片太大**（原始>1MB）→ 可能需要重新上传
- **URL问题** → 使用"Base64重试"

### 步骤 3：选择重试方式

**情况 A：压缩导致质量问题**
```
点击 [不压缩下发] 按钮
```

**情况 B：URL访问问题**
```
点击 [Base64重试] 按钮
```

### 步骤 4：查看重试结果

重试后会重新开始同步，可以在日志中看到：

```
[15:48:01] 📸 陈璋: 原始照片 1850.5KB (不压缩)
[15:48:01] 📤 发送: 陈璋 (LZ-V-3658028)
[15:48:02] ✅ 成功: 陈璋 (LZ-V-3658028)
```

## 技术实现

### 后端实现

#### 1. 添加 skipCompression 参数

```typescript
static async addAllUsers(options?: { 
  strategy?: 'all' | 'unsynced' | 'changed'; 
  validatePhotos?: boolean;
  photoFormat?: 'url' | 'base64';
  skipCompression?: boolean;  // 新增
}) {
  // ...
}
```

#### 2. 跳过压缩逻辑

```typescript
if (skipCompression) {
  // 跳过压缩，使用原始照片
  logger.info(`📸 [${user.name}] 使用原始照片（不压缩）`)
  compressionResult = {
    path: user.avatar,
    originalSize: imageInfo.size,
    compressedSize: imageInfo.size,
    wasCompressed: false,
  }
} else if (imageInfo.needsCompression) {
  // 正常压缩逻辑
  compressionResult = await processUserAvatar(user.avatar)
}
```

#### 3. 新增重试方法

```typescript
static async retryFailedUsersWithoutCompression(failedUsers) {
  return await this.syncToDevice({
    userIds: failedUsers.map(u => u.lotusId),
    strategy: 'retry',
    validatePhotos: false,
    photoFormat: 'url',
    skipCompression: true,  // 跳过压缩
  })
}
```

### 前端实现

#### 1. 添加 mutation

```typescript
const retryWithoutCompressionMutation = useMutation({
  mutationFn: (failedUsers) =>
    deviceService.retryFailedUsersWithoutCompression(failedUsers),
  onSuccess: () => {
    toast.info("不压缩重试命令已发送，使用原始照片...");
  },
})
```

#### 2. 添加按钮

```tsx
<Button
  onClick={() =>
    retryWithoutCompressionMutation.mutate(syncProgress.failedUsers)
  }
  disabled={retryWithoutCompressionMutation.isPending}
  title="使用原始照片重试（不压缩）"
>
  不压缩下发
</Button>
```

## 日志对比

### 正常压缩

```
[15:47:16] 📸 陈璋: 850.5KB -> 320.8KB ✅已压缩
[15:47:16] 📤 发送: 陈璋 (LZ-V-3658028)
```

### 不压缩下发

```
[15:48:01] 📸 陈璋: 原始照片 1850.5KB (不压缩)
[15:48:01] 📤 发送: 陈璋 (LZ-V-3658028)
```

## 注意事项

### 1. 照片大小限制

- 考勤机通常有照片大小限制（300-500KB）
- 使用原始照片可能因为太大而失败
- 建议先查看照片大小再决定是否不压缩

### 2. 网络带宽

- 原始照片更大，传输时间更长
- 如果网络较慢，可能导致超时
- 建议在网络良好时使用

### 3. 设备性能

- 大照片可能影响考勤机性能
- 如果设备处理能力有限，建议压缩后下发

## 决策流程图

```
同步失败
    ↓
查看失败日志
    ↓
检查照片大小信息
    ↓
    ├─ 压缩后<200KB？
    │   └─ 是 → [不压缩下发]
    │
    ├─ 原始>1MB？
    │   └─ 是 → 重新上传小照片
    │
    └─ URL无法访问？
        └─ 是 → [Base64重试]
```

## 使用建议

### 优先级

1. **首选**：查看失败原因和照片大小
2. **次选**：根据情况选择重试方式
3. **最后**：如果都失败，考虑重新上传照片

### 最佳实践

1. **压缩过度** → 不压缩下发
2. **照片太大** → 重新上传
3. **URL问题** → Base64重试
4. **其他问题** → 检查网络和设备

## 完成状态

✅ 添加 skipCompression 参数
✅ 后端支持不压缩下发
✅ 前端添加按钮
✅ 日志显示"不压缩"标记
✅ 代码通过类型检查

现在你可以在失败后点击"不压缩下发"按钮，使用原始照片重试了！
