# 莲花斋义工管理系统 - 文档中心

## 📚 文档目录

### 考勤系统文档 (`/docs/checkin/`)

#### 核心文档
- **[CHECKIN_DEVICE_API.md](./checkin/CHECKIN_DEVICE_API.md)** - 考勤设备接口文档
  - 设备上传格式
  - API 接口规范
  - 响应格式说明
  - 验证逻辑

- **[CHECKIN_SOLUTION_DESIGN.md](./checkin/CHECKIN_SOLUTION_DESIGN.md)** - 考勤系统完整解决方案
  - 业务场景分析
  - 数据库设计
  - 工时计算规则
  - API 接口设计

- **[CHECKIN_SUMMARY_COMPLETE.md](./checkin/CHECKIN_SUMMARY_COMPLETE.md)** - 考勤汇总系统完整文档
  - 汇总表结构
  - CRUD 接口
  - 使用示例
  - 数据统计

#### 改进计划
- **[CHECKIN_IMPROVEMENT_PLAN.md](./checkin/CHECKIN_IMPROVEMENT_PLAN.md)** - 考勤系统改进方案
  - 当前状态分析
  - 缺失功能
  - 优先级规划
  - 实施建议

#### 问题修复
- **[ISSUES_FIXED_SUMMARY.md](./checkin/ISSUES_FIXED_SUMMARY.md)** - 问题修复总结
  - 已修复的问题
  - 修改文件清单
  - 验证结果

- **[FINAL_SOLUTION_SUMMARY.md](./checkin/FINAL_SOLUTION_SUMMARY.md)** - 最终解决方案总结
  - 核心问题解答
  - 工时计算规则
  - 数据库设计
  - API 接口

---

### 数据库文档 (`/docs/database/`)

- **[DATABASE_NAMING_CONVENTION.md](./database/DATABASE_NAMING_CONVENTION.md)** - 数据库命名规范
  - 统一命名规范
  - 已修复的问题
  - 验证方法
  - 最佳实践

- **[SCHEMA_NAMING_AUDIT.md](./database/SCHEMA_NAMING_AUDIT.md)** - Schema 命名规范审计报告
  - 审计结果
  - 修复记录
  - 表功能说明
  - 验证命令

---

## 🚀 快速开始

### 考勤系统
```bash
# 查看设备接口文档
cat docs/checkin/CHECKIN_DEVICE_API.md

# 查看完整解决方案
cat docs/checkin/CHECKIN_SOLUTION_DESIGN.md
```

### 数据库
```bash
# 查看命名规范
cat docs/database/DATABASE_NAMING_CONVENTION.md

# 查看审计报告
cat docs/database/SCHEMA_NAMING_AUDIT.md
```

---

## 📋 文档更新日志

### 2024-11-16
- ✅ 创建文档中心
- ✅ 整理考勤系统文档
- ✅ 整理数据库文档
- ✅ 统一文档管理

---

## 💡 文档规范

### 新文档存放位置
- 考勤相关：`docs/checkin/`
- 数据库相关：`docs/database/`
- 通用文档：`docs/`

### 命名规范
- 使用大写字母和下划线
- 使用 `.md` 扩展名
- 文件名要有描述性

### 示例
```
✅ docs/checkin/CHECKIN_MONTHLY_REPORT.md
✅ docs/database/MIGRATION_GUIDE.md
❌ checkin-doc.md (不要放在根目录)
❌ doc1.md (命名不清晰)
```
