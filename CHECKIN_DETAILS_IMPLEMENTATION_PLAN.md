# 考勤详情功能实现方案

## 问题分析

### 现状
1. ✅ 有考勤汇总（summary）接口 - `volunteer_checkin_summary` 表
2. ✅ 有月度报表功能
3. ✅ 有导出功能
4. ❌ **缺少原始打卡记录（raw records）的详细查询接口** - `volunteer_checkin` 表
5. ❌ **缺少考勤详情页面**

### 数据表结构

#### volunteer_checkin（原始打卡记录）
```sql
- id: 记录ID
- user_id: 用户ID
- date: 日期
- check_in: 打卡时间
- check_out: 签退时间（可选）
- status: 状态（present, late, early_leave, absent, on_leave）
- location: 地点
- notes: 备注
- origin_time: 原始时间
- record_type: 记录类型（face, manual）
- created_at: 创建时间
- updated_at: 更新时间
```

#### volunteer_checkin_summary（汇总记录）
```sql
- id: 汇总ID
- user_id: 用户ID
- lotus_id: 莲花斋ID
- name: 姓名
- date: 日期
- first_checkin_time: 首次打卡时间
- last_checkin_time: 最后打卡时间
- checkin_count: 打卡次数
- work_hours: 工时
- calculation_rule: 计算规则
- is_manual: 是否手动
- notes: 备注
```

## 实现方案

### 后端实现

#### 1. 创建原始打卡记录服务
**文件**: `apps/api/src/modules/checkin/record.service.ts`

功能：
- 查询原始打卡记录列表（支持分页、筛选）
- 根据用户查询打卡记录
- 根据日期范围查询
- 查询单条记录详情
- 创建/更新/删除打卡记录

#### 2. 添加 API 路由
**文件**: `apps/api/src/modules/checkin/index.ts`

新增路由：
- `GET /api/v1/checkin/records` - 查询原始打卡记录列表
- `GET /api/v1/checkin/records/:id` - 查询单条记录详情
- `GET /api/v1/checkin/records/user/:lotusId` - 查询用户的打卡记录
- `POST /api/v1/checkin/records` - 创建打卡记录
- `PUT /api/v1/checkin/records/:id` - 更新打卡记录
- `DELETE /api/v1/checkin/records/:id` - 删除打卡记录

### 前端实现

#### 1. 更新服务层
**文件**: `apps/web/src/services/checkin.ts`

新增方法：
- `getRawRecords()` - 获取原始打卡记录
- `getRawRecordById()` - 获取单条记录详情
- `getUserRawRecords()` - 获取用户的打卡记录
- `createRawRecord()` - 创建打卡记录
- `updateRawRecord()` - 更新打卡记录
- `deleteRawRecord()` - 删除打卡记录

#### 2. 创建考勤详情页面
**文件**: `apps/web/src/routes/checkin.details.tsx`

功能：
- 显示原始打卡记录列表
- 支持按用户、日期筛选
- 显示打卡时间、地点、状态
- 支持查看详情
- 支持编辑和删除

#### 3. 创建用户考勤详情组件
**文件**: `apps/web/src/components/UserCheckinDetails.tsx`

功能：
- 显示单个用户的考勤详情
- 时间线展示打卡记录
- 统计信息（总打卡次数、总工时等）
- 可嵌入到用户详情页

#### 4. 更新义工详情页
**文件**: `apps/web/src/routes/volunteers.$lotusId.tsx`

添加考勤详情标签页，显示该义工的考勤记录。

## 实现优先级

### P0 - 核心功能（立即实现）
1. ✅ 后端：原始打卡记录查询接口
2. ✅ 前端：考勤详情页面
3. ✅ 前端：用户考勤详情组件

### P1 - 增强功能（短期实现）
4. 考勤记录的创建/编辑/删除
5. 考勤统计图表
6. 考勤异常提醒

### P2 - 优化功能（长期实现）
7. 考勤规则配置
8. 自动考勤计算
9. 考勤报表导出

## 数据流程

```
考勤机 → 原始打卡记录（volunteer_checkin）
         ↓
      定时任务汇总
         ↓
    考勤汇总（volunteer_checkin_summary）
         ↓
      月度报表
```

## API 设计

### 查询原始打卡记录
```
GET /api/v1/checkin/records
Query:
  - page: 页码
  - pageSize: 每页数量
  - lotusId: 莲花斋ID（可选）
  - startDate: 开始日期（可选）
  - endDate: 结束日期（可选）
  - status: 状态（可选）
  - recordType: 记录类型（可选）

Response:
{
  success: true,
  data: {
    records: [...],
    total: 100,
    page: 1,
    pageSize: 20
  }
}
```

### 查询用户打卡记录
```
GET /api/v1/checkin/records/user/:lotusId
Query:
  - startDate: 开始日期
  - endDate: 结束日期

Response:
{
  success: true,
  data: {
    user: { lotusId, name, ... },
    records: [...],
    statistics: {
      totalDays: 20,
      totalHours: 160,
      avgHoursPerDay: 8
    }
  }
}
```

## UI 设计

### 考勤详情页面
```
┌─────────────────────────────────────────┐
│ 考勤详情                    [返回] [导出] │
├─────────────────────────────────────────┤
│ 筛选：                                   │
│ [开始日期] [结束日期] [莲花斋ID] [查询]  │
├─────────────────────────────────────────┤
│ 打卡记录列表                             │
│ ┌───────────────────────────────────┐   │
│ │ 日期 | 姓名 | 打卡时间 | 状态 | 操作│   │
│ │ 2024-11-27 | 张三 | 08:30 | 正常 │   │
│ │ 2024-11-27 | 李四 | 09:00 | 迟到 │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 用户考勤详情组件
```
┌─────────────────────────────────────────┐
│ 张三的考勤记录                           │
├─────────────────────────────────────────┤
│ 统计信息：                               │
│ 总打卡天数: 20 天                        │
│ 总工时: 160 小时                         │
│ 平均每天: 8 小时                         │
├─────────────────────────────────────────┤
│ 打卡记录时间线：                         │
│ ● 2024-11-27 08:30 - 17:30 (9小时)     │
│ ● 2024-11-26 08:45 - 17:15 (8.5小时)   │
│ ● 2024-11-25 09:00 - 18:00 (9小时)     │
└─────────────────────────────────────────┘
```

## 实现步骤

### 第一步：后端实现
1. 创建 `record.service.ts`
2. 添加查询接口
3. 测试接口

### 第二步：前端服务层
1. 更新 `checkin.ts` 服务
2. 添加类型定义

### 第三步：前端页面
1. 创建考勤详情页面
2. 创建用户考勤详情组件
3. 集成到导航

### 第四步：测试和优化
1. 功能测试
2. 性能优化
3. UI/UX 优化

## 预期效果

实现后，用户可以：
1. ✅ 查看所有原始打卡记录
2. ✅ 按用户、日期筛选记录
3. ✅ 查看单个用户的考勤详情
4. ✅ 在用户详情页查看考勤记录
5. ✅ 导出考勤详情数据

---

**创建时间**: 2024-11-27  
**优先级**: P0 - 核心功能  
**预计工时**: 4-6 小时
