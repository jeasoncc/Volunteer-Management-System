# Care-Web 快速启动指南

## 5分钟快速体验

### 前置条件

- 已安装 Bun 或 Node.js 18+
- API 服务正在运行（端口 3001）

### 步骤 1: 安装依赖

```bash
cd apps/care-web
bun install
```

### 步骤 2: 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
VITE_API_URL=http://localhost:3001
```

### 步骤 3: 启动开发服务器

```bash
bun run dev
```

### 步骤 4: 访问网站

打开浏览器访问：

- 首页：http://localhost:4000
- 实时数据：http://localhost:4000/stats

## 测试 API 接口

```bash
bun run test:api
```

## 常见问题

### Q: API 请求失败怎么办？

**A:** 检查以下几点：

1. API 服务是否运行在 3001 端口
2. `.env` 文件中的 `VITE_API_URL` 是否正确
3. 运行 `bun run test:api` 测试接口

### Q: 页面显示 0 数据？

**A:** 可能原因：

1. 数据库中没有数据
2. API 接口返回错误
3. 前端会显示模拟数据作为降级方案

### Q: 如何添加测试数据？

**A:** 在 API 项目中运行数据库迁移和种子数据：

```bash
cd apps/api
# 运行迁移
bun run migrate
# 添加测试数据（如果有）
bun run seed
```

## 项目结构

```
apps/care-web/
├── src/
│   ├── components/     # 组件
│   ├── pages/         # 页面
│   ├── routes/        # 路由
│   ├── lib/           # 工具和 API
│   └── main.tsx       # 入口
├── public/            # 静态资源
└── scripts/           # 脚本
```

## 开发技巧

### 1. 热重载

修改代码后，页面会自动刷新。

### 2. 查看路由

访问 http://localhost:4000 时，按 `Ctrl+Shift+D` 打开 TanStack Router DevTools。

### 3. 调试 API

在浏览器开发者工具的 Network 标签中查看 API 请求。

### 4. 修改刷新间隔

在 `src/components/stats/RealtimeCheckIns.tsx` 中修改：

```typescript
// 从 30000 (30秒) 改为其他值
const interval = setInterval(loadCheckIns, 30000);
```

## 下一步

- 📖 阅读 [功能清单](FEATURES.md)
- 🚀 查看 [部署指南](DEPLOYMENT_GUIDE.md)
- 📊 了解 [实时数据功能](REALTIME_STATS.md)

## 需要帮助？

- 查看项目文档
- 联系技术团队
- 提交 Issue

祝你开发愉快！🎉
