# 满勤功能（方案一）

## 功能说明

在义工表格中显示"满勤"标记，导出考勤报表时自动为标记为满勤的义工填充每天12小时的考勤数据。

## 使用方法

### 1. 标记义工为满勤

在义工编辑页面，勾选"需要考勤全勤配置"选项（`requireFullAttendance`字段）。

### 2. 查看满勤标记

在义工管理列表中，"满勤"列会显示：
- ✅ 满勤徽章 - 已标记为满勤
- `-` - 未标记

### 3. 导出考勤报表

导出考勤报表时，系统会自动：
1. 检查义工的 `requireFullAttendance` 字段
2. 如果为 `true`，自动填充该月每天12小时的考勤数据
3. 合并实际考勤记录和满勤数据

## 数据说明

- **不写入数据库**：满勤数据只在导出时动态生成
- **不影响实际考勤**：实际打卡记录优先
- **灵活调整**：可以随时修改满勤标记

## 导出示例

```
义工：张三 (满勤)
2024-12-01: 12小时 (满勤)
2024-12-02: 8小时 (实际打卡)
2024-12-03: 12小时 (满勤)
...
总工时: 360小时
```

## 技术实现

### 前端

**文件：** `apps/web/src/components/VolunteerDataTable.tsx`

**满勤列定义：**
```typescript
{
  accessorKey: "requireFullAttendance",
  header: "满勤",
  cell: ({ row }) => {
    const requireFullAttendance = row.original.requireFullAttendance;
    return requireFullAttendance ? (
      <Badge>满勤</Badge>
    ) : (
      <span>-</span>
    );
  },
}
```

### 后端

**字段：** `volunteer.require_full_attendance`
- 类型：BOOLEAN
- 默认值：FALSE
- 说明：是否需要考勤全勤配置

### 导出逻辑（待实现）

在考勤导出功能中：
1. 获取义工的 `requireFullAttendance` 字段
2. 如果为 `true`，生成该月每天的满勤数据
3. 合并实际考勤记录
4. 导出到Excel/CSV

## 下一步

需要在考勤导出功能中实现满勤数据的动态生成逻辑。

## 优势

- ✅ 简单直接
- ✅ 数据库干净
- ✅ 灵活调整
- ✅ 不影响实际考勤
