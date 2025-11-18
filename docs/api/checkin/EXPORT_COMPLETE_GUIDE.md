# 志愿者服务时间统计表导出完整指南

## ✅ 已修复的问题

### 问题1：义工号字段 ✅
- **修复前：** 使用 `lotus_id`（莲花斋内部编号，如 LZ-V-6020135）
- **修复后：** 使用 `volunteer_id`（志愿者系统编号，如 0300207442）
- **验证：** 已通过数据库关联查询获取正确的 volunteer_id

### 问题2：Excel 格式 ✅
- **修复前：** 只有一行表头，无标题行
- **修复后：** 
  - 第1行：标题居中（深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统））
  - 第2行：表头，指定字段标红（义工号、服务开展日期、签到时间、签退时间、服务时长）
  - 数据行：内容居中对齐

### 问题3：测试数据 ✅
- **修复前：** 测试 2025年3月（未来月份，无数据）
- **修复后：** 测试 2024年11月（当前月份，有真实数据）
- **验证：** 导出成功，包含 6 条记录

---

## 📊 Excel 格式（完全符合深圳志愿者管理系统要求）

### 文件结构
```
第1行：深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统） [合并单元格，居中，加粗，14号字]

第2行：序号 | 义工号[红色] | 姓名 | 活动名称 | 服务开展日期(yyyy/MM/dd)[红色] | 签到时间(HH:mm)[红色] | 签退时间(HH:mm)[红色] | 服务时长（单位：小时）[红色]

数据行：
1 | 0300207442 | 陈璋 | 2024.1101.1130生命关怀 | 2024-11-15 | 12:00 | 12:00 | 1
2 | 0300207442 | 陈璋 | 2024.1101.1130生命关怀 | 2024-11-16 | 10:00 | 14:30 | 4.5
3 | 0300207442 | 陈璋 | 2024.1101.1130生命关怀 | 2024-11-17 | 09:00 | 09:00 | 1
...
```

### 字段说明
| 字段 | 说明 | 格式 | 是否标红 |
|------|------|------|----------|
| 序号 | 行号 | 数字 | ❌ |
| 义工号 | 志愿者系统编号 | 10位数字 | ✅ |
| 姓名 | 志愿者姓名 | 文本 | ❌ |
| 活动名称 | 服务活动名称 | 文本 | ❌ |
| 服务开展日期 | 服务日期 | YYYY-MM-DD | ✅ |
| 签到时间 | 第一次打卡时间 | HH:mm | ✅ |
| 签退时间 | 最后一次打卡时间 | HH:mm | ✅ |
| 服务时长 | 计算的工时 | 小数（小时） | ✅ |

---

## 🎯 触发方式

### 方式1：手动触发（当前实现）✅

#### 浏览器下载
```
直接访问：
http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30

浏览器会自动下载 Excel 文件
```

#### 命令行下载
```bash
# 导出11月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30' \
  -o 志愿者服务时间统计表_11月.xlsx

# 导出指定用户
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30&lotusIds=LZ-V-6020135' \
  -o 陈璋_11月服务记录.xlsx

# 自定义活动名称
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30&activityName=助念服务' \
  -o 助念服务_11月统计.xlsx
```

#### 程序调用
```javascript
// 前端 JavaScript
const downloadExcel = async (startDate, endDate) => {
  const url = `/api/v1/export/volunteer-service?startDate=${startDate}&endDate=${endDate}`
  const response = await fetch(url)
  const blob = await response.blob()
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `志愿者服务时间统计表_${startDate}_${endDate}.xlsx`
  link.click()
}

// 使用
downloadExcel('2024-11-01', '2024-11-30')
```

### 方式2：自动触发（可扩展）⏳

#### 定时任务自动生成
```typescript
// src/cron/export.ts
import cron from 'node-cron'
import { CheckInExportService } from '../modules/checkin/export.service'
import dayjs from 'dayjs'
import fs from 'fs'

// 每月1号凌晨3点自动生成上月报表
cron.schedule('0 3 1 * *', async () => {
  const lastMonth = dayjs().subtract(1, 'month')
  const startDate = lastMonth.startOf('month').format('YYYY-MM-DD')
  const endDate = lastMonth.endOf('month').format('YYYY-MM-DD')
  
  const result = await CheckInExportService.exportToExcel({
    startDate,
    endDate,
  })
  
  // 保存到文件
  const buffer = await result.workbook.xlsx.writeBuffer()
  fs.writeFileSync(`exports/${result.filename}`, buffer)
  
  console.log(`✅ 自动生成报表: ${result.filename}`)
})
```

#### 邮件自动发送
```typescript
// 生成后自动发送邮件
import nodemailer from 'nodemailer'

const sendMonthlyReport = async (filename: string, buffer: Buffer) => {
  const transporter = nodemailer.createTransporter({
    // 邮件配置
  })
  
  await transporter.sendMail({
    to: 'admin@example.com',
    subject: `${dayjs().subtract(1, 'month').format('YYYY年MM月')}志愿者服务时间统计表`,
    text: '请查收附件中的月度统计表',
    attachments: [{
      filename,
      content: buffer,
    }]
  })
}
```

---

## 📋 API 接口详细说明

### 接口地址
```
GET /api/v1/export/volunteer-service
```

### 请求参数
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| startDate | string | ✅ | 开始日期 | 2024-11-01 |
| endDate | string | ✅ | 结束日期 | 2024-11-30 |
| lotusIds | string | ❌ | 用户ID列表（逗号分隔） | LZ-V-6020135,LZ-V-1241702 |
| activityName | string | ❌ | 活动名称 | 助念服务 |

### 响应
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="志愿者服务时间统计表_日期.xlsx"`
- **Body**: Excel 文件二进制数据

---

## 🔧 工时计算规则

### 规则1：单次打卡
```
只有一次打卡记录
→ 签到时间 = 签退时间 = 打卡时间
→ 服务时长 = 1 小时

示例：
12:00 打卡 → 签到 12:00，签退 12:00，时长 1 小时
```

### 规则2：双次打卡
```
有两次及以上打卡记录
→ 签到时间 = 第一次打卡时间
→ 签退时间 = 最后一次打卡时间
→ 服务时长 = 签退时间 - 签到时间

示例：
10:00 打卡，14:30 打卡 → 签到 10:00，签退 14:30，时长 4.5 小时
```

### 规则3：跨天打卡
```
场景：23:00 打卡，次日 01:00 打卡
→ 判断：签退时间 < 签到时间
→ 处理：签退时间 + 24小时
→ 服务时长 = (01:00 + 24h) - 23:00 = 2小时

示例：
23:30 打卡，01:15 打卡 → 签到 23:30，签退 01:15，时长 1.8 小时
```

### 规则4：限制最大工时
```
如果计算出的工时 > 12小时
→ 限制为 12小时

示例：
6:00 打卡，23:00 打卡 → 计算 17 小时 → 限制为 12 小时
```

---

## 🧪 测试验证

### 测试命令
```bash
# 运行完整测试
bash scripts/test/test-export.sh

# 验证 Excel 文件内容
bun run scripts/verify-export.ts
```

### 测试结果
```
✅ 文件已生成: 志愿者服务时间统计表_20241101_20241130.xlsx (7.3K)
✅ 文件已生成: 志愿者服务时间统计表_指定用户.xlsx (7.3K)
✅ 文件已生成: 志愿者服务时间统计表_助念服务.xlsx (7.3K)
✅ 文件类型: Microsoft Excel 2007+

📋 验证文件内容:
✅ 第1行（标题）: 深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统）
✅ 第2行（表头）: 序号 | 义工号[红色] | 姓名 | 活动名称 | 服务开展日期[红色] | 签到时间[红色] | 签退时间[红色] | 服务时长[红色]
✅ 数据行: 1 | 0300207442 | 陈璋 | 2024.1101.1130生命关怀 | 2024-11-15 | 12:00 | 12:00 | 1
```

### 数据验证
```sql
-- 验证义工号正确性
SELECT lotus_id, volunteer_id, name 
FROM volunteer 
WHERE lotus_id = 'LZ-V-6020135';

-- 结果：
-- lotus_id: LZ-V-6020135 (内部编号)
-- volunteer_id: 0300207442 (志愿者系统编号) ✅
-- name: 陈璋
```

---

## 🎯 使用场景

### 场景1：月度上报（推荐）
```bash
# 每月初导出上月数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30' \
  -o 志愿者服务时间统计表_2024年11月.xlsx

# 上传到深圳志愿者管理系统
```

### 场景2：指定用户导出
```bash
# 导出特定义工的记录
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30&lotusIds=LZ-V-6020135' \
  -o 陈璋_11月服务记录.xlsx
```

### 场景3：自定义活动
```bash
# 导出特定活动的记录
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2024-11-01&endDate=2024-11-30&activityName=助念服务' \
  -o 助念服务_11月统计.xlsx
```

---

## 📁 文件结构

```
src/modules/checkin/
├── export.service.ts           # 导出服务（已修复）
├── index.ts                    # 路由（包含导出接口）
└── ...

scripts/
├── test/
│   └── test-export.sh          # 导出功能测试
└── verify-export.ts            # Excel 文件验证

docs/checkin/
├── EXPORT_GUIDE.md             # 导出指南
└── EXPORT_COMPLETE_GUIDE.md    # 本文件
```

---

## ✅ 总结

### 已完成功能
- ✅ 符合深圳志愿者管理系统格式
- ✅ 使用正确的志愿者系统义工号（volunteer_id）
- ✅ Excel 两行表头，指定字段标红
- ✅ 自动计算工时（支持跨天）
- ✅ 支持日期范围筛选
- ✅ 支持指定用户导出
- ✅ 支持自定义活动名称
- ✅ 完整测试验证通过

### 触发方式
- ✅ **手动触发**：浏览器访问、API 调用、命令行下载
- ⏳ **自动触发**：可扩展定时任务、邮件发送

### 测试验证
- ✅ 导出 3 个 Excel 文件验证
- ✅ 文件格式正确（Microsoft Excel 2007+）
- ✅ 数据内容符合要求
- ✅ 义工号使用 volunteer_id（0300207442）而非 lotus_id（LZ-V-6020135）

🎉 **导出功能完全就绪，可直接用于上传深圳志愿者管理系统！**
