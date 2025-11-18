# 🪷 莲花斋 - 现代化寺庙义工管理系统

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)
![Stars](https://img.shields.io/github/stars/yourusername/lianhuazhai?style=social)

**一个专为寺庙设计的现代化义工管理系统，让功德管理更简单**

[在线演示](https://demo.lianhuazhai.com) · [快速开始](#快速开始) · [文档](./docs) · [反馈问题](https://github.com/yourusername/lianhuazhai/issues)

</div>

---

## ✨ 特性

- 🚀 **极速体验** - 基于 Bun 运行时，启动速度提升 3 倍
- 📱 **现代化界面** - React 19 + Tailwind CSS 4，响应式设计
- 🔐 **安全可靠** - JWT 认证 + bcrypt 加密，企业级安全
- 📊 **智能考勤** - 自动汇总、月度报表、Excel 导出
- 🎯 **简单易用** - 5 分钟部署，开箱即用
- 📚 **文档完善** - 60+ 技术文档，新手友好
- 🌐 **完全开源** - MIT 协议，可商用

## 📸 预览

<div align="center">
  <img src="./screenshots/dashboard.png" alt="仪表盘" width="45%">
  <img src="./screenshots/volunteer-list.png" alt="义工列表" width="45%">
  <img src="./screenshots/checkin-report.png" alt="考勤报表" width="45%">
  <img src="./screenshots/mobile.png" alt="移动端" width="45%">
</div>

## 🎯 适用场景

- ✅ 寺庙义工管理
- ✅ 宗教场所人员管理
- ✅ 志愿者组织管理
- ✅ 社区服务管理
- ✅ 非营利组织管理

## 🚀 快速开始

### 前置要求

- [Bun](https://bun.sh) >= 1.0
- [MySQL](https://www.mysql.com/) >= 8.0
- [Node.js](https://nodejs.org/) >= 18 (可选)

### 一键安装

```bash
# 克隆项目
git clone https://github.com/yourusername/lianhuazhai.git
cd lianhuazhai

# 安装依赖
bun install

# 配置数据库
cp apps/api/.env.example apps/api/.env
# 编辑 .env 文件，填入数据库信息

# 初始化数据库
cd apps/api
bun run db:push

# 启动项目
bun run dev
```

访问 http://localhost:5173 开始使用！

详细文档：[完整安装指南](./docs/setup/QUICK_START.md)

## 📦 技术栈

### 后端
- **运行时**: [Bun](https://bun.sh) - 极速 JavaScript 运行时
- **框架**: [Elysia](https://elysiajs.com) - 高性能 Web 框架
- **数据库**: [MySQL](https://www.mysql.com/) + [Drizzle ORM](https://orm.drizzle.team)
- **认证**: JWT + bcrypt

### 前端
- **框架**: [React 19](https://react.dev)
- **路由**: [TanStack Router](https://tanstack.com/router)
- **状态**: [TanStack Query](https://tanstack.com/query)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com)
- **组件**: [shadcn/ui](https://ui.shadcn.com)

## 📖 核心功能

### 义工管理
- ✅ 义工信息 CRUD
- ✅ 批量导入/导出
- ✅ 高级搜索和筛选
- ✅ 头像上传
- ✅ 状态管理

### 考勤系统
- ✅ 签到/签退
- ✅ 自动时长计算
- ✅ 月度汇总报表
- ✅ Excel 导出
- ✅ 多维度统计

### 权限管理
- ✅ 管理员系统
- ✅ 角色权限
- ✅ 操作日志

## 📊 项目数据

- 💻 **17,000+** 行代码
- 📚 **60+** 技术文档
- 🗄️ **8** 张数据表
- ⚡ **30+** API 接口
- 🎨 **20+** UI 组件

## 🗺️ 路线图

### v1.0 (当前)
- [x] 基础义工管理
- [x] 考勤系统
- [x] 数据导出
- [x] 管理员系统

### v1.1 (计划中)
- [ ] 移动端适配
- [ ] 数据可视化
- [ ] 微信小程序
- [ ] 消息通知

### v2.0 (未来)
- [ ] 多租户支持
- [ ] 国际化
- [ ] 插件系统
- [ ] AI 智能分析

[查看完整路线图](./docs/ROADMAP.md)

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)

### 贡献者

<a href="https://github.com/yourusername/lianhuazhai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yourusername/lianhuazhai" />
</a>

## 📄 开源协议

本项目采用 [MIT](./LICENSE) 协议开源。

## 🙏 致谢

- [Bun](https://bun.sh) - 极速运行时
- [Elysia](https://elysiajs.com) - 优雅的框架
- [shadcn/ui](https://ui.shadcn.com) - 精美的组件

## 💬 社区

- 💬 [讨论区](https://github.com/yourusername/lianhuazhai/discussions)
- 🐛 [问题反馈](https://github.com/yourusername/lianhuazhai/issues)
- 📧 邮件: your-email@example.com
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/lianhuazhai&type=Date)](https://star-history.com/#yourusername/lianhuazhai&Date)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by [Your Name](https://github.com/yourusername)

</div>
