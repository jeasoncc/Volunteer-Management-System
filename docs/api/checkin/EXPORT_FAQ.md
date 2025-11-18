# 导出功能常见问题

## ❓ 数据来源相关

### Q1: 导出功能是从哪个表获取数据的？
**A**: 直接从 `volunteer_checkin` 原始打卡表获取数据，**不是**从 `volunteer_checkin_summary` 汇总表。

### Q2: 为什么不使用汇总表？
**A**: 使用原始表的优势：
- ✅ 可以导出任意时间段（不限于上个月）
- ✅ 不需要等待汇总表生成
- ✅ 数据实时准确
- ✅ 支持灵活筛选（用户、日期、活动）

### Q3: 汇总表是做什么用的？
**A**: `volunteer_checkin_summary` 汇总表用于：
- 快速查询和统计分析
- 报表展示
- 数据看板

**生成时机**: 每月1号凌晨自动生成上月汇总

**与导出的关系**: 导出功能**不依赖**汇总表，两者独立运行。

### Q4: 可以导出当月的数据吗？
**A**: 可以！因为使用的是原始打卡数据，所以可以导出任意时间段，包括当月、当周、甚至当天的数据。

```bash
# 导出当月数据（假设现在是11月）
bash scripts/export-monthly.sh 2025 11

# 导出当周数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-10&endDate=2025-11-16' \
  -o exports/本周数据.xlsx
```

---

## 🗑️ 文件管理相关

### Q5: 每次导出前需要删除旧文件吗？
**A**: 建议删除，这样文件夹更清晰。有以下几种方法：

**方法1: 使用清理脚本（推荐）**
```bash
bash scripts/clean-exports.sh
```

**方法2: 导出时自动清理**
```bash
bash scripts/export-monthly.sh 2025 9 --clean
```

**方法3: 批量导出时清理**
```bash
bash scripts/export-batch.sh 2025 9 10 11
# 会提示是否清理旧文件
```

**方法4: 手动删除**
```bash
rm exports/*.xlsx
```

### Q6: 导出的文件会被提交到 Git 吗？
**A**: 不会。`exports/` 文件夹和 `*.xlsx` 文件已添加到 `.gitignore`，不会被提交到 Git 仓库。

### Q7: 如何备份导出的文件？
**A**: 
```bash
# 创建备份文件夹
mkdir -p exports/backup

# 备份所有文件
cp exports/*.xlsx exports/backup/

# 或者按日期备份
mkdir -p exports/backup/$(date +%Y%m%d)
cp exports/*.xlsx exports/backup/$(date +%Y%m%d)/
```

---

## ⏰ 工时计算相关

### Q8: 为什么单次打卡的签退时间会自动加1小时？
**A**: 这是为了符合深圳志愿者管理系统的要求，避免签到和签退时间相同。

**规则**: 
- 单次打卡: 签退 = 签到 + 1小时，服务时长 = 1小时
- 示例: 12:05 打卡 → 签到 12:05，签退 13:05，时长 1小时

### Q9: 为什么有些记录的工时是8小时，但实际打卡时间超过8小时？
**A**: 系统设置了最大工时限制为 8小时/天。

**规则**:
- 如果实际打卡时间超过8小时，会自动限制为8小时
- 示例: 00:55 打卡，17:33 打卡 → 实际 16.6小时 → 限制为 8小时

### Q10: 跨天打卡如何计算？
**A**: 系统会自动处理跨天打卡。

**规则**:
- 如果签退时间 < 签到时间，自动加24小时
- 示例: 23:30 打卡，01:15 打卡 → 签到 23:30，签退 01:15，时长 1.8小时

---

## 📊 导出操作相关

### Q11: 如何导出多个月份的数据？
**A**: 使用批量导出脚本：

```bash
# 一次性导出9月、10月、11月
bash scripts/export-batch.sh 2025 9 10 11
```

### Q12: 如何导出指定用户的数据？
**A**: 
```bash
# 导出单个用户
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&lotusIds=LZ-V-6020135' \
  -o exports/陈璋_11月.xlsx

# 导出多个用户（用逗号分隔）
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&lotusIds=LZ-V-6020135,LZ-V-1241702' \
  -o exports/指定用户_11月.xlsx
```

### Q13: 如何自定义活动名称？
**A**: 
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&activityName=助念服务' \
  -o exports/助念服务_11月.xlsx
```

**默认活动名称**: 如果不指定，默认为 `日期范围+生命关怀`，如 `2025.1101.1130生命关怀`

### Q14: 如何导出自定义日期范围？
**A**: 
```bash
# 导出某一周
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-07' \
  -o exports/11月第1周.xlsx

# 导出某一天
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-15&endDate=2025-11-15' \
  -o exports/11月15日.xlsx
```

---

## 🔧 性能相关

### Q15: 导出大量数据会很慢吗？
**A**: 当前性能表现：
- 2025年11月: 610条原始记录 → 157行数据 → < 1秒
- 2025年10月: 813条原始记录 → 254行数据 → < 1秒

**结论**: 对于正常的月度数据量（< 1000条），性能完全可接受。

### Q16: 如果数据量很大怎么办？
**A**: 如果未来数据量增大（如每月 > 10000条），可以考虑：
1. 添加数据库索引
2. 使用分页查询
3. 添加缓存机制

详见 [数据来源说明](./EXPORT_DATA_SOURCE.md#性能考虑)

---

## 📋 Excel 格式相关

### Q17: Excel 文件的格式是什么？
**A**: 
```
第1行: 深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统）[合并单元格，居中]
第2行: 序号 | 义工号[红] | 姓名 | 活动名称 | 服务开展日期[红] | 签到时间[红] | 签退时间[红] | 服务时长[红]
第3行开始: 数据行...
```

### Q18: 义工号是什么？
**A**: 义工号是志愿者系统的编号（`volunteer_id`），不是内部编号（`lotus_id`）。

**示例**:
- lotus_id: LZ-V-6020135（内部编号）
- volunteer_id: 0300207442（志愿者系统编号）✅

**Excel 中显示**: 0300207442

### Q19: 为什么有些字段是红色的？
**A**: 根据深圳志愿者管理系统的要求，以下字段需要标红：
- 义工号
- 服务开展日期
- 签到时间
- 签退时间
- 服务时长

---

## 🚀 快速参考

### 常用命令
```bash
# 导出单个月份
bash scripts/export-monthly.sh 2025 11

# 导出多个月份
bash scripts/export-batch.sh 2025 9 10 11

# 清理旧文件
bash scripts/clean-exports.sh

# 验证导出文件
bun run scripts/verify-monthly-exports.ts
```

### 文件位置
```
exports/                                    # 导出文件夹
├── 志愿者服务时间统计表_2025年09月.xlsx
├── 志愿者服务时间统计表_2025年10月.xlsx
├── 志愿者服务时间统计表_2025年11月.xlsx
└── README.md                               # 文件说明
```

### 相关文档
- [使用指南](./EXPORT_USAGE.md)
- [数据来源说明](./EXPORT_DATA_SOURCE.md)
- [导出规则](./EXPORT_RULES.md)
- [完整指南](./EXPORT_COMPLETE_GUIDE.md)

---

## 💡 最佳实践

### 月度上报流程
1. 每月初（1-5号）导出上月数据
2. 清理旧文件，保持文件夹整洁
3. 验证导出文件的数据准确性
4. 上传到深圳志愿者管理系统

```bash
# 完整流程
bash scripts/clean-exports.sh              # 清理旧文件
bash scripts/export-monthly.sh 2025 10    # 导出10月数据
bun run scripts/verify-monthly-exports.ts  # 验证数据
```

### 批量导出流程
```bash
# 一次性导出多个月份
bash scripts/export-batch.sh 2025 9 10 11
# 会自动提示是否清理旧文件
```

---

## 🔗 获取帮助

如果遇到问题，可以：
1. 查看相关文档（见上方链接）
2. 运行测试脚本验证功能
3. 检查服务是否正常运行

```bash
# 检查服务状态
curl http://localhost:3001/api/v1/health

# 运行测试
bash scripts/test/test-export.sh
```

🎉 **如有其他问题，欢迎随时询问！**
