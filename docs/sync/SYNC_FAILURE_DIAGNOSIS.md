# 同步失败诊断指南

## 🔍 问题：所有数据都无法下发成功

### 可能的原因

#### 1. 设备未连接 ⭐⭐⭐
**症状**：所有用户都显示"发送失败"
**检查方法**：
```bash
# 查看后端日志
# 应该看到类似：✅ 设备 YET88476 已注册
```

**解决方案**：
- 确保考勤机已连接到 WebSocket
- 检查考勤机的网络配置
- 检查 WebSocket 地址是否正确

#### 2. user_id 格式问题 ⭐⭐⭐
**症状**：考勤机返回错误
**检查方法**：
```typescript
// user_id 不能以 DL 开头
if (user.lotusId.startsWith('DL')) {
  console.error('❌ user_id 不能以 DL 开头')
}
```

**解决方案**：
- 修改 user_id 格式
- 使用 LZ-V-xxx 格式

#### 3. 照片无法访问 ⭐⭐
**症状**：考勤机返回错误码 11-16
**检查方法**：
```bash
# 测试照片 URL
curl -I http://192.168.101.100:3001/uploads/xxx.jpg
```

**解决方案**：
- 确保照片服务器可访问
- 检查防火墙设置
- 检查照片路径是否正确

#### 4. 字段值为 null ⭐⭐
**症状**：考勤机无响应或返回错误
**检查方法**：
```typescript
// 检查是否有 null 值
console.log('idNumber:', user.idNumber)  // 可能是 null
console.log('phone:', user.phone)        // 可能是 null
```

**解决方案**：
- 已修复：使用 `|| ''` 确保不是 null

#### 5. 消息格式错误 ⭐
**症状**：考勤机无响应
**检查方法**：
```typescript
// 检查发送的消息格式
console.log(JSON.stringify(message, null, 2))
```

**解决方案**：
- 确保包含外层 `to_device` 结构
- 确保 `data` 字段包含完整命令

## 🔧 调试步骤

### 步骤 1：检查设备连接

```bash
# 运行测试脚本
cd apps/api
bun run scripts/test-user-sync.ts
```

查看输出，确认：
- ✅ 用户数据正确
- ✅ 命令格式正确
- ✅ 照片 URL 正确

### 步骤 2：查看后端日志

启动后端后，查看日志：

```
🔌 WebSocket 连接已建立
✅ 设备 YET88476 已注册
📤 已发送: 张三(LZ-V-001)，等待考勤机确认...
```

如果看不到"设备已注册"，说明设备未连接。

### 步骤 3：查看发送的命令

在日志中查找：

```json
📋 完整命令: {
  "cmd": "addUser",
  "mode": 0,
  "name": "张三",
  "user_id": "LZ-V-001",
  "user_id_card": "110101199001011234",
  "face_template": "http://192.168.101.100:3001/uploads/xxx.jpg",
  "phone": "13800138000",
  "id_valid": ""
}
```

检查：
- ✅ user_id 不以 DL 开头
- ✅ face_template 是完整 URL
- ✅ 所有字段都有值（不是 null）
- ✅ id_valid 存在

### 步骤 4：查看包装后的消息

```json
📦 格式化消息（对象）: {
  "cmd": "to_device",
  "from": "server",
  "to": "YET88476",
  "data": {
    "cmd": "addUser",
    "mode": 0,
    ...
  }
}
```

确认：
- ✅ 有外层 `to_device` 结构
- ✅ `data` 字段包含完整命令

### 步骤 5：等待考勤机响应

正常情况下，应该收到：

```json
{
  "cmd": "to_client",
  "data": {
    "cmd": "addUserRet",
    "user_id": "LZ-V-001",
    "code": 0,
    "msg": "成功"
  }
}
```

如果 code 不是 0，查看错误码：
- 11: 没有找到有效人脸
- 12: 人脸宽度不符合标准
- 13: 人脸高度不符合标准
- 14: 人脸清晰度不符合标准
- 15: 人脸亮度不符合标准
- 16: 人脸亮度标准差不符合标准

## 🎯 快速检查清单

### 前置条件
- [ ] 考勤机已开机
- [ ] 考勤机已连接到网络
- [ ] 考勤机已连接到 WebSocket
- [ ] 后端服务正在运行

### 数据检查
- [ ] 用户有头像
- [ ] 用户状态是 active
- [ ] user_id 不以 DL 开头
- [ ] 照片 URL 可访问

### 命令检查
- [ ] 包含 id_valid 字段
- [ ] 所有字段不是 null
- [ ] 消息有外层包装

## 🔨 修复方案

### 已实施的修复

1. **添加 id_valid 字段**
```typescript
id_valid: ''  // 空字符串表示永久有效
```

2. **防止 null 值**
```typescript
user_id_card: user.idNumber || '',
phone: user.phone || '',
```

3. **添加详细日志**
```typescript
logger.info(`📋 完整命令:`, JSON.stringify(command, null, 2))
console.log(`📦 格式化消息:`, JSON.stringify(message, null, 2))
```

4. **完善错误码处理**
```typescript
const ERROR_MESSAGES: Record<number, string> = {
  0: '成功',
  11: '没有找到有效人脸',
  12: '人脸宽度不符合标准',
  // ...
}
```

### 待验证

1. **设备连接状态**
   - 运行测试脚本
   - 查看后端日志
   - 确认设备在线

2. **照片可访问性**
   - 使用 curl 测试照片 URL
   - 确保考勤机能访问照片服务器

3. **user_id 格式**
   - 检查数据库中的 lotusId
   - 确保不以 DL 开头

## 📞 下一步

如果问题仍然存在，请提供：

1. **后端日志**
   - 设备连接日志
   - 命令发送日志
   - 考勤机响应日志

2. **测试脚本输出**
```bash
bun run scripts/test-user-sync.ts
```

3. **具体错误信息**
   - 考勤机返回的 code
   - 考勤机返回的 msg
   - 前端显示的错误

4. **网络环境**
   - 后端服务器 IP
   - 考勤机 IP
   - 是否在同一网络

## 🧪 测试命令

```bash
# 1. 运行测试脚本
cd apps/api
bun run scripts/test-user-sync.ts

# 2. 测试照片访问
curl -I http://192.168.101.100:3001/uploads/xxx.jpg

# 3. 查看后端日志
# 启动后端，观察日志输出

# 4. 测试单个用户下发
# 在前端使用"下发单个义工"功能
```

## 💡 常见问题

### Q: 为什么所有用户都失败？
A: 最可能的原因是设备未连接。检查：
1. 考勤机是否在线
2. WebSocket 连接是否建立
3. 后端日志是否显示"设备已注册"

### Q: 如何确认设备已连接？
A: 查看后端日志，应该看到：
```
✅ 设备 YET88476 已注册
```

### Q: 照片 URL 格式是什么？
A: 完整的 HTTP URL，例如：
```
http://192.168.101.100:3001/uploads/avatar.jpg
```

### Q: user_id 有什么限制？
A: 不能以 DL 开头，建议使用 LZ-V-xxx 格式

### Q: id_valid 是什么？
A: 用户有效期，空字符串表示永久有效，格式：
```
""                    // 永久有效
"2025-12-31"         // 到期日期
"2025-12-31 23:59"   // 到期日期时间
```
