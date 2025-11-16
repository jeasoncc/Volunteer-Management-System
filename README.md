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

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
# 同时启动前后端
bun run dev

# 只启动后端
bun run dev --filter=@lianhuazhai/api

# 只启动前端
bun run dev --filter=@lianhuazhai/web
```

### 构建

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

- [后端 API 文档](./apps/api/README.md)
- [前端 Web 文档](./apps/web/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
