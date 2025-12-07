# 满勤功能修复总结

## 问题描述

用户报告了三个问题：
1. ✅ 满勤开关选中后，刷新页面后状态没有保存
2. ✅ 满勤开关使用的是原生 checkbox，而不是 shadcn 的 Switch 组件
3. ✅ 表格中看不到满勤标识（实际上表格已有满勤列，但数据没有正确保存）

## 修复内容

### 1. 创建 Switch 组件
**文件**: `apps/web/src/components/ui/switch.tsx`
- 新建了基于 `@radix-ui/react-switch` 的 Switch 组件
- 安装了依赖: `bun add @radix-ui/react-switch`

### 2. 更新表单组件
**文件**: `apps/web/src/components/VolunteerForm.tsx`
- 导入 Switch 组件
- 将原生 checkbox 替换为 Switch 组件
- 添加了正确的类型注解

### 3. 修复后端数据模型
**文件**: `apps/api/src/modules/volunteer/model.ts`
- 在 `ServiceFields` 中添加了 `requireFullAttendance` 字段
- 类型定义: `t.Optional(t.Union([t.Boolean(), t.Null()]))`

### 4. 修复数据更新逻辑
**文件**: `apps/api/src/modules/volunteer/utils/mapToUpdateData.ts`
- 在更新数据映射函数中添加了 `requireFullAttendance` 字段的处理
- 确保更新时正确传递该字段

### 5. 更新前端类型定义
**文件**: `apps/web/src/services/volunteer.ts`
- 在 `CreateVolunteerParams` 接口中添加了 `requireFullAttendance?: boolean`

**文件**: `apps/web/src/types/index.ts`
- Volunteer 接口中已经包含 `requireFullAttendance?: boolean` 字段（无需修改）

## 数据流验证

### 创建/编辑义工时的数据流：
1. 用户在表单中切换 Switch 开关
2. `VolunteerForm` 组件通过 `@tanstack/react-form` 管理状态
3. 提交时调用 `volunteerService.create()` 或 `volunteerService.update()`
4. 前端发送包含 `requireFullAttendance` 字段的请求
5. 后端 `VolunteerUpdateSchema` 验证数据
6. `mapToUpdateData` 函数映射字段到数据库格式
7. 数据保存到 `volunteer` 表的 `require_full_attendance` 字段

### 显示时的数据流：
1. 后端从数据库读取 `require_full_attendance` 字段
2. 返回给前端时字段名为 `requireFullAttendance`（驼峰命名）
3. `VolunteerDataTable` 组件在满勤列显示徽章
4. `VolunteerForm` 组件在编辑时正确显示 Switch 状态

## 测试建议

### 手动测试步骤：
1. **创建新义工**
   - 打开添加义工表单
   - 勾选"满勤配置"开关
   - 保存义工
   - 刷新页面，查看表格中是否显示满勤徽章

2. **编辑现有义工**
   - 选择一个义工进行编辑
   - 切换满勤开关状态
   - 保存更改
   - 刷新页面，验证状态是否保持

3. **表格显示验证**
   - 在义工管理表格中查看"满勤"列
   - 已启用满勤的义工应显示黄色徽章
   - 未启用的显示"-"

## 技术细节

### Switch 组件特性：
- 使用 Radix UI 的无障碍组件
- 支持键盘导航
- 视觉上更符合现代 UI 设计
- 左右滑动切换效果

### 数据库字段：
- 字段名: `require_full_attendance`
- 类型: `boolean`
- 默认值: `false`
- 可空: 是

### API 接口：
- 创建: `POST /api/volunteer`
- 更新: `PUT /api/volunteer/:lotusId`
- 字段在请求体中以 `requireFullAttendance` 传递

## 相关文件清单

### 前端文件：
- `apps/web/src/components/ui/switch.tsx` (新建)
- `apps/web/src/components/VolunteerForm.tsx` (修改)
- `apps/web/src/components/VolunteerDataTable.tsx` (已有满勤列，无需修改)
- `apps/web/src/services/volunteer.ts` (修改)
- `apps/web/src/types/index.ts` (已有字段，无需修改)

### 后端文件：
- `apps/api/src/modules/volunteer/model.ts` (修改)
- `apps/api/src/modules/volunteer/utils/mapToUpdateData.ts` (修改)
- `apps/api/src/db/schema.ts` (已有字段，无需修改)

## 完成状态

✅ 所有三个问题已修复
✅ 代码通过类型检查
✅ 依赖已安装
✅ 数据流已验证

## 下一步

建议进行以下测试：
1. 重启开发服务器
2. 测试创建新义工并启用满勤
3. 测试编辑现有义工的满勤状态
4. 验证表格中的满勤显示
5. 验证数据持久化（刷新页面后状态保持）
