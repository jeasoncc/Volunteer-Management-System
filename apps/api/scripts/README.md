# 脚本管理

## 📁 目录结构

```
scripts/
├── README.md                           # 本文件
├── sql/                                # SQL 脚本
│   ├── add-missing-checkin-fields.sql
│   ├── create-checkin-summary-table.sql
│   ├── fix-all-column-names.sql
│   ├── fix-checkin-foreign-key.sql
│   ├── normalize-checkin-column-names.sql
│   └── remove-duplicate-device-field.sql
├── test/                               # 测试脚本
│   ├── test-checkin.sh
│   ├── test-checkin-summary.sh
│   ├── test-checkin-validation.sh
│   ├── test-monthly-summary.sh
│   ├── test-summary-crud.sh
│   └── test-final.sh
└── generate-checkin-summary.ts         # 生成脚本
```

---

## 📊 SQL 脚本

### 数据库迁移脚本

#### 1. add-missing-checkin-fields.sql
**用途：** 添加考勤表缺失的字段
**字段：** device_sn, body_temperature, confidence

```bash
mysql < scripts/sql/add-missing-checkin-fields.sql
```

#### 2. create-checkin-summary-table.sql
**用途：** 创建考勤汇总表和规则配置表
**表：** volunteer_checkin_summary, checkin_rules

```bash
mysql < scripts/sql/create-checkin-summary-table.sql
```

#### 3. fix-all-column-names.sql
**用途：** 修复所有表中的驼峰命名列
**修复：** chantPostion → chant_position

```bash
mysql < scripts/sql/fix-all-column-names.sql
```

#### 4. fix-checkin-foreign-key.sql
**用途：** 修复考勤表的外键关系
**修复：** 添加 user_id 外键，使用 volunteer.id

```bash
mysql < scripts/sql/fix-checkin-foreign-key.sql
```

#### 5. normalize-checkin-column-names.sql
**用途：** 统一考勤表列名为下划线命名
**修复：** recordType → record_type, originTime → origin_time

```bash
mysql < scripts/sql/normalize-checkin-column-names.sql
```

#### 6. remove-duplicate-device-field.sql
**用途：** 删除重复的设备字段
**修复：** 删除 device_id，只保留 device_sn

```bash
mysql < scripts/sql/remove-duplicate-device-field.sql
```

---

## 🧪 测试脚本

### 考勤系统测试

#### 1. test-checkin.sh
**用途：** 测试基本签到功能
**测试：** 人脸识别签到、陌生人记录

```bash
bash scripts/test/test-checkin.sh
```

#### 2. test-checkin-validation.sh
**用途：** 测试签到验证逻辑
**测试：** 用户验证、时间验证、重复检查

```bash
bash scripts/test/test-checkin-validation.sh
```

#### 3. test-checkin-summary.sh
**用途：** 测试考勤汇总计算
**测试：** 单次打卡、双次打卡、跨夜班

```bash
bash scripts/test/test-checkin-summary.sh
```

#### 4. test-monthly-summary.sh
**用途：** 测试月度汇总功能
**测试：** 生成月度汇总、查询报表

```bash
bash scripts/test/test-monthly-summary.sh
```

#### 5. test-summary-crud.sh
**用途：** 测试汇总记录 CRUD 操作
**测试：** 创建、查询、更新、删除

```bash
bash scripts/test/test-summary-crud.sh
```

#### 6. test-final.sh
**用途：** 最终集成测试

```bash
bash scripts/test/test-final.sh
```

---

## 🔧 生成脚本

### generate-checkin-summary.ts
**用途：** 从原始打卡记录生成考勤汇总

**使用方法：**
```bash
# 生成所有历史数据的汇总
bun run scripts/generate-checkin-summary.ts

# 或者使用月度汇总 API（推荐）
curl -X POST http://localhost:3001/api/v1/summary/generate-monthly \
  -d '{"year": 2024, "month": 11}'
```

---

## 📋 使用指南

### 数据库初始化
```bash
# 1. 创建汇总表
mysql < scripts/sql/create-checkin-summary-table.sql

# 2. 修复字段命名
mysql < scripts/sql/normalize-checkin-column-names.sql

# 3. 删除重复字段
mysql < scripts/sql/remove-duplicate-device-field.sql

# 4. 生成历史汇总数据
bun run scripts/generate-checkin-summary.ts
```

### 日常测试
```bash
# 测试签到功能
bash scripts/test/test-checkin.sh

# 测试月度汇总
bash scripts/test/test-monthly-summary.sh

# 测试 CRUD 操作
bash scripts/test/test-summary-crud.sh
```

### 月度汇总
```bash
# 方式1：自动执行（推荐）
# 定时任务会在每月1号凌晨2点自动执行

# 方式2：手动执行
curl -X POST http://localhost:3001/api/v1/summary/generate-monthly \
  -d '{"year": 2024, "month": 11}'

# 方式3：命令行脚本
bun run scripts/generate-checkin-summary.ts
```

---

## 🔍 故障排查

### SQL 脚本执行失败
```bash
# 检查数据库连接
mysql -h 127.0.0.1 -P 3307 -u root -padmin123 lotus -e "SELECT 1;"

# 查看错误日志
mysql < scripts/sql/xxx.sql 2>&1 | grep ERROR
```

### 测试脚本失败
```bash
# 检查服务是否运行
curl http://localhost:3001/api/v1/summary/list

# 查看服务日志
# 日志会显示在控制台
```

---

## 📝 维护建议

### 添加新脚本
1. SQL 脚本放在 `scripts/sql/`
2. 测试脚本放在 `scripts/test/`
3. 生成脚本放在 `scripts/`
4. 更新本 README

### 命名规范
- SQL 脚本：`kebab-case.sql`
- 测试脚本：`test-xxx.sh`
- 生成脚本：`generate-xxx.ts`

### 文档规范
- 每个脚本都应该有注释说明用途
- 复杂脚本应该有使用示例
- 更新 README 保持同步
