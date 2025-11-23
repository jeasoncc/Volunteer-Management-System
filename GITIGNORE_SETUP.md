# .gitignore 设置说明

## 📋 概述

本项目已配置了完整的 `.gitignore` 文件，用于排除不需要版本控制的文件。

## 🔍 已配置的忽略规则

### 1. 编辑器文件
- ✅ Visual Studio Code (`.vscode/`)
- ✅ Cursor (`.cursor/`)
- ✅ IntelliJ IDEA / WebStorm (`.idea/`)
- ✅ Vim (`*.swp`, `*.swo`)
- ✅ Emacs (`*~`, `\#*\#`)
- ✅ Sublime Text (`*.sublime-workspace`)
- ✅ Atom (`.atom/`)
- ✅ Eclipse (`.classpath`, `.project`)
- ✅ NetBeans (`nbproject/`)

### 2. 操作系统文件
- ✅ macOS (`.DS_Store`, `._*`)
- ✅ Windows (`Thumbs.db`, `Desktop.ini`)
- ✅ Linux (`*~`, `.directory`)

### 3. 依赖和构建产物
- ✅ `node_modules/`
- ✅ `dist/`, `build/`, `.next/`
- ✅ `.turbo/`, `.tanstack/`

### 4. 环境变量
- ✅ `.env*` 文件（但保留 `.env.example`）

### 5. 日志和临时文件
- ✅ `*.log`
- ✅ `*.tmp`, `*.temp`
- ✅ `cookies.txt`

### 6. 数据库文件
- ✅ `*.sqlite`, `*.db`

### 7. 上传和导出文件
- ✅ `apps/api/public/upload/`
- ✅ `apps/api/exports/`
- ✅ `*.xlsx`, `*.xls`, `*.csv`

### 8. 开发文档（临时）
- ✅ `*_SUMMARY.md`
- ✅ `*_COMPLETE.md`
- ✅ `*_FIX.md`
- ✅ `*_GUIDE.md`
- ✅ `QUICK_*.md`
- ✅ `FINAL_*.md`
- ✅ `ALL_*.md`
- ✅ 等等...

**但保留重要文档：**
- ✅ `README.md`
- ✅ `CHANGELOG.md`
- ✅ `CONTRIBUTING.md`
- ✅ `docs/**/*.md`

## ⚠️ 重要提示

### 如果文件已经被 Git 跟踪

`.gitignore` 只对**未跟踪的文件**生效。如果文件已经被 Git 跟踪，需要先从 Git 中移除：

```bash
# 查看哪些临时文档文件已被跟踪
git ls-files | grep -E "(SUMMARY|COMPLETE|FIX|GUIDE)"

# 从 Git 中移除这些文件（但保留本地文件）
git rm --cached *_SUMMARY.md
git rm --cached *_COMPLETE.md
git rm --cached *_FIX.md
git rm --cached *_GUIDE.md
git rm --cached QUICK_*.md
git rm --cached FINAL_*.md
git rm --cached ALL_*.md
git rm --cached COMPLETE_*.md
git rm --cached SYSTEM_*.md
git rm --cached PROJECT_*.md
git rm --cached DATA_*.md
git rm --cached HOMEPAGE_*.md
git rm --cached LOGIN_*.md
git rm --cached TOAST_*.md
git rm --cached UI_*.md
git rm --cached VOLUNTEER_*.md
git rm --cached CHANTING_*.md
git rm --cached DECEASED_*.md
git rm --cached PHOTO_*.md
git rm --cached FORM_*.md
git rm --cached BACKEND_*.md
git rm --cached FEATURES.md

# 移除其他临时文件
git rm --cached cookies.txt
git rm --cached apps/api/cookies.txt
git rm --cached apps/api/public/*.xlsx
git rm --cached apps/api/public/*.pdf
git rm --cached apps/api/public/*.aux
git rm --cached apps/api/public/*.log

# 提交更改
git commit -m "chore: 移除临时文档和文件，更新 .gitignore"
```

### 批量移除脚本

你也可以使用以下脚本批量移除：

```bash
#!/bin/bash
# 移除所有临时文档文件

# 临时文档模式
PATTERNS=(
    "*_SUMMARY.md"
    "*_COMPLETE.md"
    "*_FIX.md"
    "*_GUIDE.md"
    "*_REFERENCE.md"
    "*_PROGRESS.md"
    "*_STATUS.md"
    "*_AUDIT.md"
    "*_REPORT.md"
    "*_OPTIMIZATION.md"
    "*_IMPROVEMENTS.md"
    "*_PROPOSAL.md"
    "*_CHECKLIST.md"
    "QUICK_*.md"
    "FINAL_*.md"
    "ALL_*.md"
    "COMPLETE_*.md"
    "SYSTEM_*.md"
    "PROJECT_*.md"
    "DATA_*.md"
    "HOMEPAGE_*.md"
    "LOGIN_*.md"
    "TOAST_*.md"
    "UI_*.md"
    "VOLUNTEER_*.md"
    "CHANTING_*.md"
    "DECEASED_*.md"
    "PHOTO_*.md"
    "FORM_*.md"
    "BACKEND_*.md"
    "FEATURES.md"
)

for pattern in "${PATTERNS[@]}"; do
    git rm --cached "$pattern" 2>/dev/null || true
done

# 移除其他临时文件
git rm --cached cookies.txt 2>/dev/null || true
git rm --cached apps/api/cookies.txt 2>/dev/null || true
git rm --cached apps/api/public/*.xlsx 2>/dev/null || true
git rm --cached apps/api/public/*.pdf 2>/dev/null || true
git rm --cached apps/api/public/*.aux 2>/dev/null || true
git rm --cached apps/api/public/*.log 2>/dev/null || true

echo "✅ 已从 Git 中移除临时文件"
echo "📝 请检查更改：git status"
echo "💾 提交更改：git commit -m 'chore: 移除临时文档和文件'"
```

## ✅ 验证 .gitignore 是否生效

```bash
# 检查文件是否被忽略
git check-ignore -v <文件路径>

# 查看所有被忽略的文件
git status --ignored

# 查看被忽略的文件列表
git ls-files --others --ignored --exclude-standard
```

## 📝 需要提交的文件

以下文件**应该**提交到 Git：

- ✅ `routeTree.gen.ts` - TanStack Router 自动生成的路由树（需要提交）
- ✅ `README.md` - 项目说明文档
- ✅ `CHANGELOG.md` - 更新日志
- ✅ `docs/**/*.md` - 正式文档
- ✅ `screenshots/` - 项目截图（如果用于文档）

## 🚫 不应该提交的文件

以下文件**不应该**提交到 Git：

- ❌ `.env*` - 环境变量文件
- ❌ `node_modules/` - 依赖包
- ❌ `dist/`, `build/` - 构建产物
- ❌ `*.log` - 日志文件
- ❌ `*.xlsx`, `*.xls` - Excel 导出文件
- ❌ `cookies.txt` - Cookie 文件
- ❌ 临时文档（`*_SUMMARY.md` 等）
- ❌ 编辑器配置文件（`.vscode/`, `.idea/` 等）

## 🔄 更新 .gitignore

如果需要添加新的忽略规则，请编辑 `.gitignore` 文件，并确保：

1. 规则格式正确
2. 使用注释说明规则用途
3. 测试规则是否生效

## 📚 相关资源

- [Git 官方文档 - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub 的 .gitignore 模板](https://github.com/github/gitignore)

