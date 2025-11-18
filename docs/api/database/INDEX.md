# 数据库文档

本目录包含数据库设计和规范文档，共 3 个文档。

## 📖 文档列表

### 命名规范
- [DATABASE_NAMING_CONVENTION.md](./DATABASE_NAMING_CONVENTION.md) - 数据库命名规范 ⭐ 核心文档
- [NAMING_CONVENTION_ANALYSIS.md](./NAMING_CONVENTION_ANALYSIS.md) - 命名规范分析
- [SCHEMA_NAMING_AUDIT.md](./SCHEMA_NAMING_AUDIT.md) - 数据库架构命名审计

## 🎯 使用指南

### 新建表或字段
1. 查看 [DATABASE_NAMING_CONVENTION.md](./DATABASE_NAMING_CONVENTION.md) 了解命名规则
2. 参考现有表结构保持一致性

### 代码审查
1. 使用 [SCHEMA_NAMING_AUDIT.md](./SCHEMA_NAMING_AUDIT.md) 检查命名是否符合规范
2. 参考 [NAMING_CONVENTION_ANALYSIS.md](./NAMING_CONVENTION_ANALYSIS.md) 了解分析方法

## 📋 规范要点

- 表名使用单数形式，snake_case 命名
- 主键统一使用 `id`
- 外键使用 `{table}_id` 格式
- 时间戳字段: `created_at`, `updated_at`
- 软删除字段: `deleted_at`
- 布尔字段使用 `is_` 或 `has_` 前缀
