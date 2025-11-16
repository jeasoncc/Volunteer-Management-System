# 考勤系统改进方案

## 当前状态分析

### ✅ 已实现
1. 人脸识别签到记录
2. 陌生人记录接收
3. 用户验证
4. 重复记录检查
5. 时间格式验证

### ❌ 缺失功能

## 改进方案

### 优先级 1：核心功能完善

#### 1.1 陌生人记录存储
**问题**：陌生人记录只是记录日志，没有存储到数据库

**方案**：创建 `stranger_record` 表

```sql
CREATE TABLE stranger_record (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL COMMENT '设备生成的ID',
  user_name VARCHAR(50) COMMENT '姓名',
  recog_type VARCHAR(20) NOT NULL COMMENT '识别类型',
  recog_time DATETIME NOT NULL COMMENT '识别时间',
  photo TEXT COMMENT '照片base64',
  gender INT COMMENT '性别',
  body_temperature VARCHAR(10) COMMENT '体温',
  confidence VARCHAR(10) COMMENT '置信度',
  device_sn VARCHAR(50) COMMENT '设备号',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_recog_time (recog_time),
  INDEX idx_device_sn (device_sn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**实现**：
- 保存陌生人的照片
- 记录详细信息
- 提供查询接口

#### 1.2 签到照片存储
**问题**：签到时的照片（photo 字段）没有保存

**方案**：
1. 在 `volunteer_check_in` 表添加 `photo` 字段
2. 解码 base64 照片并保存到文件系统
3. 在数据库中存储照片路径

```sql
ALTER TABLE volunteer_check_in 
ADD COLUMN photo TEXT COMMENT '签到照片路径' AFTER record_type;
```

#### 1.3 设备信息记录
**问题**：没有记录是哪个设备上传的数据

**方案**：在签到记录中添加设备信息

```sql
ALTER TABLE volunteer_check_in 
ADD COLUMN device_sn VARCHAR(50) COMMENT '设备号' AFTER photo,
ADD COLUMN body_temperature VARCHAR(10) COMMENT '体温' AFTER device_sn,
ADD COLUMN confidence VARCHAR(10) COMMENT '识别置信度' AFTER body_temperature,
ADD INDEX idx_device_sn (device_sn);
```

### 优先级 2：查询和统计功能

#### 2.1 签到记录查询
**需求**：
- 按日期范围查询
- 按用户查询
- 按设备查询
- 按识别类型查询

**接口**：
```
GET /api/v1/checkin/records
参数：
  - lotusId: 用户ID
  - startDate: 开始日期
  - endDate: 结束日期
  - deviceSn: 设备号
  - recogType: 识别类型
  - page: 页码
  - limit: 每页数量
```

#### 2.2 签到统计
**需求**：
- 每日签到人数统计
- 用户签到次数统计
- 设备使用统计
- 识别类型分布

**接口**：
```
GET /api/v1/checkin/statistics
参数：
  - type: daily | user | device | recog_type
  - startDate: 开始日期
  - endDate: 结束日期
```

#### 2.3 异常记录查询
**需求**：
- 高温记录
- 陌生人记录
- 识别失败记录

**接口**：
```
GET /api/v1/checkin/anomalies
参数：
  - type: high_temp | stranger | failed
  - startDate: 开始日期
  - endDate: 结束日期
```

### 优先级 3：高级功能

#### 3.1 实时通知
**需求**：
- 陌生人出现时通知管理员
- 高温预警
- 异常签到提醒

**实现**：
- 使用 WebSocket 推送实时消息
- 集成微信/邮件通知

#### 3.2 签到规则配置
**需求**：
- 配置签到时间段（如：8:00-18:00）
- 配置体温阈值
- 配置重复签到间隔（如：5分钟内不允许重复）

**实现**：
- 创建配置表
- 在签到时应用规则
- 提供配置管理接口

#### 3.3 考勤报表
**需求**：
- 月度考勤报表
- 个人考勤统计
- 部门考勤统计
- 导出 Excel

**实现**：
- 生成报表数据
- 提供导出接口
- 支持多种格式（PDF、Excel）

#### 3.4 补签功能
**需求**：
- 管理员可以为用户补签
- 记录补签原因
- 补签审批流程

**接口**：
```
POST /api/v1/checkin/makeup
参数：
  - lotusId: 用户ID
  - date: 日期
  - time: 时间
  - reason: 补签原因
  - approver: 审批人
```

### 优先级 4：数据完整性

#### 4.1 数据备份
**需求**：
- 定期备份签到数据
- 支持数据恢复

#### 4.2 数据清理
**需求**：
- 清理过期的陌生人记录
- 归档历史签到数据

#### 4.3 数据同步
**需求**：
- 与考勤设备双向同步
- 支持离线数据上传

## 实施建议

### 第一阶段（1-2周）
1. ✅ 优化现有签到逻辑（已完成）
2. 创建陌生人记录表
3. 实现签到照片存储
4. 添加设备信息记录

### 第二阶段（2-3周）
1. 实现签到记录查询接口
2. 实现基础统计功能
3. 添加异常记录查询

### 第三阶段（3-4周）
1. 实现实时通知
2. 添加签到规则配置
3. 实现考勤报表

### 第四阶段（长期）
1. 补签功能
2. 数据备份和清理
3. 高级统计和分析

## 数据库 Schema 建议

### 1. 陌生人记录表
```sql
CREATE TABLE stranger_record (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(50),
  recog_type VARCHAR(20) NOT NULL,
  recog_time DATETIME NOT NULL,
  photo TEXT,
  gender INT,
  body_temperature VARCHAR(10),
  confidence VARCHAR(10),
  device_sn VARCHAR(50),
  location JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_recog_time (recog_time),
  INDEX idx_device_sn (device_sn)
);
```

### 2. 扩展签到记录表
```sql
ALTER TABLE volunteer_check_in 
ADD COLUMN photo TEXT COMMENT '签到照片路径',
ADD COLUMN device_sn VARCHAR(50) COMMENT '设备号',
ADD COLUMN body_temperature VARCHAR(10) COMMENT '体温',
ADD COLUMN confidence VARCHAR(10) COMMENT '识别置信度',
ADD COLUMN pass_status INT COMMENT '通过状态',
ADD COLUMN location JSON COMMENT '位置信息',
ADD INDEX idx_device_sn (device_sn);
```

### 3. 签到规则配置表
```sql
CREATE TABLE checkin_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(50) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT INTO checkin_config (config_key, config_value, description) VALUES
('work_start_time', '08:00:00', '上班时间'),
('work_end_time', '18:00:00', '下班时间'),
('temp_threshold', '37.3', '体温阈值'),
('duplicate_interval', '300', '重复签到间隔（秒）');
```

### 4. 补签记录表
```sql
CREATE TABLE checkin_makeup (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lotus_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  check_in TIME NOT NULL,
  reason TEXT NOT NULL,
  approver VARCHAR(50),
  approved_at TIMESTAMP,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_lotus_id (lotus_id),
  INDEX idx_date (date),
  FOREIGN KEY (lotus_id) REFERENCES volunteer(lotus_id)
);
```

## API 接口建议

### 查询接口
```
GET /api/v1/checkin/records - 签到记录列表
GET /api/v1/checkin/records/:id - 签到记录详情
GET /api/v1/checkin/statistics - 签到统计
GET /api/v1/checkin/anomalies - 异常记录
GET /api/v1/checkin/stranger - 陌生人记录列表
```

### 管理接口
```
POST /api/v1/checkin/makeup - 补签
DELETE /api/v1/checkin/records/:id - 删除记录
PUT /api/v1/checkin/config - 更新配置
GET /api/v1/checkin/config - 获取配置
```

### 导出接口
```
GET /api/v1/checkin/export/excel - 导出 Excel
GET /api/v1/checkin/export/pdf - 导出 PDF
```

## 代码结构建议

```
src/modules/checkin/
├── index.ts              # 路由（简洁）
├── service.ts            # 业务逻辑
├── model.ts              # 数据模型
├── config.ts             # Swagger 配置
├── types.ts              # 类型定义
├── errors.ts             # 错误定义
├── utils/                # 工具函数
│   ├── validator.ts      # 验证工具
│   ├── statistics.ts     # 统计工具
│   └── export.ts         # 导出工具
└── services/             # 子服务
    ├── record.service.ts # 记录处理
    ├── stranger.service.ts # 陌生人处理
    ├── statistics.service.ts # 统计服务
    └── export.service.ts # 导出服务
```

## 测试建议

### 单元测试
- 验证逻辑测试
- 重复检查测试
- 时间处理测试

### 集成测试
- 完整签到流程测试
- 批量数据上传测试
- 异常情况测试

### 性能测试
- 815 条数据批量上传测试
- 并发签到测试
- 查询性能测试

## 监控建议

### 日志
- 签到成功/失败统计
- 异常记录统计
- 设备在线状态

### 告警
- 陌生人出现告警
- 高温告警
- 设备离线告警
- 数据库错误告警

## 下一步行动

### 立即执行（本周）
1. ✅ 优化 Controller 和 Service 结构
2. 创建陌生人记录表
3. 实现签到照片存储
4. 添加设备信息字段

### 短期目标（2周内）
1. 实现签到记录查询接口
2. 实现基础统计功能
3. 添加单元测试

### 中期目标（1个月内）
1. 实现考勤报表
2. 添加实时通知
3. 实现补签功能

### 长期目标（3个月内）
1. 完善数据分析
2. 优化性能
3. 添加更多统计维度
