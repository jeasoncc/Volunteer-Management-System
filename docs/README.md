# 📚 莲花斋项目文档中心

本目录包含了项目开发过程中的所有文档，包括 AI 辅助生成的开发文档、API 文档、指南等。

## 📁 目录结构

```
docs/
├── api/                    # API 后端文档
│   ├── checkin/           # 考勤签到模块
│   ├── database/          # 数据库设计
│   ├── volunteer/         # 义工模块
│   └── specs/             # 技术规格
├── frontend/              # 前端开发文档
├── backend/               # 后端开发文档
├── sync/                  # 同步功能文档
├── volunteer/             # 义工管理文档
├── network/               # 网络配置文档
├── features/              # 功能特性文档
├── fixes/                 # 修复记录文档
├── guides/                # 使用指南文档
├── summaries/             # 项目总结文档
├── setup/                 # 项目设置文档
└── archive/               # 归档文档
```

## 🚀 快速导航

### 新手入门
- [快速开始指南](setup/QUICK_START.md)
- [项目设置](setup/SETUP.md)
- [Git 设置](setup/GIT_SETUP.md)
- [快速参考卡](guides/QUICK_REFERENCE_CARD.md)

### API 文档
- [API 总览](api/API_DOCUMENTATION.md)
- [API 摘要](api/API_SUMMARY.md)
- [快速开始](api/QUICK_START.md)
- [考勤模块](api/checkin/)
- [义工模块](api/volunteer/)
- [数据库设计](api/database/)

### 前端开发
- [前端总结](frontend/FRONTEND_SUMMARY.md)
- [前端开发计划](frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- [功能特性](frontend/FEATURES.md)
- [UI/UX 优化](frontend/UI_UX_OPTIMIZATION_PROPOSAL.md)
- [移动端上传指南](frontend/MOBILE_UPLOAD_GUIDE.md)

### 后端开发
- [后端实现完成](backend/BACKEND_IMPLEMENTATION_COMPLETE.md)
- [日志清理](backend/BACKEND_LOGGING_CLEANUP.md)
- [WebSocket 协议](backend/WEBSOCKET_PROTOCOL_ANALYSIS.md)
- [API 路径修复](backend/API_PATH_FIX_SUMMARY.md)

### 核心功能

#### 🔄 同步功能
- [同步快速指南](sync/SYNC_QUICK_GUIDE.md)
- [同步重复风险分析](sync/SYNC_DUPLICATE_RISK_ANALYSIS.md)
- [同步重复修复总结](sync/SYNC_DUPLICATE_FIX_SUMMARY.md)
- [同步改进](sync/SYNC_IMPROVEMENTS.md)
- [同步 UX 改进](sync/SYNC_UX_IMPROVEMENTS.md)

#### 👥 义工管理
- [义工导入指南](volunteer/VOLUNTEER_IMPORT_GUIDE.md)
- [义工导入 README](volunteer/VOLUNTEER_IMPORT_README.md)
- [快速导入 5 个义工](volunteer/5个义工快速导入.md)
- [CSV 导入修复](volunteer/CSV_IMPORT_FIX.md)
- [义工数据总结](volunteer/VOLUNTEER_DATA_SUMMARY.md)

#### 🌐 网络配置
- [网络配置总结](network/NETWORK_CONFIG_SUMMARY.md)
- [前端 IP 审计](network/FRONTEND_IP_AUDIT.md)
- [IP 地址审计](network/IP_ADDRESS_AUDIT.md)
- [端口更新总结](network/PORT_UPDATE_SUMMARY.md)

### 项目状态
- [当前状态](summaries/CURRENT_STATUS.md)
- [项目最终状态](summaries/PROJECT_FINAL_STATUS.md)
- [项目结构](summaries/PROJECT_STRUCTURE.md)
- [下一步计划](summaries/NEXT_STEPS.md)
- [会话总结](summaries/SESSION_SUMMARY.md)

## 📊 文档统计

| 分类 | 文档数量 | 说明 |
|------|---------|------|
| API 文档 | 40+ | 后端 API、数据库、模块文档 |
| 前端文档 | 38 | 前端开发、优化、功能文档 |
| 同步功能 | 13 | 设备同步相关文档 |
| 义工管理 | 17 | 义工数据管理文档 |
| 网络配置 | 5 | 网络和配置文档 |
| 后端开发 | 6 | 后端实现和修复 |
| 功能特性 | 4 | 新功能开发文档 |
| 修复记录 | 7 | Bug 修复记录 |
| 指南文档 | 3 | 使用指南 |
| 总结报告 | 6 | 项目总结和状态 |

## 🔍 搜索文档

### 按关键词搜索
```bash
# 搜索所有文档中的关键词
grep -r "关键词" docs/

# 搜索特定目录
grep -r "同步" docs/sync/
```

### 列出文档
```bash
# 列出所有 Markdown 文档
find docs/ -name "*.md" -type f

# 按修改时间排序
find docs/ -name "*.md" -type f -printf '%T+ %p\n' | sort -r

# 按大小排序
find docs/ -name "*.md" -type f -exec ls -lh {} \; | sort -k5 -h
```

### 统计信息
```bash
# 统计各目录的文档数量
for dir in docs/*/; do 
  echo "$(basename $dir): $(find $dir -name "*.md" | wc -l) 个文档"
done

# 统计总行数
find docs/ -name "*.md" -type f -exec wc -l {} + | tail -1
```

## 📝 文档命名规范

### 文件命名
- `*_SUMMARY.md` - 总结性文档
- `*_FIX.md` - 修复记录
- `*_GUIDE.md` - 指南文档
- `*_FEATURE.md` - 功能特性
- `*_COMPLETE.md` - 完成报告
- `*_ANALYSIS.md` - 分析文档
- `README.md` - 目录说明

### 目录组织
- 按功能模块分类（sync, volunteer, network 等）
- 按文档类型分类（guides, fixes, features 等）
- 按项目部分分类（frontend, backend, api 等）

## 🗂️ 维护指南

### 添加新文档
1. 确定文档类型和所属模块
2. 放入对应的目录
3. 更新相关的 README.md
4. 遵循命名规范

### 更新现有文档
1. 在文档顶部添加更新日期
2. 保留历史版本信息
3. 更新相关索引

### 归档旧文档
1. 将过时文档移至 `archive/` 目录
2. 在原位置添加指向新文档的链接
3. 更新索引文件

## 🔗 相关资源

### 项目文档
- [README.md](../README.md) - 项目主文档
- [CHANGELOG.md](../CHANGELOG.md) - 变更日志
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南
- [ROADMAP.md](../ROADMAP.md) - 产品路线图

### 外部资源
- [Turbo 文档](https://turbo.build/repo/docs)
- [Elysia 文档](https://elysiajs.com/)
- [React 文档](https://react.dev/)
- [TanStack Query 文档](https://tanstack.com/query/latest)

## 📧 反馈与建议

如果您发现文档有误或有改进建议，请：
1. 提交 Issue
2. 创建 Pull Request
3. 联系项目维护者

---

**最后更新**: 2024-11-27  
**维护者**: AI 辅助开发团队
