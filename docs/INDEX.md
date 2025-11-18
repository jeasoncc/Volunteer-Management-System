# 莲花斋项目文档索引

本目录统一管理项目的所有文档。所有文档已从各子项目整合到此处，便于查找和维护。

## 📁 文档结构

### 根目录文档
- [PROJECT_ARCHITECTURE_REVIEW.md](./PROJECT_ARCHITECTURE_REVIEW.md) - 项目架构评审

### API 后端文档 (`api/`)

#### 核心文档
- [API_DOCUMENTATION.md](./api/API_DOCUMENTATION.md) - API 接口文档
- [API_SUMMARY.md](./api/API_SUMMARY.md) - API 开发总结
- [PROJECT_STATUS.md](./api/PROJECT_STATUS.md) - 项目状态
- [QUICK_START.md](./api/QUICK_START.md) - API 快速开始
- [SCRIPTS_REFERENCE.md](./api/SCRIPTS_REFERENCE.md) - 脚本参考
- [ORGANIZATION_COMPLETE.md](./api/ORGANIZATION_COMPLETE.md) - 组织架构完成

#### 签到系统 (`api/checkin/`) - 19个文档
- [README.md](./api/checkin/README.md) - 签到系统概览
- [CHECKIN_COMPREHENSIVE_IMPROVEMENT.md](./api/checkin/CHECKIN_COMPREHENSIVE_IMPROVEMENT.md) - 综合改进
- [CHECKIN_DEVICE_API.md](./api/checkin/CHECKIN_DEVICE_API.md) - 设备 API
- [CHECKIN_IMPROVEMENT_PLAN.md](./api/checkin/CHECKIN_IMPROVEMENT_PLAN.md) - 改进计划
- [CHECKIN_SOLUTION_DESIGN.md](./api/checkin/CHECKIN_SOLUTION_DESIGN.md) - 解决方案设计
- [CHECKIN_SUMMARY_COMPLETE.md](./api/checkin/CHECKIN_SUMMARY_COMPLETE.md) - 完整总结
- [CHECKIN_SYSTEM_COMPREHENSIVE_ANALYSIS.md](./api/checkin/CHECKIN_SYSTEM_COMPREHENSIVE_ANALYSIS.md) - 综合分析
- [EXPORT_COMPLETE_GUIDE.md](./api/checkin/EXPORT_COMPLETE_GUIDE.md) - 导出完整指南
- [EXPORT_DATA_SOURCE.md](./api/checkin/EXPORT_DATA_SOURCE.md) - 导出数据源
- [EXPORT_FAQ.md](./api/checkin/EXPORT_FAQ.md) - 导出常见问题
- [EXPORT_GUIDE.md](./api/checkin/EXPORT_GUIDE.md) - 导出指南
- [EXPORT_QUICK_REFERENCE.md](./api/checkin/EXPORT_QUICK_REFERENCE.md) - 导出快速参考
- [EXPORT_RULES.md](./api/checkin/EXPORT_RULES.md) - 导出规则
- [EXPORT_USAGE.md](./api/checkin/EXPORT_USAGE.md) - 导出使用说明
- [FINAL_SOLUTION_SUMMARY.md](./api/checkin/FINAL_SOLUTION_SUMMARY.md) - 最终解决方案
- [ISSUES_FIXED_SUMMARY.md](./api/checkin/ISSUES_FIXED_SUMMARY.md) - 问题修复总结
- [MONTHLY_SUMMARY_IMPLEMENTATION.md](./api/checkin/MONTHLY_SUMMARY_IMPLEMENTATION.md) - 月度汇总实现
- [MONTHLY_SUMMARY_STRATEGY.md](./api/checkin/MONTHLY_SUMMARY_STRATEGY.md) - 月度汇总策略

#### 义工系统 (`api/volunteer/`) - 5个文档
- [QUICK_START.md](./api/volunteer/QUICK_START.md) - 快速开始
- [REGISTER_GUIDE.md](./api/volunteer/REGISTER_GUIDE.md) - 注册指南
- [REGISTER_SUMMARY.md](./api/volunteer/REGISTER_SUMMARY.md) - 注册总结
- [REGISTER_V2_SUMMARY.md](./api/volunteer/REGISTER_V2_SUMMARY.md) - 注册 V2 总结
- [UPLOAD_FIX.md](./api/volunteer/UPLOAD_FIX.md) - 上传修复

#### 数据库 (`api/database/`) - 3个文档
- [DATABASE_NAMING_CONVENTION.md](./api/database/DATABASE_NAMING_CONVENTION.md) - 数据库命名规范
- [NAMING_CONVENTION_ANALYSIS.md](./api/database/NAMING_CONVENTION_ANALYSIS.md) - 命名规范分析
- [SCHEMA_NAMING_AUDIT.md](./api/database/SCHEMA_NAMING_AUDIT.md) - 架构命名审计

#### 技术规格 (`api/specs/`)
- **架构评审**: [architecture-review/analysis.md](./api/specs/architecture-review/analysis.md)
- **认证系统**: [auth-system/requirements.md](./api/specs/auth-system/requirements.md)
- **Better Auth 登录注册**:
  - [requirements.md](./api/specs/better-auth-login-register/requirements.md) - 需求
  - [design.md](./api/specs/better-auth-login-register/design.md) - 设计
  - [tasks.md](./api/specs/better-auth-login-register/tasks.md) - 任务

#### 模块文档 (`api/modules/`)
- [volunteer-module.md](./api/modules/volunteer-module.md) - 义工模块说明

### 前端文档 (`frontend/`)
- [FRONTEND_DEVELOPMENT_PLAN.md](./frontend/FRONTEND_DEVELOPMENT_PLAN.md) - 前端开发计划
- [FRONTEND_SUMMARY.md](./frontend/FRONTEND_SUMMARY.md) - 前端开发总结
- [WEB_FEATURES.md](./frontend/WEB_FEATURES.md) - Web 功能特性

### 设置指南 (`setup/`)
- [QUICK_START.md](./setup/QUICK_START.md) - 快速开始指南
- [START_GUIDE.md](./setup/START_GUIDE.md) - 启动指南
- [SETUP.md](./setup/SETUP.md) - 项目设置
- [GIT_SETUP.md](./setup/GIT_SETUP.md) - Git 配置指南
- [SHADCN_UI_INTEGRATION.md](./setup/SHADCN_UI_INTEGRATION.md) - Shadcn UI 集成指南

### 开发总结 (`summaries/`)
- [FINAL_SUMMARY.md](./summaries/FINAL_SUMMARY.md) - 最终总结
- [FIX_SUMMARY.md](./summaries/FIX_SUMMARY.md) - 修复总结
- [LOGIN_FIX_SUMMARY.md](./summaries/LOGIN_FIX_SUMMARY.md) - 登录修复总结
- [REACT_ERROR_FIX.md](./summaries/REACT_ERROR_FIX.md) - React 错误修复
- [UPDATES_SUMMARY.md](./summaries/UPDATES_SUMMARY.md) - 更新总结
- [DEBUG_VOLUNTEER_LIST.md](./summaries/DEBUG_VOLUNTEER_LIST.md) - 义工列表调试
- [TEST_CHECKLIST.md](./summaries/TEST_CHECKLIST.md) - 测试清单



## 📝 文档分类

### 开发指南
- **快速开始**: `setup/QUICK_START.md`, `setup/START_GUIDE.md`, `api/QUICK_START.md`
- **项目设置**: `setup/SETUP.md`, `setup/GIT_SETUP.md`
- **API 文档**: `api/API_DOCUMENTATION.md`
- **脚本参考**: `api/SCRIPTS_REFERENCE.md`

### 功能模块
- **签到系统**: `api/checkin/` (19个文档)
- **义工管理**: `api/volunteer/` (5个文档)
- **认证系统**: `api/specs/auth-system/`, `api/specs/better-auth-login-register/`

### 技术规范
- **数据库规范**: `api/database/` (3个文档)
- **架构设计**: `PROJECT_ARCHITECTURE_REVIEW.md`, `api/specs/architecture-review/`
- **模块设计**: `api/modules/`

### 开发总结
- **前端总结**: `frontend/FRONTEND_SUMMARY.md`
- **API 总结**: `api/API_SUMMARY.md`
- **各类修复总结**: `summaries/` (7个文档)

## 🔍 快速查找

### 新手入门
1. 从 [setup/QUICK_START.md](./setup/QUICK_START.md) 开始
2. 查看 [setup/SETUP.md](./setup/SETUP.md) 了解项目设置
3. 阅读 [api/QUICK_START.md](./api/QUICK_START.md) 了解 API 开发

### API 开发
- **接口文档**: [api/API_DOCUMENTATION.md](./api/API_DOCUMENTATION.md)
- **项目状态**: [api/PROJECT_STATUS.md](./api/PROJECT_STATUS.md)
- **开发总结**: [api/API_SUMMARY.md](./api/API_SUMMARY.md)

### 前端开发
- **开发计划**: [frontend/FRONTEND_DEVELOPMENT_PLAN.md](./frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- **功能特性**: [frontend/WEB_FEATURES.md](./frontend/WEB_FEATURES.md)
- **UI 集成**: [setup/SHADCN_UI_INTEGRATION.md](./setup/SHADCN_UI_INTEGRATION.md)

### 功能开发
- **签到功能**: [api/checkin/README.md](./api/checkin/README.md) - 签到系统入口
- **义工管理**: [api/volunteer/QUICK_START.md](./api/volunteer/QUICK_START.md) - 义工系统入口
- **数据库设计**: [api/database/DATABASE_NAMING_CONVENTION.md](./api/database/DATABASE_NAMING_CONVENTION.md)

## 📊 文档统计

- **总文档数**: 54个 Markdown 文档
- **API 文档**: 37个
- **前端文档**: 3个
- **设置指南**: 5个
- **开发总结**: 7个
- **其他**: 2个

## 🗂️ 原始位置参考

所有文档已从以下位置整合：
- `apps/api/docs/` → `docs/api/`
- `apps/api/.kiro/specs/` → `docs/api/specs/`
- `apps/api/src/modules/volunteer/readme.md` → `docs/api/modules/volunteer-module.md`
- `apps/web/FEATURES.md` → `docs/frontend/WEB_FEATURES.md`
- 根目录散落文档 → `docs/` 各分类目录

原始文件保留在原位置，此处为副本便于统一管理和查找。
