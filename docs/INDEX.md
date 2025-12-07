# 📚 莲花斋项目文档索引

> 完整的技术文档和开发指南索引

## 📖 快速导航

- [项目主文档](../README.md) - 项目介绍和快速开始
- [更新日志](../CHANGELOG.md) - 版本变更记录
- [产品路线图](../ROADMAP.md) - 未来功能规划
- [贡献指南](../CONTRIBUTING.md) - 如何参与项目
- [根目录文档整理](./ROOT_FILES_ORGANIZATION.md) - 文档组织结构说明

## 📁 文档目录结构

### 🚀 快速开始
- [快速开始指南](./setup/QUICK_START.md)
- [项目设置](./setup/SETUP.md)
- [启动指南](./setup/START_GUIDE.md)
- [Git 设置](./setup/GIT_SETUP.md)

### 📡 API 文档
- [API 总览](./api/API_DOCUMENTATION.md)
- [API 摘要](./api/API_SUMMARY.md)
- [快速开始](./api/QUICK_START.md)

#### 考勤模块 (`api/checkin/`)
- 19 个详细文档，包括：
  - 考勤系统设计
  - 数据导出指南
  - 接口说明
  - 使用示例

#### 义工模块 (`api/volunteer/`)
- 6 个文档，包括：
  - 义工管理接口
  - 批量导入导出
  - 搜索功能

#### 数据库文档 (`api/database/`)
- 4 个文档，包括：
  - 数据库设计
  - 命名规范
  - 表结构说明

### 🎨 前端文档
- [前端总结](./frontend/FRONTEND_SUMMARY.md)
- [前端开发计划](./frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- [功能特性](./frontend/FEATURES.md)
- [UI/UX 优化](./frontend/UI_UX_OPTIMIZATION_PROPOSAL.md)

### 🔧 后端文档
- [后端实现完成](./backend/BACKEND_IMPLEMENTATION_COMPLETE.md)
- [日志清理](./backend/BACKEND_LOGGING_CLEANUP.md)
- [WebSocket 协议分析](./backend/WEBSOCKET_PROTOCOL_ANALYSIS.md)

### ✨ 功能文档 (`features/`)

#### 压缩功能 (`features/compression/`)
- 压缩配置显示
- 压缩策略示例
- 压缩质量优化
- 实时压缩示例

#### 打卡功能 (`features/attendance/`)
- 打卡详情实现计划
- 打卡重构总结
- 全勤导出修复
- 全勤功能说明

#### 照片功能 (`features/photo/`)
- 照片大小日志增强
- 照片大小测试指南
- 同步日志照片大小增强
- Web 照片大小日志指南

#### 其他功能
- 设备同步 WebSocket 实现
- 设备管理改进
- 通知中心时间显示
- 动态 IP 配置
- 日志过滤功能

### 🐛 修复文档 (`fixes/`)

#### 压缩修复 (`fixes/compression/`)
- 压缩质量修复

#### 打卡修复 (`fixes/attendance/`)
- 打卡数据修复
- 打卡分页验证
- 打卡无数据根因分析

#### 照片修复 (`fixes/photo/`)
- 失败日志照片大小
- 照片同步调试增强
- 照片同步故障排除
- 照片 URL 修复

#### 其他修复
- WebSocket 连接修复
- WebSocket 重复 Toast 修复
- 设备同步反馈修复
- 志愿者重复检查修复
- 分页验证修复

### 📖 指南文档 (`guides/`)
- [快速参考卡](./guides/QUICK_REFERENCE_CARD.md)
- [打卡导航指南](./guides/CHECKIN_NAVIGATION_GUIDE.md)
- [设备同步 WebSocket 快速开始](./guides/DEVICE_SYNC_WEBSOCKET_QUICKSTART.md)
- [设备同步 WebSocket 测试](./guides/DEVICE_SYNC_WEBSOCKET_TESTING.md)
- [全勤功能使用](./guides/PERFECT_ATTENDANCE_USAGE.md)
- [验证检查清单](./guides/VERIFICATION_CHECKLIST.md)

### 🔄 同步文档 (`sync/`)
- 设备同步迁移总结
- 设备同步 WebSocket 总结
- 同步重复修复总结
- 同步重复风险分析
- 同步徽章修复
- 同步失败诊断
- 同步超时修复
- 同步 UX 改进

### 📊 总结文档 (`summaries/`)
- 项目清理完成报告
- 文档组织总结
- 根目录清理总结
- Care Web 增强总结

### 🌐 网络文档 (`network/`)
- 网络配置总结
- 前端 IP 审计
- IP 地址审计
- 网络配置
- 端口更新总结

### 👥 志愿者文档 (`volunteer/`)
- 17 个志愿者管理相关文档

### 🔍 审查文档 (`reviews/`)
- 设备同步审计
- 设备同步模块审查
- 设备同步模块审计

### 🏗️ 架构文档 (`architecture/`)
- 前端架构审查

### 📦 归档文档 (`archive/`)
- 调试志愿者更新
- 回滚测试

## 📱 移动端文档

移动端相关文档位于 `apps/mobile/` 目录：

- [移动端 README](../apps/mobile/README.md)
- [快速开始](../apps/mobile/QUICK_START.md)
- [详细设置](../apps/mobile/SETUP.md)
- [原生项目设置](../apps/mobile/NATIVE_SETUP.md)
- [完成总结](../apps/mobile/COMPLETION_SUMMARY.md)
- [项目检查清单](../apps/mobile/CHECKLIST.md)

## 🔍 按主题查找

### 压缩相关
- 功能文档: `docs/features/compression/`
- 修复文档: `docs/fixes/compression/`

### 打卡相关
- 功能文档: `docs/features/attendance/`
- 修复文档: `docs/fixes/attendance/`

### 照片相关
- 功能文档: `docs/features/photo/`
- 修复文档: `docs/fixes/photo/`

### 同步相关
- 功能文档: `docs/features/` (设备同步相关)
- 修复文档: `docs/fixes/` (同步相关)
- 同步文档: `docs/sync/`

## 📝 文档维护

- 文档组织结构说明: [ROOT_FILES_ORGANIZATION.md](./ROOT_FILES_ORGANIZATION.md)
- 添加新文档时，请遵循文档组织结构原则

## 📈 文档统计

- **总文档数**: 200+ 个
- **API 文档**: 30+ 个
- **功能文档**: 40+ 个
- **修复文档**: 30+ 个
- **指南文档**: 10+ 个
- **总结文档**: 10+ 个

---

最后更新: 2024-12-07
