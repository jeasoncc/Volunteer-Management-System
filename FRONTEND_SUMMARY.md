# 莲花斋义工管理系统 - 前端项目总结

## 项目概述

这是一个基于现代化技术栈构建的义工管理系统前端应用，使用 React 19 + Vite 7 + TanStack 全家桶（Router、Query、Form、Table）开发。

## 技术架构

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| Vite | 7.1.7 | 构建工具 |
| TypeScript | 5.7.2 | 类型系统 |
| TanStack Router | 1.132.0 | 路由管理 |
| TanStack Query | 5.62.11 | 服务器状态管理 |
| TanStack Form | 0.37.0 | 表单状态管理 |
| TanStack Table | 8.21.3 | 表格组件 |
| Tailwind CSS | 4.0.6 | 样式框架 |
| Axios | 1.7.9 | HTTP 客户端 |
| dayjs | 1.11.18 | 日期处理 |
| Biome | 2.2.4 | 代码规范 |

### 项目结构

```
apps/web/
├── src/
│   ├── components/          # 组件目录
│   │   ├── ui/             # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── alert.tsx
│   │   │   └── dialog.tsx
│   │   ├── Layout.tsx           # 布局组件
│   │   ├── VolunteerTable.tsx   # 义工表格（TanStack Table）
│   │   ├── CheckinTable.tsx     # 考勤表格（TanStack Table）
│   │   └── VolunteerForm.tsx    # 义工表单（TanStack Form）
│   ├── hooks/              # 自定义 Hooks
│   │   └── useAuth.ts      # 认证 Hook
│   ├── lib/                # 工具库
│   │   ├── api.ts          # Axios 实例配置
│   │   ├── query-client.ts # React Query 配置
│   │   └── utils.ts        # 工具函数
│   ├── routes/             # 路由页面
│   │   ├── __root.tsx      # 根路由
│   │   ├── index.tsx       # 首页仪表板
│   │   ├── login.tsx       # 登录页
│   │   ├── volunteers.tsx  # 义工管理
│   │   └── checkin.tsx     # 考勤管理
│   ├── services/           # API 服务层
│   │   ├── auth.ts         # 认证服务
│   │   ├── volunteer.ts    # 义工服务
│   │   ├── checkin.ts      # 考勤服务
│   │   └── upload.ts       # 上传服务
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── main.tsx            # 应用入口
│   └── styles.css          # 全局样式
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── biome.json              # Biome 配置
└── package.json            # 依赖配置
```

## 已实现功能

### 1. 认证系统
- ✅ 用户登录（账号密码）
- ✅ 用户登出
- ✅ 会话管理（Token 存储）
- ✅ 路由守卫（未登录自动跳转）
- ✅ 用户信息获取

### 2. 首页仪表板
- ✅ 统计数据卡片
  - 义工总数
  - 本月活跃义工
  - 本月服务时长
  - 本月打卡次数
- ✅ 本月服务时长排行榜（前10名）
- ✅ 快捷入口（义工管理、考勤管理）

### 3. 义工管理
- ✅ 义工列表展示（TanStack Table）
  - 客户端分页（每页可配置）
  - 多列排序（点击列标题）
  - 全局搜索（跨所有列）
  - 状态标签（已注册、培训中、申请中等）
- ✅ 义工创建
  - 表单验证
  - 必填字段标识
  - 基本信息（姓名、手机、身份证、性别等）
  - 佛教信息（法名、学历等）
- ✅ 义工编辑
  - 预填充现有数据
  - 表单验证
- ✅ 义工删除
  - 确认对话框
  - 乐观更新
- ✅ 操作反馈
  - 成功/失败提示
  - 加载状态

### 4. 考勤管理
- ✅ 月度考勤报表
  - 年月选择器
  - 统计数据概览
- ✅ 考勤数据表格（TanStack Table）
  - 默认按服务时长降序排序
  - 全局搜索（姓名、ID）
  - 客户端分页
- ✅ Excel 导出
  - 按日期范围导出
  - 自动下载文件

## 核心特性

### TanStack Table 集成

#### VolunteerTable（义工表格）
```typescript
- 支持排序：点击列标题进行升序/降序排序
- 全局搜索：实时搜索所有列
- 分页控制：首页、上一页、下一页、末页
- 自定义渲染：状态标签、性别显示、日期格式化
- 操作列：查看、编辑、删除按钮
```

#### CheckinTable（考勤表格）
```typescript
- 默认排序：按服务时长降序
- 搜索功能：按姓名或莲花斋ID搜索
- 数据展示：打卡天数、服务时长
- 操作按钮：查看详情
```

### TanStack Form 集成

#### VolunteerForm（义工表单）
```typescript
- 字段管理：name, phone, idNumber, gender, email, wechat, address, dharmaName, education, joinReason
- 表单验证：必填字段验证
- 受控组件：统一的状态管理
- 提交处理：创建/更新模式
```

### TanStack Query 集成

#### 数据获取
```typescript
- 自动缓存：减少不必要的网络请求
- 后台更新：保持数据新鲜度
- 加载状态：isLoading, isError
- 错误处理：统一的错误提示
```

#### 数据变更
```typescript
- useMutation：创建、更新、删除操作
- 乐观更新：立即更新 UI
- 缓存失效：自动刷新相关数据
- 成功/失败回调：用户反馈
```

## 设计模式

### 1. 服务层模式
所有 API 调用都封装在 `services/` 目录中，提供统一的接口：

```typescript
// services/volunteer.ts
export const volunteerService = {
  getList: (params) => api.get('/volunteers', { params }),
  getByLotusId: (lotusId) => api.get(`/volunteers/${lotusId}`),
  create: (data) => api.post('/volunteers', data),
  update: (lotusId, data) => api.put(`/volunteers/${lotusId}`, data),
  delete: (lotusId) => api.delete(`/volunteers/${lotusId}`),
}
```

### 2. 组件复用
- UI 组件：`components/ui/` 提供可复用的基础组件
- 业务组件：`components/` 提供业务逻辑组件
- 表格组件：独立的 Table 组件，易于维护和扩展

### 3. 类型安全
- 完整的 TypeScript 类型定义
- API 响应类型
- 组件 Props 类型
- 表单数据类型

### 4. 状态管理
- 服务器状态：TanStack Query
- 表单状态：TanStack Form
- 本地状态：React useState
- 认证状态：自定义 useAuth Hook

## 性能优化

### 1. 代码分割
- 路由级别的代码分割（TanStack Router）
- 按需加载组件

### 2. 数据缓存
- React Query 自动缓存
- 减少重复请求
- 后台数据同步

### 3. 客户端分页
- 一次性加载所有数据
- 客户端处理分页、排序、筛选
- 减少服务器压力

## 用户体验

### 1. 加载状态
- 全局加载指示器
- 按钮加载状态
- 骨架屏（待实现）

### 2. 错误处理
- 友好的错误提示
- 表单验证反馈
- API 错误处理

### 3. 交互反馈
- 操作成功提示
- 确认对话框
- 悬停效果
- 过渡动画

## 待优化项

### 功能增强
- [ ] 义工详情页面
- [ ] 批量操作（批量删除、批量导入）
- [ ] 头像上传
- [ ] 高级筛选（多条件组合）
- [ ] 考勤详情页面
- [ ] 数据可视化图表
- [ ] 导出 PDF 报表

### 性能优化
- [ ] 虚拟滚动（大数据量表格）
- [ ] 图片懒加载
- [ ] 骨架屏
- [ ] Service Worker（PWA）

### 用户体验
- [ ] 响应式设计（移动端适配）
- [ ] 暗色模式
- [ ] 国际化（i18n）
- [ ] 键盘快捷键
- [ ] 拖拽排序

### 代码质量
- [ ] 单元测试（Vitest）
- [ ] E2E 测试（Playwright）
- [ ] 组件文档（Storybook）
- [ ] 性能监控

## 开发建议

### 1. 添加新页面
```bash
# 在 src/routes/ 创建新文件
# 例如：src/routes/settings.tsx
export const Route = createFileRoute("/settings")({
  component: SettingsPage,
} as any);
```

### 2. 添加新 API 服务
```typescript
// 在 src/services/ 创建新文件
// 例如：src/services/settings.ts
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}
```

### 3. 添加新组件
```typescript
// 在 src/components/ 创建新文件
// 使用 TypeScript 定义 Props
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  // 组件实现
}
```

### 4. 使用 TanStack Table
```typescript
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  // 添加更多功能
});
```

## 部署

### 开发环境
```bash
bun run dev
# 访问 http://localhost:3000
```

### 生产构建
```bash
bun run build
# 输出到 dist/ 目录
```

### 预览生产版本
```bash
bun run serve
```

## 环境变量

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=莲花斋义工管理系统
VITE_APP_VERSION=1.0.0
```

## 总结

这是一个功能完整、架构清晰、易于维护的现代化前端应用。通过使用 TanStack 全家桶，我们实现了：

1. **强大的表格功能**：排序、搜索、分页、自定义渲染
2. **优雅的状态管理**：服务器状态、表单状态、本地状态分离
3. **类型安全**：完整的 TypeScript 支持
4. **良好的用户体验**：加载状态、错误处理、操作反馈
5. **可维护性**：清晰的项目结构、组件复用、服务层封装

项目已经具备了核心功能，可以继续扩展更多高级特性。
