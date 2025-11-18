# 📚 文档导航

欢迎查看莲花斋项目文档！所有文档已统一整理到 `docs/` 目录。

## 快速链接

### 🚀 开始使用
- [快速开始指南](./docs/setup/QUICK_START.md)
- [项目设置](./docs/setup/SETUP.md)
- [Git 配置](./docs/setup/GIT_SETUP.md)

### 📖 开发文档
- [API 接口文档](./docs/api/API_DOCUMENTATION.md)
- [前端开发计划](./docs/frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- [项目架构评审](./docs/PROJECT_ARCHITECTURE_REVIEW.md)

### 🔧 功能模块
- [签到系统文档](./docs/api/checkin/) - 19个文档
- [义工管理文档](./docs/api/volunteer/) - 5个文档
- [数据库规范](./docs/api/database/) - 3个文档
- [技术规格](./docs/api/specs/) - Kiro specs 和架构设计

### 📋 完整索引
查看 [文档索引](./docs/INDEX.md) 获取所有 54 个文档的完整列表和分类。

## 文档结构

```
docs/                                 # 统一文档目录（54个文档）
├── INDEX.md                          # 完整文档索引
├── PROJECT_ARCHITECTURE_REVIEW.md    # 架构评审
│
├── api/                              # API 后端文档（37个）
│   ├── API_DOCUMENTATION.md          # API 接口文档
│   ├── API_SUMMARY.md                # API 开发总结
│   ├── PROJECT_STATUS.md             # 项目状态
│   ├── QUICK_START.md                # API 快速开始
│   ├── SCRIPTS_REFERENCE.md          # 脚本参考
│   ├── ORGANIZATION_COMPLETE.md      # 组织架构
│   │
│   ├── checkin/                      # 签到系统（19个文档）
│   │   ├── README.md
│   │   ├── CHECKIN_*.md              # 签到核心文档
│   │   └── EXPORT_*.md               # 导出相关文档
│   │
│   ├── volunteer/                    # 义工系统（5个文档）
│   │   ├── QUICK_START.md
│   │   ├── REGISTER_*.md
│   │   └── UPLOAD_FIX.md
│   │
│   ├── database/                     # 数据库规范（3个文档）
│   │   ├── DATABASE_NAMING_CONVENTION.md
│   │   ├── NAMING_CONVENTION_ANALYSIS.md
│   │   └── SCHEMA_NAMING_AUDIT.md
│   │
│   ├── specs/                        # 技术规格
│   │   ├── architecture-review/
│   │   ├── auth-system/
│   │   └── better-auth-login-register/
│   │
│   └── modules/                      # 模块文档
│       └── volunteer-module.md
│
├── frontend/                         # 前端文档（3个）
│   ├── FRONTEND_DEVELOPMENT_PLAN.md
│   ├── FRONTEND_SUMMARY.md
│   └── WEB_FEATURES.md
│
├── setup/                            # 设置指南（5个）
│   ├── QUICK_START.md
│   ├── START_GUIDE.md
│   ├── SETUP.md
│   ├── GIT_SETUP.md
│   └── SHADCN_UI_INTEGRATION.md
│
└── summaries/                        # 开发总结（7个）
    ├── FINAL_SUMMARY.md
    ├── FIX_SUMMARY.md
    ├── LOGIN_FIX_SUMMARY.md
    ├── REACT_ERROR_FIX.md
    ├── UPDATES_SUMMARY.md
    ├── DEBUG_VOLUNTEER_LIST.md
    └── TEST_CHECKLIST.md
```

## 📌 说明

所有文档已从 `apps/api/docs/`、`apps/api/.kiro/specs/`、`apps/web/` 等位置整合到 `docs/` 目录，便于统一管理和查找。原始文件保留在原位置。

## 贡献文档

添加新文档时，请：
1. 将文档放在合适的目录下
2. 更新 `docs/INDEX.md` 索引
3. 如需要，更新本导航文件
