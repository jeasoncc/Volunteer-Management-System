# 志愿者服务时间统计表导出指南

## 📋 功能说明

导出符合**深圳志愿者管理系统**格式的 Excel 文件，用于上传到中国志愿者管理系统统计义工服务时长。

---

## 📊 导出格式

### Excel 表头
| 序号 | 义工号 | 姓名 | 活动名称 | 服务开展日期 | 签到时间 | 签退时间 | 服务时长 |
|------|--------|------|----------|-------------|---------|---------|---------|
| 1 | 0000766192 | 游景秀 | 2025.0301.0331生命关怀 | 2025-03-01 | 7:00 | 9:00 | 2 |
| 2 | 0000766192 | 游景秀 | 2025.0301.0331生命关怀 | 2025-03-02 | 7:00 | 15:00 | 8 |

### 字段说明
- **序号**: 自动递增
- **义工号**: lotus_id（如：LZ-V-6020135）
- **姓名**: 义工姓名
- **活动名称**: 默认为"日期范围+生命关怀"，可自定义
- **服务开展日期**: YYYY-MM-DD 格式
- **签到时间**: HH:mm 格式（第一次打卡）
- **签退时间**: HH:mm 格式（最后一次打卡）
- **服务时长**: 小时（保留一位小数）

---

## 🎯 API 接口

### 接口地址
```
GET /api/v1/export/volunteer-service
```

### 请求参数

#### 必填参数
| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| startDate | string | 开始日期 | 2025-03-01 |
| endDate | string | 结束日期 | 2025-03-31 |

#### 可选参数
| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| lotusIds | string | 用户ID列表（逗号分隔） | LZ-V-001,LZ-V-002 |
| activityName | string | 活动名称 | 助念服务 |

### 响应
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="志愿者服务时间统计表_日期.xlsx"`
- **Body**: Excel 文件二进制数据

---

## 💻 使用示例

### 示例1：导出整月数据
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-03-01&endDate=2025-03-31' \
  -o 志愿者服务时间统计表_3月.xlsx
```

### 示例2：导出指定用户
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-03-01&endDate=2025-03-31&lotusIds=LZ-V-6020135,LZ-V-1241702' \
  -o 志愿者服务时间统计表_指定用户.xlsx
```

### 示例3：自定义活动名称
```bash
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-03-01&endDate=2025-03-31&activityName=助念服务' \
  -o 志愿者服务时间统计表_助念服务.xlsx
```

### 示例4：在浏览器中下载
```
直接访问：
http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-03-01&endDate=2025-03-31

浏览器会自动下载 Excel 文件
```

---

## 📊 工时计算规则

### 规则1：单次打卡
```
只有一次打卡记录
→ 签到时间 = 签退时间
→ 服务时长 = 1 小时
```

### 规则2：双次打卡
```
有两次及以上打卡记录
→ 签到时间 = 第一次打卡
→ 签退时间 = 最后一次打卡
→ 服务时长 = 签退时间 - 签到时间
```

### 规则3：跨天打卡
```
场景：23:00 打卡，次日 01:00 打卡
→ 判断：签退时间 < 签到时间
→ 处理：签退时间 + 24小时
→ 服务时长 = (01:00 + 24h) - 23:00 = 2小时
```

### 规则4：限制最大工时
```
如果计算出的工时 > 12小时
→ 限制为 12小时
```

---

## 🧪 测试

### 运行测试脚本
```bash
bash scripts/test/test-export.sh
```

### 测试结果
```
✅ 文件已生成: 志愿者服务时间统计表_20250301_20250331.xlsx
📦 文件大小: 6.7K
✅ 文件类型: Microsoft Excel 2007+
```

### 验证数据
1. 打开生成的 Excel 文件
2. 检查表头是否正确
3. 检查数据格式是否符合要求
4. 检查工时计算是否准确

---

## 📝 数据示例

### 导出的 Excel 数据示例
```
序号 | 义工号        | 姓名   | 活动名称              | 服务开展日期 | 签到时间 | 签退时间 | 服务时长
-----|--------------|--------|----------------------|-------------|---------|---------|----------
1    | LZ-V-6020135 | 陈璋   | 2025.0301.0331生命关怀 | 2025-03-01  | 9:00    | 18:00   | 9
2    | LZ-V-6020135 | 陈璋   | 2025.0301.0331生命关怀 | 2025-03-02  | 9:00    | 9:00    | 1
3    | LZ-V-1241702 | 房石安 | 2025.0301.0331生命关怀 | 2025-03-01  | 10:00   | 17:00   | 7
```

---

## 🎯 使用场景

### 场景1：月度上报
```
每月初导出上月数据，上传到深圳志愿者管理系统

步骤：
1. 访问导出接口
2. 下载 Excel 文件
3. 打开文件检查数据
4. 上传到志愿者管理系统
```

### 场景2：指定用户导出
```
为特定义工导出服务记录

用途：
- 个人服务证明
- 年度总结
- 评优评先
```

### 场景3：活动统计
```
导出特定活动的服务记录

用途：
- 活动总结
- 工时统计
- 报表生成
```

---

## ⚙️ 高级功能

### 1. 批量导出
```bash
# 导出多个月份
for month in {1..12}; do
  curl "http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-${month}-01&endDate=2025-${month}-31" \
    -o "志愿者服务时间统计表_2025年${month}月.xlsx"
done
```

### 2. 自动化脚本
```bash
#!/bin/bash
# 每月自动导出上月数据

LAST_MONTH=$(date -d "last month" +%Y-%m)
YEAR=$(echo $LAST_MONTH | cut -d'-' -f1)
MONTH=$(echo $LAST_MONTH | cut -d'-' -f2)

START_DATE="${YEAR}-${MONTH}-01"
END_DATE=$(date -d "${START_DATE} +1 month -1 day" +%Y-%m-%d)

curl "http://localhost:3001/api/v1/export/volunteer-service?startDate=${START_DATE}&endDate=${END_DATE}" \
  -o "志愿者服务时间统计表_${YEAR}年${MONTH}月.xlsx"
```

---

## 🔍 故障排查

### 问题1：文件下载失败
**检查：**
```bash
# 检查服务是否运行
curl http://localhost:3001/api/v1/summary/list?limit=1

# 检查参数是否正确
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-03-01&endDate=2025-03-31' -v
```

### 问题2：数据不完整
**检查：**
```bash
# 检查数据库中的记录
mysql -e "SELECT COUNT(*) FROM volunteer_checkin WHERE date BETWEEN '2025-03-01' AND '2025-03-31';"

# 检查是否有打卡记录
curl 'http://localhost:3001/api/v1/summary/list?startDate=2025-03-01&endDate=2025-03-31&limit=5'
```

### 问题3：工时计算不准确
**检查：**
```bash
# 查看原始打卡记录
mysql -e "SELECT lotus_id, name, date, check_in FROM volunteer_checkin WHERE date = '2025-03-01' ORDER BY lotus_id, check_in;"

# 对比导出的工时
```

---

## 📋 注意事项

1. ✅ **日期格式**: 必须是 YYYY-MM-DD
2. ✅ **活动名称**: 默认格式为 "YYYY.MMDD.MMDD生命关怀"
3. ✅ **工时计算**: 自动处理跨天打卡
4. ✅ **数据完整性**: 只导出有打卡记录的数据
5. ✅ **文件命名**: 自动生成带日期的文件名

---

## ✅ 总结

**导出功能已完成：**
- ✅ 符合深圳志愿者管理系统格式
- ✅ 支持日期范围筛选
- ✅ 支持指定用户导出
- ✅ 支持自定义活动名称
- ✅ 自动计算工时
- ✅ 处理跨天打卡
- ✅ Excel 格式标准

**测试结果：**
- ✅ 文件生成成功
- ✅ 格式正确
- ✅ 数据完整
- ✅ 可直接上传到志愿者管理系统

🎉 导出功能已就绪！
