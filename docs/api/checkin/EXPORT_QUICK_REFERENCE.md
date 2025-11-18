# 导出功能快速参考

## 🚀 常用命令

### 导出操作
```bash
# 导出单个月份
npm run export:monthly 2025 11

# 导出多个月份
npm run export:batch 2025 9 10 11

# 导出前清理旧文件
bash scripts/export-monthly.sh 2025 11 --clean
```

### 文件管理
```bash
# 清理导出文件
npm run clean-exports

# 查看导出文件
ls -lh exports/*.xlsx
```

### 验证
```bash
# 基本验证
npm run export:verify

# 详细统计
npm run export:verify-detailed

# 验证工时限制
npm run export:verify-hours

# 测试导出功能
npm run export:test
```

---

## 📋 API 快速参考

### 基本导出
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30' \
  -o exports/志愿者服务时间统计表_2025年11月.xlsx
```

### 指定用户
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&lotusIds=LZ-V-6020135' \
  -o exports/陈璋_11月.xlsx
```

### 自定义活动
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&activityName=助念服务' \
  -o exports/助念服务_11月.xlsx
```

---

## 📊 Excel 格式

```
第1行：深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统）
第2行：序号 | 义工号[红] | 姓名 | 活动名称 | 服务开展日期[红] | 签到时间[红] | 签退时间[红] | 服务时长[红]
数据行：1 | 0300207442 | 陈璋 | 2025.1101.1130生命关怀 | 2025-11-15 | 12:00 | 13:00 | 1
```

---

## ⏰ 工时规则

| 场景 | 规则 | 示例 |
|------|------|------|
| 单次打卡 | 签退 = 签到 + 1小时 | 12:05 → 12:05-13:05 (1小时) |
| 多次打卡 | 签退 = 最后打卡 | 10:00, 14:30 → 10:00-14:30 (4.5小时) |
| 跨天打卡 | 自动加24小时 | 23:30, 01:15 → 23:30-01:15 (1.8小时) |
| 最大限制 | 8小时/天 | 00:55-17:33 → 8小时（限制） |

---

## 📁 文件位置

```
exports/
├── 志愿者服务时间统计表_2025年09月.xlsx
├── 志愿者服务时间统计表_2025年10月.xlsx
├── 志愿者服务时间统计表_2025年11月.xlsx
└── README.md
```

---

## 🔗 相关文档

| 文档 | 说明 |
|------|------|
| [EXPORT_USAGE.md](./EXPORT_USAGE.md) | 使用指南 |
| [EXPORT_RULES.md](./EXPORT_RULES.md) | 导出规则 |
| [EXPORT_DATA_SOURCE.md](./EXPORT_DATA_SOURCE.md) | 数据来源 |
| [EXPORT_FAQ.md](./EXPORT_FAQ.md) | 常见问题 |
| [EXPORT_COMPLETE_GUIDE.md](./EXPORT_COMPLETE_GUIDE.md) | 完整指南 |

---

## 💡 最佳实践

### 月度上报流程
```bash
# 1. 清理旧文件
npm run clean-exports

# 2. 导出上月数据
npm run export:monthly 2025 10

# 3. 验证数据
npm run export:verify-detailed

# 4. 上传到深圳志愿者管理系统
```

### 批量导出流程
```bash
# 一次性导出多个月份（会提示是否清理）
npm run export:batch 2025 9 10 11
```

---

## ❓ 快速问答

**Q: 可以导出当月数据吗？**  
A: 可以！使用原始打卡数据，支持任意时间段。

**Q: 需要等汇总表生成吗？**  
A: 不需要！直接从原始数据实时计算。

**Q: 如何清理旧文件？**  
A: 运行 `npm run clean-exports` 或在导出时加 `--clean` 参数。

**Q: 工时为什么限制8小时？**  
A: 符合深圳志愿者管理系统要求，每天最多8小时。

---

## 📞 获取帮助

遇到问题？查看：
1. [常见问题 FAQ](./EXPORT_FAQ.md)
2. [完整指南](./EXPORT_COMPLETE_GUIDE.md)
3. 运行测试：`npm run export:test`
