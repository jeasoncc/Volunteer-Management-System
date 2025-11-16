# 莲花斋义工管理系统 - 启动指南

## 🚀 快速启动

### 方式一：同时启动前后端（推荐）

```bash
# 在项目根目录执行
bun run dev
```

这个命令会使用 Turborepo 同时启动：
- 后端 API：http://localhost:3001
- 前端 Web：http://localhost:3000

### 方式二：分别启动

#### 启动后端

```bash
# 方式 1：使用 Turbo 过滤器
bun run dev --filter=@lianhuazhai/api

# 方式 2：直接进入后端目录
cd apps/api
bun run dev
```

#### 启动前端

```bash
# 方式 1：使用 Turbo 过滤器
bun run dev --filter=@lianhuazhai/web

# 方式 2：直接进入前端目录
cd apps/web
bun run dev
```

## 📋 启动前检查清单

### 1. 环境准备

- [x] 已安装 Bun >= 1.0.0
- [x] 已安装 MySQL >= 8.0
- [x] MySQL 服务已启动

### 2. 依赖安装

```bash
# 在项目根目录
bun install
```

### 3. 环境变量配置

#### 后端环境变量 (apps/api/.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lianhuazhai

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务器配置
PORT=3001
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

#### 前端环境变量 (apps/web/.env)

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=莲花斋义工管理系统
VITE_APP_VERSION=1.0.0
```

### 4. 数据库初始化

```bash
cd apps/api

# 生成数据库迁移
bun run db:generate

# 执行数据库迁移
bun run db:push

# 初始化测试数据（可选）
bun run db:seed
```

## 🎯 访问地址

启动成功后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React 前端界面 |
| 后端 API | http://localhost:3001 | Elysia API 服务 |
| API 文档 | http://localhost:3001/swagger | Swagger 文档 |

## 🔐 默认登录信息

- **账号**：`admin`
- **密码**：`admin123`

## 📦 Turborepo 命令说明

### 开发命令

```bash
# 同时启动所有应用（开发模式）
bun run dev

# 只启动后端
bun run dev --filter=@lianhuazhai/api

# 只启动前端
bun run dev --filter=@lianhuazhai/web
```

### 构建命令

```bash
# 构建所有项目
bun run build

# 只构建后端
bun run build --filter=@lianhuazhai/api

# 只构建前端
bun run build --filter=@lianhuazhai/web
```

### 代码质量命令

```bash
# 代码检查
bun run lint

# 代码格式化
bun run format

# 运行测试
bun run test
```

### 清理命令

```bash
# 清理所有构建产物和缓存
bun run clean

# 清理并删除所有 node_modules
bun run clean && rm -rf node_modules apps/*/node_modules
```

## 🔧 Turborepo 配置说明

项目使用 `turbo.json` 配置任务管道（Turborepo 2.0+ 使用 `tasks` 字段）：

```json
{
  "tasks": {
    "dev": {
      "cache": false,        // 开发模式不缓存
      "persistent": true     // 持久运行
    },
    "build": {
      "dependsOn": ["^build"],  // 依赖其他包先构建
      "outputs": ["dist/**"]    // 输出目录
    }
  }
}
```

**注意**：Turborepo 2.0+ 版本将 `pipeline` 改名为 `tasks`。

### 任务依赖

- `^build`：表示先构建依赖的包
- `dependsOn`：定义任务执行顺序

### 缓存策略

- `dev`：不缓存，因为需要实时更新
- `build`：缓存构建结果，加速后续构建

## 🐛 常见问题

### 1. 端口被占用

**问题**：`Error: listen EADDRINUSE: address already in use :::3000`

**解决**：
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>

# 或修改端口
# 后端：修改 apps/api/.env 中的 PORT
# 前端：修改 apps/web/package.json 中的 dev 脚本
```

### 2. 数据库连接失败

**问题**：`Error: connect ECONNREFUSED 127.0.0.1:3306`

**检查**：
1. MySQL 服务是否启动
2. 数据库配置是否正确
3. 数据库是否已创建

**解决**：
```bash
# 启动 MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# 创建数据库
mysql -u root -p
CREATE DATABASE lianhuazhai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 前端无法连接后端

**问题**：API 请求失败

**检查**：
1. 后端服务是否启动
2. `apps/web/.env` 中的 `VITE_API_BASE_URL` 是否正确
3. CORS 配置是否正确

### 4. Turbo 缓存问题

**问题**：修改代码后没有生效

**解决**：
```bash
# 清理 Turbo 缓存
rm -rf .turbo

# 重新启动
bun run dev
```

### 5. 依赖安装失败

**问题**：`bun install` 失败

**解决**：
```bash
# 清理缓存
rm -rf node_modules
rm -rf apps/*/node_modules
rm bun.lock

# 重新安装
bun install
```

## 📊 开发工具

启动后可以使用以下开发工具：

### 1. React Query Devtools
- 位置：浏览器左下角
- 功能：查看查询状态、缓存数据

### 2. TanStack Router Devtools
- 位置：浏览器右下角
- 功能：查看路由状态、导航历史

### 3. Swagger API 文档
- 地址：http://localhost:3001/swagger
- 功能：查看和测试 API 接口

## 🎨 新功能预览

### 美化的登录页面
- ✅ 渐变背景动画
- ✅ 图标装饰
- ✅ 加载动画
- ✅ 错误提示优化
- ✅ 响应式设计

### 404 错误页面
- ✅ 友好的错误提示
- ✅ 返回首页按钮
- ✅ 返回上一页按钮
- ✅ 快捷链接导航

## 📝 开发建议

1. **使用 Turbo 过滤器**：开发单个应用时使用 `--filter` 参数
2. **监控日志**：注意终端输出的错误信息
3. **使用 DevTools**：充分利用浏览器开发工具
4. **定期清理缓存**：遇到问题时先清理缓存
5. **保持依赖更新**：定期更新依赖包

## 🚀 生产部署

### 构建生产版本

```bash
# 构建所有项目
bun run build
```

### 后端部署

```bash
cd apps/api
bun run start

# 或使用 PM2
pm2 start bun --name "lianhuazhai-api" -- run start
```

### 前端部署

前端构建后会生成 `apps/web/dist` 目录，可以部署到：
- Vercel（推荐）
- Netlify
- Nginx

## 📚 相关文档

- [README.md](./README.md) - 项目概述
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [FRONTEND_SUMMARY.md](./FRONTEND_SUMMARY.md) - 前端总结
- [PROJECT_ARCHITECTURE_REVIEW.md](./PROJECT_ARCHITECTURE_REVIEW.md) - 架构评估

## 💡 提示

- 首次启动可能需要等待依赖安装和数据库初始化
- 开发模式下会自动热更新，无需手动重启
- 使用 `Ctrl+C` 停止服务

祝你开发愉快！🎉
