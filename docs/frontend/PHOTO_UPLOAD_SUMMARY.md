# 义工照片上传功能实现总结

## ✅ 已完成的功能

### 1. 图片上传组件 (`ImageUpload.tsx`)

**功能特性**：
- 📸 照片预览（圆形头像样式）
- 📤 拖拽或点击上传
- 🔄 实时预览
- ❌ 删除照片
- 🔄 更换照片
- ⚠️ 文件验证（类型、大小）
- 💾 自动上传到服务器

**支持的格式**：
- JPG
- PNG
- WEBP

**文件大小限制**：
- 默认最大 5MB
- 可配置

**用户体验**：
- 悬停显示操作按钮
- 上传进度提示
- 成功/失败 Toast 通知
- 禁用状态支持

---

### 2. 表单集成

**位置**：
- 在义工表单顶部
- 居中显示
- 独立区域（带分隔线）

**交互流程**：
1. 点击"上传照片"按钮
2. 选择图片文件
3. 自动上传到服务器
4. 显示预览
5. 保存时一起提交

---

## 🎨 UI 设计

### 默认状态（无照片）
```
┌─────────────────────────┐
│                         │
│      ┌─────────┐        │
│      │         │        │
│      │   👤    │        │  ← 默认头像图标
│      │         │        │
│      └─────────┘        │
│                         │
│   [📤 上传照片]         │  ← 上传按钮
│                         │
│  支持 JPG、PNG、WEBP    │
│  文件大小不超过 5MB     │
└─────────────────────────┘
```

### 已上传状态
```
┌─────────────────────────┐
│                         │
│      ┌─────────┐        │
│      │         │        │
│      │  照片   │        │  ← 显示照片
│      │         │        │
│      └─────────┘        │
│                         │
│  悬停显示：             │
│  [📷 更换] [❌ 删除]    │  ← 操作按钮
└─────────────────────────┘
```

---

## 🔧 技术实现

### 文件上传流程

1. **前端验证**
```typescript
// 验证文件类型
if (!file.type.startsWith("image/")) {
  toast.error("请选择图片文件");
  return;
}

// 验证文件大小
if (file.size > maxSize * 1024 * 1024) {
  toast.error(`图片大小不能超过 ${maxSize}MB`);
  return;
}
```

2. **创建预览**
```typescript
const reader = new FileReader();
reader.onloadend = () => {
  setPreview(reader.result as string);
};
reader.readAsDataURL(file);
```

3. **上传到服务器**
```typescript
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

4. **保存 URL**
```typescript
const data = await response.json();
const imageUrl = data.data?.url || data.url;
onChange(imageUrl);
```

---

## 📁 新增文件

1. **`apps/web/src/components/ImageUpload.tsx`**
   - 图片上传组件
   - 可复用
   - 完整的错误处理

---

## 🔌 后端接口

### 上传接口
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (图片文件)

Response:
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/avatar.jpg"
  }
}
```

---

## 💡 使用方法

### 在表单中使用
```typescript
<form.Field name="avatar">
  {(field) => (
    <ImageUpload
      value={field.state.value}
      onChange={(url) => field.handleChange(url)}
      onRemove={() => field.handleChange("")}
      disabled={isLoading}
    />
  )}
</form.Field>
```

### 独立使用
```typescript
const [avatarUrl, setAvatarUrl] = useState("");

<ImageUpload
  value={avatarUrl}
  onChange={setAvatarUrl}
  onRemove={() => setAvatarUrl("")}
  maxSize={10} // 10MB
/>
```

---

## 🎯 功能特点

### 1. 用户友好
- ✅ 直观的拖拽上传
- ✅ 实时预览
- ✅ 清晰的提示信息
- ✅ 友好的错误提示

### 2. 安全性
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 服务端验证（需后端实现）

### 3. 性能优化
- ✅ 本地预览（不等待上传）
- ✅ 异步上传
- ✅ 上传状态反馈

### 4. 可维护性
- ✅ 组件化设计
- ✅ TypeScript 类型安全
- ✅ 清晰的代码结构

---

## 🔄 完整流程

### 添加义工时上传照片

1. **打开添加义工对话框**
   - 点击"添加义工"按钮

2. **上传照片**
   - 点击"上传照片"按钮
   - 选择图片文件
   - 等待上传完成
   - 查看预览

3. **填写其他信息**
   - 姓名、手机号等

4. **提交表单**
   - 照片 URL 一起提交
   - 保存到数据库

### 编辑义工时更换照片

1. **打开编辑对话框**
   - 点击义工的"编辑"按钮

2. **查看现有照片**
   - 显示当前照片

3. **更换照片**
   - 悬停在照片上
   - 点击"更换"按钮
   - 选择新照片
   - 自动上传

4. **保存更改**
   - 提交表单

---

## 🎨 样式特点

### 头像样式
- 圆形显示
- 边框虚线（未上传时）
- 边框实线（已上传时）
- 尺寸：128x128px

### 悬停效果
- 半透明黑色遮罩
- 显示操作按钮
- 平滑过渡动画

### 按钮样式
- 圆形按钮
- 图标清晰
- 颜色区分（更换/删除）

---

## 🐛 错误处理

### 文件类型错误
```
❌ 请选择图片文件
```

### 文件过大
```
❌ 图片大小不能超过 5MB
```

### 上传失败
```
❌ 上传失败，请重试
```

### 网络错误
```
❌ 网络错误，请检查连接
```

---

## 📊 数据流

```
用户选择文件
    ↓
前端验证（类型、大小）
    ↓
创建本地预览
    ↓
上传到服务器 (/api/upload)
    ↓
获取图片 URL
    ↓
更新表单字段 (avatar)
    ↓
提交表单时一起保存
```

---

## 🔐 安全建议

### 前端
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 预览前验证

### 后端（需实现）
- ⚠️ 文件类型验证
- ⚠️ 文件大小限制
- ⚠️ 文件名随机化
- ⚠️ 存储路径安全
- ⚠️ 图片压缩
- ⚠️ 病毒扫描

---

## 🎉 总结

照片上传功能已完全实现！

**用户可以**：
- 📸 上传义工照片
- 👀 实时预览
- 🔄 更换照片
- ❌ 删除照片
- ✅ 保存到服务器

**特点**：
- 简单易用
- 视觉美观
- 错误处理完善
- 性能优化

现在添加或编辑义工时，可以上传照片了！🎊
