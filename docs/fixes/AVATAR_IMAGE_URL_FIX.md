# 义工头像显示问题修复

## 问题描述

义工管理界面中，已上传头像的义工无法正常显示头像图片。

## 根本原因

数据库中存储的头像路径是相对路径（例如：`/uploads/avatars/xxx.jpg`），但在前端显示时没有拼接后端服务器的完整地址，导致浏览器无法正确加载图片。

## 解决方案

创建统一的图片 URL 处理工具函数，自动将相对路径转换为完整的 URL。

### 1. 创建图片 URL 工具函数

**文件：** `apps/web/src/lib/image.ts`

提供两个工具函数：
- `getImageUrl(url)` - 通用图片 URL 处理
- `getAvatarUrl(avatarPath)` - 头像 URL 处理

功能：
- 如果 URL 已经是完整路径（http:// 或 https://），直接返回
- 如果是相对路径，自动拼接后端服务器地址
- 处理 undefined 和 null 值

### 2. 更新所有使用头像的组件

更新以下组件使用 `getAvatarUrl()` 函数：

1. **VolunteerDataTable.tsx** - 义工列表表格
2. **VolunteerDetails.tsx** - 义工详情页
3. **ImageUpload.tsx** - 头像上传预览
4. **nav-user.tsx** - 用户导航头像

### 修改示例

**修改前：**
```tsx
<AvatarImage src={volunteer.avatar} />
```

**修改后：**
```tsx
import { getAvatarUrl } from "@/lib/image";

<AvatarImage src={getAvatarUrl(volunteer.avatar)} />
```

## 影响范围

- 义工管理页面的头像显示
- 义工详情页面的头像显示
- 头像上传预览
- 用户导航栏头像显示

## 测试建议

1. 打开义工管理页面，检查已上传头像的义工是否正常显示
2. 点击义工查看详情，检查头像是否正常显示
3. 添加/编辑义工时上传头像，检查预览是否正常
4. 检查用户导航栏的头像是否正常显示
5. 在不同网络环境下测试（本地、局域网、外网）

## 配置说明

图片 URL 的后端地址由 `apps/web/src/config/network.ts` 中的 `CURRENT_ENV` 配置决定：

- `development` - 本机开发环境
- `lan` - 局域网环境
- `production` - 生产环境

确保 `CURRENT_ENV` 设置正确，以匹配当前的运行环境。
