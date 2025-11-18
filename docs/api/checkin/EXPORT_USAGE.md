# 志愿者服务时间统计表导出使用指南

## 🚀 快速开始

### 方法1：使用快捷脚本（推荐）

```bash
# 导出指定月份
bash scripts/export-monthly.sh 2025 9   # 导出2025年9月
bash scripts/export-monthly.sh 2025 10  # 导出2025年10月
bash scripts/export-monthly.sh 2025 11  # 导出2025年11月
```

### 方法2：使用 curl 命令

```bash
# 导出9月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-09-01&endDate=2025-09-30' \
  -o exports/志愿者服务时间统计表_2025年09月.xlsx

# 导出10月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-10-01&endDate=2025-10-31' \
  -o exports/志愿者服务时间统计表_2025年10月.xlsx

# 导出11月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30' \
  -o exports/志愿者服务时间统计表_2025年11月.xlsx
```

### 方法3：浏览器直接下载

在浏览器中访问以下地址，会自动下载 Excel 文件：

```
http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-09-01&endDate=2025-09-30
http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-10-01&endDate=2025-10-31
http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30
```

---

## 📊 已导出的文件

### 月度报表
| 文件名 | 月份 | 志愿者 | 数据行 | 总时长 |
|--------|------|--------|--------|--------|
| 志愿者服务时间统计表_2025年09月.xlsx | 2025年9月 | 17人 | 150行 | 639.9小时 |
| 志愿者服务时间统计表_2025年10月.xlsx | 2025年10月 | 24人 | 254行 | 933.0小时 |
| 志愿者服务时间统计表_2025年11月.xlsx | 2025年11月 | 25人 | 157行 | 648.2小时 |

所有文件保存在 `exports/` 文件夹中。

---

## 🎯 高级用法

### 导出指定用户的数据

```bash
# 导出陈璋的10月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-10-01&endDate=2025-10-31&lotusIds=LZ-V-6020135' \
  -o exports/陈璋_10月服务记录.xlsx

# 导出多个用户（用逗号分隔）
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-10-01&endDate=2025-10-31&lotusIds=LZ-V-6020135,LZ-V-1241702' \
  -o exports/指定用户_10月服务记录.xlsx
```

### 自定义活动名称

```bash
# 导出助念服务活动
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-09-01&endDate=2025-09-30&activityName=助念服务' \
  -o exports/助念服务_9月统计.xlsx

# 导出生命关怀活动
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-09-01&endDate=2025-09-30&activityName=生命关怀' \
  -o exports/生命关怀_9月统计.xlsx
```

### 导出自定义日期范围

```bash
# 导出某一周的数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-07' \
  -o exports/志愿者服务时间统计表_11月第1周.xlsx

# 导出某一天的数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-15&endDate=2025-11-15' \
  -o exports/志愿者服务时间统计表_11月15日.xlsx
```

---

## 📋 API 参数说明

### 接口地址
```
GET /api/v1/export/volunteer-service
```

### 请求参数
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| startDate | string | ✅ | 开始日期 | 2025-09-01 |
| endDate | string | ✅ | 结束日期 | 2025-09-30 |
| lotusIds | string | ❌ | 用户ID列表（逗号分隔） | LZ-V-6020135,LZ-V-1241702 |
| activityName | string | ❌ | 活动名称 | 助念服务 |

### 响应
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="志愿者服务时间统计表_日期.xlsx"`
- **Body**: Excel 文件二进制数据

---

## 🧪 验证导出文件

### 基本验证
```bash
# 验证所有测试文件
bun run scripts/verify-export.ts
```

### 详细统计
```bash
# 查看详细的志愿者统计信息
bun run scripts/verify-export-detailed.ts
```

### 月度报表验证
```bash
# 验证9月和10月的导出文件
bun run scripts/verify-monthly-exports.ts
```

### 验证最大工时限制
```bash
# 检查是否有记录超过8小时
bun run scripts/verify-max-hours.ts
```

---

## 📁 文件管理

### 查看已导出的文件
```bash
ls -lh exports/*.xlsx
```

### 删除旧文件
```bash
# 删除所有导出文件
rm exports/*.xlsx

# 删除指定月份的文件
rm exports/志愿者服务时间统计表_2025年09月.xlsx
```

### 备份文件
```bash
# 创建备份文件夹
mkdir -p exports/backup

# 备份所有文件
cp exports/*.xlsx exports/backup/
```

---

## 🔧 工时计算规则

### 单次打卡
```
只有一次打卡记录
→ 签到时间 = 打卡时间
→ 签退时间 = 打卡时间 + 1 小时
→ 服务时长 = 1 小时

示例：
12:05 打卡 → 签到 12:05，签退 13:05，时长 1 小时
```

### 多次打卡
```
有两次及以上打卡记录
→ 签到时间 = 第一次打卡时间
→ 签退时间 = 最后一次打卡时间
→ 服务时长 = 签退时间 - 签到时间（最大8小时）

示例：
10:00 打卡，14:30 打卡 → 签到 10:00，签退 14:30，时长 4.5 小时
00:55 打卡，17:33 打卡 → 签到 00:55，签退 17:33，时长 8 小时（限制）
```

---

## 📝 常见问题

### Q1: 为什么只有一次打卡时，签退时间会自动加1小时？
**A**: 这是为了符合深圳志愿者管理系统的要求，避免签到和签退时间相同。系统会自动将签退时间设置为签到时间+1小时，服务时长记为1小时。

### Q2: 为什么有些记录的工时是8小时，但实际打卡时间超过8小时？
**A**: 系统设置了最大工时限制为8小时/天。如果实际打卡时间超过8小时，会自动限制为8小时。

### Q3: 如何导出多个用户的数据？
**A**: 在 `lotusIds` 参数中使用逗号分隔多个用户ID，例如：`lotusIds=LZ-V-6020135,LZ-V-1241702`

### Q4: 导出的文件在哪里？
**A**: 所有导出的文件保存在项目根目录的 `exports/` 文件夹中。

### Q5: 导出的文件会被提交到 Git 吗？
**A**: 不会。`exports/` 文件夹和 `*.xlsx` 文件已添加到 `.gitignore`，不会被提交到 Git 仓库。

---

## 🔗 相关文档

- [导出功能完整指南](./EXPORT_COMPLETE_GUIDE.md)
- [导出规则说明](./EXPORT_RULES.md)
- [导出功能指南](./EXPORT_GUIDE.md)
- [导出文件说明](../../exports/README.md)

---

## ✅ 总结

### 快速导出命令
```bash
# 使用脚本（推荐）
bash scripts/export-monthly.sh 2025 9

# 使用 curl
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-09-01&endDate=2025-09-30' \
  -o exports/志愿者服务时间统计表_2025年09月.xlsx
```

### 文件位置
```
exports/志愿者服务时间统计表_2025年09月.xlsx
exports/志愿者服务时间统计表_2025年10月.xlsx
exports/志愿者服务时间统计表_2025年11月.xlsx
```

### 验证命令
```bash
bun run scripts/verify-monthly-exports.ts
```

🎉 **导出功能完全就绪，可直接用于上传深圳志愿者管理系统！**
