# 实时数据功能说明

## 概述

为 care-web 官网添加了实时数据展示功能，展示义工服务和考勤数据。

## 新增功能

### 1. 实时统计页面 (`/stats`)

展示以下实时数据：

- **注册义工总数**：系统中所有注册的义工数量
- **活跃义工数**：本月有签到记录的义工数量
- **累计服务时长**：所有义工的累计服务小时数
- **今日签到数**：今天的签到记录数量

### 2. 今日签到动态

实时展示最新的10条签到记录，包括：
- 义工姓名
- 签到时间
- 签到地点
- 签到状态（正常/迟到）

数据每30秒自动刷新。

### 3. 本月服务排行榜

展示本月服务时长前10名的义工，包括：
- 排名
- 义工姓名
- 出勤天数
- 累计服务时长
- 日均服务时长

### 4. 首页数据预览

在首页展示核心统计数据，让访客快速了解组织规模和活跃度。

## 技术实现

### 前端 (care-web)

**新增文件：**
- `src/lib/api.ts` - API 客户端
- `src/components/stats/StatsCard.tsx` - 统计卡片组件
- `src/components/stats/RealtimeCheckIns.tsx` - 实时签到组件
- `src/pages/StatsPage.tsx` - 统计页面
- `src/routes/stats.tsx` - 路由配置

**修改文件：**
- `src/components/Header.tsx` - 添加"实时数据"导航链接
- `src/pages/HomePage.tsx` - 丰富首页内容，添加数据预览

### 后端 (API)

**新增文件：**
- `src/modules/stats/index.ts` - 统计数据模块

**新增接口：**

1. `GET /api/stats/volunteers` - 获取义工统计数据
   ```json
   {
     "totalVolunteers": 156,
     "activeVolunteers": 89,
     "totalServiceHours": 12450,
     "todayCheckIns": 34
   }
   ```

2. `GET /api/stats/checkins/today` - 获取今日签到记录
   ```json
   {
     "records": [
       {
         "id": 1,
         "lotusId": "LH001",
         "name": "张三",
         "date": "2025-11-28",
         "checkIn": "08:30:00",
         "status": "present",
         "location": "深圳市龙岗区..."
       }
     ]
   }
   ```

3. `GET /api/stats/leaderboard/monthly?year=2025&month=11` - 获取月度排行榜
   ```json
   {
     "summaries": [
       {
         "lotusId": "LH001",
         "name": "张三",
         "totalHours": 120.5,
         "presentDays": 20,
         "avgHoursPerDay": 6.0
       }
     ]
   }
   ```

## 配置

### 环境变量

在 `apps/care-web/.env` 中配置 API 地址：

```env
VITE_API_URL=http://localhost:3001
```

生产环境：
```env
VITE_API_URL=https://api.lianhuazhai.org
```

## 部署

### 开发环境

1. 启动 API 服务：
   ```bash
   cd apps/api
   bun run dev
   ```

2. 启动 care-web：
   ```bash
   cd apps/care-web
   bun run dev
   ```

3. 访问 http://localhost:4000/stats

### 生产环境

1. 构建前端：
   ```bash
   cd apps/care-web
   bun run build
   ```

2. 配置 Nginx 反向代理：
   ```nginx
   location /api/ {
     proxy_pass http://localhost:3001/api/;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
   }
   ```

## 数据更新机制

- **统计数据**：每60秒自动刷新
- **签到记录**：每30秒自动刷新
- **排行榜**：页面加载时获取，不自动刷新

## 性能优化

1. **数据库查询优化**：
   - 使用索引加速查询
   - 使用聚合函数减少数据传输

2. **前端优化**：
   - 使用 React 状态管理避免重复请求
   - 实现加载状态提升用户体验

3. **缓存策略**（可选）：
   - 可在 API 层添加 Redis 缓存
   - 统计数据缓存5分钟

## 未来扩展

1. **WebSocket 实时推送**：
   - 新签到时实时推送到前端
   - 无需轮询，降低服务器压力

2. **更多统计维度**：
   - 按部门统计
   - 按服务类型统计
   - 历史趋势图表

3. **数据导出**：
   - 支持导出 Excel
   - 生成统计报告

## 注意事项

1. 所有统计接口都是公开的，不需要认证
2. 数据已脱敏，不包含敏感信息
3. 建议在生产环境添加 API 限流保护
