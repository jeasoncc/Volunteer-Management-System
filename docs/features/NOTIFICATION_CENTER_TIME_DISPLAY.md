# 通知中心时间显示优化

## 修改内容

在通知中心的每一条通知上添加了详细的时间显示。

## 显示效果

### 之前
```
3分钟前
```

### 现在
```
3分钟前
2024-11-28 20:15:30
```

## 实现细节

### 1. 导入 format 函数
```typescript
import { formatDistanceToNow, format } from "date-fns";
```

### 2. 格式化时间
```typescript
const timestamp = new Date(notification.timestamp);
const timeAgo = formatDistanceToNow(timestamp, {
  addSuffix: true,
  locale: zhCN,
});
const fullTime = format(timestamp, "yyyy-MM-dd HH:mm:ss");
```

### 3. 显示两行时间
```typescript
<div className="flex flex-col">
  <span className="text-xs text-muted-foreground" title={fullTime}>
    {timeAgo}
  </span>
  <span className="text-xs text-muted-foreground/70">
    {fullTime}
  </span>
</div>
```

## 时间格式

- **相对时间**：`3分钟前`、`1小时前`、`2天前`
- **具体时间**：`2024-11-28 20:15:30`（年-月-日 时:分:秒）

## 用户体验

### 优点
1. **相对时间**：快速了解通知的新旧程度
2. **具体时间**：精确知道通知的发生时间
3. **鼠标悬停**：相对时间上悬停也会显示完整时间（title 属性）

### 显示位置
- 位于通知消息下方
- 左侧显示时间
- 右侧显示操作按钮

## 示例

### 设备同步通知
```
🔵 设备同步
开始同步
正在下发 10 个人员信息到考勤机

3分钟前
2024-11-28 20:15:30

[查看进度]
```

### 用户失败通知
```
🔴 警告
用户同步失败
张三(LHZ0001) 同步失败：没有找到有效人脸

5分钟前
2024-11-28 20:13:15

[查看详情] [✓] [🗑]
```

### 批次完成通知
```
🟢 设备同步
同步完成
设备同步完成：成功 8，失败 2，跳过 0

10分钟前
2024-11-28 20:08:45

[查看详情]
```

## 技术细节

### date-fns 函数
- `formatDistanceToNow()`: 格式化为相对时间
- `format()`: 格式化为指定格式的时间字符串

### 时间格式化模式
- `yyyy`: 4位年份（2024）
- `MM`: 2位月份（01-12）
- `dd`: 2位日期（01-31）
- `HH`: 24小时制小时（00-23）
- `mm`: 分钟（00-59）
- `ss`: 秒（00-59）

### 样式说明
- `text-xs`: 小号字体
- `text-muted-foreground`: 次要文字颜色
- `text-muted-foreground/70`: 70% 透明度的次要文字颜色
- `flex flex-col`: 垂直排列

## 测试方法

1. 打开通知中心（点击右上角铃铛图标）
2. 查看任意通知
3. 确认显示两行时间：
   - 第一行：相对时间（如"3分钟前"）
   - 第二行：具体时间（如"2024-11-28 20:15:30"）
4. 鼠标悬停在相对时间上，确认显示完整时间

## 相关文件

- `apps/web/src/components/NotificationCenter.tsx` - 通知中心组件
- `apps/web/src/types/notification.ts` - 通知类型定义
- `apps/web/src/hooks/useNotifications.ts` - 通知管理 Hook

## 更新日志

**2024-11-28**
- ✅ 添加具体时间显示
- ✅ 保留相对时间显示
- ✅ 添加 title 属性用于悬停提示
- ✅ 优化样式和布局
