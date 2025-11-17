# 🚀 莲花斋志愿者管理系统 - 快速开始指南

## 📋 系统要求

- **Node.js**: v20.19+ 或 v22.12+
- **Bun**: v1.0.0+
- **MySQL**: v8.0+
- **操作系统**: Linux / macOS / Windows (WSL)

## 🔧 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd lianhuazhai-monorepo
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置环境变量

#### 后端配置 (apps/api/.env)

```bash
cp apps/api/.env.example apps/api/.env
```

编辑 `apps/api/.env`:
```env
# 数据库配置
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3307
DATABASE_USER=root
DATABASE_PASSWORD=admin123
DATABASE_NAME=lianhuazhai

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 应用配置
APP_PORT=3001
NODE_ENV=development
```

#### 前端配置 (apps/web/.env)

```bash
cp apps/web/.env.example apps/web/.env
```

编辑 `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. 数据库设置

#### 4.1 启动 MySQL

```bash
# 使用 Docker (推荐)
docker run -d \
  --name lianhuazhai-mysql \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=lianhuazhai \
  mysql:8.0

# 或使用现有的 MySQL 服务
mycli -h 127.0.0.1 -P 3307 -u root -p admin123
```

#### 4.2 运行数据库迁移

```bash
cd apps/api
bun run db:push
```

#### 4.3 插入测试数据

```bash
cd apps/api
bun run scripts/seed-test-data.ts
```

**测试账户**:
```
超级管理员: 13800001001 / 123456
普通管理员: 13800001002 / 123456
操作员: 13800001003 / 123456
义工: 13800001004 / 123456
申请者: 13800001005 / 123456
```

## 🏃 启动项目

### 方式 1: 启动全栈 (推荐)

```bash
bun run dev
```

这会同时启动:
- 前端: http://localhost:3000
- 后端: http://localhost:3001

### 方式 2: 分别启动

```bash
# 终端 1 - 启动后端
bun run dev --filter=@lianhuazhai/api

# 终端 2 - 启动前端
bun run dev --filter=@lianhuazhai/web
```

## 🌐 访问应用

### 前端应用

**主页**: http://localhost:3000

**登录**: 使用测试账户登录
- 账号: `13800001001`
- 密码: `123456`

### 后端服务

**API 基础地址**: http://localhost:3001

**Swagger 文档**: http://localhost:3001/swagger

**注册页面**: http://localhost:3001/register.html

**WebSocket**: ws://localhost:3001/ws

## 📱 功能概览

### 1. 仪表板 (/)
- ✅ 统计概览卡片
- ✅ 本月服务时长排行榜
- ✅ 快捷入口

### 2. 义工管理 (/volunteers)
- ✅ 查看义工列表
- ✅ 添加新义工
- ✅ 编辑义工信息
- ✅ 删除义工
- ✅ 搜索和筛选
- ✅ 查看详情 (/volunteers/:lotusId)

### 3. 管理员管理 (/admin)
- ✅ 查看管理员列表
- ✅ 添加管理员
- ✅ 编辑权限
- ✅ 删除管理员

### 4. 考勤管理 (/checkin)
- ✅ 月度报表视图
  - 统计概览
  - 义工考勤明细
  - 导出 Excel
- ✅ 记录管理视图
  - 查看所有记录
  - 编辑工时和备注
  - 删除记录
  - 日期筛选

## 🛠️ 常用命令

### 开发

```bash
# 启动开发服务器
bun run dev

# 仅启动前端
bun run dev --filter=@lianhuazhai/web

# 仅启动后端
bun run dev --filter=@lianhuazhai/api

# 代码格式化
bun run format

# 代码检查
bun run lint
```

### 数据库

```bash
cd apps/api

# 生成迁移文件
bun run db:generate

# 应用迁移
bun run db:push

# 重置数据库
bun run db:drop && bun run db:push

# 插入测试数据
bun run scripts/seed-test-data.ts
```

### 测试

```bash
# 运行单元测试
bun run test

# 运行 E2E 测试
cd apps/web
bun run test:e2e

# 查看测试覆盖率
bun run test:coverage
```

### 构建

```bash
# 构建所有包
bun run build

# 仅构建前端
bun run build --filter=@lianhuazhai/web

# 仅构建后端
bun run build --filter=@lianhuazhai/api
```

## 🐛 故障排除

### 问题 1: 数据库连接失败

**错误**: `Error: connect ECONNREFUSED 127.0.0.1:3307`

**解决方案**:
```bash
# 检查 MySQL 是否运行
docker ps | grep mysql

# 或直接连接测试
mycli -h 127.0.0.1 -P 3307 -u root -p admin123

# 如果无法连接，重启 MySQL
docker restart lianhuazhai-mysql
```

### 问题 2: 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用不同的端口
PORT=3002 bun run dev --filter=@lianhuazhai/web
```

### 问题 3: Node 版本不兼容

**错误**: `You are using Node.js 22.1.0. Vite requires Node.js version 20.19+`

**解决方案**:
```bash
# 使用 nvm 安装正确的 Node 版本
nvm install 22.12
nvm use 22.12

# 或升级现有的 Node
```

### 问题 4: JWT 认证失败

**错误**: `未登录，请先登录`

**解决方案**:
1. 清除浏览器 cookies
2. 重新登录
3. 检查 JWT_SECRET 配置是否正确

### 问题 5: 前端无法访问后端 API

**解决方案**:
1. 检查后端是否运行: http://localhost:3001/swagger
2. 检查 CORS 配置
3. 检查 `.env` 中的 `VITE_API_URL`

## 📊 数据库管理

### 使用 mycli 连接

```bash
mycli -h 127.0.0.1 -P 3307 -u root -p admin123
```

### 常用 SQL 命令

```sql
-- 查看所有义工
SELECT * FROM volunteer;

-- 查看所有管理员
SELECT v.name, a.role, a.department 
FROM admin a 
JOIN volunteer v ON a.id = v.id;

-- 查看考勤记录
SELECT * FROM volunteer_checkin_summary 
ORDER BY date DESC 
LIMIT 10;

-- 统计本月服务时长
SELECT 
  name, 
  SUM(work_hours) as total_hours 
FROM volunteer_checkin_summary 
WHERE date >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY user_id, name
ORDER BY total_hours DESC;
```

## 🔑 API 认证

### 获取 Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"13800001001","password":"123456"}'
```

### 使用 Token

```bash
# Token 会自动保存在 cookie 中
# 前端自动处理，无需手动设置
```

## 📝 开发建议

### 1. 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式写法

### 2. Git 工作流

```bash
# 创建功能分支
git checkout -b feature/xxx

# 提交代码
git add .
git commit -m "feat: 添加xxx功能"

# 推送到远程
git push origin feature/xxx

# 创建 Pull Request
```

### 3. 提交信息规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 📚 学习资源

### 前端技术栈

- **React**: https://react.dev
- **TanStack Router**: https://tanstack.com/router
- **TanStack Query**: https://tanstack.com/query
- **TanStack Table**: https://tanstack.com/table
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

### 后端技术栈

- **Bun**: https://bun.sh
- **Elysia**: https://elysiajs.com
- **Drizzle ORM**: https://orm.drizzle.team

## 🎯 下一步

1. ✅ **熟悉功能**: 使用测试账户体验所有功能
2. ✅ **阅读文档**: 查看 `IMPLEMENTATION_SUMMARY.md`
3. ✅ **优化结构**: 参考 `FILE_STRUCTURE_OPTIMIZATION_GUIDE.md`
4. ✅ **编写测试**: 为新功能添加单元测试
5. ✅ **部署准备**: 配置生产环境

## 💡 提示

- 开发时使用浏览器的开发者工具查看网络请求
- 后端日志会实时显示在终端
- Swagger 文档提供了所有 API 的详细说明
- 遇到问题先查看终端的错误日志

## 🆘 获取帮助

- 查看项目文档: `/docs` 目录
- 查看 API 文档: http://localhost:3001/swagger
- 查看实现总结: `IMPLEMENTATION_SUMMARY.md`
- 查看优化指南: `FILE_STRUCTURE_OPTIMIZATION_GUIDE.md`

---

**祝开发愉快！** 🎉
