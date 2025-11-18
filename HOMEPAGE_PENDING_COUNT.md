# 🏠 首页待审批数量显示功能

## 功能概述

在首页添加待审批义工数量的显示，让管理员一眼就能看到有多少义工申请需要处理。

## 实现内容

### 1. 统计卡片中的待审批数量 ✅

在首页的统计卡片区域添加了"待审批义工"卡片：

```tsx
<Card className={pendingCount > 0 ? "border-orange-500 bg-orange-50/50" : ""}>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">待审批义工</CardTitle>
    <AlertCircle className={`h-4 w-4 ${pendingCount > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
  </CardHeader>
  <CardContent>
    <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-orange-600" : ""}`}>
      {pendingCount}
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {pendingCount > 0 ? "需要处理" : "暂无待审批"}
    </p>
  </CardContent>
</Card>
```

**特点**：
- 🟠 **橙色高亮**：有待审批时卡片边框和背景变为橙色
- 🔔 **图标提示**：使用 AlertCircle 图标提醒
- 📊 **动态文字**：根据数量显示不同的提示文字

### 2. 快捷入口的待审批徽章 ✅

在"义工审批"快捷入口上添加待审批数量徽章：

```tsx
<Card className={`hover:shadow-md transition-shadow ${pendingCount > 0 ? "border-orange-500" : ""}`}>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      义工审批
      {pendingCount > 0 && (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full">
          {pendingCount}
        </span>
      )}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">
      {pendingCount > 0 
        ? `有 ${pendingCount} 个义工申请待审批` 
        : "审批义工申请、查看待审批列表、批量审批"}
    </p>
    <Link to="/approval">
      <Button className={`w-full ${pendingCount > 0 ? "bg-orange-500 hover:bg-orange-600" : ""}`}>
        进入义工审批 →
      </Button>
    </Link>
  </CardContent>
</Card>
```

**特点**：
- 🔴 **数字徽章**：在标题右侧显示待审批数量
- 🟠 **橙色边框**：有待审批时卡片边框变为橙色
- 📝 **动态描述**：根据数量显示不同的描述文字
- 🎨 **按钮高亮**：有待审批时按钮变为橙色

### 3. 数据查询实现 ✅

添加待审批数量的查询：

```tsx
// 获取待审批义工数量
const { data: pendingData } = useQuery({
  queryKey: ["approval", "pending", "count"],
  queryFn: () => approvalService.getPendingList({ page: 1, pageSize: 1 }),
  enabled: isAuthenticated,
});

const pendingCount = pendingData?.data?.total || 0;
```

**优化**：
- 📦 **最小化请求**：只请求 1 条数据，仅获取总数
- 🔄 **自动刷新**：使用 React Query 自动管理缓存
- 🔐 **权限控制**：仅在已登录时查询

## 视觉效果

### 首页布局

```
┌─────────────────────────────────────────────────────────────┐
│ 欢迎回来，管理员                                              │
│ 今天是 2024年11月19日 星期三                                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 义工总数      │ 待审批义工    │ 本月服务时长  │ 本月打卡次数  │
│              │ 🟠           │              │              │
│   54         │   49 🔔      │   123.5      │   456        │
│ 注册义工人数  │ 需要处理      │ 小时         │ 次           │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 义工审批 [49] │ 义工管理      │ 考勤管理      │ 管理员管理    │
│ 🟠           │              │              │              │
│ 有 49 个义工  │ 管理义工信息  │ 查看考勤记录  │ 管理系统管理员│
│ 申请待审批    │ 查看义工列表  │ 生成考勤报表  │ 权限分配      │
│              │ 添加新义工    │ 导出统计数据  │ 角色设置      │
│ [进入义工审批→]│ [进入义工管理→]│ [进入考勤管理→]│ [进入管理员管理→]│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 颜色方案

- **无待审批**：
  - 卡片：默认白色背景
  - 图标：灰色
  - 按钮：默认蓝色

- **有待审批**：
  - 卡片：橙色边框 + 浅橙色背景
  - 图标：橙色
  - 数字：橙色加粗
  - 徽章：橙色圆形徽章
  - 按钮：橙色

## 用户体验

### 管理员登录后

1. **一眼看到待审批数量**
   - 统计卡片中显眼的橙色提示
   - 快捷入口上的数字徽章

2. **快速进入审批页面**
   - 点击统计卡片（未来可添加）
   - 点击快捷入口的按钮

3. **实时更新**
   - 审批完成后自动刷新
   - 数量实时同步

### 视觉层次

```
优先级 1: 🟠 待审批义工卡片（橙色高亮）
优先级 2: 📊 其他统计卡片（默认样式）
优先级 3: 🔗 快捷入口（待审批入口橙色高亮）
```

## 数据流

```
用户登录
   ↓
首页加载
   ↓
查询待审批数量 (API: /volunteer/approval/pending?page=1&limit=1)
   ↓
获取 total 字段
   ↓
显示在统计卡片和快捷入口
   ↓
用户点击进入审批页面
   ↓
审批完成
   ↓
React Query 自动刷新缓存
   ↓
首页数量自动更新
```

## 缓存策略

### 查询键

```typescript
["approval", "pending", "count"]
```

### 刷新时机

1. **自动刷新**：
   - 页面重新获得焦点
   - 网络重新连接
   - 定时刷新（默认 5 分钟）

2. **手动刷新**：
   - 审批操作完成后
   - 用户手动刷新页面

### 缓存失效

审批操作会使以下缓存失效：
- `["approval", "pending"]` - 待审批列表
- `["approval", "pending", "count"]` - 待审批数量
- `["approval", "history"]` - 审批历史

## API 接口

### 获取待审批列表

```bash
GET /volunteer/approval/pending?page=1&limit=1
```

**响应**：
```json
{
  "success": true,
  "total": 49,
  "data": [...],
  "page": 1,
  "pageSize": 1,
  "totalPages": 49
}
```

**使用 total 字段**：
```typescript
const pendingCount = pendingData?.data?.total || 0;
```

## 测试验证

### 1. 数据显示测试

```bash
# 查询待审批数量
curl -b cookies.txt "http://localhost:3001/volunteer/approval/pending?page=1&limit=1"

# 验证响应
{
  "success": true,
  "total": 49,  ← 这个数字会显示在首页
  ...
}
```

### 2. 视觉效果测试

- ✅ 有待审批时：卡片显示橙色边框和背景
- ✅ 无待审批时：卡片显示默认样式
- ✅ 徽章显示：快捷入口标题右侧显示数字
- ✅ 按钮高亮：有待审批时按钮变为橙色

### 3. 交互测试

1. 登录系统
2. 查看首页统计卡片
3. 验证待审批数量显示
4. 点击快捷入口进入审批页面
5. 审批一个义工
6. 返回首页
7. 验证数量自动减少

## 后续优化建议

### 1. 点击统计卡片跳转

让统计卡片也可以点击跳转到审批页面：

```tsx
<Link to="/approval">
  <Card className={`cursor-pointer hover:shadow-lg transition-all ${pendingCount > 0 ? "border-orange-500 bg-orange-50/50" : ""}`}>
    ...
  </Card>
</Link>
```

### 2. 动画效果

添加数字变化的动画效果：

```tsx
import { motion } from "framer-motion";

<motion.div 
  key={pendingCount}
  initial={{ scale: 1.2, color: "#f97316" }}
  animate={{ scale: 1, color: pendingCount > 0 ? "#ea580c" : "#000" }}
  className="text-2xl font-bold"
>
  {pendingCount}
</motion.div>
```

### 3. 实时通知

使用 WebSocket 实现实时更新：

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001/approval/updates');
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'new_application') {
      queryClient.invalidateQueries({ queryKey: ["approval", "pending", "count"] });
      toast.info(`新的义工申请：${data.name}`);
    }
  };
  return () => ws.close();
}, []);
```

### 4. 趋势显示

显示待审批数量的变化趋势：

```tsx
<p className="text-xs text-muted-foreground mt-1">
  {pendingCount > 0 ? "需要处理" : "暂无待审批"}
  {trend > 0 && <span className="text-orange-500 ml-1">↑ {trend}</span>}
  {trend < 0 && <span className="text-green-500 ml-1">↓ {Math.abs(trend)}</span>}
</p>
```

## 相关文档

- [审批功能文档](./APPROVAL_FEATURE.md)
- [审批 UI 修复](./APPROVAL_UI_FIX.md)
- [审批刷新修复](./APPROVAL_REFRESH_FIX.md)

---

**实现时间**: 2024-11-19
**实现人**: Kiro AI Assistant
**功能状态**: ✅ 已完成

**现在管理员登录后，首页会显眼地显示待审批义工数量，一目了然！** 🎉
