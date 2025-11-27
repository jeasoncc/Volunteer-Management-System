#!/bin/bash

# 文档整理脚本
# 将 AI 生成的 Markdown 文档移动到 docs 目录并分类

echo "📚 开始整理文档..."

# 创建目录结构
mkdir -p docs/{features,fixes,guides,summaries,backend,frontend,sync,volunteer,network,archive}

# ==================== 根目录文档分类 ====================

# 同步相关文档 -> docs/sync/
echo "📦 移动同步相关文档..."
mv -f SYNC_*.md docs/sync/ 2>/dev/null
mv -f ATTENDANCE_SYNC_*.md docs/sync/ 2>/dev/null

# 义工相关文档 -> docs/volunteer/
echo "👥 移动义工相关文档..."
mv -f VOLUNTEER_*.md docs/volunteer/ 2>/dev/null
mv -f 义工*.md docs/volunteer/ 2>/dev/null
mv -f 导入*.md docs/volunteer/ 2>/dev/null
mv -f 批量*.md docs/volunteer/ 2>/dev/null
mv -f CSV_IMPORT_FIX.md docs/volunteer/ 2>/dev/null
mv -f IMPORT_QUICK_START.md docs/volunteer/ 2>/dev/null
mv -f check_and_import_volunteers.md docs/volunteer/ 2>/dev/null
mv -f 5个义工快速导入.md docs/volunteer/ 2>/dev/null

# 网络配置相关 -> docs/network/
echo "🌐 移动网络配置文档..."
mv -f NETWORK_*.md docs/network/ 2>/dev/null
mv -f IP_ADDRESS_AUDIT.md docs/network/ 2>/dev/null
mv -f FRONTEND_IP_AUDIT.md docs/network/ 2>/dev/null
mv -f PORT_UPDATE_SUMMARY.md docs/network/ 2>/dev/null

# 后端相关 -> docs/backend/
echo "⚙️  移动后端相关文档..."
mv -f BACKEND_*.md docs/backend/ 2>/dev/null
mv -f API_PATH_FIX_SUMMARY.md docs/backend/ 2>/dev/null
mv -f TOKEN_ERROR_FIX_SUMMARY.md docs/backend/ 2>/dev/null
mv -f WEBSOCKET_*.md docs/backend/ 2>/dev/null

# 前端相关 -> docs/frontend/
echo "🎨 移动前端相关文档..."
mv -f FRONTEND_*.md docs/frontend/ 2>/dev/null
mv -f LOGIN_*.md docs/frontend/ 2>/dev/null
mv -f MOBILE_UPLOAD_*.md docs/frontend/ 2>/dev/null
mv -f SEARCH_*.md docs/frontend/ 2>/dev/null
mv -f 表格*.md docs/frontend/ 2>/dev/null
mv -f 排序*.md docs/frontend/ 2>/dev/null
mv -f 测试*.md docs/frontend/ 2>/dev/null

# 功能特性 -> docs/features/
echo "✨ 移动功能特性文档..."
mv -f *_FEATURE.md docs/features/ 2>/dev/null
mv -f AVATAR_FILTER_FEATURE.md docs/features/ 2>/dev/null
mv -f ATTENDANCE_FIELDS_ADDED.md docs/features/ 2>/dev/null
mv -f DEVICE_MANAGEMENT_IMPROVEMENTS.md docs/features/ 2>/dev/null
mv -f EXPORT_AND_HOVER_IMPROVEMENTS.md docs/features/ 2>/dev/null

# 修复记录 -> docs/fixes/
echo "🔧 移动修复记录文档..."
mv -f *_FIX.md docs/fixes/ 2>/dev/null
mv -f *_FIX_SUMMARY.md docs/fixes/ 2>/dev/null
mv -f CLEAR_DEVICE_FIX.md docs/fixes/ 2>/dev/null
mv -f DATA_STRUCTURE_FIX.md docs/fixes/ 2>/dev/null
mv -f PAGINATION_AND_STATS_FIX.md docs/fixes/ 2>/dev/null
mv -f PHOTO_URL_FIX.md docs/fixes/ 2>/dev/null

# 指南文档 -> docs/guides/
echo "📖 移动指南文档..."
mv -f *_GUIDE.md docs/guides/ 2>/dev/null
mv -f QUICK_REFERENCE_CARD.md docs/guides/ 2>/dev/null
mv -f VERIFICATION_CHECKLIST.md docs/guides/ 2>/dev/null
mv -f GITIGNORE_SETUP.md docs/guides/ 2>/dev/null

# 总结报告 -> docs/summaries/
echo "📊 移动总结报告..."
mv -f SESSION_SUMMARY.md docs/summaries/ 2>/dev/null
mv -f CURRENT_STATUS.md docs/summaries/ 2>/dev/null
mv -f PROJECT_FINAL_STATUS.md docs/summaries/ 2>/dev/null
mv -f PROJECT_STRUCTURE.md docs/summaries/ 2>/dev/null
mv -f NEXT_STEPS.md docs/summaries/ 2>/dev/null
mv -f 文件索引.md docs/summaries/ 2>/dev/null

# 其他归档 -> docs/archive/
echo "📦 移动其他文档到归档..."
mv -f ROLLBACK_TEST.md docs/archive/ 2>/dev/null
mv -f DEBUG_*.md docs/archive/ 2>/dev/null

# ==================== apps/web 文档分类 ====================

echo "🌐 处理 apps/web 文档..."

# 移动到前端目录
mv -f apps/web/ALL_FEATURES_COMPLETE.md docs/frontend/ 2>/dev/null
mv -f apps/web/API_MIGRATION_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/CHANTING_MODULE_COMPLETE.md docs/frontend/ 2>/dev/null
mv -f apps/web/COMPLETE_OPTIMIZATION_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/DECEASED_MODULE_COMPLETE.md docs/frontend/ 2>/dev/null
mv -f apps/web/ENVIRONMENT_SWITCH.md docs/frontend/ 2>/dev/null
mv -f apps/web/FEATURES.md docs/frontend/ 2>/dev/null
mv -f apps/web/FINAL_IMPLEMENTATION_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/FINAL_OPTIMIZATION_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/FORM_IMPROVEMENTS.md docs/frontend/ 2>/dev/null
mv -f apps/web/IMPLEMENTATION_PROGRESS.md docs/frontend/ 2>/dev/null
mv -f apps/web/MOBILE_UPLOAD_GUIDE.md docs/frontend/ 2>/dev/null
mv -f apps/web/NETWORK_CONFIG.md docs/network/ 2>/dev/null
mv -f apps/web/PHOTO_UPLOAD_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/PROJECT_COMPLETION_AUDIT.md docs/frontend/ 2>/dev/null
mv -f apps/web/QUICK_FIX_GUIDE.md docs/frontend/ 2>/dev/null
mv -f apps/web/QUICK_REFERENCE.md docs/frontend/ 2>/dev/null
mv -f apps/web/QUICK_START_OPTIMIZATION.md docs/frontend/ 2>/dev/null
mv -f apps/web/SYSTEM_AUDIT_REPORT.md docs/frontend/ 2>/dev/null
mv -f apps/web/SYSTEM_FIXES_COMPLETE.md docs/frontend/ 2>/dev/null
mv -f apps/web/TOAST_AND_THEME_SUMMARY.md docs/frontend/ 2>/dev/null
mv -f apps/web/UI_UX_OPTIMIZATION_PROPOSAL.md docs/frontend/ 2>/dev/null
mv -f apps/web/UI_VISUAL_GUIDE.md docs/frontend/ 2>/dev/null
mv -f apps/web/VOLUNTEER_TABLE_OPTIMIZATION.md docs/frontend/ 2>/dev/null

# ==================== apps/api 文档分类 ====================

echo "⚙️  处理 apps/api 文档..."
mv -f apps/api/BACKEND_IMPLEMENTATION_COMPLETE.md docs/backend/ 2>/dev/null

# ==================== 生成索引文件 ====================

echo "📝 生成文档索引..."

cat > docs/README.md << 'EOF'
# 项目文档索引

本目录包含了项目开发过程中 AI 生成的所有文档，按类别组织。

## 📁 目录结构

### 🔄 sync/ - 同步相关
设备同步、考勤同步相关的文档和修复记录

### 👥 volunteer/ - 义工管理
义工数据导入、管理、更新相关的文档

### 🌐 network/ - 网络配置
网络配置、IP 地址、端口相关的文档

### ⚙️ backend/ - 后端开发
后端 API、WebSocket、日志等相关文档

### 🎨 frontend/ - 前端开发
前端页面、组件、优化相关的文档

### ✨ features/ - 功能特性
新功能开发和功能改进的文档

### 🔧 fixes/ - 修复记录
Bug 修复和问题解决的记录

### 📖 guides/ - 指南文档
使用指南、快速参考等文档

### 📊 summaries/ - 总结报告
项目总结、状态报告等文档

### 📦 archive/ - 归档文档
历史文档和临时文档的归档

## 📚 重要文档

### 项目概览
- [项目结构](summaries/PROJECT_STRUCTURE.md)
- [当前状态](summaries/CURRENT_STATUS.md)
- [下一步计划](summaries/NEXT_STEPS.md)

### 快速开始
- [快速参考卡](guides/QUICK_REFERENCE_CARD.md)
- [验证清单](guides/VERIFICATION_CHECKLIST.md)

### 核心功能
- [同步功能指南](sync/)
- [义工管理指南](volunteer/)
- [网络配置](network/)

## 🔍 查找文档

使用以下命令搜索文档：

```bash
# 搜索关键词
grep -r "关键词" docs/

# 列出所有文档
find docs/ -name "*.md" -type f

# 按修改时间排序
find docs/ -name "*.md" -type f -printf '%T+ %p\n' | sort -r
```

## 📝 文档规范

所有文档遵循以下命名规范：
- `*_SUMMARY.md` - 总结性文档
- `*_FIX.md` - 修复记录
- `*_GUIDE.md` - 指南文档
- `*_FEATURE.md` - 功能特性
- `*_COMPLETE.md` - 完成报告

## 🗂️ 维护说明

- 新文档应放在对应的分类目录中
- 过时的文档移动到 `archive/` 目录
- 定期更新本索引文件
EOF

echo ""
echo "✅ 文档整理完成！"
echo ""
echo "📊 统计信息："
echo "   同步相关: $(find docs/sync -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   义工管理: $(find docs/volunteer -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   网络配置: $(find docs/network -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   后端开发: $(find docs/backend -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   前端开发: $(find docs/frontend -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   功能特性: $(find docs/features -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   修复记录: $(find docs/fixes -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   指南文档: $(find docs/guides -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   总结报告: $(find docs/summaries -name "*.md" 2>/dev/null | wc -l) 个文档"
echo "   归档文档: $(find docs/archive -name "*.md" 2>/dev/null | wc -l) 个文档"
echo ""
echo "📖 查看文档索引: cat docs/README.md"
