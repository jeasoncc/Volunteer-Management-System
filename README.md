# 莲花斋义工管理系统 - Monorepo

一个基于 Turborepo 的全栈应用，包含后端 API 和前端 Web 应用。

## 📦 项目结构

```
lianhuazhai-monorepo/
├── apps/
│   ├── api/          # 后端 API (Elysia + Bun)
│   └── web/          # 前端 Web (React + Vite)
├── packages/         # 共享包（未来扩展）
├── turbo.json        # Turborepo 配置
└── package.json      # 根配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

```bash
# 后端配置
cd apps/api
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息

# 前端配置
cd ../web
cp .env.example .env
# 编辑 .env 文件，配置 API 地址
```

### 3. 初始化数据库

```bash
cd apps/api
bun run db:generate  # 生成迁移
bun run db:push      # 执行迁移
bun run db:seed      # 初始化数据（可选）
```

### 4. 启动项目

```bash
# 回到根目录
cd ../..

# 同时启动前后端（推荐）
bun run dev

# 或分别启动
bun run dev --filter=@lianhuazhai/api   # 只启动后端
bun run dev --filter=@lianhuazhai/web   # 只启动前端
```

### 5. 访问应用

- 前端：http://localhost:3000
- 后端 API：http://localhost:3001
- API 文档：http://localhost:3001/swagger

**默认登录账号**：`admin` / `admin123`

### 构建生产版本

```bash
# 构建所有项目
bun run build

# 构建指定项目
bun run build --filter=@lianhuazhai/web
```

## 📝 项目说明

### 后端 API (@lianhuazhai/api)

- **技术栈**: Elysia + Bun + Drizzle ORM + MySQL
- **端口**: 3001
- **文档**: http://localhost:3001/swagger

### 前端 Web (@lianhuazhai/web)

- **技术栈**: React + Vite + TanStack Router/Query/Form + shadcn/ui
- **端口**: 3000
- **访问**: http://localhost:3000

## 🔧 常用命令

```bash
# 开发
bun run dev

# 构建
bun run build

# 代码检查
bun run lint

# 代码格式化
bun run format

# 测试
bun run test

# 清理
bun run clean
```

## 📚 文档

- [启动指南](./START_GUIDE.md) - 详细的启动和配置说明
- [快速开始](./QUICK_START.md) - 快速上手指南
- [前端总结](./FRONTEND_SUMMARY.md) - 前端技术栈和功能说明
- [架构评估](./PROJECT_ARCHITECTURE_REVIEW.md) - 项目架构分析
- [后端 API 文档](./apps/api/README.md) - 后端开发文档
- [前端 Web 文档](./apps/web/README.md) - 前端开发文档

## ✨ 新功能

### 美化的登录页面
- 渐变背景动画效果
- 图标装饰和加载动画
- 优化的错误提示
- 响应式设计

### 404 错误页面
- 友好的错误提示
- 快速导航按钮
- 常用链接快捷入口

### TanStack Table 集成
- 强大的表格功能（排序、搜索、分页）
- 义工管理表格
- 考勤管理表格

### 完整的 CRUD 功能
- 义工创建、编辑、删除
- 表单验证
- 乐观更新

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
