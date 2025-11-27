# 令牌错误提示优化总结

## 📅 更新时间
2025-11-26

## 🎯 问题描述

用户在手机上传照片时，如果令牌过期，系统会报错提示"令牌过期"，但前端没有清晰地区分"过期"和"无效"两种情况。

## ✅ 已完成的优化

### 1. 明确错误类型

#### 令牌过期
- **触发**: 超过 10 分钟未上传
- **后端消息**: "令牌已过期，请重新扫码"
- **前端显示**: 
  ```
  ⏰ 上传链接已过期
  
  请返回电脑端重新生成二维码
  ```

#### 令牌无效
- **触发**: 令牌不存在或格式错误
- **后端消息**: "令牌无效或已过期"
- **前端显示**:
  ```
  ❌ 上传链接无效
  
  请返回电脑端重新生成二维码
  ```

### 2. 优化错误处理逻辑

```typescript
// 前端代码
if (!response.ok) {
  const errorMsg = data.message || "上传失败";
  
  // 检查是否是令牌相关错误
  if (errorMsg.includes("令牌") || errorMsg.includes("token")) {
    if (errorMsg.includes("过期")) {
      throw new Error("⏰ 上传链接已过期\n\n请返回电脑端重新生成二维码");
    } else if (errorMsg.includes("无效")) {
      throw new Error("❌ 上传链接无效\n\n请返回电脑端重新生成二维码");
    }
  }
  
  throw new Error(errorMsg);
}
```

### 3. 统一有效期提示

所有地方都统一显示 **10 分钟** 有效期：

- ✅ 手机上传页面：`链接有效期 10 分钟`
- ✅ 二维码对话框：`⚠️ 链接10分钟内有效，请尽快上传`
- ✅ 错误提示页面：`确保在二维码生成后 10 分钟内扫描`

### 4. 自动清除预览

当检测到令牌错误时，自动清除已选择的图片预览：

```typescript
// 如果是过期或无效的token，清除预览
if (errorMessage.includes("过期") || 
    errorMessage.includes("无效") || 
    errorMessage.includes("令牌")) {
  setPreview(undefined);
}
```

## 📱 用户体验改进

### 之前
```
❌ 上传失败
令牌无效或已过期
```
- 不清楚是过期还是无效
- 不知道如何解决

### 现在
```
⏰ 上传链接已过期

请返回电脑端重新生成二维码
```
或
```
❌ 上传链接无效

请返回电脑端重新生成二维码
```
- 清楚知道具体问题
- 明确的解决方案
- 使用图标增强视觉效果

## 🔧 技术细节

### 后端令牌管理
```typescript
// 令牌有效期：10 分钟
const expireTime = 10 * 60 * 1000;

// 检查过期
if (Date.now() - tokenData.createdAt > expireTime) {
  uploadTokens.delete(token);
  throw new ValidationError('令牌已过期，请重新扫码');
}

// 检查无效
if (!tokenData) {
  throw new ValidationError('令牌无效或已过期');
}
```

### 前端错误识别
```typescript
// 通过关键词识别错误类型
if (errorMsg.includes("令牌") || errorMsg.includes("token")) {
  if (errorMsg.includes("过期")) {
    // 显示过期提示
  } else if (errorMsg.includes("无效")) {
    // 显示无效提示
  }
}
```

## 📊 错误场景覆盖

| 场景 | 检测方式 | 提示信息 | 用户操作 |
|------|---------|---------|---------|
| URL 无 token | 页面加载检查 | 链接无效或已过期 | 重新生成 |
| token 格式错误 | 后端验证 | 上传链接无效 | 重新生成 |
| token 不存在 | 后端验证 | 上传链接无效 | 重新生成 |
| token 已过期 | 后端时间检查 | 上传链接已过期 | 重新生成 |
| 文件类型错误 | 前端验证 | 请选择图片文件 | 选择正确文件 |
| 文件过大 | 前端验证 | 图片大小不能超过 5MB | 压缩图片 |

## 📝 修改的文件

1. **apps/web/src/routes/mobile-upload.tsx**
   - 优化错误处理逻辑
   - 区分过期和无效
   - 统一有效期为 10 分钟
   - 移除未使用的状态

2. **apps/web/src/components/MobileUploadDialog.tsx**
   - 已经正确显示 10 分钟有效期
   - 无需修改

3. **apps/api/src/modules/upload/index.ts**
   - 后端逻辑已正确
   - 无需修改

## 🎉 成果

- ✅ 错误提示清晰明确
- ✅ 区分"过期"和"无效"
- ✅ 统一有效期为 10 分钟
- ✅ 提供明确的解决方案
- ✅ 自动清除错误状态
- ✅ 使用图标增强视觉效果

## 🧪 测试建议

### 测试令牌过期
1. 生成二维码
2. 等待 10 分钟
3. 扫码上传照片
4. 应该看到"⏰ 上传链接已过期"

### 测试令牌无效
1. 手动修改 URL 中的 token 参数
2. 打开链接
3. 应该看到"链接无效或已过期"页面

### 测试正常上传
1. 生成二维码
2. 立即扫码
3. 选择照片上传
4. 应该成功上传

## 📚 相关文档

- [手机上传错误处理说明](MOBILE_UPLOAD_ERROR_HANDLING.md)
- [手机上传指南](apps/web/MOBILE_UPLOAD_GUIDE.md)
- [端口更新总结](PORT_UPDATE_SUMMARY.md)

---

**状态**: ✅ 令牌错误提示已优化完成
**测试**: 建议测试各种错误场景
