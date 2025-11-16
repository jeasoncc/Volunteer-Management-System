# 义工列表数据问题调试指南

## 🐛 问题描述

管理员登录后，义工列表页面显示为空，无法看到义工数据。

## ✅ 已完成的修复

### 1. 更新后端 CORS 配置

修改了 `apps/api/src/index.ts`，添加了 credentials 支持：

```typescript
.use(cors({
  origin: true,
  credentials: true,
}))
```

这确保了浏览器可以正确发送和接收 cookies。

### 2. 验证后端 API

测试结果：
- ✅ 登录 API 正常工作
- ✅ Cookie 正确设置
- ✅ 带 Cookie 的请求可以获取数据

## 🔍 调试步骤

### 步骤 1：清除浏览器缓存和 Cookie

1. 打开浏览器开发者工具（F12）
2. 进入 Application/应用 标签
3. 清除所有 Cookie
4. 清除 Local Storage
5. 刷新页面

### 步骤 2：重新登录

1. 访问：http://localhost:3000/login
2. 输入账号：`admin`
3. 输入密码：`admin123`
4. 点击登录

### 步骤 3：检查 Cookie

登录成功后，在开发者工具中检查：

1. 打开 Application/应用 标签
2. 查看 Cookies → http://localhost:3000
3. 应该看到一个名为 `auth` 的 cookie
4. 值应该是一个 JWT token

### 步骤 4：检查网络请求

1. 打开 Network/网络 标签
2. 访问义工管理页面
3. 查找 `/volunteer` 请求
4. 检查请求头中是否包含 Cookie
5. 检查响应状态码和数据

## 🔧 可能的问题和解决方案

### 问题 1：Cookie 未设置

**症状**：
- 登录成功但 Application 中看不到 auth cookie

**解决方案**：
```bash
# 1. 确保服务已重启
# 2. 清除浏览器缓存
# 3. 重新登录
```

### 问题 2：Cookie 未发送

**症状**：
- Cookie 存在但请求中没有携带

**检查**：
- 打开 Network 标签
- 查看 `/volunteer` 请求
- 检查 Request Headers 中的 Cookie 字段

**解决方案**：
- 确保前端和后端在同一域名下（都是 localhost）
- 检查 `apps/web/src/lib/api.ts` 中的 `withCredentials: true`

### 问题 3：401 未授权错误

**症状**：
- 请求返回 401 状态码
- 错误信息："未登录，请先登录"

**解决方案**：
```bash
# 1. 清除浏览器 Cookie
# 2. 重新登录
# 3. 检查 Cookie 是否正确设置
```

### 问题 4：CORS 错误

**症状**：
- 控制台显示 CORS 错误
- 请求被浏览器阻止

**解决方案**：
- 已修复：后端 CORS 配置已更新
- 确保服务已重启

## 📝 手动测试 API

### 测试登录

```bash
curl -c /tmp/cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

### 测试获取义工列表

```bash
curl -b /tmp/cookies.txt http://localhost:3001/volunteer
```

应该返回义工数据列表。

## 🎯 预期结果

登录成功后：

1. ✅ Cookie 正确设置
2. ✅ 义工列表请求携带 Cookie
3. ✅ 后端返回义工数据
4. ✅ 前端显示义工列表

## 🔍 开发者工具检查清单

### Console 标签
- [ ] 没有 JavaScript 错误
- [ ] 没有 CORS 错误
- [ ] 没有 401/403 错误

### Network 标签
- [ ] `/api/auth/login` 请求成功（200）
- [ ] 响应包含 `Set-Cookie` 头
- [ ] `/volunteer` 请求携带 Cookie
- [ ] `/volunteer` 请求成功（200）
- [ ] 响应包含义工数据

### Application 标签
- [ ] Cookies 中有 `auth` cookie
- [ ] Cookie 的 Domain 是 `localhost`
- [ ] Cookie 的 Path 是 `/`
- [ ] Cookie 的 HttpOnly 是 `true`

## 💡 快速修复步骤

如果问题仍然存在，按以下步骤操作：

### 1. 完全清除浏览器数据

```
Chrome/Edge:
1. 按 Ctrl+Shift+Delete
2. 选择"所有时间"
3. 勾选"Cookie 和其他网站数据"
4. 点击"清除数据"

Firefox:
1. 按 Ctrl+Shift+Delete
2. 选择"全部"
3. 勾选"Cookie"
4. 点击"立即清除"
```

### 2. 重启服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
bun run dev
```

### 3. 使用无痕/隐私模式

打开浏览器的无痕/隐私模式窗口，访问：
```
http://localhost:3000/login
```

### 4. 检查环境变量

确保 `apps/web/.env` 文件存在且配置正确：

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 📊 数据库检查

确认数据库中有义工数据：

```bash
# 进入 API 目录
cd apps/api

# 打开数据库管理界面
bun run studio
```

访问 http://localhost:4983 查看 volunteer 表是否有数据。

## 🆘 如果问题仍然存在

### 收集以下信息：

1. **浏览器控制台错误**
   - 截图 Console 标签的错误信息

2. **网络请求详情**
   - 截图 Network 标签中的 `/volunteer` 请求
   - 包括 Request Headers 和 Response

3. **Cookie 信息**
   - 截图 Application 标签中的 Cookies

4. **前端日志**
   - 查看终端中的前端日志

5. **后端日志**
   - 查看终端中的后端日志

## ✅ 验证修复

修复后，应该能看到：

1. 登录页面正常显示
2. 输入 admin/admin123 可以登录
3. 跳转到首页，显示统计数据
4. 点击"义工管理"，显示义工列表
5. 表格中显示多条义工记录
6. 可以搜索、排序、翻页

## 📞 技术支持

如果按照以上步骤仍无法解决，请提供：
- 浏览器类型和版本
- 控制台错误截图
- Network 请求截图
- Cookie 截图

我会帮你进一步诊断问题！
