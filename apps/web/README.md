# 莲花斋义工管理系统 - 前端

基于 React + Vite + TanStack Router/Query 的现代化前端应用。

## 📋 目录

- [技术栈](#技术栈)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [路由说明](#路由说明)
- [组件说明](#组件说明)
- [API 集成](#api-集成)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

## 🛠️ 技术栈

- **框架**: React 19
- **构建工具**: Vite 7
- **路由**: TanStack Router (文件路由系统)
- **状态管理**: TanStack Query (React Query)
- **表单**: TanStack Form
- **表格**: TanStack Table v8
- **UI 组件**: shadcn/ui + Tailwind CSS 4
- **HTTP 客户端**: Axios
- **日期处理**: dayjs
- **代码规范**: Biome
- **图标**: Lucide React
- **通知**: Sonner (Toast)
- **图表**: Recharts
- **Excel 导出**: xlsx

## ✨ 功能模块

### 1. 认证模块 ✅
- ✅ 用户登录（账号密码）
- ✅ 用户登出
- ✅ 会话管理（Cookie）
- ✅ 路由守卫（未登录自动跳转）
- ✅ 权限检查（useAuth Hook）
- ✅ 超级管理员权限控制

### 2. 首页仪表板 ✅
- ✅ 统计数据概览
  - 义工总数
  - 本月活跃义工
  - 本月服务时长
  - 本月打卡次数
- ✅ 本月服务时长排行榜（Top 10）
- ✅ 快捷入口（义工、考勤、管理员、文档）
- ✅ 数据可视化图表

### 3. 义工管理 ✅
- ✅ 义工列表（TanStack Table）
  - 服务端分页
  - 多列排序
  - 全局搜索（姓名、ID、手机号）
  - 高级筛选（状态、角色、日期范围）
  - 列可见性控制
  - 表格密度调整
- ✅ 义工创建表单（TanStack Form）
  - 基本信息（姓名、手机、身份证、性别、出生日期等）
  - 佛教信息（法名、学历、皈依状态、宗教身份等）
  - 义工服务信息（服务岗位、服务时间、健康状况等）
  - 头像上传
  - 表单验证
- ✅ 义工编辑表单
  - 预填充现有数据
  - 完整字段编辑
- ✅ 义工详情查看
  - Dialog 弹窗展示
  - 完整信息展示（联系信息、佛教信息、义工服务、其他信息）
  - 从详情页快速编辑
- ✅ 义工详情页面（独立路由）
  - 完整信息展示
  - 考勤汇总统计（最近3个月）
  - 编辑、删除操作
- ✅ 义工删除
  - 确认对话框
  - 乐观更新
- ✅ 批量操作
  - 批量删除
  - 批量导入（Excel）
  - 批量添加
  - 批量审批
- ✅ 数据导出
  - Excel 导出
  - CSV 导出
  - 自定义列导出
- ✅ 角色管理（超级管理员）
  - 升级为管理员
  - 降级为义工
- ✅ 审批功能
  - 待审批义工列表
  - 审批通过/拒绝
  - 审批备注

### 4. 考勤管理 ✅
- ✅ 月度考勤报表
  - 年月选择器
  - 统计概览（参与义工数、总时长、总次数）
  - 义工考勤明细列表
  - 排序和搜索
- ✅ 考勤记录列表
  - 日期范围筛选
  - 按义工筛选
  - 考勤类型显示（人脸识别/手动）
  - 查看义工详情
- ✅ 陌生人考勤记录
  - 陌生人考勤列表
  - 关联到义工
- ✅ Excel 导出
  - 志愿者服务时间统计表
  - 快捷导出（本月、上月、本季度、本年度）
  - 自定义日期范围导出
  - 多种导出规则

### 5. 管理员管理 ✅
- ✅ 管理员列表（TanStack Table）
  - 分页、排序、搜索
- ✅ 管理员创建
  - 表单验证
  - 角色选择
- ✅ 管理员编辑
  - 信息更新
  - 角色修改
- ✅ 管理员删除
  - 确认对话框
- ✅ 角色管理
  - 超级管理员
  - 管理员
  - 义工

### 6. 审批管理 ✅
- ✅ 待审批列表
  - 分页显示
  - 审批操作
  - 审批备注

### 7. 助念排班 ✅
- ✅ 排班日历视图
- ✅ 排班表单
- ✅ 排班管理

### 8. 往生者管理 ✅
- ✅ 往生者列表
- ✅ 往生者表单（创建/编辑）
- ✅ 往生者信息管理

### 9. 设备管理 ✅
- ✅ 设备列表
- ✅ 设备管理

### 10. 文档管理 ✅
- ✅ 志愿者服务时间统计表导出
- ✅ 快捷导出（本月、上月、本季度、本年度）
- ✅ 自定义日期范围导出
- ✅ Excel 格式导出

### 11. 设置页面 ✅
- ✅ 个人信息查看
- ✅ 修改密码
- ✅ 系统信息展示
- ✅ 主题设置（明暗模式）
- ✅ 通知中心

## 🚀 快速开始

### 前置要求

- [Bun](https://bun.sh) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 20.0.0

### 安装依赖

```bash
# 在项目根目录
bun install
```

### 环境变量配置

创建 `apps/web/.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=莲花斋义工管理系统
VITE_APP_VERSION=1.0.0
```

### 开发模式

```bash
# 在项目根目录启动所有服务
bun run dev

# 或仅启动前端
cd apps/web
bun run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
cd apps/web
bun run build
```

### 预览生产版本

```bash
cd apps/web
bun run serve
```

## 📁 项目结构

```
apps/web/
├── src/
│   ├── components/          # 组件
│   │   ├── ui/             # UI 基础组件（shadcn/ui）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── ...         # 更多 UI 组件
│   │   ├── DataTable.tsx   # 通用数据表格组件
│   │   ├── VolunteerDataTable.tsx  # 义工表格组件
│   │   ├── VolunteerDetails.tsx    # 义工详情组件
│   │   ├── VolunteerForm.tsx      # 义工表单组件
│   │   ├── CheckinTable.tsx       # 考勤表格组件
│   │   ├── CheckinRecordsTable.tsx # 考勤记录表格
│   │   ├── AdminTable.tsx         # 管理员表格组件
│   │   ├── AdminForm.tsx          # 管理员表单组件
│   │   ├── BatchActionBar.tsx     # 批量操作栏
│   │   ├── BatchImportDialog.tsx  # 批量导入对话框
│   │   ├── BatchAddVolunteers.tsx # 批量添加组件
│   │   ├── AdvancedFilter.tsx     # 高级筛选组件
│   │   ├── DateRangeFilter.tsx    # 日期范围筛选
│   │   ├── FilterTags.tsx         # 筛选标签
│   │   ├── ConfirmDialog.tsx      # 确认对话框
│   │   ├── EmptyState.tsx         # 空状态组件
│   │   ├── LoadingSkeleton.tsx    # 加载骨架屏
│   │   ├── HighlightText.tsx      # 高亮文本组件
│   │   ├── ImageUpload.tsx        # 图片上传组件
│   │   ├── Pagination.tsx          # 分页组件
│   │   ├── DashboardLayout.tsx    # 仪表板布局
│   │   ├── app-sidebar.tsx        # 侧边栏
│   │   ├── nav-main.tsx           # 主导航
│   │   ├── nav-user.tsx           # 用户导航
│   │   ├── login-form.tsx         # 登录表单
│   │   ├── ThemeProvider.tsx      # 主题提供者
│   │   ├── ThemeSettings.tsx      # 主题设置
│   │   ├── NotificationCenter.tsx # 通知中心
│   │   ├── PermissionGuard.tsx   # 权限守卫
│   │   ├── ProtectedRoute.tsx    # 受保护路由
│   │   ├── ErrorBoundary.tsx     # 错误边界
│   │   └── NotFound.tsx           # 404 页面
│   ├── routes/             # 路由页面（TanStack Router 文件路由）
│   │   ├── __root.tsx      # 根路由（布局）
│   │   ├── index.tsx       # 首页仪表板
│   │   ├── login.tsx       # 登录页
│   │   ├── volunteers.tsx  # 义工管理
│   │   ├── volunteers.$lotusId.tsx      # 义工详情页
│   │   ├── volunteers.$lotusId.edit.tsx # 义工编辑页
│   │   ├── checkin.tsx     # 考勤管理
│   │   ├── checkin.records.tsx    # 考勤记录
│   │   ├── checkin.strangers.tsx # 陌生人考勤
│   │   ├── admin.tsx       # 管理员管理
│   │   ├── approval.tsx   # 审批管理
│   │   ├── chanting.tsx   # 助念排班
│   │   ├── deceased.tsx   # 往生者管理
│   │   ├── devices.tsx    # 设备管理
│   │   ├── documents.tsx  # 文档管理
│   │   └── settings.tsx   # 设置页面
│   ├── services/           # API 服务层
│   │   ├── auth.ts         # 认证服务
│   │   ├── volunteer.ts    # 义工服务
│   │   ├── checkin.ts      # 考勤服务
│   │   ├── admin.ts        # 管理员服务
│   │   ├── approval.ts     # 审批服务
│   │   ├── chanting.ts     # 助念服务
│   │   ├── deceased.ts     # 往生者服务
│   │   ├── device.ts       # 设备服务
│   │   ├── document.ts     # 文档服务
│   │   └── upload.ts       # 上传服务
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useAuth.ts      # 认证 Hook
│   │   ├── usePermission.ts # 权限 Hook
│   │   ├── useNotifications.ts # 通知 Hook
│   │   ├── useKeyboardShortcuts.ts # 键盘快捷键
│   │   ├── useDuplicateCheck.ts # 重复检查
│   │   └── use-mobile.ts   # 移动端检测
│   ├── lib/                # 工具库
│   │   ├── api.ts          # API 客户端（Axios 配置）
│   │   ├── query-client.ts # React Query 配置
│   │   ├── toast.ts        # Toast 通知配置
│   │   ├── export.ts       # 导出工具（Excel/CSV）
│   │   └── utils/          # 工具函数
│   │       ├── date.ts     # 日期工具
│   │       ├── format.ts   # 格式化工具
│   │       └── index.ts    # 通用工具
│   ├── types/              # TypeScript 类型定义
│   │   ├── index.ts        # 全局类型
│   │   └── notification.ts # 通知类型
│   ├── constants/          # 常量
│   │   ├── index.ts        # 通用常量
│   │   ├── cache.ts        # 缓存键
│   │   └── queryKeys.ts   # Query Keys
│   ├── features/           # 功能模块（按功能组织）
│   │   ├── admin/         # 管理员功能
│   │   ├── checkin/       # 考勤功能
│   │   ├── dashboard/     # 仪表板功能
│   │   └── volunteers/    # 义工功能
│   ├── main.tsx            # 应用入口
│   ├── styles.css          # 全局样式
│   └── routeTree.gen.ts   # 路由树（自动生成）
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── biome.json              # Biome 配置
└── package.json            # 依赖配置
```

## 🗺️ 路由说明

使用 TanStack Router 的文件路由系统，路由与文件结构一一对应：

| 路由 | 文件 | 说明 | 权限要求 |
|------|------|------|----------|
| `/` | `index.tsx` | 首页仪表板 | 需要登录 |
| `/login` | `login.tsx` | 登录页 | 无需登录 |
| `/volunteers` | `volunteers.tsx` | 义工管理列表 | 需要登录 |
| `/volunteers/$lotusId` | `volunteers.$lotusId.tsx` | 义工详情页 | 需要登录 |
| `/volunteers/$lotusId/edit` | `volunteers.$lotusId.edit.tsx` | 义工编辑页 | 需要登录 |
| `/checkin` | `checkin.tsx` | 考勤管理 | 需要登录 |
| `/checkin/records` | `checkin.records.tsx` | 考勤记录列表 | 需要登录 |
| `/checkin/strangers` | `checkin.strangers.tsx` | 陌生人考勤 | 需要登录 |
| `/admin` | `admin.tsx` | 管理员管理 | 需要管理员权限 |
| `/approval` | `approval.tsx` | 审批管理 | 需要登录 |
| `/chanting` | `chanting.tsx` | 助念排班 | 需要登录 |
| `/deceased` | `deceased.tsx` | 往生者管理 | 需要登录 |
| `/devices` | `devices.tsx` | 设备管理 | 需要登录 |
| `/documents` | `documents.tsx` | 文档管理 | 需要登录 |
| `/settings` | `settings.tsx` | 设置页面 | 需要登录 |

## 🧩 组件说明

### 核心组件

#### DataTable
通用数据表格组件，基于 TanStack Table，提供：
- 服务端/客户端分页
- 多列排序
- 全局搜索
- 列筛选
- 列可见性控制
- 表格密度调整
- 数据导出（Excel/CSV）
- 行选择（可选）

#### VolunteerDataTable
义工专用表格组件，基于 `DataTable`，提供：
- 义工特定列定义
- 操作菜单（查看、编辑、删除、角色管理）
- 批量操作支持
- 自定义导出列

#### VolunteerDetails
义工详情展示组件，用于：
- Dialog 弹窗展示
- 独立详情页面
- 完整信息展示（联系信息、佛教信息、义工服务、其他信息）

#### VolunteerForm
义工表单组件，基于 TanStack Form，提供：
- 创建/编辑模式
- 完整字段支持
- 表单验证
- 头像上传集成

### UI 组件

所有 UI 组件基于 [shadcn/ui](https://ui.shadcn.com)，包括：
- Button, Input, Card, Table
- Dialog, DropdownMenu, Tabs
- Badge, Avatar, Select
- DatePicker, Calendar
- 等等...

## 🔌 API 集成

### 认证

```typescript
import { authService } from '@/services/auth'

// 登录
await authService.login({ account, password })

// 登出
await authService.logout()

// 获取当前用户
await authService.me()
```

### 义工管理

```typescript
import { volunteerService } from '@/services/volunteer'

// 获取列表（分页）
await volunteerService.getList({ page: 1, pageSize: 20 })

// 获取详情
await volunteerService.getByLotusId('LZ-V-6020135')

// 创建义工
await volunteerService.create({ name, phone, idNumber, gender, ... })

// 更新义工
await volunteerService.update(lotusId, { name, phone, ... })

// 删除义工
await volunteerService.delete(lotusId)

// 批量删除
await volunteerService.batchDelete(['lotusId1', 'lotusId2'])

// 批量导入
await volunteerService.batchImport(file)

// 更新角色（超级管理员）
await volunteerService.updateRole(lotusId, 'admin' | 'volunteer')
```

### 考勤管理

```typescript
import { checkinService } from '@/services/checkin'

// 获取月度报表
await checkinService.getMonthlyReport({ year: 2025, month: 11 })

// 获取考勤记录
await checkinService.getRecords({ startDate, endDate, lotusId })

// 导出 Excel
const blob = await checkinService.exportVolunteerService(startDate, endDate)
```

### 使用 React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

// 查询数据
const { data, isLoading } = useQuery({
  queryKey: ['volunteers', page, pageSize],
  queryFn: () => volunteerService.getList({ page, pageSize }),
  enabled: isAuthenticated,
})

// 修改数据
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: volunteerService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    toast.success('创建成功！')
  },
  onError: (error) => {
    toast.error(error.message || '创建失败')
  },
})
```

## 💻 开发指南

### 代码规范

使用 Biome 进行代码检查和格式化：

```bash
# 检查代码
bun run lint

# 格式化代码
bun run format

# 检查并修复
bun run check
```

### 添加新路由

1. 在 `src/routes/` 目录下创建新文件，例如 `new-page.tsx`
2. 使用 `createFileRoute` 创建路由：

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/new-page')({
  component: NewPage,
})

function NewPage() {
  return <div>新页面</div>
}
```

3. 路由会自动注册到路由树中

### 添加新组件

1. 在 `src/components/` 目录下创建组件文件
2. 使用 TypeScript 和函数组件
3. 使用 Tailwind CSS 进行样式设计
4. 遵循现有的组件结构

### 添加新服务

1. 在 `src/services/` 目录下创建服务文件
2. 使用 `api` 客户端进行请求：

```typescript
import { api } from '@/lib/api'

export const newService = {
  getList: (params) => api.get('/new-endpoint', { params }),
  create: (data) => api.post('/new-endpoint', data),
  // ...
}
```

### 使用 TanStack Table

```typescript
import { useReactTable, getCoreRowModel, ... } from '@tanstack/react-table'

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  // ...
})
```

### 使用 TanStack Form

```typescript
import { useForm } from '@tanstack/react-form'

const form = useForm({
  defaultValues: { name: '', phone: '' },
  onSubmit: async ({ value }) => {
    await onSubmit(value)
  },
})
```

### 添加 UI 组件

使用 shadcn CLI 添加组件：

```bash
cd apps/web
pnpx shadcn@latest add dialog
pnpx shadcn@latest add select
pnpx shadcn@latest add form
```

## 🐛 常见问题

### 1. API 请求失败

**问题**: API 请求返回 401 或连接失败

**解决方案**:
- 检查 `.env` 中的 `VITE_API_BASE_URL` 是否正确
- 确保后端服务已启动（默认 http://localhost:3001）
- 检查网络连接和 CORS 配置

### 2. 路由不工作

**问题**: 路由跳转失败或显示 404

**解决方案**:
- 确保已安装 `@tanstack/router-plugin`
- 检查 `vite.config.ts` 中的插件配置
- 运行 `bun run dev` 重新生成路由树

### 3. 样式不生效

**问题**: Tailwind CSS 样式没有应用

**解决方案**:
- 检查 `tailwind.config.js` 配置
- 确保 `@tailwindcss/vite` 插件已添加到 Vite 配置
- 检查类名是否正确拼写

### 4. 类型错误

**问题**: TypeScript 类型检查失败

**解决方案**:
- 运行 `bun run build` 查看详细错误信息
- 检查 `tsconfig.json` 配置
- 确保所有类型定义文件已正确导入

### 5. 构建失败

**问题**: `bun run build` 执行失败

**解决方案**:
- 检查所有依赖是否已安装：`bun install`
- 检查代码中是否有语法错误
- 查看构建日志中的具体错误信息

## 📚 相关文档

- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [TanStack Table 文档](https://tanstack.com/table)
- [TanStack Form 文档](https://tanstack.com/form)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License
