# 考勤设备接口文档

## 概述

本文档说明考勤设备与服务器的接口规范。

## 接口地址

- **人脸识别签到**: `POST /api/v1/record/face`
- **陌生人记录**: `POST /api/v1/stranger`

## 请求格式

### 通用格式

```json
{
  "sn": "设备号",
  "Count": 1,
  "logs": [记录数组]
}
```

### 记录字段说明

#### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | string | 人员ID（lotusId） |
| `recog_type` | string | 识别类型 |
| `recog_time` | string | 识别时间（格式：yyyy-MM-dd HH:mm:ss） |
| `gender` | number | 性别（0=男，1=女，-1=未知） |

#### 识别类型（recog_type）

- `face` - 人脸识别
- `password` - 密码开门
- `manual` - 远程开门
- `card` - 刷卡开门
- `fingerprint` - 指纹验证
- `blacklist` - 黑名单记录
- `high_temperature` - 高温
- `palm_print` - 掌纹识别
- `iris` - 虹膜识别
- `face_iris` - 人脸加虹膜
- `palm_vein` - 掌静脉

#### 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `photo` | string | 识别照片（base64） |
| `pass_status` | number | 开门状态（0=开门，1=未开门，2=关联识别） |
| `user_name` | string | 用户名 |
| `user_type` | number | 用户类型 |
| `body_temperature` | string | 体温 |
| `confidence` | string | 置信度 |
| `reflectivity` | number | 设备反射率 |
| `room_temperature` | number | 室温 |
| `card_number` | string | 卡号 |
| `password` | string | 开门密码 |
| `qr_code` | string | 访客二维码内容 |
| `health_code_color` | string | 健康码颜色 |
| `health_code_info` | object | 健康码详细数据 |
| `alcohol_result` | string | 酒精检测数值 |
| `alcohol_pass` | number | 酒精检测结果（0=合格，1=异常） |
| `location` | object | 位置信息 |
| `panoramic_picture` | string | 全景照片 |
| `signature` | string | 签名 |
| `extra` | string | 额外参数 |
| `action` | string | 按钮标识 |
| `association_mark` | string | 关联识别标识 |

## 响应格式

### 成功响应

```json
{
  "success": true,
  "Result": 0,
  "Msg": "签到成功",
  "reason": "SUCCESS",
  "data": {
    "lotusId": "LZ-V-6020135",
    "name": "陈璋",
    "checkIn": "10:00:00"
  }
}
```

### 重复记录响应

```json
{
  "success": true,
  "Result": 0,
  "Msg": "记录已存在（重复签到）",
  "reason": "DUPLICATE_RECORD",
  "data": {
    "lotusId": "LZ-V-6020135",
    "existing_id": 12345
  }
}
```

### 失败响应

#### 用户不存在

```json
{
  "success": false,
  "Result": 0,
  "Msg": "用户不存在: LZ-V-NOTEXIST",
  "reason": "USER_NOT_FOUND",
  "data": {
    "user_id": "LZ-V-NOTEXIST"
  }
}
```

#### 时间格式错误

```json
{
  "success": false,
  "Result": 0,
  "Msg": "时间格式错误: invalid-time",
  "reason": "INVALID_TIME_FORMAT",
  "data": {
    "user_id": "LZ-V-6020135",
    "recog_time": "invalid-time"
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `Result` | number | 设备要求的结果码（0=成功） |
| `Msg` | string | 消息说明 |
| `reason` | string | 失败原因代码 |
| `data` | object | 详细数据 |

### 失败原因代码（reason）

| 代码 | 说明 | 处理建议 |
|------|------|----------|
| `SUCCESS` | 签到成功 | - |
| `DUPLICATE_RECORD` | 重复记录 | 正常，无需处理 |
| `USER_NOT_FOUND` | 用户不存在 | 检查用户是否已在系统中注册 |
| `INVALID_TIME_FORMAT` | 时间格式错误 | 检查时间格式是否为 yyyy-MM-dd HH:mm:ss |
| `DATABASE_ERROR` | 数据库错误 | 联系管理员 |

### 重要说明

⚠️ **所有情况都返回 `Result: 0`**

- 无论成功还是失败，都返回 `Result: 0`
- 这样可以避免设备无限重试
- 通过 `success` 和 `reason` 字段判断实际结果
- 失败原因会在 `Msg` 和 `reason` 中详细说明

## 请求示例

### 人脸识别签到

```bash
curl -X POST http://localhost:3001/api/v1/record/face \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "YET88476",
    "Count": 1,
    "logs": [{
      "user_id": "LZ-V-6020135",
      "recog_type": "face",
      "recog_time": "2024-11-15 12:00:00",
      "gender": 0,
      "photo": "",
      "user_name": "陈璋",
      "body_temperature": "36.5",
      "confidence": "95.5",
      "reflectivity": 86,
      "room_temperature": 25.5,
      "pass_status": 0
    }]
  }'
```

### 陌生人记录

陌生人记录在以下情况下触发：

1. 设备设置为"任何人可通行"时
2. 设备本机录入的用户（user_id 以 `DL` 开头）

```bash
curl -X POST http://localhost:3001/api/v1/stranger \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "YET88476",
    "Count": 1,
    "logs": [{
      "user_id": "DL_stranger_001",
      "recog_type": "face",
      "recog_time": "2024-11-15 12:05:00",
      "gender": 0,
      "user_name": "陌生人",
      "body_temperature": "36.5",
      "confidence": "50.5"
    }]
  }'
```

## 测试

运行测试脚本：

```bash
bash test-checkin.sh
```

## 数据流程

```
考勤设备
    ↓
识别成功
    ↓
判断用户类型
    ├─→ 已注册用户 → POST /api/v1/record/face
    └─→ 陌生人 → POST /api/v1/stranger
         ↓
    服务器处理
         ↓
    返回 Result: 0
         ↓
    设备删除本地记录
```

## 注意事项

1. **时间格式**: 必须是 `yyyy-MM-dd HH:mm:ss`
2. **user_id**: 使用 lotusId（如 `LZ-V-6020135`）
3. **照片数据**: base64 编码的图片数据
4. **重复签到**: 系统会自动检测并返回成功（避免重复记录）
5. **设备号**: 每个设备有唯一的 sn 编号

## 故障排查

### 设备一直重试上传

**原因**: 服务器没有返回 `Result: 0`

**解决**: 检查服务器日志，确保响应格式正确

### 记录未保存

**原因**: 数据格式不正确或必填字段缺失

**解决**: 
1. 检查请求数据格式
2. 确保必填字段都有值
3. 查看服务器日志

### 陌生人记录未触发

**原因**: user_id 格式不正确

**解决**: 陌生人的 user_id 应该以 `DL` 开头

## 相关文档

- API 文档: http://localhost:3001/swagger
- 测试脚本: `test-checkin.sh`


## 验证逻辑

系统会对每条上传的记录进行多维度验证：

### 1. 用户验证
- 检查 `user_id`（lotusId）是否存在于系统中
- 如果不存在，返回 `USER_NOT_FOUND`

### 2. 时间验证
- 检查 `recog_time` 格式是否正确（yyyy-MM-dd HH:mm:ss）
- 如果格式错误，返回 `INVALID_TIME_FORMAT`

### 3. 重复记录检查（多维度比对）
检查以下三个维度是否完全相同：
- **用户ID** (`lotusId`)
- **识别时间** (`recog_time`)
- **识别类型** (`recog_type`)

如果三个维度都相同，则认为是重复记录，返回 `DUPLICATE_RECORD`

### 4. 数据库写入
- 验证通过后，写入数据库
- 如果写入失败，返回 `DATABASE_ERROR`

## 重复记录判断示例

### 场景 1: 完全相同的记录（重复）
```json
记录 A: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="face"
记录 B: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="face"
结果: DUPLICATE_RECORD ❌
```

### 场景 2: 相同用户和时间，但不同识别类型（不重复）
```json
记录 A: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="face"
记录 B: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="card"
结果: SUCCESS ✅（允许同一时间用不同方式签到）
```

### 场景 3: 相同用户和类型，但不同时间（不重复）
```json
记录 A: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="face"
记录 B: user_id="LZ-V-001", recog_time="2024-11-16 14:00:00", recog_type="face"
结果: SUCCESS ✅（允许一天多次签到）
```

### 场景 4: 不同用户（不重复）
```json
记录 A: user_id="LZ-V-001", recog_time="2024-11-16 10:00:00", recog_type="face"
记录 B: user_id="LZ-V-002", recog_time="2024-11-16 10:00:00", recog_type="face"
结果: SUCCESS ✅（不同用户）
```

## 测试

### 运行完整测试
```bash
bash test-checkin-validation.sh
```

### 测试覆盖场景
1. ✅ 正常签到（用户存在）
2. ✅ 重复签到（相同用户+时间+类型）
3. ✅ 用户不存在
4. ✅ 时间格式错误
5. ✅ 不同时间的签到
6. ✅ 相同时间但不同识别类型

## 日志示例

### 成功签到
```
✅ 签到成功: 陈璋(LZ-V-6020135) - 2024-11-16 10:00:00
```

### 重复签到
```
⏭️  重复签到: 陈璋(LZ-V-6020135) - 2024-11-16 10:00:00
```

### 用户不存在
```
❌ 用户不存在: LZ-V-NOTEXIST
```

### 时间格式错误
```
❌ 时间格式错误: invalid-time
```
