# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 完整的项目文档体系（60+ 文档）
- 开源推广策略和时间表
- GitHub Issue 和 PR 模板
- 贡献指南和行为准则

## [1.0.0] - 2024-11-18

### 新增
- 🎉 首个正式版本发布
- ✨ 完整的义工管理系统
- ✨ 考勤签到系统
- ✨ 月度报表和数据导出
- ✨ 管理员权限系统
- ✨ JWT 认证和会话管理
- ✨ Swagger API 文档
- ✨ 响应式前端界面

### 后端功能
- 义工 CRUD 操作
- 批量导入/导出
- 考勤签到/签退
- 月度汇总报表
- Excel 数据导出
- 管理员管理
- 文件上传
- 密码加密（bcrypt）

### 前端功能
- 登录/登出
- 义工列表（分页、搜索）
- 考勤报表（月度统计）
- 数据导出
- 响应式布局
- 美化的 UI 界面

### 技术栈
- 后端: Bun + Elysia + Drizzle ORM + MySQL
- 前端: React 19 + Vite 7 + TanStack Router/Query + Tailwind CSS 4
- 组件: shadcn/ui
- 语言: TypeScript 5.0+

## [0.9.0] - 2024-11-15

### 新增
- 基础项目架构
- 数据库设计和迁移
- 认证系统
- 基础 API 接口

### 修复
- 认证中间件问题
- 密码加密问题
- Swagger 文档标签分组

### 优化
- 代码结构优化
- 文档完善
- 性能优化

## [0.5.0] - 2024-11-01

### 新增
- 项目初始化
- Monorepo 架构搭建
- 基础开发环境配置

---

## 版本说明

### 版本号格式
- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 变更类型
- `新增`: 新功能
- `修改`: 对现有功能的变更
- `弃用`: 即将移除的功能
- `移除`: 已移除的功能
- `修复`: Bug 修复
- `安全`: 安全相关的修复

---

[未发布]: https://github.com/yourusername/lianhuazhai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/lianhuazhai/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/yourusername/lianhuazhai/compare/v0.5.0...v0.9.0
[0.5.0]: https://github.com/yourusername/lianhuazhai/releases/tag/v0.5.0
