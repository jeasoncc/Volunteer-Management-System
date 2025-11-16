# 义工自助注册功能指南

## 📋 功能概述

义工自助注册功能允许用户通过公开的网址自行填写信息并注册成为义工申请人，无需管理员手动录入。

### 主要特性
- ✅ 公开接口，无需登录
- ✅ 自动生成莲花斋ID（格式：LZ-V-xxxxxxx）
- ✅ 自动从身份证号提取出生日期和性别
- ✅ 手机号作为默认账号
- ✅ 默认密码为 123456（提示用户登录后修改）
- ✅ 注册后状态为"申请人"（applicant）
- ✅ 防止重复注册（身份证号和手机号唯一性检查）
- ✅ 实时检查身份证号和手机号是否已注册

---

## 🚀 快速开始

### API 接口

#### 1. 注册新义工
```
POST /volunteer/register
```

**请求体：**
```json
{
  // 必填字段
  "name": "张三",
  "phone": "13800138000",
  "idNumber": "110101199001011234",
  
  // 可选字段
  "wechat": "zhangsan_wx",
  "email": "zhangsan@example.com",
  "address": "北京市朝阳区",
  "dharmaName": "觉明",
  "hasBuddhismFaith": true,
  "refugeStatus": "took_refuge",
  "joinReason": "希望通过义工服务积累福报",
  "hobbies": "读经、打坐、书法",
  "availableTimes": "周末全天",
  "emergencyContact": "李四 13900139000"
}
```

**响应：**
```json
{
  "success": true,
  "message": "注册成功！请使用手机号和默认密码登录，并尽快修改密码。",
  "data": {
    "lotusId": "LZ-V-4286806",
    "account": "13800138000",
    "defaultPassword": "123456",
    "name": "张三",
    "phone": "13800138000",
    "status": "applicant"
  }
}
```

#### 2. 检查身份证号是否已注册
```
GET /volunteer/register/check-id/:idNumber
```

**示例：**
```bash
curl http://localhost:3001/volunteer/register/check-id/110101199001011234
```

**响应：**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "message": "该身份证号已注册"
  }
}
```

#### 3. 检查手机号是否已注册
```
GET /volunteer/register/check-phone/:phone
```

**示例：**
```bash
curl http://localhost:3001/volunteer/register/check-phone/13800138000
```

**响应：**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "message": "该手机号已注册"
  }
}
```

#### 4. 获取注册统计
```
GET /volunteer/register/stats
```

**响应：**
```json
{
  "success": true,
  "data": {
    "total": 47,
    "applicant": 47,
    "trainee": 0,
    "registered": 0,
    "inactive": 0,
    "suspended": 0
  }
}
```

---

## 📝 字段说明

### 必填字段
| 字段 | 类型 | 说明 | 验证规则 |
|------|------|------|----------|
| name | string | 姓名 | 2-50个字符 |
| phone | string | 手机号 | 11位，1开头 |
| idNumber | string | 身份证号 | 18位 |

### 可选字段
| 字段 | 类型 | 说明 |
|------|------|------|
| gender | string | 性别（male/female/other），默认从身份证提取 |
| birthDate | string | 出生日期，默认从身份证提取 |
| wechat | string | 微信号 |
| email | string | 邮箱 |
| address | string | 地址 |
| dharmaName | string | 法名 |
| hasBuddhismFaith | boolean | 是否有佛教信仰 |
| refugeStatus | string | 皈依状态（none/took_refuge/five_precepts/bodhisattva） |
| religiousBackground | string | 宗教背景 |
| education | string | 学历 |
| healthConditions | string | 健康状况 |
| joinReason | string | 加入原因 |
| hobbies | string | 兴趣爱好 |
| availableTimes | string | 可服务时间 |
| emergencyContact | string | 紧急联系人 |
| familyConsent | string | 家人同意情况（approved/partial/rejected/self_decided） |

---

## 🔒 验证规则

### 1. 身份证号验证
- 必须为18位
- 格式：`^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$`
- 自动提取出生日期和性别

### 2. 手机号验证
- 必须为11位
- 格式：`^1[3-9]\d{9}$`
- 作为默认账号

### 3. 唯一性检查
- 身份证号不能重复
- 手机号不能重复

---

## 🎯 注册流程

```
用户填写表单
    ↓
验证必填字段
    ↓
验证身份证号格式
    ↓
验证手机号格式
    ↓
检查身份证号是否已注册
    ↓
检查手机号是否已注册
    ↓
生成莲花斋ID（LZ-V-xxxxxxx）
    ↓
从身份证号提取出生日期和性别
    ↓
生成默认账号（手机号）和密码（123456）
    ↓
插入数据库（状态：applicant）
    ↓
返回注册信息
```

---

## 💻 前端集成示例

### HTML 表单
```html
<form id="registerForm">
  <h2>义工注册</h2>
  
  <!-- 必填字段 -->
  <div>
    <label>姓名 *</label>
    <input type="text" name="name" required minlength="2" maxlength="50">
  </div>
  
  <div>
    <label>手机号 *</label>
    <input type="tel" name="phone" required pattern="^1[3-9]\d{9}$">
    <button type="button" onclick="checkPhone()">检查是否已注册</button>
  </div>
  
  <div>
    <label>身份证号 *</label>
    <input type="text" name="idNumber" required minlength="18" maxlength="18">
    <button type="button" onclick="checkIdNumber()">检查是否已注册</button>
  </div>
  
  <!-- 可选字段 -->
  <div>
    <label>微信号</label>
    <input type="text" name="wechat">
  </div>
  
  <div>
    <label>邮箱</label>
    <input type="email" name="email">
  </div>
  
  <div>
    <label>地址</label>
    <textarea name="address"></textarea>
  </div>
  
  <div>
    <label>法名</label>
    <input type="text" name="dharmaName">
  </div>
  
  <div>
    <label>是否有佛教信仰</label>
    <input type="checkbox" name="hasBuddhismFaith">
  </div>
  
  <div>
    <label>皈依状态</label>
    <select name="refugeStatus">
      <option value="none">未皈依</option>
      <option value="took_refuge">已皈依</option>
      <option value="five_precepts">五戒</option>
      <option value="bodhisattva">菩萨戒</option>
    </select>
  </div>
  
  <div>
    <label>加入原因</label>
    <textarea name="joinReason"></textarea>
  </div>
  
  <div>
    <label>兴趣爱好</label>
    <textarea name="hobbies"></textarea>
  </div>
  
  <div>
    <label>可服务时间</label>
    <input type="text" name="availableTimes" placeholder="例如：周末全天">
  </div>
  
  <div>
    <label>紧急联系人</label>
    <input type="text" name="emergencyContact" placeholder="姓名 电话">
  </div>
  
  <button type="submit">提交注册</button>
</form>
```

### JavaScript 处理
```javascript
// 检查手机号
async function checkPhone() {
  const phone = document.querySelector('[name="phone"]').value
  if (!phone) return
  
  const response = await fetch(`/volunteer/register/check-phone/${phone}`)
  const data = await response.json()
  
  if (data.data.exists) {
    alert('该手机号已注册')
  } else {
    alert('该手机号可以注册')
  }
}

// 检查身份证号
async function checkIdNumber() {
  const idNumber = document.querySelector('[name="idNumber"]').value
  if (!idNumber) return
  
  const response = await fetch(`/volunteer/register/check-id/${idNumber}`)
  const data = await response.json()
  
  if (data.data.exists) {
    alert('该身份证号已注册')
  } else {
    alert('该身份证号可以注册')
  }
}

// 提交注册
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData.entries())
  
  // 转换 checkbox
  data.hasBuddhismFaith = formData.get('hasBuddhismFaith') === 'on'
  
  try {
    const response = await fetch('/volunteer/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert(`注册成功！\n\n莲花斋ID: ${result.data.lotusId}\n账号: ${result.data.account}\n默认密码: ${result.data.defaultPassword}\n\n请使用手机号和默认密码登录，并尽快修改密码。`)
      
      // 跳转到登录页面
      window.location.href = '/login'
    } else {
      alert(`注册失败: ${result.message}`)
    }
  } catch (error) {
    alert('注册失败，请稍后重试')
    console.error(error)
  }
})
```

---

## 🧪 测试

### 运行测试脚本
```bash
bash scripts/test/test-volunteer-register.sh
```

### 手动测试
```bash
# 1. 注册新义工
curl -X POST http://localhost:3001/volunteer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "idNumber": "110101199001011234",
    "wechat": "zhangsan_wx",
    "email": "zhangsan@example.com"
  }'

# 2. 检查身份证号
curl http://localhost:3001/volunteer/register/check-id/110101199001011234

# 3. 检查手机号
curl http://localhost:3001/volunteer/register/check-phone/13800138000

# 4. 获取统计
curl http://localhost:3001/volunteer/register/stats
```

---

## 📊 注册后的状态流转

```
applicant (申请人)
    ↓ 管理员审核通过
trainee (培训中)
    ↓ 完成培训
registered (正式义工)
    ↓ 长期未服务
inactive (不活跃)
    ↓ 违规或其他原因
suspended (暂停)
```

---

## 🔐 安全考虑

1. **密码安全**
   - 默认密码为 123456
   - 使用 bcrypt 加密存储
   - 提示用户登录后立即修改密码

2. **数据验证**
   - 身份证号格式验证
   - 手机号格式验证
   - 唯一性检查

3. **防止重复注册**
   - 身份证号唯一
   - 手机号唯一

---

## 📝 后续流程

### 1. 用户登录
注册成功后，用户可以使用手机号和默认密码登录：
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "123456"
  }'
```

### 2. 修改密码
登录后应立即修改密码：
```bash
curl -X POST http://localhost:3001/volunteer/{lotusId}/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: auth=<token>" \
  -d '{
    "oldPassword": "123456",
    "newPassword": "new_secure_password"
  }'
```

### 3. 管理员审核
管理员可以查看申请人列表并审核：
```bash
# 查看申请人列表
curl http://localhost:3001/volunteer?status=applicant \
  -H "Cookie: auth=<admin_token>"

# 更新状态为培训中
curl -X PATCH http://localhost:3001/volunteer/{lotusId}/status \
  -H "Content-Type: application/json" \
  -H "Cookie: auth=<admin_token>" \
  -d '{
    "status": "trainee"
  }'
```

---

## 🔗 相关文档

- [义工管理 API 文档](http://localhost:3001/swagger)
- [认证模块文档](../auth/README.md)

---

**最后更新**: 2024-11-16  
**维护者**: 莲花斋开发团队
