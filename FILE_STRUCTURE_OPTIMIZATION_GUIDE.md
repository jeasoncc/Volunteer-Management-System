# 文件结构优化指南

## 📁 当前结构

```
apps/web/src/
├── components/               # 所有组件混在一起
│   ├── AdminForm.tsx
│   ├── AdminTable.tsx
│   ├── CheckinTable.tsx
│   ├── CheckinRecordsTable.tsx
│   ├── DashboardLayout.tsx
│   ├── VolunteerForm.tsx
│   ├── VolunteerTable.tsx
│   └── ui/
├── services/                 # 所有服务混在一起
│   ├── admin.ts
│   ├── auth.ts
│   ├── checkin.ts
│   ├── upload.ts
│   └── volunteer.ts
└── routes/                   # 路由文件
    ├── index.tsx
    ├── admin.tsx
    ├── checkin.tsx
    └── volunteers.tsx
```

## 🎯 优化后的结构 (推荐)

```
apps/web/src/
├── features/                       # 功能模块 (Feature-based)
│   ├── auth/                       # 认证模块
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── routes/
│   │       └── login.tsx
│   │
│   ├── dashboard/                  # 仪表板模块
│   │   ├── components/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── TopVolunteers.tsx
│   │   │   └── QuickActions.tsx
│   │   └── routes/
│   │       └── index.tsx
│   │
│   ├── volunteers/                 # 义工管理模块
│   │   ├── components/
│   │   │   ├── VolunteerForm.tsx
│   │   │   ├── VolunteerTable.tsx
│   │   │   ├── VolunteerDetail.tsx
│   │   │   └── VolunteerFilters.tsx
│   │   ├── services/
│   │   │   └── volunteer.service.ts
│   │   ├── hooks/
│   │   │   ├── useVolunteer.ts
│   │   │   └── useVolunteers.ts
│   │   ├── types/
│   │   │   └── volunteer.types.ts
│   │   └── routes/
│   │       ├── index.tsx
│   │       └── [id].tsx
│   │
│   ├── admin/                      # 管理员模块
│   │   ├── components/
│   │   │   ├── AdminForm.tsx
│   │   │   ├── AdminTable.tsx
│   │   │   └── PermissionEditor.tsx
│   │   ├── services/
│   │   │   └── admin.service.ts
│   │   ├── hooks/
│   │   │   └── useAdmin.ts
│   │   ├── types/
│   │   │   └── admin.types.ts
│   │   └── routes/
│   │       └── index.tsx
│   │
│   └── checkin/                    # 考勤模块
│       ├── components/
│       │   ├── CheckinTable.tsx
│       │   ├── CheckinRecordsTable.tsx
│       │   ├── MonthlyReportView.tsx
│       │   └── RecordsManagementView.tsx
│       ├── services/
│       │   └── checkin.service.ts
│       ├── hooks/
│       │   ├── useCheckinReport.ts
│       │   └── useCheckinRecords.ts
│       ├── types/
│       │   └── checkin.types.ts
│       └── routes/
│           └── index.tsx
│
├── shared/                         # 共享资源
│   ├── components/                 # 共享组件
│   │   ├── Layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── DataDisplay/
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── Forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── Select.tsx
│   │   └── Feedback/
│   │       ├── Toast.tsx
│   │       ├── Dialog.tsx
│   │       └── Loading.tsx
│   │
│   ├── hooks/                      # 共享 Hooks
│   │   ├── useToast.ts
│   │   ├── useDebounce.ts
│   │   └── usePagination.ts
│   │
│   ├── utils/                      # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── date.ts
│   │
│   ├── services/                   # 共享服务
│   │   ├── api.ts                  # API 客户端
│   │   └── upload.service.ts
│   │
│   ├── types/                      # 共享类型
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   └── pagination.types.ts
│   │
│   └── constants/                  # 常量
│       ├── routes.ts
│       └── config.ts
│
├── routes/                         # TanStack Router 路由配置
│   └── __root.tsx
│
├── ui/                             # shadcn/ui 组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
├── main.tsx                        # 应用入口
├── routeTree.gen.ts                # 自动生成的路由树
└── styles.css                      # 全局样式
```

## 🔄 迁移步骤

### 阶段 1: 创建新的目录结构

```bash
cd apps/web/src

# 创建 features 目录
mkdir -p features/{auth,dashboard,volunteers,admin,checkin}/{components,services,hooks,types,routes}

# 创建 shared 目录
mkdir -p shared/{components/{Layout,DataDisplay,Forms,Feedback},hooks,utils,services,types,constants}
```

### 阶段 2: 迁移组件

#### 2.1 迁移义工管理组件

```bash
# 从
components/VolunteerForm.tsx
components/VolunteerTable.tsx

# 到
features/volunteers/components/VolunteerForm.tsx
features/volunteers/components/VolunteerTable.tsx
```

**更新导入路径**:
```typescript
// 之前
import { VolunteerForm } from "../components/VolunteerForm"

// 之后
import { VolunteerForm } from "@/features/volunteers/components/VolunteerForm"
```

#### 2.2 迁移管理员组件

```bash
# 从
components/AdminForm.tsx
components/AdminTable.tsx

# 到
features/admin/components/AdminForm.tsx
features/admin/components/AdminTable.tsx
```

#### 2.3 迁移考勤组件

```bash
# 从
components/CheckinTable.tsx
components/CheckinRecordsTable.tsx

# 到
features/checkin/components/CheckinTable.tsx
features/checkin/components/CheckinRecordsTable.tsx
```

#### 2.4 迁移共享组件

```bash
# 从
components/DashboardLayout.tsx

# 到
shared/components/Layout/DashboardLayout.tsx
```

### 阶段 3: 迁移服务

```bash
# 从
services/volunteer.ts
services/admin.ts
services/checkin.ts

# 到
features/volunteers/services/volunteer.service.ts
features/admin/services/admin.service.ts
features/checkin/services/checkin.service.ts

# 共享服务
services/auth.ts → shared/services/auth.service.ts
services/upload.ts → shared/services/upload.service.ts
```

### 阶段 4: 迁移类型定义

```bash
# 拆分 types/index.ts
types/index.ts

# 到各个模块
features/volunteers/types/volunteer.types.ts
features/admin/types/admin.types.ts
features/checkin/types/checkin.types.ts
shared/types/api.types.ts
shared/types/common.types.ts
shared/types/pagination.types.ts
```

### 阶段 5: 创建 Barrel Exports

每个 feature 创建一个 `index.ts`:

```typescript
// features/volunteers/index.ts
export * from './components/VolunteerForm'
export * from './components/VolunteerTable'
export * from './services/volunteer.service'
export * from './types/volunteer.types'
```

这样可以简化导入:
```typescript
// 之前
import { VolunteerForm } from '@/features/volunteers/components/VolunteerForm'
import { VolunteerTable } from '@/features/volunteers/components/VolunteerTable'

// 之后
import { VolunteerForm, VolunteerTable } from '@/features/volunteers'
```

### 阶段 6: 更新 tsconfig.json

添加路径别名:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/ui/*": ["./src/ui/*"]
    }
  }
}
```

## 📝 文件命名规范

### 组件
- React 组件: `PascalCase.tsx` (例如: `VolunteerForm.tsx`)
- UI 组件: `kebab-case.tsx` (例如: `button.tsx`)

### 服务
- 服务文件: `*.service.ts` (例如: `volunteer.service.ts`)

### Hooks
- 自定义 Hooks: `use*.ts` (例如: `useVolunteer.ts`)

### 类型
- 类型定义: `*.types.ts` (例如: `volunteer.types.ts`)

### 工具函数
- 工具文件: `*.utils.ts` 或 直接 `.ts` (例如: `format.ts`)

### 常量
- 常量文件: `*.constants.ts` 或 直接 `.ts` (例如: `routes.ts`)

## 🎯 优势

### 1. 清晰的关注点分离
- 每个功能模块包含其所有相关代码
- 易于查找和维护

### 2. 更好的可扩展性
- 添加新功能只需创建新的 feature 目录
- 不会影响其他模块

### 3. 团队协作友好
- 减少合并冲突
- 团队成员可以专注于特定模块

### 4. 代码复用
- 共享组件和工具在 `shared/` 目录中
- 避免重复代码

### 5. 类型安全
- 每个模块有自己的类型定义
- 更容易管理和维护类型

## 📚 示例: 义工模块完整结构

```
features/volunteers/
├── components/
│   ├── VolunteerForm.tsx         # 表单组件
│   ├── VolunteerTable.tsx        # 列表表格
│   ├── VolunteerDetail.tsx       # 详情页
│   ├── VolunteerFilters.tsx      # 筛选器
│   └── VolunteerCard.tsx         # 卡片视图
│
├── services/
│   └── volunteer.service.ts      # API 服务
│       - getList()
│       - getById()
│       - create()
│       - update()
│       - delete()
│       - search()
│
├── hooks/
│   ├── useVolunteer.ts           # 单个义工
│   ├── useVolunteers.ts          # 义工列表
│   ├── useVolunteerMutations.ts  # 变更操作
│   └── useVolunteerSearch.ts     # 搜索
│
├── types/
│   └── volunteer.types.ts        # 类型定义
│       - Volunteer
│       - CreateVolunteerDto
│       - UpdateVolunteerDto
│       - VolunteerFilters
│
├── routes/
│   ├── index.tsx                 # 列表页
│   └── [id].tsx                  # 详情页
│
├── utils/
│   └── volunteer.utils.ts        # 工具函数
│       - formatVolunteerStatus()
│       - validateVolunteer()
│
└── index.ts                      # Barrel export
```

## 🛠️ 实际代码示例

### feature/volunteers/services/volunteer.service.ts

```typescript
import { api } from '@/shared/services/api'
import type { 
  Volunteer, 
  CreateVolunteerDto, 
  UpdateVolunteerDto,
  VolunteerListParams 
} from '../types/volunteer.types'
import type { ApiResponse, PaginationResponse } from '@/shared/types/api.types'

export const volunteerService = {
  getList: async (params: VolunteerListParams): Promise<ApiResponse<PaginationResponse<Volunteer>>> => {
    return api.get('/volunteer', { params })
  },

  getById: async (lotusId: string): Promise<ApiResponse<Volunteer>> => {
    return api.get(`/volunteer/${lotusId}`)
  },

  create: async (data: CreateVolunteerDto): Promise<ApiResponse<Volunteer>> => {
    return api.post('/volunteer', data)
  },

  update: async (lotusId: string, data: UpdateVolunteerDto): Promise<ApiResponse<Volunteer>> => {
    return api.put(`/volunteer/${lotusId}`, data)
  },

  delete: async (lotusId: string): Promise<ApiResponse> => {
    return api.delete(`/volunteer/${lotusId}`)
  },

  search: async (keyword: string, limit?: number): Promise<ApiResponse<Volunteer[]>> => {
    return api.get('/volunteer/search', { params: { keyword, limit } })
  }
}
```

### features/volunteers/hooks/useVolunteers.ts

```typescript
import { useQuery } from '@tanstack/react-query'
import { volunteerService } from '../services/volunteer.service'
import type { VolunteerListParams } from '../types/volunteer.types'

export const useVolunteers = (params: VolunteerListParams) => {
  return useQuery({
    queryKey: ['volunteers', params],
    queryFn: () => volunteerService.getList(params)
  })
}
```

### features/volunteers/hooks/useVolunteerMutations.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { volunteerService } from '../services/volunteer.service'
import type { CreateVolunteerDto, UpdateVolunteerDto } from '../types/volunteer.types'

export const useVolunteerMutations = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: volunteerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ lotusId, data }: { lotusId: string, data: UpdateVolunteerDto }) =>
      volunteerService.update(lotusId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: volunteerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
    }
  })

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation
  }
}
```

### features/volunteers/routes/index.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { VolunteerTable, VolunteerForm } from '@/features/volunteers'
import { useVolunteers, useVolunteerMutations } from '@/features/volunteers'
import { DashboardLayout } from '@/shared/components/Layout'

export const Route = createFileRoute('/volunteers')({
  component: VolunteersPage
})

function VolunteersPage() {
  const { data, isLoading } = useVolunteers({ page: 1, pageSize: 20 })
  const mutations = useVolunteerMutations()

  // ... rest of the component
}
```

## 🔍 注意事项

1. **逐步迁移**: 不要一次性迁移所有文件，按模块逐步进行
2. **保持一致性**: 确保团队成员遵循相同的目录结构
3. **更新导入**: 使用 IDE 的重构功能批量更新导入路径
4. **测试**: 每次迁移后运行测试确保功能正常
5. **文档同步**: 更新相关文档说明新的文件结构

## ✅ 检查清单

- [ ] 创建新的目录结构
- [ ] 迁移组件到对应的 feature 目录
- [ ] 迁移服务到对应的 feature 目录
- [ ] 迁移类型定义
- [ ] 创建 Barrel Exports (index.ts)
- [ ] 更新 tsconfig.json 路径别名
- [ ] 更新所有导入路径
- [ ] 运行测试
- [ ] 更新文档
- [ ] 代码审查

---

**说明**: 此优化方案基于 Feature-Driven 架构模式，适用于中大型应用。对于小型应用，当前的扁平结构也完全可以接受。
