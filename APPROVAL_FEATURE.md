# 🎯 义工审批功能

## 功能概述

实现了完整的义工审批流程，管理员可以审批、拒绝义工申请，支持单个和批量操作。

## 功能特性

### 1. 审批流程
- ✅ 待审批列表展示
- ✅ 单个审批（通过/拒绝）
- ✅ 批量审批
- ✅ 审批备注
- ✅ 审批历史记录

### 2. 状态管理
- `applicant` (申请人) - 待审批状态
- `registered` (已注册) - 审批通过
- `inactive` (未激活) - 审批拒绝

### 3. 权限控制
- 只有管理员可以访问审批功能
- 需要登录才能操作

## 后端 API

### 1. 获取待审批列表
```
GET /volunteer/approval/pending?page=1&limit=20
```

**响应**:
```json
{
  "success": true,
  "data": [...],
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### 2. 审批单个义工
```
POST /volunteer/approval/:lotusId
```

**请求体**:
```json
{
  "action": "approve",  // 或 "reject"
  "notes": "审批备注（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "审批通过成功",
  "data": {
    "lotusId": "LZ-V-1234567",
    "status": "registered",
    "reviewer": "admin"
  }
}
```

### 3. 批量审批
```
POST /volunteer/approval/batch
```

**请求体**:
```json
{
  "lotusIds": ["LZ-V-1234567", "LZ-V-7654321"],
  "action": "approve",
  "notes": "批量审批备注（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "批量审批通过成功",
  "data": {
    "count": 2,
    "status": "registered",
    "reviewer": "admin"
  }
}
```

### 4. 获取审批历史
```
GET /volunteer/approval/history?page=1&limit=20
```

## 前端页面

### 1. 审批页面 (`/approval`)

**功能**:
- 显示待审批义工列表
- 单个审批操作
- 批量选择和审批
- 审批备注输入
- 实时统计信息

**组件**:
- 统计卡片（待审批数、已选择数、今日审批数）
- 义工卡片列表
- 审批确认对话框

### 2. 首页快捷入口

在首页添加了"义工审批"快捷入口卡片。

### 3. 侧边栏导航

在侧边栏添加了"义工审批"菜单项，使用 CheckSquare 图标。

## 文件清单

### 后端文件
1. `apps/api/src/modules/volunteer/approval.ts` - 审批模块
2. `apps/api/src/index.ts` - 注册审批模块

### 前端文件
1. `apps/web/src/services/approval.ts` - 审批服务
2. `apps/web/src/routes/approval.tsx` - 审批页面
3. `apps/web/src/components/app-sidebar.tsx` - 添加导航菜单
4. `apps/web/src/routes/index.tsx` - 添加首页入口

## 使用流程

### 1. 义工申请
义工通过注册页面提交申请，状态为 `applicant`。

### 2. 管理员审批
1. 管理员登录系统
2. 进入"义工审批"页面
3. 查看待审批列表
4. 选择要审批的义工
5. 点击"通过"或"拒绝"按钮
6. 可选：输入审批备注
7. 确认审批

### 3. 批量审批
1. 勾选多个义工
2. 点击"批量通过"或"批量拒绝"
3. 输入备注（可选）
4. 确认批量审批

### 4. 审批结果
- 通过：义工状态变为 `registered`，可以正常使用系统
- 拒绝：义工状态变为 `inactive`，无法登录系统

## 数据库字段

使用现有的 `volunteer` 表字段：
- `volunteerStatus` - 义工状态
- `reviewer` - 审批人
- `notes` - 审批备注
- `updatedAt` - 更新时间

## 权限说明

### 管理员权限
- ✅ 查看待审批列表
- ✅ 审批义工申请
- ✅ 批量审批
- ✅ 查看审批历史

### 普通义工
- ❌ 无法访问审批功能
- ❌ 只能查看自己的状态

## 测试步骤

### 1. 创建测试数据
```sql
-- 创建待审批义工
INSERT INTO volunteer (
  lotus_id, id_number, account, password, name, 
  gender, phone, volunteer_status
) VALUES (
  'LZ-V-TEST001', '110101199001011234', 'test001', 
  '$2b$10$...', '测试义工', 'male', '13800138000', 
  'applicant'
);
```

### 2. 测试审批流程
1. 访问 http://localhost:3000/approval
2. 查看待审批列表
3. 测试单个审批
4. 测试批量审批
5. 验证状态变更

### 3. API 测试
```bash
# 获取待审批列表
curl -b cookies.txt http://localhost:3001/volunteer/approval/pending

# 审批通过
curl -X POST -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","notes":"测试通过"}' \
  http://localhost:3001/volunteer/approval/LZ-V-TEST001

# 批量审批
curl -X POST -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"lotusIds":["LZ-V-TEST001","LZ-V-TEST002"],"action":"approve"}' \
  http://localhost:3001/volunteer/approval/batch
```

## 后续优化建议

### 1. 通知功能
- 审批通过后发送通知给义工
- 支持邮件/短信通知
- 系统内消息通知

### 2. 审批流程增强
- 多级审批
- 审批意见讨论
- 审批流程日志

### 3. 数据统计
- 审批效率统计
- 审批通过率
- 审批人员工作量统计

### 4. 自动化
- 自动审批规则
- 定时提醒待审批
- 超时自动处理

## 相关文档

- [API 文档](./docs/api/API_DOCUMENTATION.md)
- [义工管理文档](./docs/api/volunteer/)
- [前端开发指南](./docs/frontend/FRONTEND_DEVELOPMENT_PLAN.md)

---

**创建时间**: 2024-11-19
**创建人**: Kiro AI Assistant
**功能状态**: ✅ 已完成
**测试状态**: ⏳ 待测试
