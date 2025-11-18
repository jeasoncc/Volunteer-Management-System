# Git 配置说明

## 仓库信息

- **远程仓库**: git@gitee.com:jeasonchen/lianhuazhai.git
- **默认分支**: main
- **项目类型**: Turborepo Monorepo

## 项目结构

```
lianhuazhai-monorepo/          # Monorepo 根目录（Git 仓库）
├── apps/
│   ├── api/                   # 后端项目（无独立 Git）
│   └── web/                   # 前端项目（无独立 Git）
└── packages/                  # 共享包（无独立 Git）
```

## Git 工作流

### 1. 查看状态
```bash
git status
```

### 2. 添加更改
```bash
# 添加所有更改
git add .

# 添加特定文件
git add apps/api/src/index.ts
git add apps/web/src/App.tsx
```

### 3. 提交更改
```bash
# 提交格式建议
git commit -m "feat(api): 添加新功能"
git commit -m "fix(web): 修复 bug"
git commit -m "docs: 更新文档"
git commit -m "chore: 更新依赖"
```

### 4. 推送到远程
```bash
# 首次推送（设置上游分支）
git push -u origin main

# 后续推送
git push
```

### 5. 拉取更新
```bash
git pull origin main
```

## 提交规范

使用 Conventional Commits 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
# 后端相关
git commit -m "feat(api): 添加义工注册接口"
git commit -m "fix(api): 修复上传文件失败的问题"

# 前端相关
git commit -m "feat(web): 实现登录页面"
git commit -m "fix(web): 修复表单验证问题"

# 通用
git commit -m "docs: 更新 README"
git commit -m "chore: 升级依赖版本"
```

## 分支管理

### 主要分支
- `main`: 主分支，稳定版本
- `develop`: 开发分支（可选）

### 功能分支
```bash
# 创建功能分支
git checkout -b feature/volunteer-management

# 开发完成后合并
git checkout main
git merge feature/volunteer-management

# 删除功能分支
git branch -d feature/volunteer-management
```

## 常见问题

### Q1: 如何查看远程仓库？
```bash
git remote -v
```

### Q2: 如何更改远程仓库地址？
```bash
git remote set-url origin <new-url>
```

### Q3: 如何撤销未提交的更改？
```bash
# 撤销所有更改
git checkout .

# 撤销特定文件
git checkout apps/api/src/index.ts
```

### Q4: 如何查看提交历史？
```bash
# 简洁模式
git log --oneline

# 详细模式
git log

# 图形化显示
git log --graph --oneline --all
```

## 注意事项

1. ✅ **统一管理**: 整个 Monorepo 使用一个 Git 仓库
2. ✅ **子项目无 Git**: apps/api 和 apps/web 不再有独立的 .git 目录
3. ✅ **提交规范**: 使用 Conventional Commits 格式
4. ✅ **分支策略**: 建议使用 main + feature 分支模式

## 迁移说明

### 从旧项目迁移

原有项目：
- `/home/lotus/project/lianhuazhai` (后端) → `apps/api`
- `/home/lotus/project/front` (前端) → `apps/web`

新项目：
- `/home/lotus/project/lianhuazhai-monorepo` (Monorepo)

### 远程仓库

- 原后端远程: `git@gitee.com:jeasonchen/lianhuazhai.git`
- 现 Monorepo 远程: `git@gitee.com:jeasonchen/lianhuazhai.git` (相同)

---

**创建时间**: 2024-11-16  
**维护者**: Jeason Chen
