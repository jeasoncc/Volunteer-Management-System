# WebSocket 协议分析与优化方案

## 当前实现 vs 文档要求

### 当前实现的字段
```typescript
{
  cmd: 'addUser',
  mode: 0,
  name: user.name,
  user_id: user.lotusId,
  user_id_card: user.idNumber,
  face_template: photoUrl,
  phone: user.phone
}
```

### 文档要求的完整字段

| 字段 | 必填 | 当前状态 | 优先级 | 说明 |
|------|------|---------|--------|------|
| cmd | ✅ | ✅ 已实现 | P0 | 指令名称 |
| user_id | ✅ | ✅ 已实现 | P0 | 用户ID |
| name | ✅ | ✅ 已实现 | P0 | 用户姓名 |
| **id_valid** | ✅ | ❌ **缺失** | P0 | **有效期（必填！）** |
| user_id_card | ❌ | ✅ 已实现 | P1 | 身份证号 |
| face_template | ❌ | ✅ 已实现 | P0 | 人脸照片 |
| phone | ❌ | ✅ 已实现 | P2 | 手机号 |
| mode | ❌ | ✅ 已实现 | P1 | 录入模式 |
| **user_type** | ❌ | ❌ 缺失 | P1 | 用户类型（正常/访客/黑名单） |
| **effect_time** | ❌ | ❌ 缺失 | P1 | 生效时间 |
| **valid_cycle** | ❌ | ❌ 缺失 | P2 | 通行周期 |
| **tts_name** | ❌ | ❌ 缺失 | P2 | 多音字处理 |
| Ic | ❌ | ❌ 缺失 | P2 | IC卡号 |
| password | ❌ | ❌ 缺失 | P2 | 开门密码 |
| confidence_level | ❌ | ❌ 缺失 | P3 | 置信度 |
| pass_rule_id | ❌ | ❌ 缺失 | P3 | 通行规则ID |
| max_pass_count | ❌ | ❌ 缺失 | P3 | 可通行次数 |
| voice | ❌ | ❌ 缺失 | P3 | 自定义语音 |
| association_ids | ❌ | ❌ 缺失 | P3 | 关联识别 |

## 🚨 严重问题

### 1. 缺少必填字段 `id_valid`
```typescript
// ❌ 当前：没有传 id_valid
{
  cmd: 'addUser',
  user_id: 'LZ-V-001',
  name: '张三'
}

// ✅ 应该：
{
  cmd: 'addUser',
  user_id: 'LZ-V-001',
  name: '张三',
  id_valid: ''  // 空字符串表示永久有效
}
```

### 2. 错误码处理不完整
```typescript
// 文档定义的错误码
0:  成功
11: 没有找到有效人脸
12: 人脸宽度不符合标准
13: 人脸高度不符合标准
14: 人脸清晰度不符合标准
15: 人脸亮度不符合标准
16: 人脸亮度标准差不符合标准

// ❌ 当前：只判断 code === 0
if (code === 0) {
  // 成功
} else {
  // 失败（不知道具体原因）
}

// ✅ 应该：详细的错误处理
const ERROR_MESSAGES = {
  0: '成功',
  11: '没有找到有效人脸',
  12: '人脸宽度不符合标准',
  13: '人脸高度不符合标准',
  14: '人脸清晰度不符合标准',
  15: '人脸亮度不符合标准',
  16: '人脸亮度标准差不符合标准'
}
```

## 📊 优化方案

### 优先级 P0（必须实现）

#### 1. 添加 `id_valid` 字段
```typescript
interface AddUserCommand {
  cmd: 'addUser'
  mode: number
  name: string
  user_id: string
  user_id_card: string
  face_template: string
  phone: string
  id_valid: string  // ✅ 新增：必填字段
}
```

#### 2. 完善错误码处理
```typescript
static async handleAddUserResult(userId: string, code: number, msg: string) {
  const ERROR_MESSAGES: Record<number, string> = {
    0: '成功',
    11: '没有找到有效人脸',
    12: '人脸宽度不符合标准',
    13: '人脸高度不符合标准',
    14: '人脸清晰度不符合标准',
    15: '人脸亮度不符合标准',
    16: '人脸亮度标准差不符合标准',
  }
  
  const errorMessage = ERROR_MESSAGES[code] || msg || '未知错误'
  
  if (code === 0) {
    // 成功
  } else {
    // 失败，记录详细原因
    syncProgressManager.incrementFailed(userId, userName, errorMessage)
  }
}
```

### 优先级 P1（强烈建议）

#### 3. 添加 `user_type` 支持
```typescript
// 数据库 schema 添加字段
export const volunteer = pgTable('volunteer', {
  // ... 现有字段
  userType: integer('user_type').default(0), // 0=正常, 2=访客, 10=黑名单
  effectTime: timestamp('effect_time'),      // 生效时间
  validUntil: timestamp('valid_until'),      // 过期时间
})

// 下发时使用
const command: AddUserCommand = {
  cmd: 'addUser',
  mode: 0,
  name: user.name,
  user_id: user.lotusId!,
  user_id_card: user.idNumber,
  face_template: photoUrl,
  phone: user.phone,
  user_type: user.userType || 0,
  effect_time: user.effectTime ? formatDate(user.effectTime) : '',
  id_valid: user.validUntil ? formatDate(user.validUntil) : '',
}
```

#### 4. 添加 `effect_time` 和 `id_valid`
```typescript
// 义工表单添加字段
<FormField label="生效时间">
  <DatePicker value={effectTime} onChange={setEffectTime} />
</FormField>

<FormField label="有效期">
  <DatePicker value={validUntil} onChange={setValidUntil} />
  <Checkbox label="永久有效" checked={isPermanent} />
</FormField>
```

### 优先级 P2（建议实现）

#### 5. 多音字处理 `tts_name`
```typescript
// 数据库添加字段
ttsName: text('tts_name')  // 播报名称

// 表单添加
<FormField label="播报名称（多音字）">
  <Input 
    placeholder="例如：善当当（用于单当当）" 
    value={ttsName}
  />
  <p className="text-xs text-muted-foreground">
    仅当姓名有多音字时填写，用于正确播报
  </p>
</FormField>
```

#### 6. 通行周期 `valid_cycle`
```typescript
// 添加时间段管理
interface ValidCycle {
  start_time: string  // "07:00"
  end_time: string    // "08:00"
}

// UI 组件
<FormField label="通行时间段">
  <Button onClick={addTimeSlot}>添加时间段</Button>
  {validCycles.map((cycle, i) => (
    <div key={i}>
      <TimePicker value={cycle.start_time} />
      <span>至</span>
      <TimePicker value={cycle.end_time} />
      <Button onClick={() => removeTimeSlot(i)}>删除</Button>
    </div>
  ))}
</FormField>
```

#### 7. IC卡号支持
```typescript
// 数据库添加
icCard: text('ic_card')  // IC卡号

// 下发时包含
const command = {
  // ... 其他字段
  Ic: user.icCard || '',
}
```

### 优先级 P3（可选）

#### 8. 开门密码
```typescript
password: text('password')  // 开门密码（纯数字）

// 验证
if (password && !/^\d+$/.test(password)) {
  throw new Error('密码只能为纯数字')
}
```

#### 9. 通行次数限制
```typescript
maxPassCount: integer('max_pass_count')      // 可通行次数
passCountCycle: bigint('pass_count_cycle')   // 计算周期
```

## 🔧 数据库 Schema 扩展

```typescript
export const volunteer = pgTable('volunteer', {
  // ===== 现有字段 =====
  id: serial('id').primaryKey(),
  lotusId: text('lotus_id').unique(),
  name: text('name').notNull(),
  idNumber: text('id_number'),
  phone: text('phone'),
  avatar: text('avatar'),
  status: text('status').default('active'),
  syncToAttendance: boolean('sync_to_attendance').default(false),
  
  // ===== P0: 必须添加 =====
  validUntil: timestamp('valid_until'),  // 有效期（必填）
  
  // ===== P1: 强烈建议 =====
  userType: integer('user_type').default(0),  // 用户类型
  effectTime: timestamp('effect_time'),       // 生效时间
  
  // ===== P2: 建议添加 =====
  ttsName: text('tts_name'),           // 播报名称
  icCard: text('ic_card'),             // IC卡号
  validCycle: json('valid_cycle'),     // 通行周期
  
  // ===== P3: 可选 =====
  password: text('password'),                    // 开门密码
  confidenceLevel: real('confidence_level'),     // 置信度
  maxPassCount: integer('max_pass_count'),       // 通行次数
  passCountCycle: bigint('pass_count_cycle'),    // 计算周期
  voice: text('voice'),                          // 自定义语音
  associationIds: json('association_ids'),       // 关联识别
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

## 📝 实施步骤

### 第一阶段：修复严重问题（1小时）
1. ✅ 添加 `id_valid` 字段到命令
2. ✅ 完善错误码处理
3. ✅ 测试基本功能

### 第二阶段：核心功能（2-3小时）
1. ✅ 数据库添加 `validUntil`, `effectTime`, `userType`
2. ✅ 前端表单添加对应字段
3. ✅ 更新下发逻辑
4. ✅ 测试访客、黑名单功能

### 第三阶段：增强功能（3-4小时）
1. ✅ 实现多音字处理
2. ✅ 实现通行周期
3. ✅ 实现IC卡支持
4. ✅ 完善UI和用户体验

### 第四阶段：高级功能（可选）
1. 开门密码管理
2. 通行次数限制
3. 自定义语音
4. 关联识别

## 🎯 快速修复（立即可做）

最小改动，修复必填字段问题：

```typescript
// apps/api/src/modules/ws/service.ts
const command: AddUserCommand = {
  cmd: 'addUser',
  mode: 0,
  name: user.name,
  user_id: user.lotusId!,
  user_id_card: user.idNumber,
  face_template: photoUrl,
  phone: user.phone,
  id_valid: '',  // ✅ 添加这一行，空字符串表示永久有效
}
```

## 📚 参考资料

- 用户类型说明：
  - 0: 正常用户
  - 2: 访客（到期自动删除）
  - 10: 黑名单（识别后报警）
  - 20: 只测温不开门
  - 21: 刷证即过
  - 22: 不走在线验证
  - 23: 会议模式不受限制

- 时间格式：
  - `yyyy-MM-dd` 或 `yyyy-MM-dd HH:mm`
  - 空字符串 `""` 表示永久

- Mode 说明：
  - 0: 立即录入，WebSocket 返回结果
  - 1: 先存储后录入，HTTP 返回结果
  - 2: 只保存图片，不录入算法库
