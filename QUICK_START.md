# 莲花斋义工管理系统 - 快速开始指南

## 前置要求

- **Bun**: >= 1.0.0 ([安装指南](https://bun.sh/docs/installation))
- **MySQL**: >= 8.0
- **Node.js**: >= 18 (可选，Bun 已包含)

## 一键启动（推荐）

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
cd apps/api
cp .env.example .env
```

编辑 `.env` 文件：

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

#### 前端配置 (apps/web/.env)

```bash
cd ../web
cp .env.example .env
```

编辑 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=莲花斋义工管理系统
VITE_APP_VERSION=1.0.0
```

### 4. 初始化数据库

```bash
cd apps/api

# 生成数据库迁移
bun run db:generate

# 执行数据库迁移
bun run db:push

# 初始化测试数据（可选）
bun run db:seed
```

### 5. 启动项目

回到项目根目录：

```bash
cd ../..

# 同时启动前后端
bun run dev
```

访问：
- 前端：http://localhost:3000
- 后端 API：http://localhost:3001
- API 文档：http://localhost:3001/swagger

### 6. 登录系统

默认管理员账号：
- 账号：`admin`
- 密码：`admin123`

## 分别启动（开发调试）

### 只启动后端

```bash
bun run dev --filter=@lianhuazhai/api
```

### 只启动前端

```bash
bun run dev --filter=@lianhuazhai/web
```

## 常用命令

### 根目录命令

```bash
# 安装依赖
bun install

# 开发模式（同时启动前后端）
bun run dev

# 构建所有项目
bun run build

# 代码检查
bun run lint

# 代码格式化
bun run format

# 清理所有构建产物
bun run clean
```

### 后端命令 (apps/api)

```bash
cd apps/api

# 开发模式
bun run dev

# 生产模式
bun run start

# 数据库迁移
bun run db:generate    # 生成迁移文件
bun run db:push        # 执行迁移
bun run db:studio      # 打开数据库管理界面

# 初始化数据
bun run db:seed

# 代码格式化
bun run format

# 测试
bun run test
```

### 前端命令 (apps/web)

```bash
cd apps/web

# 开发模式
bun run dev

# 构建生产版本
bun run build

# 预览生产版本
bun run serve

# 代码检查
bun run lint

# 代码格式化
bun run format

# 测试
bun run test
```

## 数据库设置

### 使用 Docker 快速启动 MySQL

```bash
docker run -d \
  --name lianhuazhai-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=lianhuazhai \
  mysql:8.0
```

### 手动创建数据库

```sql
CREATE DATABASE lianhuazhai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 项目结构

```
lianhuazhai-monorepo/
├── apps/
│   ├── api/                    # 后端 API
│   │   ├── src/
│   │   │   ├── routes/        # 路由
│   │   │   ├── services/      # 业务逻辑
│   │   │   ├── models/        # 数据模型
│   │   │   ├── middleware/    # 中间件
│   │   │   └── utils/         # 工具函数
│   │   ├── .env               # 环境变量
│   │   └── package.json
│   │
│   └── web/                    # 前端 Web
│       ├── src/
│       │   ├── routes/        # 页面路由
│       │   ├── components/    # 组件
│       │   ├── services/      # API 服务
│       │   ├── hooks/         # 自定义 Hooks
│       │   └── lib/           # 工具库
│       ├── .env               # 环境变量
│       └── package.json
│
├── packages/                   # 共享包（未来扩展）
├── turbo.json                  # Turborepo 配置
└── package.json                # 根配置
```

## 功能模块

### 1. 认证系统
- 用户登录/登出
- JWT Token 认证
- 路由守卫

### 2. 义工管理
- 义工列表（分页、搜索、排序）
- 添加义工
- 编辑义工
- 删除义工
- 义工详情

### 3. 考勤管理
- 月度考勤报表
- 考勤统计
- Excel 导出

### 4. 首页仪表板
- 统计数据概览
- 服务时长排行榜

## 开发建议

### 1. 代码规范

项目使用 Biome 进行代码检查和格式化：

```bash
# 检查代码
bun run lint

# 格式化代码
bun run format
```

### 2. Git 提交规范

建议使用 Conventional Commits：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 3. 开发流程

1. 创建功能分支：`git checkout -b feature/xxx`
2. 开发功能
3. 提交代码：`git commit -m "feat: xxx"`
4. 推送分支：`git push origin feature/xxx`
5. 创建 Pull Request

## 常见问题

### 1. 端口被占用

如果端口 3000 或 3001 被占用，可以修改：

**后端端口** (apps/api/.env)：
```env
PORT=3002
```

**前端端口** (apps/web/package.json)：
```json
{
  "scripts": {
    "dev": "vite --port 3001"
  }
}
```

### 2. 数据库连接失败

检查：
1. MySQL 服务是否启动
2. `.env` 中的数据库配置是否正确
3. 数据库是否已创建
4. 用户权限是否正确

### 3. 前端无法连接后端

检查：
1. 后端服务是否启动
2. `apps/web/.env` 中的 `VITE_API_BASE_URL` 是否正确
3. CORS 配置是否正确

### 4. 依赖安装失败

尝试：
```bash
# 清理缓存
rm -rf node_modules
rm -rf apps/*/node_modules
rm bun.lock

# 重新安装
bun install
```

## 生产部署

### 构建项目

```bash
# 构建所有项目
bun run build

# 或分别构建
bun run build --filter=@lianhuazhai/api
bun run build --filter=@lianhuazhai/web
```

### 后端部署

```bash
cd apps/api

# 设置生产环境变量
export NODE_ENV=production

# 启动服务
bun run start

# 或使用 PM2
pm2 start bun --name "lianhuazhai-api" -- run start
```

### 前端部署

前端构建后会生成 `apps/web/dist` 目录，可以部署到：

- **Vercel**: 推荐，零配置部署
- **Netlify**: 简单易用
- **Nginx**: 自建服务器

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 技术支持

- 查看文档：[README.md](./README.md)
- 前端文档：[apps/web/README.md](./apps/web/README.md)
- 后端文档：[apps/api/README.md](./apps/api/README.md)
- 架构评估：[PROJECT_ARCHITECTURE_REVIEW.md](./PROJECT_ARCHITECTURE_REVIEW.md)
- 前端总结：[FRONTEND_SUMMARY.md](./FRONTEND_SUMMARY.md)

## 下一步

1. ✅ 熟悉项目结构
2. ✅ 启动开发环境
3. ✅ 登录系统体验功能
4. 📝 阅读代码，了解实现细节
5. 🚀 开始开发新功能

祝你开发愉快！🎉
