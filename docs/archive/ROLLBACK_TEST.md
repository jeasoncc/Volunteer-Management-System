# 回滚测试

## 问题

添加 `id_valid` 字段后，所有用户都无法下发成功。

## 测试方案

### 版本 A：不包含 id_valid（当前）

```typescript
const command = {
  cmd: 'addUser',
  mode: 0,
  name: user.name,
  user_id: user.lotusId,
  user_id_card: user.idNumber || '',
  face_template: photoUrl,
  phone: user.phone || '',
  // 没有 id_valid
}
```

### 版本 B：包含 id_valid（之前）

```typescript
const command = {
  cmd: 'addUser',
  mode: 0,
  name: user.name,
  user_id: user.lotusId,
  user_id_card: user.idNumber || '',
  face_template: photoUrl,
  phone: user.phone || '',
  id_valid: '',  // 添加了这个字段
}
```

## 测试步骤

1. **当前版本（版本 A）**
   - 重启后端
   - 尝试下发单个用户
   - 尝试批量下发
   - 记录结果

2. **如果版本 A 成功**
   - 说明 `id_valid` 字段导致问题
   - 可能原因：
     - 考勤机固件版本不支持此字段
     - 字段格式不正确
     - 字段值不符合要求

3. **如果版本 A 仍然失败**
   - 说明问题不在 `id_valid`
   - 需要检查其他改动：
     - `|| ''` 的空字符串处理
     - 日志输出
     - 其他逻辑变更

## 可能的根本原因

### 1. id_valid 字段问题

**假设**：考勤机不接受空字符串的 `id_valid`

**解决方案**：
- 方案 1：完全不传 `id_valid` 字段
- 方案 2：传递有效的日期格式
- 方案 3：传递 null 而不是空字符串

### 2. 字段顺序问题

**假设**：考勤机对字段顺序敏感

**解决方案**：
- 按照文档示例的顺序排列字段

### 3. 类型问题

**假设**：某些字段类型不匹配

**解决方案**：
- 检查 mode 是否应该是字符串
- 检查其他数值字段

## 下一步

### 如果版本 A 成功

1. 确认 `id_valid` 是问题根源
2. 研究正确的 `id_valid` 格式
3. 可能需要：
   - 查看考勤机固件版本
   - 查看设备支持的协议版本
   - 联系设备厂商确认

### 如果版本 A 失败

1. 对比更早的工作版本
2. 逐个回滚改动
3. 找出真正的问题点

## 测试记录

### 测试 1：版本 A（不含 id_valid）

- 时间：
- 结果：
- 日志：

### 测试 2：其他发现

- 
