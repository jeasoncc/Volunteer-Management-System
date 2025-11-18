# 莲花斋义工管理系统 - 前端

基于 React + Vite + TanStack Router/Query 的现代化前端应用。

## 技术栈

- **框架**: React 19
- **构建工具**: Vite 7
- **路由**: TanStack Router
- **状态管理**: TanStack Query (React Query)
- **表单**: TanStack Form
- **表格**: TanStack Table
- **UI 组件**: shadcn/ui + Tailwind CSS 4
- **HTTP 客户端**: Axios
- **日期处理**: dayjs
- **代码规范**: Biome

## 功能模块

### 1. 认证模块
- ✅ 用户登录
- ✅ 用户登出
- ✅ 会话管理
- ✅ 路由守卫

### 2. 首页仪表板
- ✅ 统计数据概览（义工总数、活跃义工、服务时长、打卡次数）
- ✅ 本月服务时长排行榜
- ✅ 快捷入口（义工、考勤、管理员、文档）

### 3. 义工管理
- ✅ 义工列表（使用 TanStack Table）
- ✅ 客户端分页、排序、筛选
- ✅ 全局搜索
- ✅ 义工创建表单
- ✅ 义工编辑表单
- ✅ 义工详情页面
- ✅ 义工删除
- 🚧 批量操作
- 🚧 头像上传

### 4. 考勤管理
- ✅ 月度考勤报表
- ✅ 考勤统计概览
- ✅ 考勤数据表格（使用 TanStack Table）
- ✅ 排序和搜索功能
- ✅ Excel 导出
- ✅ 考勤记录列表页面
- ✅ 日期范围筛选
- 🚧 手动添加考勤

### 5. 管理员管理
- ✅ 管理员列表
- ✅ 管理员创建
- ✅ 管理员编辑
- ✅ 管理员删除
- ✅ 角色管理

### 6. 文档管理
- ✅ 志愿者服务时间统计表导出
- ✅ 快捷导出（本月、上月等）
- ✅ 自定义日期范围导出
- ✅ Excel 格式导出

### 7. 设置页面
- ✅ 个人信息查看
- ✅ 修改密码
- ✅ 系统信息展示
- 🚧 通知设置

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
bun run build
```

### 预览生产版本

```bash
bun run serve
```

## 项目结构

```
src/
├── components/          # 组件
│   ├── ui/             # UI 基础组件（shadcn/ui）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── alert.tsx
│   │   └── dialog.tsx
│   ├── Layout.tsx      # 布局组件
│   ├── VolunteerTable.tsx   # 义工表格组件（TanStack Table）
│   ├── CheckinTable.tsx     # 考勤表格组件（TanStack Table）
│   └── VolunteerForm.tsx    # 义工表单组件（TanStack Form）
├── hooks/              # 自定义 Hooks
│   └── useAuth.ts      # 认证 Hook
├── lib/                # 工具库
│   ├── api.ts          # API 客户端
│   ├── query-client.ts # React Query 配置
│   └── utils.ts        # 工具函数
├── routes/             # 路由页面
│   ├── __root.tsx      # 根路由
│   ├── index.tsx       # 首页仪表板
│   ├── login.tsx       # 登录页
│   ├── volunteers.tsx  # 义工管理
│   └── checkin.tsx     # 考勤管理
├── services/           # API 服务
│   ├── auth.ts         # 认证服务
│   ├── volunteer.ts    # 义工服务
│   ├── checkin.ts      # 考勤服务
│   └── upload.ts       # 上传服务
├── types/              # 类型定义
│   └── index.ts        # 全局类型
├── main.tsx            # 应用入口
└── styles.css          # 全局样式
```

## 环境变量

创建 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=莲花斋义工管理系统
VITE_APP_VERSION=1.0.0
```

## API 集成

### 认证

```typescript
import { authService } from './services/auth'

// 登录
await authService.login({ account, password })

// 登出
await authService.logout()

// 获取当前用户
await authService.me()
```

### 义工管理

```typescript
import { volunteerService } from './services/volunteer'

// 获取列表
await volunteerService.getList({ page: 1, pageSize: 20 })

// 获取详情
await volunteerService.getByLotusId('LZ-V-6020135')

// 创建义工
await volunteerService.create({ name, phone, idNumber, gender })

// 更新义工
await volunteerService.update(lotusId, { name, phone })

// 删除义工
await volunteerService.delete(lotusId)
```

### 考勤管理

```typescript
import { checkinService } from './services/checkin'

// 获取月度报表
await checkinService.getMonthlyReport({ year: 2025, month: 11 })

// 导出 Excel
const blob = await checkinService.exportVolunteerService(startDate, endDate)
```

## 使用 React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// 查询数据
const { data, isLoading } = useQuery({
  queryKey: ['volunteers', page],
  queryFn: () => volunteerService.getList({ page }),
})

// 修改数据
const mutation = useMutation({
  mutationFn: volunteerService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['volunteers'] })
  },
})
```

## 路由

使用 TanStack Router 的文件路由系统：

- `/` - 首页（需要登录）
- `/login` - 登录页
- `/volunteers` - 义工管理（需要登录）
- `/checkin` - 考勤管理（需要登录）

## UI 组件

使用 shadcn/ui 组件库，已添加的组件：

- Button - 按钮
- Input - 输入框
- Card - 卡片
- Table - 表格
- Alert - 警告

添加更多组件：

```bash
pnpx shadcn@latest add dialog
pnpx shadcn@latest add select
pnpx shadcn@latest add form
```

## 代码规范

使用 Biome 进行代码检查和格式化：

```bash
# 检查代码
bun run lint

# 格式化代码
bun run format

# 检查并修复
bun run check
```

## 测试

```bash
bun run test
```

## 核心功能特性

### TanStack Table 集成
项目使用 TanStack Table v8 实现了强大的表格功能：

- **客户端分页**: 自动处理大量数据的分页显示
- **排序功能**: 点击列标题进行升序/降序排序
- **全局搜索**: 跨所有列的实时搜索过滤
- **列过滤**: 支持单列的精确过滤
- **灵活配置**: 易于自定义列定义和单元格渲染

### 表单管理
使用 TanStack Form 实现表单状态管理：

- **类型安全**: 完整的 TypeScript 支持
- **验证**: 内置表单验证
- **受控组件**: 统一的表单状态管理

### 数据获取
使用 TanStack Query 管理服务器状态：

- **自动缓存**: 智能的数据缓存策略
- **后台更新**: 自动重新获取过期数据
- **乐观更新**: 提升用户体验
- **错误处理**: 统一的错误处理机制

## 待完成功能

### 义工管理
- [ ] 义工详情页面
- [ ] 批量导入（Excel）
- [ ] 批量删除
- [ ] 头像上传
- [ ] 高级筛选

### 考勤管理
- [ ] 考勤记录详情页面
- [ ] 日期范围筛选
- [ ] 按义工筛选
- [ ] 手动添加考勤
- [ ] 考勤数据可视化图表

### 其他
- [ ] 用户个人中心
- [ ] 密码修改
- [ ] 系统设置
- [ ] 权限管理
- [ ] 数据统计图表（Echarts/Recharts）
- [ ] 响应式移动端优化

## 开发建议

1. **组件复用**: 将常用的 UI 模式抽取为组件
2. **类型安全**: 充分利用 TypeScript 的类型系统
3. **错误处理**: 统一的错误提示和处理
4. **加载状态**: 为异步操作提供加载反馈
5. **响应式设计**: 确保在不同设备上的良好体验

## 常见问题

### 1. API 请求失败

检查 `.env` 中的 `VITE_API_BASE_URL` 是否正确，确保后端服务已启动。

### 2. 路由不工作

确保已安装 `@tanstack/router-plugin` 并在 `vite.config.ts` 中配置。

### 3. 样式不生效

检查 Tailwind CSS 配置，确保 `@tailwindcss/vite` 插件已添加。

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
