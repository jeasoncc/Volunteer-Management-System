# WebSocket 协议快速修复

## ✅ 已修复（立即生效）

### 1. 添加必填字段 `id_valid`
```typescript
// ✅ 修复前：缺少必填字段
{
  cmd: 'addUser',
  user_id: 'LZ-V-001',
  name: '张三'
}

// ✅ 修复后：包含必填字段
{
  cmd: 'addUser',
  user_id: 'LZ-V-001',
  name: '张三',
  id_valid: ''  // 空字符串表示永久有效
}
```

### 2. 完善错误码处理
```typescript
// ✅ 现在支持详细的错误信息
0:  成功
11: 没有找到有效人脸
12: 人脸宽度不符合标准
13: 人脸高度不符合标准
14: 人脸清晰度不符合标准
15: 人脸亮度不符合标准
16: 人脸亮度标准差不符合标准
```

### 3. 扩展命令接口
```typescript
export interface AddUserCommand {
  // 必填字段
  cmd: 'addUser'
  mode: number
  name: string
  user_id: string
  user_id_card: string
  face_template: string
  phone: string
  id_valid: string  // ✅ 新增必填
  
  // 可选字段（已定义，待实现）
  user_type?: number
  effect_time?: string
  tts_name?: string
  Ic?: string
  confidence_level?: number
  valid_cycle?: Array<{ start_time: string; end_time: string }>
}
```

## 📋 下一步优化（按优先级）

### P1: 用户类型和有效期（强烈建议）

**业务价值**：
- 支持访客管理（自动过期）
- 支持黑名单功能（识别报警）
- 支持临时人员（指定有效期）

**实施步骤**：

1. 数据库迁移
```typescript
// 创建迁移文件
export async function up(db: Database) {
  await db.schema
    .alterTable('volunteer')
    .addColumn('user_type', 'integer', col => col.defaultTo(0))
    .addColumn('effect_time', 'timestamp')
    .addColumn('valid_until', 'timestamp')
    .execute()
}
```

2. 更新 Schema
```typescript
export const volunteer = pgTable('volunteer', {
  // ... 现有字段
  userType: integer('user_type').default(0),
  effectTime: timestamp('effect_time'),
  validUntil: timestamp('valid_until'),
})
```

3. 前端表单
```tsx
<FormField label="用户类型">
  <Select value={userType} onValueChange={setUserType}>
    <SelectItem value="0">正常用户</SelectItem>
    <SelectItem value="2">访客（到期自动删除）</SelectItem>
    <SelectItem value="10">黑名单（识别报警）</SelectItem>
    <SelectItem value="20">只测温不开门</SelectItem>
  </Select>
</FormField>

<FormField label="有效期">
  <DatePicker value={validUntil} onChange={setValidUntil} />
  <Checkbox 
    label="永久有效" 
    checked={isPermanent}
    onCheckedChange={(checked) => {
      if (checked) setValidUntil(null)
    }}
  />
</FormField>
```

4. 更新下发逻辑
```typescript
const command: AddUserCommand = {
  // ... 现有字段
  user_type: user.userType || 0,
  effect_time: user.effectTime 
    ? format(user.effectTime, 'yyyy-MM-dd HH:mm') 
    : '',
  id_valid: user.validUntil 
    ? format(user.validUntil, 'yyyy-MM-dd HH:mm') 
    : '',
}
```

### P2: 多音字和通行周期（建议实现）

**业务价值**：
- 正确播报多音字姓名
- 精确控制通行时间段

**实施步骤**：

1. 数据库
```typescript
ttsName: text('tts_name'),
validCycle: json('valid_cycle'),
```

2. 前端
```tsx
<FormField label="播报名称（可选）">
  <Input 
    placeholder="例如：善当当（用于单当当）"
    value={ttsName}
  />
  <p className="text-xs text-muted-foreground">
    仅当姓名有多音字时填写
  </p>
</FormField>

<FormField label="通行时间段">
  {validCycles.map((cycle, i) => (
    <div key={i} className="flex gap-2">
      <TimePicker value={cycle.start_time} />
      <span>至</span>
      <TimePicker value={cycle.end_time} />
      <Button onClick={() => removeTimeSlot(i)}>删除</Button>
    </div>
  ))}
  <Button onClick={addTimeSlot}>添加时间段</Button>
</FormField>
```

### P3: IC卡和密码（可选）

**业务价值**：
- 支持IC卡开门
- 支持密码开门

**实施步骤**：

1. 数据库
```typescript
icCard: text('ic_card'),
password: text('password'),
```

2. 前端
```tsx
<FormField label="IC卡号">
  <Input value={icCard} onChange={setIcCard} />
</FormField>

<FormField label="开门密码">
  <Input 
    type="password"
    value={password}
    onChange={setPassword}
    pattern="[0-9]*"
  />
  <p className="text-xs text-muted-foreground">
    只能为纯数字
  </p>
</FormField>
```

## 🎯 推荐实施顺序

### 第一周：修复和基础功能
- [x] 修复 `id_valid` 必填字段
- [x] 完善错误码处理
- [ ] 实现用户类型（P1）
- [ ] 实现有效期管理（P1）

### 第二周：增强功能
- [ ] 实现多音字处理（P2）
- [ ] 实现通行周期（P2）
- [ ] 完善UI和用户体验

### 第三周：可选功能
- [ ] IC卡支持（P3）
- [ ] 密码开门（P3）
- [ ] 通行次数限制（P3）

## 📊 影响评估

### 当前修复的影响
- ✅ 符合协议规范
- ✅ 避免下发失败
- ✅ 更详细的错误信息
- ✅ 无需数据库变更
- ✅ 向后兼容

### P1 功能的影响
- 需要数据库迁移
- 需要更新前端表单
- 需要更新下发逻辑
- 预计工作量：2-3小时

## 🧪 测试建议

### 测试用例

1. **基本下发**
   - 下发正常用户
   - 验证 `id_valid` 字段存在
   - 验证考勤机正常录入

2. **错误处理**
   - 下发无效照片（测试错误码 11-16）
   - 验证错误信息正确显示
   - 验证日志记录详细原因

3. **访客功能**（P1 实现后）
   - 下发访客用户（user_type=2）
   - 设置过期时间
   - 验证到期后自动删除

4. **黑名单功能**（P1 实现后）
   - 下发黑名单用户（user_type=10）
   - 验证识别后报警

## 📝 注意事项

1. **user_id 不能以 DL 开头**
   - 文档明确说明
   - 建议在下发前验证

2. **照片格式**
   - 支持 HTTP 链接
   - 支持 Base64 编码
   - 当前使用 HTTP 链接

3. **时间格式**
   - `yyyy-MM-dd` 或 `yyyy-MM-dd HH:mm`
   - 空字符串表示永久

4. **IC卡号类型**
   - 默认十六进制
   - 十进制需要在设备上设置

## 🔗 相关文档

- `WEBSOCKET_PROTOCOL_ANALYSIS.md` - 完整协议分析
- `apps/api/src/modules/ws/service.ts` - 服务实现
- `apps/api/src/modules/ws/model.ts` - 数据模型
