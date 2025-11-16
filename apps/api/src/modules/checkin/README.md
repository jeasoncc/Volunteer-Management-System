# CheckIn 模块

签到模块，处理考勤设备的签到记录、陌生人记录等功能。

## 📁 模块结构

```
src/modules/checkin/
├── index.ts          # Controller - 路由定义和请求处理
├── service.ts        # Service - 业务逻辑层
├── model.ts          # DTO/Schema - 数据传输对象和验证规则
├── types.ts          # TypeScript 类型定义
├── errors.ts         # 自定义错误类
├── config.ts         # 路由配置
├── dto/              # 旧的 DTO（保留兼容）
│   └── stranger.ts
└── README.md         # 本文档
```

## 🎯 职责划分

### Controller (`index.ts`)
- ✅ 定义路由
- ✅ 参数验证
- ✅ 调用 Service 层
- ✅ 格式化响应
- ✅ 错误处理

### Service (`service.ts`)
- ✅ 业务逻辑
- ✅ 数据库操作
- ✅ 数据转换
- ✅ 文件操作（头像保存）

### Model (`model.ts`)
- ✅ DTO Schema 定义
- ✅ 请求验证规则
- ✅ 响应类型定义

### Types (`types.ts`)
- ✅ TypeScript 接口
- ✅ 数据类定义
- ✅ 工具方法

### Errors (`errors.ts`)
- ✅ 自定义错误类
- ✅ 错误响应格式化

## 📡 API 端点

### 1. 陌生人记录
```
POST /api/v1/stranger
```

**请求体：**
```json
{
  "logs": [{
    "user_id": "unknown",
    "user_name": "陌生人",
    "recog_time": "2024-01-01 10:00:00",
    ...
  }]
}
```

**响应：**
```json
{
  "success": true,
  "Result": 0,
  "Msg": "",
  "data": {...},
  "message": "JSON结构分析完成"
}
```

### 2. 人脸识别签到
```
POST /api/v1/record/face
```

**请求体：**
```json
{
  "logs": [{
    "user_id": "VOL-001",
    "user_name": "张三",
    "recog_time": "2024-01-01 09:00:00",
    "recog_type": "face",
    ...
  }]
}
```

**响应：**
```json
{
  "success": true,
  "Result": 0,
  "Msg": "",
  "data": {
    "lotusId": "VOL-001",
    "name": "张三",
    "checkIn": "09:00:00"
  },
  "message": "签到成功"
}
```

### 3. 同步用户照片
```
POST /api/v1/user/inf_photo
```

**请求体：**
```json
{
  "content": [{
    "user_id": "VOL-001",
    "vl_photo": "data:image/jpeg;base64,..."
  }]
}
```

## 🔧 使用示例

### 在其他模块中调用 Service

```typescript
import { CheckInService } from '../checkin/service';

// 处理签到
const result = await CheckInService.processFaceCheckIn({
  user_id: 'VOL-001',
  user_name: '张三',
  recog_time: '2024-01-01 09:00:00',
  // ... 其他字段
});

// 获取签到列表
const records = await CheckInService.getCheckInList({
  lotusId: 'VOL-001',
  limit: 10,
});
```

## ⚠️ 注意事项

1. **时区处理**：所有时间都会转换为上海时区（Asia/Shanghai）
2. **重复签到**：系统会自动检测并跳过重复的签到记录
3. **头像存储**：头像保存在 `public/upload/avatar/` 目录
4. **错误处理**：所有错误都会被统一捕获和格式化

## 🔄 迁移说明

### 从旧代码迁移

旧的 `dto/stranger.ts` 中的 `CheckIn` 类已被 `types.ts` 中的 `CheckInRecord` 类替代。

**旧代码：**
```typescript
import { CheckIn } from './dto/stranger';
const record = new CheckIn(data);
```

**新代码：**
```typescript
import { CheckInRecord } from './types';
const record = new CheckInRecord(data);
```

功能完全相同，只是文件位置和命名更规范。

## 📝 TODO

- [ ] 添加签到统计功能
- [ ] 添加签到记录查询接口
- [ ] 添加签到异常告警
- [ ] 完善陌生人记录处理逻辑
