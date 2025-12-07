# 根目录文档整理说明

## 📁 文档组织结构

### 根目录保留的核心文档

以下文档保留在项目根目录，作为项目的核心文档：

- **README.md** - 项目主文档，包含项目介绍、快速开始、功能说明等
- **CHANGELOG.md** - 更新日志，记录所有版本变更
- **ROADMAP.md** - 产品路线图，规划未来功能
- **CONTRIBUTING.md** - 贡献指南，说明如何参与项目
- **CODE_OF_CONDUCT.md** - 行为准则，规范社区行为

### 已整理的文档

以下文档已移动到 `docs/` 目录下的相应子目录：

#### 压缩相关 (`docs/features/compression/`)
- `COMPRESSION_CONFIG_DISPLAY.md`
- `COMPRESSION_CONFIG_LIVE_EXAMPLES.md`
- `COMPRESSION_CONFIG_UI.md`
- `COMPRESSION_EXAMPLES.md`
- `COMPRESSION_STRATEGY_EXAMPLES.md`
- `LIVE_COMPRESSION_EXAMPLES.md`
- `OPTIMIZED_COMPRESSION_STRATEGY.md`
- `NO_COMPRESSION_RETRY_FEATURE.md`

#### 压缩修复 (`docs/fixes/compression/`)
- `COMPRESSION_QUALITY_FIX.md`

#### 打卡相关 (`docs/features/attendance/`)
- `CHECKIN_DETAILS_IMPLEMENTATION_PLAN.md`
- `CHECKIN_REFACTOR_SUMMARY.md`
- `PERFECT_ATTENDANCE_EXPORT_FIX.md`
- `PERFECT_ATTENDANCE_FIX_SUMMARY.md`

#### 照片相关 (`docs/features/photo/`)
- `PHOTO_SIZE_LOGGING_ENHANCEMENT.md`
- `PHOTO_SIZE_LOG_TEST_GUIDE.md`
- `SYNC_LOG_PHOTO_SIZE_ENHANCEMENT.md`
- `WEB_PHOTO_SIZE_LOG_GUIDE.md`

#### 照片修复 (`docs/fixes/photo/`)
- `FAILURE_LOG_WITH_PHOTO_SIZE.md`

#### 同步相关 (`docs/sync/`)
- `DEVICE_SYNC_MIGRATION_SUMMARY.md`
- `DEVICE_SYNC_WEBSOCKET_CHECKLIST.md`
- `DEVICE_SYNC_WEBSOCKET_SUMMARY.md`

#### 其他修复 (`docs/fixes/`)
- `DUPLICATE_SEND_FIX.md`

#### 其他功能 (`docs/features/`)
- `LOG_FILTER_FEATURE.md`

#### 总结文档 (`docs/summaries/`)
- `CARE_WEB_ENHANCEMENT_SUMMARY.md`

## 📋 文档查找指南

### 按功能查找

- **压缩功能**: `docs/features/compression/`
- **打卡功能**: `docs/features/attendance/`
- **照片功能**: `docs/features/photo/`
- **同步功能**: `docs/sync/`

### 按类型查找

- **功能文档**: `docs/features/`
- **修复文档**: `docs/fixes/`
- **指南文档**: `docs/guides/`
- **总结文档**: `docs/summaries/`

### 完整文档索引

查看 `docs/INDEX.md` 获取完整的文档索引。

## 🔄 文档维护原则

1. **根目录文档**: 只保留项目核心文档（README, CHANGELOG, ROADMAP, CONTRIBUTING, CODE_OF_CONDUCT）
2. **功能文档**: 按功能模块组织到 `docs/features/` 子目录
3. **修复文档**: 按修复类型组织到 `docs/fixes/` 子目录
4. **总结文档**: 统一放在 `docs/summaries/` 目录

## 📝 添加新文档

添加新文档时，请遵循以下规则：

1. **功能文档** → `docs/features/[功能名称]/`
2. **修复文档** → `docs/fixes/[修复类型]/`
3. **指南文档** → `docs/guides/`
4. **总结文档** → `docs/summaries/`

不要直接在根目录创建功能相关的 markdown 文件。

