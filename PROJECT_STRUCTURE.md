# 📁 项目结构

## 根目录

```
lianhuazhai-monorepo/
├── apps/                    # 应用代码
│   ├── api/                 # 后端 API (Bun + Elysia)
│   └── web/                 # 前端应用 (React 19 + Vite)
│
├── packages/                # 共享包
│
├── docs/                    # 技术文档
│   ├── api/                 # API 文档
│   ├── database/            # 数据库文档
│   ├── frontend/            # 前端文档
│   └── setup/               # 设置指南
│
├── screenshots/             # 项目截图
├── tests/                   # 测试文件
│
├── README.md                # 项目说明
├── ROADMAP.md               # 产品路线图
├── CHANGELOG.md             # 更新日志
├── CONTRIBUTING.md          # 贡献指南
├── CODE_OF_CONDUCT.md       # 行为准则
├── LICENSE                  # MIT 协议
│
└── package.json             # 项目配置
```

## 核心目录说明

### apps/api/ - 后端服务
- `src/modules/` - 业务模块（auth, volunteer, checkin, document 等）
- `src/db/` - 数据库配置
- `public/` - 静态文件（生成的 PDF 等）

### apps/web/ - 前端应用
- `src/routes/` - 页面路由
- `src/components/` - UI 组件
- `src/services/` - API 服务

### docs/ - 文档
- 只保留技术文档和 API 文档
- 删除了冗余的总结和状态报告

## 快速开始

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 前端: http://localhost:3000
# 后端: http://localhost:3001
```

## 文档导航

- **项目说明**: [README.md](./README.md)
- **产品路线图**: [ROADMAP.md](./ROADMAP.md)
- **贡献指南**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **API 文档**: [docs/api/](./docs/api/)
- **数据库文档**: [docs/database/](./docs/database/)

---

**保持简洁，专注开发** 🚀
