# 启动问题修复总结

## 🐛 遇到的问题

### 1. Turborepo 配置错误

**错误信息**：
```
Found `pipeline` field instead of `tasks`.
Changed in 2.0: `pipeline` has been renamed to `tasks`.
```

**原因**：
- Turborepo 2.0+ 版本将配置字段从 `pipeline` 改名为 `tasks`
- 项目使用的是 Turborepo 2.6.1，但配置文件还在使用旧的 `pipeline` 字段

**解决方案**：
修改 `turbo.json` 文件：
```json
// 之前
{
  "pipeline": { ... }
}

// 之后
{
  "tasks": { ... }
}
```

### 2. 404 路由文件警告

**警告信息**：
```
Route file "/apps/web/src/routes/404.tsx" does not contain any route piece.
```

**原因**：
- TanStack Router 的文件路由系统要求路由文件必须导出 Route 对象
- 我们创建的 404.tsx 是一个普通组件，不符合路由文件规范

**解决方案**：
1. 删除 `apps/web/src/routes/404.tsx`
2. 创建 `apps/web/src/components/NotFound.tsx` 组件
3. 在 `apps/web/src/routes/__root.tsx` 中配置 `notFoundComponent`

## ✅ 修复后的状态

### 启动成功

```bash
$ bun run dev

✓ 后端 API 启动成功
  - Local:   http://localhost:3001
  - Swagger: http://localhost:3001/swagger

✓ 前端 Web 启动成功
  - Local:   http://localhost:3000
```

### 功能正常

- ✅ 前端服务运行在 http://localhost:3000
- ✅ 后端服务运行在 http://localhost:3001
- ✅ WebSocket 连接正常
- ✅ 设备心跳正常
- ✅ 定时任务启动成功

## 📝 修改的文件

### 1. turbo.json
```diff
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
- "pipeline": {
+ "tasks": {
    "dev": { ... },
    "build": { ... },
    ...
  }
}
```

### 2. apps/web/src/routes/__root.tsx
```diff
- import NotFoundPage from "./404";
+ import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  component: () => (...),
- notFoundComponent: NotFoundPage,
+ notFoundComponent: NotFound,
});
```

### 3. 文件结构变化
```diff
apps/web/src/
├── routes/
-│   ├── 404.tsx          # 删除（不符合路由规范）
│   ├── __root.tsx        # 修改（更新导入）
│   └── ...
└── components/
+   ├── NotFound.tsx      # 新增（404 组件）
    └── ...
```

## 🎯 验证步骤

### 1. 启动项目
```bash
bun run dev
```

### 2. 访问前端
打开浏览器访问：http://localhost:3000

### 3. 测试登录
- 账号：`admin`
- 密码：`admin123`

### 4. 测试 404 页面
访问任意不存在的路径，如：http://localhost:3000/not-found

## 🚀 现在可以正常使用了！

### 可用的命令

```bash
# 同时启动前后端
bun run dev

# 只启动后端
bun run dev --filter=@lianhuazhai/api

# 只启动前端
bun run dev --filter=@lianhuazhai/web

# 构建项目
bun run build

# 代码检查
bun run lint

# 代码格式化
bun run format
```

### 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React 前端界面 |
| 登录页面 | http://localhost:3000/login | 美化的登录页面 |
| 后端 API | http://localhost:3001 | Elysia API 服务 |
| API 文档 | http://localhost:3001/swagger | Swagger 文档 |

### 默认登录信息

- **账号**：`admin`
- **密码**：`admin123`

## 📚 相关文档

- [START_GUIDE.md](./START_GUIDE.md) - 详细的启动指南
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [UPDATES_SUMMARY.md](./UPDATES_SUMMARY.md) - 更新总结
- [README.md](./README.md) - 项目概述

## 💡 注意事项

### Node.js 版本警告

启动时可能会看到这个警告：
```
You are using Node.js 22.1.0. Vite requires Node.js version 20.19+ or 22.12+.
```

**说明**：
- 这只是一个警告，不影响运行
- 项目使用 Bun 运行，不依赖 Node.js
- 如果想消除警告，可以升级 Node.js 到 22.12+

### Turborepo 版本

项目使用的是 Turborepo 2.6.1，配置文件已更新为新版本格式。

如果遇到其他 Turborepo 相关问题，请参考：
- [Turborepo 文档](https://turbo.build/repo/docs)
- [迁移指南](https://turbo.build/repo/docs/getting-started/migrating)

## 🎉 总结

问题已全部修复，项目现在可以正常启动和运行了！

主要修复：
1. ✅ 更新 Turborepo 配置（pipeline → tasks）
2. ✅ 修复 404 路由文件结构
3. ✅ 验证前后端启动成功

现在可以愉快地开发了！🚀
