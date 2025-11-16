# 莲花斋义工管理系统 - Monorepo 设置完成

## ✅ 已完成的工作

### 1. 项目结构
```
lianhuazhai-monorepo/
├── apps/
│   ├── api/          # 后端 API (@lianhuazhai/api)
│   └── web/          # 前端 Web (@lianhuazhai/web)
├── packages/         # 共享包（未来扩展）
├── turbo.json        # Turborepo 配置
├── package.json      # 根配置
├── README.md         # 项目说明
└── .gitignore        # Git 忽略文件
```

### 2. 技术栈

**后端 API**
- Elysia + Bun
- Drizzle ORM + MySQL
- JWT 认证
- 端口: 3001

**前端 Web**
- React 19 + TypeScript
- Vite 7
- TanStack Router (路由)
- TanStack Query (数据获取)
- TanStack Form (表单管理)
- TanStack Store (状态管理)
- shadcn/ui (UI 组件)
- Tailwind CSS 4
- 端口: 3000

### 3. 已安装的依赖
- ✅ Turborepo 2.6.1
- ✅ 所有前端依赖
- ✅ 所有后端依赖

## �� 快速开始

### 启动开发环境

```bash
# 进入项目目录
cd /home/lotus/project/lianhuazhai-monorepo

# 同时启动前后端
bun run dev
```

这将启动：
- 后端 API: http://localhost:3001
- 前端 Web: http://localhost:3000
- Swagger 文档: http://localhost:3001/swagger

### 单独启动

```bash
# 只启动后端
bun run dev --filter=@lianhuazhai/api

# 只启动前端
bun run dev --filter=@lianhuazhai/web
```

## 📝 下一步工作

### 1. 配置前端 API 客户端

创建 `apps/web/src/lib/api.ts`:
```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})
```

### 2. 配置环境变量

创建 `apps/web/.env`:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. 更新后端 CORS 配置

在 `apps/api/src/index.ts` 中添加前端地址：
```typescript
.use(cors({
  origin: [
    'http://localhost:3000',  // 前端开发地址
    'http://192.168.101.100:3000'
  ],
  credentials: true,
}))
```

### 4. 创建前端页面

建议的页面结构：
```
apps/web/src/
├── routes/
│   ├── __root.tsx           # 根布局
│   ├── index.tsx            # 首页
│   ├── auth/
│   │   ├── login.tsx        # 登录
│   │   └── register.tsx     # 注册
│   ├── volunteer/
│   │   ├── index.tsx        # 义工列表
│   │   └── $id.tsx          # 义工详情
│   └── checkin/
│       └── index.tsx        # 考勤管理
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   └── layout/              # 布局组件
├── lib/
│   ├── api.ts               # API 客户端
│   └── utils.ts             # 工具函数
└── App.tsx
```

## 🔧 常用命令

```bash
# 开发
bun run dev                                    # 启动所有项目
bun run dev --filter=@lianhuazhai/api         # 只启动后端
bun run dev --filter=@lianhuazhai/web         # 只启动前端

# 构建
bun run build                                  # 构建所有项目
bun run build --filter=@lianhuazhai/web       # 只构建前端

# 代码检查
bun run lint                                   # 检查所有项目
bun run format                                 # 格式化所有项目

# 测试
bun run test                                   # 测试所有项目

# 清理
bun run clean                                  # 清理所有项目
```

## 📚 相关文档

- [Turborepo 文档](https://turbo.build/repo/docs)
- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Vite 文档](https://vitejs.dev)

## �� 项目特点

1. **Monorepo 架构**: 使用 Turborepo 管理多个项目
2. **类型安全**: 前后端都使用 TypeScript
3. **现代化技术栈**: React 19, Vite 7, TanStack 系列
4. **高性能**: Bun 运行时，Vite 构建工具
5. **开发体验**: 热更新，类型提示，代码检查

## 💡 提示

1. 确保 MySQL 数据库已启动
2. 确保后端 .env 文件配置正确
3. 首次启动可能需要数据库迁移
4. 前端默认端口 3000，后端默认端口 3001

---

**创建时间**: 2024-11-16  
**维护者**: 莲花斋开发团队
