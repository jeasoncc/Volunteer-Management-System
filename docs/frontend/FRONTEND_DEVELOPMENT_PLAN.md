# 前端开发计划

## 📋 当前状态

### ✅ 已完成
- 登录页面（带权限检查）
- 首页仪表板（统计数据、排行榜）
- 义工管理（列表、创建、编辑、删除、搜索）
- 考勤管理（月度报表、Excel 导出）
- 侧边栏导航
- 面包屑导航
- 响应式布局

### ⚠️ 需要完善
- 义工详情页面
- 文件上传功能
- 批量操作

### ❌ 未实现
- 管理员管理
- 考勤详细记录
- 设置页面
- 用户注册

---

## 🎯 开发计划

### 阶段一：完善核心功能（1-2天）

#### 1. 义工详情页面 ⭐⭐⭐
**路由**: `/volunteers/:lotusId`

**功能**:
- 显示义工完整信息
- 基本信息卡片
- 佛教信息卡片
- 考勤统计卡片
- 操作按钮（编辑、删除、修改密码）

**文件**:
```
apps/web/src/routes/volunteers.$lotusId.tsx
apps/web/src/components/VolunteerDetail.tsx
```

**API**:
- `GET /volunteer/:lotusId` - 获取详情
- `GET /api/v1/summary/user` - 获取考勤汇总

#### 2. 文件上传功能 ⭐⭐⭐
**功能**:
- 头像上传组件
- 拖拽上传支持
- 图片预览
- 裁剪功能（可选）

**文件**:
```
apps/web/src/components/AvatarUpload.tsx
apps/web/src/services/upload.ts
```

**API**:
- `POST /api/upload/avatar` - 上传头像

**集成到**:
- 义工创建表单
- 义工编辑表单
- 义工详情页面

#### 3. 义工批量操作 ⭐⭐
**功能**:
- 表格多选
- 批量删除
- Excel 批量导入

**更新文件**:
```
apps/web/src/components/VolunteerTable.tsx
apps/web/src/routes/volunteers.tsx
```

**API**:
- `POST /volunteer/batch/delete` - 批量删除
- `POST /volunteer/batch/import` - 批量导入

---

### 阶段二：考勤详细功能（1-2天）

#### 4. 考勤详细记录页面 ⭐⭐⭐
**路由**: `/checkin/records`

**功能**:
- 考勤记录列表
- 日期范围筛选
- 按义工筛选
- 打卡时间显示
- 记录类型（人脸/手动）

**文件**:
```
apps/web/src/routes/checkin.records.tsx
apps/web/src/components/CheckinRecordTable.tsx
```

**API**:
- `GET /api/v1/summary/list` - 获取记录列表

#### 5. 义工考勤详情 ⭐⭐
**功能**:
- 在义工详情页显示考勤记录
- 月度考勤日历视图
- 打卡时间线

**更新文件**:
```
apps/web/src/routes/volunteers.$lotusId.tsx
apps/web/src/components/CheckinCalendar.tsx
```

**API**:
- `GET /api/v1/summary/user` - 获取用户考勤

---

### 阶段三：管理功能（2-3天）

#### 6. 管理员管理模块 ⭐⭐
**路由**: `/admin`

**功能**:
- 管理员列表
- 创建管理员
- 编辑管理员
- 删除管理员
- 权限管理
- 升级义工为管理员

**文件**:
```
apps/web/src/routes/admin.tsx
apps/web/src/routes/admin.$id.tsx
apps/web/src/components/AdminTable.tsx
apps/web/src/components/AdminForm.tsx
apps/web/src/services/admin.ts
```

**API**:
- `GET /admin` - 管理员列表
- `POST /admin` - 创建管理员
- `PUT /admin/:id` - 更新管理员
- `DELETE /admin/:id` - 删除管理员
- `POST /admin/promote` - 升级义工

#### 7. 义工状态管理 ⭐⭐
**功能**:
- 状态变更按钮
- 状态流程图
- 状态历史记录

**更新文件**:
```
apps/web/src/routes/volunteers.$lotusId.tsx
apps/web/src/components/VolunteerStatusManager.tsx
```

**API**:
- `PATCH /volunteer/:lotusId/status` - 变更状态

#### 8. 密码管理 ⭐
**功能**:
- 修改自己的密码
- 重置义工密码（管理员）

**文件**:
```
apps/web/src/components/ChangePasswordDialog.tsx
```

**API**:
- `POST /volunteer/:lotusId/change-password` - 修改密码

---

### 阶段四：辅助功能（1-2天）

#### 9. 设置页面 ⭐
**路由**: `/settings`

**功能**:
- 个人信息设置
- 密码修改
- 系统设置（管理员）
- 主题切换（可选）

**文件**:
```
apps/web/src/routes/settings.tsx
apps/web/src/components/SettingsForm.tsx
```

#### 10. 用户注册页面 ⭐
**路由**: `/register`

**功能**:
- 公开注册表单
- 表单验证
- 头像上传
- 注册成功提示

**文件**:
```
apps/web/src/routes/register.tsx
apps/web/src/components/RegisterForm.tsx
```

**API**:
- `POST /api/auth/register` - 用户注册
- `POST /api/upload/avatar/public` - 公开头像上传

---

## 📁 需要创建的文件清单

### 路由页面
```
apps/web/src/routes/
├── volunteers.$lotusId.tsx      # 义工详情
├── checkin.records.tsx          # 考勤记录
├── admin.tsx                    # 管理员列表
├── admin.$id.tsx                # 管理员详情
├── settings.tsx                 # 设置页面
└── register.tsx                 # 注册页面
```

### 组件
```
apps/web/src/components/
├── VolunteerDetail.tsx          # 义工详情
├── AvatarUpload.tsx             # 头像上传
├── CheckinRecordTable.tsx       # 考勤记录表格
├── CheckinCalendar.tsx          # 考勤日历
├── AdminTable.tsx               # 管理员表格
├── AdminForm.tsx                # 管理员表单
├── VolunteerStatusManager.tsx   # 状态管理
├── ChangePasswordDialog.tsx     # 密码修改
├── SettingsForm.tsx             # 设置表单
├── RegisterForm.tsx             # 注册表单
└── ExcelImport.tsx              # Excel 导入
```

### 服务
```
apps/web/src/services/
├── upload.ts                    # 上传服务
└── admin.ts                     # 管理员服务
```

---

## 🛠️ 技术实现建议

### 1. 文件上传
使用 shadcn/ui 的组件 + react-dropzone：
```bash
bunx shadcn@latest add form
bun add react-dropzone
```

### 2. 日历视图
使用 react-big-calendar 或 shadcn/ui 的 calendar：
```bash
bunx shadcn@latest add calendar
bunx shadcn@latest add popover
```

### 3. Excel 导入
使用 xlsx 库：
```bash
bun add xlsx
```

### 4. 数据可视化（可选）
使用 recharts：
```bash
bun add recharts
```

---

## 📊 开发时间估算

| 阶段 | 功能 | 预计时间 |
|------|------|----------|
| 阶段一 | 核心功能完善 | 1-2天 |
| 阶段二 | 考勤详细功能 | 1-2天 |
| 阶段三 | 管理功能 | 2-3天 |
| 阶段四 | 辅助功能 | 1-2天 |
| **总计** | | **5-9天** |

---

## 🎯 开发优先级

### 必须完成（MVP）
1. ✅ 义工详情页面
2. ✅ 文件上传功能
3. ✅ 批量操作

### 重要功能
4. ✅ 考勤详细记录
5. ✅ 管理员管理
6. ✅ 状态管理

### 可选功能
7. ⭕ 密码管理
8. ⭕ 设置页面
9. ⭕ 用户注册

---

## 📝 开发规范

### 1. 文件命名
- 路由文件：`kebab-case.tsx`
- 组件文件：`PascalCase.tsx`
- 服务文件：`camelCase.ts`

### 2. 组件结构
```typescript
// 1. 导入
import { ... } from "...";

// 2. 类型定义
interface Props { ... }

// 3. 组件
export function Component({ ... }: Props) {
  // 3.1 Hooks
  // 3.2 状态
  // 3.3 副作用
  // 3.4 事件处理
  // 3.5 渲染
  return (...)
}
```

### 3. API 调用
- 使用 TanStack Query
- 统一错误处理
- 加载状态显示
- 乐观更新

### 4. 样式
- 使用 Tailwind CSS
- 使用 shadcn/ui 组件
- 保持设计一致性

---

## 🧪 测试清单

每个功能完成后需要测试：

- [ ] 功能正常工作
- [ ] 错误处理正确
- [ ] 加载状态显示
- [ ] 响应式设计
- [ ] 无控制台错误
- [ ] API 调用正确
- [ ] 数据更新及时

---

## 📚 参考文档

- [API 文档](./API_DOCUMENTATION.md)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [TanStack Query 文档](https://tanstack.com/query)
- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Table 文档](https://tanstack.com/table)

---

## 🚀 开始开发

### 第一步：义工详情页面

```bash
# 1. 创建路由文件
touch apps/web/src/routes/volunteers.\$lotusId.tsx

# 2. 创建组件
touch apps/web/src/components/VolunteerDetail.tsx

# 3. 开始编码
```

准备好了吗？让我们开始吧！🎉
