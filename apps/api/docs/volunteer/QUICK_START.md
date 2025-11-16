# 义工自助注册 - 快速启动指南

## 🚀 5分钟快速开始

### 1. 启动服务
```bash
npm run dev
```

等待服务启动，看到以下信息表示成功：
```
🦊 Server is running at http://localhost:3001
```

### 2. 访问注册页面
在浏览器中打开：
```
http://localhost:3001/register.html
```

### 3. 填写注册信息

**必填字段：**
- 姓名
- 手机号（11位）
- 身份证号（18位）

**可选字段：**
- 微信号
- 邮箱
- 地址
- 法名
- 佛教信息
- 其他信息

### 4. 提交注册

点击"提交注册"按钮，系统会：
1. 验证信息格式
2. 检查是否重复注册
3. 自动生成莲花斋ID
4. 创建登录账号

### 5. 获取账号信息

注册成功后，页面会显示：
```
🎉 注册成功！

莲花斋ID：LZ-V-7628109
登录账号：13900139000
默认密码：123456

重要提示：请使用手机号和默认密码登录，并尽快修改密码！
```

### 6. 登录系统

使用获取的账号信息登录：
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13900139000",
    "password": "123456"
  }'
```

---

## 📱 API 快速测试

### 注册新义工
```bash
curl -X POST http://localhost:3001/volunteer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "idNumber": "110101199001011234"
  }'
```

### 检查手机号
```bash
curl http://localhost:3001/volunteer/register/check-phone/13800138000
```

### 检查身份证号
```bash
curl http://localhost:3001/volunteer/register/check-id/110101199001011234
```

### 获取统计
```bash
curl http://localhost:3001/volunteer/register/stats
```

---

## 🧪 运行测试

```bash
npm run test:register
```

测试脚本会自动：
1. 注册新义工
2. 测试重复注册
3. 检查身份证号和手机号
4. 获取统计信息
5. 测试登录

---

## ❓ 常见问题

### Q: 页面显示 404 Not Found
**A**: 检查以下几点：
1. 服务是否已启动（`npm run dev`）
2. 访问地址是否正确（`http://localhost:3001/register.html`）
3. `public/register.html` 文件是否存在

### Q: 提交后显示"该身份证号已注册"
**A**: 该身份证号已经被使用，请使用其他身份证号。

### Q: 提交后显示"该手机号已注册"
**A**: 该手机号已经被使用，请使用其他手机号。

### Q: 注册成功后如何登录？
**A**: 使用手机号作为账号，默认密码为 123456。

### Q: 如何修改密码？
**A**: 登录后调用修改密码接口：
```bash
curl -X POST http://localhost:3001/volunteer/{lotusId}/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: auth=<token>" \
  -d '{
    "oldPassword": "123456",
    "newPassword": "new_password"
  }'
```

---

## 📊 注册流程图

```
访问注册页面
    ↓
填写基本信息
    ↓
点击"检查"按钮（可选）
    ↓
提交注册
    ↓
系统验证
    ├─ 格式验证
    ├─ 唯一性检查
    └─ 生成账号
    ↓
注册成功
    ├─ 显示莲花斋ID
    ├─ 显示登录账号
    └─ 显示默认密码
    ↓
使用账号登录
    ↓
修改密码
    ↓
等待管理员审核
```

---

## 🔗 相关链接

- [完整使用指南](./REGISTER_GUIDE.md)
- [开发总结](./REGISTER_SUMMARY.md)
- [API 文档](http://localhost:3001/swagger)

---

## 💡 提示

1. **安全提示**：注册成功后请立即修改默认密码
2. **信息准确**：请确保填写的信息真实准确
3. **手机号**：手机号将作为登录账号，请妥善保管
4. **审核流程**：注册后需要等待管理员审核

---

**最后更新**: 2024-11-16  
**维护者**: 莲花斋开发团队
