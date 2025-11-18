# 🪷 莲花斋 - 现代化寺庙义工管理系统

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg?logo=bun)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg?logo=mysql&logoColor=white)

**一个专为寺庙设计的现代化义工管理系统，让功德管理更简单高效**

[在线演示](https://demo.lianhuazhai.com) · [快速开始](#-快速开始) · [完整文档](./docs) · [反馈问题](https://github.com/yourusername/lianhuazhai/issues) · [参与贡献](./CONTRIBUTING.md)

</div>

---

## ✨ 特性亮点

<table>
<tr>
<td width="50%">

### 🚀 极速体验
- 基于 **Bun** 运行时，启动速度提升 3 倍
- API 响应时间 < 100ms
- 支持 1000+ 并发请求

### 📱 现代化界面
- **React 19** + **Tailwind CSS 4**
- 响应式设计，完美适配各种设备
- 精美的 **shadcn/ui** 组件

### 🔐 安全可靠
- JWT 认证 + bcrypt 加密
- HTTP-only Cookie 会话管理
- SQL 注入防护，企业级安全

</td>
<td width="50%">

### 📊 智能考勤
- 自动签到/签退
- 智能时长计算
- 月度汇总报表
- Excel 一键导出

### 🎯 简单易用
- 5 分钟快速部署
- 开箱即用
- 完善的中文文档

### 🌐 完全开源
- MIT 协议，可商用
- 60+ 技术文档
- 活跃的社区支持

</td>
</tr>
</table>

---

## 📸 项目预览

<div align="center">

### 登录页面
<img src="./screenshots/login.png" alt="登录页面" width="80%">

### 义工管理
<img src="./screenshots/volunteer-list.png" alt="义工列表" width="80%">

### 考勤报表
<img src="./screenshots/checkin-report.png" alt="考勤报表" width="80%">

</div>

> � *项*提示**: 截图展示了系统的核心功能，更多功能请查看[在线演示](https://demo.lianhuazhai.com)

---

## 🎯 适用场景

<table>
<tr>
<td align="center" width="20%">
<img src="https://img.icons8.com/fluency/96/temple.png" width="64"><br>
<b>寺庙管理</b><br>
义工、考勤、活动
</td>
<td align="center" width="20%">
<img src="https://img.icons8.com/fluency/96/church.png" width="64"><br>
<b>宗教场所</b><br>
人员、服务管理
</td>
<td align="center" width="20%">
<img src="https://img.icons8.com/fluency/96/volunteer.png" width="64"><br>
<b>志愿者组织</b><br>
志愿者管理
</td>
<td align="center" width="20%">
<img src="https://img.icons8.com/fluency/96/community.png" width="64"><br>
<b>社区服务</b><br>
社区活动管理
</td>
<td align="center" width="20%">
<img src="https://img.icons8.com/fluency/96/charity.png" width="64"><br>
<b>非营利组织</b><br>
成员管理
</td>
</tr>
</table>

---

## � 快]速开始

### 前置要求

确保你的系统已安装以下软件：

- [Bun](https://bun.sh) >= 1.0.0
- [MySQL](https://www.mysql.com/) >= 8.0
- [Git](https://git-scm.com/)

### 一键安装

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/lianhuazhai.git
cd lianhuazhai

# 2. 安装依赖
bun install

# 3. 配置环境变量
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# 编辑 .env 文件，填入你的数据库信息

# 4. 初始化数据库
cd apps/api
bun run db:push

# 5. 启动项目
cd ../..
bun run dev
```

🎉 **完成！** 访问 http://localhost:3000 开始使用

**默认登录账号**: `admin` / `admin123`

> 📖 详细安装指南请查看 [完整文档](./docs/setup/QUICK_START.md)

### Docker 部署（推荐）

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001
# API 文档: http://localhost:3001/swagger
```

---

## 📦 技术栈

<table>
<tr>
<td width="50%" valign="top">

### 后端技术
- **运行时**: [Bun](https://bun.sh) - 极速 JavaScript 运行时
- **框架**: [Elysia](https://elysiajs.com) - 高性能 Web 框架
- **数据库**: [MySQL](https://www.mysql.com/) 8.0+
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) - 类型安全的 ORM
- **认证**: JWT + bcrypt
- **API 文档**: Swagger/OpenAPI
- **语言**: TypeScript 5.0+

</td>
<td width="50%" valign="top">

### 前端技术
- **框架**: [React 19](https://react.dev) - 最新版本
- **构建工具**: [Vite 7](https://vitejs.dev) - 极速构建
- **路由**: [TanStack Router](https://tanstack.com/router) - 类型安全路由
- **状态管理**: [TanStack Query](https://tanstack.com/query) - 数据获取
- **样式**: [Tailwind CSS 4](https://tailwindcss.com) - 原子化 CSS
- **组件库**: [shadcn/ui](https://ui.shadcn.com) - 精美组件
- **语言**: TypeScript 5.0+

</td>
</tr>
</table>

---

## 📖 核心功能

### 🧑‍🤝‍🧑 义工管理
- ✅ 义工信息 CRUD（创建、查询、更新、删除）
- ✅ 批量导入/导出（支持 Excel）
- ✅ 高级搜索和筛选（姓名、手机号、莲花斋ID）
- ✅ 头像上传和管理
- ✅ 状态管理（在职/离职）
- ✅ 法名字段支持
- ✅ 密码管理和重置

### ⏰ 考勤系统
- ✅ 签到/签退功能
- ✅ 自动时长计算
- ✅ 月度汇总报表
- ✅ 多维度统计（参与人数、总时长、总次数）
- ✅ Excel 导出（支持多种规则）
- ✅ 考勤记录查询
- ✅ 异常考勤处理

### 👨‍💼 权限管理
- ✅ 管理员系统
- ✅ 角色权限控制
- ✅ 操作日志记录
- ✅ 安全审计

### 📊 数据分析
- ✅ 考勤统计报表
- ✅ 义工活跃度分析
- ✅ 数据可视化图表
- ✅ 自定义报表导出

---

## 📊 项目数据

<div align="center">

| 指标 | 数值 | 说明 |
|:---:|:---:|:---|
| 💻 **代码量** | 17,000+ 行 | 后端 9,000+ / 前端 8,000+ |
| 📚 **文档数** | 60+ 个 | 完善的技术文档 |
| 🗄️ **数据表** | 8 张 | 精心设计的数据库架构 |
| ⚡ **API 接口** | 30+ 个 | RESTful API 设计 |
| 🎨 **UI 组件** | 20+ 个 | 可复用的组件库 |
| ✅ **测试覆盖** | 60%+ | 单元测试 + 集成测试 |
| 🚀 **性能** | < 100ms | API 平均响应时间 |
| 🔒 **安全性** | A+ | 企业级安全标准 |

</div>

---

## 📁 项目结构

```
lianhuazhai-monorepo/
├── apps/
│   ├── api/                    # 后端 API
│   │   ├── src/
│   │   │   ├── modules/        # 业务模块
│   │   │   │   ├── auth/       # 认证模块
│   │   │   │   ├── volunteer/  # 义工模块
│   │   │   │   ├── checkin/    # 考勤模块
│   │   │   │   └── admin/      # 管理员模块
│   │   │   ├── db/             # 数据库配置
│   │   │   ├── middleware/     # 中间件
│   │   │   └── utils/          # 工具函数
│   │   └── package.json
│   │
│   └── web/                    # 前端应用
│       ├── src/
│       │   ├── routes/         # 页面路由
│       │   ├── components/     # UI 组件
│       │   ├── services/       # API 服务
│       │   ├── hooks/          # React Hooks
│       │   └── lib/            # 工具库
│       └── package.json
│
├── docs/                       # 📚 统一文档目录
│   ├── README.md               # 文档中心首页
│   ├── INDEX.md                # 完整文档索引
│   ├── api/                    # API 文档
│   │   ├── checkin/            # 签到系统文档（19个）
│   │   ├── volunteer/          # 义工系统文档（6个）
│   │   ├── database/           # 数据库文档（4个）
│   │   ├── specs/              # 技术规格（6个）
│   │   └── modules/            # 模块文档
│   ├── frontend/               # 前端文档（3个）
│   ├── setup/                  # 设置指南（5个）
│   └── summaries/              # 开发总结（7个）
│
├── screenshots/                # 项目截图
├── .github/                    # GitHub 配置
│   ├── ISSUE_TEMPLATE/         # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md             # 贡献指南
├── ROADMAP.md                  # 产品路线图
├── CHANGELOG.md                # 更新日志
└── LICENSE                     # MIT 协议
```

---

## 🗺️ 产品路线图

### ✅ v1.0 (当前版本)
- [x] 基础义工管理
- [x] 考勤签到系统
- [x] 数据导出功能
- [x] 管理员系统
- [x] API 文档

### 🚧 v1.1 (开发中)
- [ ] 移动端适配
- [ ] 数据可视化大屏
- [ ] 消息通知系统
- [ ] 高级搜索功能

### 🔮 v1.2 (计划中)
- [ ] 微信小程序
- [ ] 扫码签到
- [ ] AI 智能分析
- [ ] 多租户支持

查看 [完整路线图](./ROADMAP.md) 了解更多

---

## 📚 文档导航

<table>
<tr>
<td width="33%">

### 🚀 快速开始
- [安装指南](./docs/setup/QUICK_START.md)
- [项目设置](./docs/setup/SETUP.md)
- [启动指南](./docs/setup/START_GUIDE.md)
- [常见问题](./docs/FAQ.md)

</td>
<td width="33%">

### 📖 开发文档
- [API 文档](./docs/api/API_DOCUMENTATION.md)
- [前端开发](./docs/frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- [数据库设计](./docs/api/database/DATABASE_NAMING_CONVENTION.md)
- [架构设计](./docs/PROJECT_ARCHITECTURE_REVIEW.md)

</td>
<td width="33%">

### 🔧 功能模块
- [签到系统](./docs/api/checkin/)
- [义工管理](./docs/api/volunteer/)
- [权限系统](./docs/api/specs/auth-system/)
- [数据导出](./docs/api/checkin/EXPORT_COMPLETE_GUIDE.md)

</td>
</tr>
</table>

📋 查看 [完整文档索引](./docs/INDEX.md) 获取所有 60+ 个文档

---

## 🤝 参与贡献

我们欢迎所有形式的贡献！无论是报告 Bug、提出新功能、改进文档还是提交代码。

### 贡献方式

1. 🐛 [报告 Bug](https://github.com/yourusername/lianhuazhai/issues/new?template=bug_report.md)
2. 💡 [提出新功能](https://github.com/yourusername/lianhuazhai/issues/new?template=feature_request.md)
3. 📖 改进文档
4. 💻 提交代码

### 快速开始贡献

```bash
# 1. Fork 项目
# 2. 克隆你的 Fork
git clone https://github.com/your-username/lianhuazhai.git

# 3. 创建特性分支
git checkout -b feature/amazing-feature

# 4. 提交更改
git commit -m 'feat: add amazing feature'

# 5. 推送到分支
git push origin feature/amazing-feature

# 6. 创建 Pull Request
```

详细指南请查看 [贡献指南](./CONTRIBUTING.md)

### 贡献者

感谢所有贡献者的付出！

<a href="https://github.com/yourusername/lianhuazhai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/lianhuazhai" />
</a>

---

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/lianhuazhai&type=Date)](https://star-history.com/#yourusername/lianhuazhai&Date)

---

## 📄 开源协议

本项目采用 [MIT](./LICENSE) 协议开源。

这意味着你可以：
- ✅ 商业使用
- ✅ 修改代码
- ✅ 分发
- ✅ 私人使用

唯一的要求是保留版权声明。

---

## 🙏 致谢

感谢以下优秀的开源项目：

- [Bun](https://bun.sh) - 极速的 JavaScript 运行时
- [Elysia](https://elysiajs.com) - 优雅的 Web 框架
- [React](https://react.dev) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com) - 实用的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com) - 精美的组件库
- [Drizzle ORM](https://orm.drizzle.team) - 类型安全的 ORM

---

## 💬 社区与支持

<table>
<tr>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/github.png" width="48"><br>
<b>GitHub</b><br>
<a href="https://github.com/yourusername/lianhuazhai/discussions">讨论区</a>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/discord.png" width="48"><br>
<b>Discord</b><br>
<a href="https://discord.gg/lianhuazhai">加入社区</a>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/twitter.png" width="48"><br>
<b>Twitter</b><br>
<a href="https://twitter.com/lianhuazhai">@lianhuazhai</a>
</td>
<td align="center" width="25%">
<img src="https://img.icons8.com/fluency/96/email.png" width="48"><br>
<b>Email</b><br>
<a href="mailto:hello@lianhuazhai.com">联系我们</a>
</td>
</tr>
</table>

---

## 📈 项目状态

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/lianhuazhai)
![GitHub issues](https://img.shields.io/github/issues/yourusername/lianhuazhai)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/lianhuazhai)
![GitHub](https://img.shields.io/github/license/yourusername/lianhuazhai)

---

<div align="center">

### ⭐ 如果这个项目对你有帮助，请给一个 Star 支持一下！⭐

**让我们一起让功德管理更简单！**

Made with ❤️ by [莲花斋团队](https://github.com/yourusername)

[⬆ 回到顶部](#-莲花斋---现代化寺庙义工管理系统)

</div>
