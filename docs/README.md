# 莲花斋项目文档中心

欢迎来到莲花斋项目的统一文档中心！所有项目文档已整合到此目录，便于查找和维护。

## 🚀 快速导航

### 新手入门
- [快速开始](./setup/QUICK_START.md) - 项目快速开始指南
- [项目设置](./setup/SETUP.md) - 开发环境设置
- [启动指南](./setup/START_GUIDE.md) - 如何启动项目

### 开发文档
- [API 接口文档](./api/API_DOCUMENTATION.md) - 完整的 API 接口说明
- [前端开发计划](./frontend/FRONTEND_DEVELOPMENT_PLAN.md) - 前端开发指南
- [项目架构评审](./PROJECT_ARCHITECTURE_REVIEW.md) - 架构设计和评审

### 功能模块
- [签到系统](./api/checkin/) - 19个文档，包含设计、实现、导出等
- [义工管理](./api/volunteer/) - 5个文档，包含注册、管理等
- [数据库规范](./api/database/) - 3个文档，数据库设计规范

## 📚 文档索引

查看 [完整文档索引](./INDEX.md) 获取所有 54 个文档的详细列表和分类。

## 📁 目录结构

```
docs/
├── README.md                    # 本文件
├── INDEX.md                     # 完整文档索引
├── PROJECT_ARCHITECTURE_REVIEW.md
│
├── api/                         # API 后端文档（37个）
│   ├── checkin/                 # 签到系统（19个）
│   ├── volunteer/               # 义工系统（5个）
│   ├── database/                # 数据库规范（3个）
│   ├── specs/                   # 技术规格
│   └── modules/                 # 模块文档
│
├── frontend/                    # 前端文档（3个）
├── setup/                       # 设置指南（5个）
└── summaries/                   # 开发总结（7个）
```

## 🎯 按角色查找

### 后端开发者
1. [API 快速开始](./api/QUICK_START.md)
2. [API 接口文档](./api/API_DOCUMENTATION.md)
3. [数据库命名规范](./api/database/DATABASE_NAMING_CONVENTION.md)
4. [签到系统文档](./api/checkin/)
5. [义工系统文档](./api/volunteer/)

### 前端开发者
1. [快速开始](./setup/QUICK_START.md)
2. [前端开发计划](./frontend/FRONTEND_DEVELOPMENT_PLAN.md)
3. [Web 功能特性](./frontend/WEB_FEATURES.md)
4. [Shadcn UI 集成](./setup/SHADCN_UI_INTEGRATION.md)
5. [API 接口文档](./api/API_DOCUMENTATION.md)

### 项目管理者
1. [项目架构评审](./PROJECT_ARCHITECTURE_REVIEW.md)
2. [项目状态](./api/PROJECT_STATUS.md)
3. [API 开发总结](./api/API_SUMMARY.md)
4. [前端开发总结](./frontend/FRONTEND_SUMMARY.md)

### DevOps
1. [项目设置](./setup/SETUP.md)
2. [Git 配置](./setup/GIT_SETUP.md)
3. [脚本参考](./api/SCRIPTS_REFERENCE.md)

## 📊 文档统计

- **总文档数**: 54 个 Markdown 文档
- **API 文档**: 37 个
- **前端文档**: 3 个
- **设置指南**: 5 个
- **开发总结**: 7 个
- **其他**: 2 个

## 🔄 文档来源

所有文档已从以下位置整合：
- `apps/api/docs/` → `docs/api/`
- `apps/api/.kiro/specs/` → `docs/api/specs/`
- `apps/api/src/modules/` → `docs/api/modules/`
- `apps/web/` → `docs/frontend/`
- 根目录散落文档 → `docs/` 各分类目录

**注意**: 原始文件仍保留在原位置，此处为副本便于统一管理。

## 📝 文档维护

### 添加新文档
1. 将文档放在合适的目录下
2. 更新 [INDEX.md](./INDEX.md)
3. 如需要，更新相关的 INDEX.md 文件
4. 更新本 README 的统计信息

### 文档命名规范
- 使用大写字母和下划线: `FEATURE_NAME.md`
- 使用描述性名称
- 相关文档使用相同前缀，如 `EXPORT_*.md`

## 🔗 外部链接

- [项目根目录 README](../README.md)
- [文档导航](../DOCS.md)
- [API 项目 README](../apps/api/README.md)
- [Web 项目 README](../apps/web/README.md)

---

最后更新: 2024-11-18
