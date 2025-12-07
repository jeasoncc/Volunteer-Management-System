# 手机扫码上传二维码修复

## 问题描述

手机扫码上传时，二维码中的URL是 `http://localhost:3000/mobile-upload?token=xxx`，导致手机无法访问。

## 根本原因

前端配置中的 `LOCAL_IP` 写死为 `192.168.5.4`，而且在生成二维码时没有正确使用当前浏览器访问的IP地址。

## 解决方案

### 修改前端配置

**文件：** `apps/web/src/config/network.ts`

**修改：**
```typescript
// 修改前
export const LOCAL_IP = '192.168.5.4';  // 写死的IP

// 修改后
const defaultLocalIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const LOCAL_IP = defaultLocalIP;  // 动态获取当前访问的IP
```

**原理：**
- 使用 `window.location.hostname` 获取当前浏览器访问的主机名
- 如果你通过 `http://192.168.1.157:3000` 访问，`LOCAL_IP` 就是 `192.168.1.157`
- 如果你通过 `http://localhost:3000` 访问，`LOCAL_IP` 就是 `localhost`

## 使用方法

### 正确的访问方式

**❌ 错误：** 在浏览器中访问 `http://localhost:3000`
- 生成的二维码：`http://localhost:3000/mobile-upload?token=xxx`
- 手机无法访问 `localhost`

**✅ 正确：** 在浏览器中访问 `http://192.168.1.157:3000`
- 生成的二维码：`http://192.168.1.157:3000/mobile-upload?token=xxx`
- 手机可以正常访问

### 步骤

1. **查看当前IP地址**
   ```bash
   cd apps/api
   bun run test-local-ip.ts
   ```
   
   输出示例：
   ```
   ✅ 主要局域网IP: 192.168.1.157
   ```

2. **启动服务器**
   ```bash
   # 启动API
   cd apps/api && bun run dev
   
   # 启动Web（新终端）
   cd apps/web && bun run dev
   ```

3. **在浏览器中访问**
   - 打开浏览器
   - 访问：`http://192.168.1.157:3000`（使用你的实际IP）
   - **不要使用** `http://localhost:3000`

4. **生成二维码**
   - 进入义工管理页面
   - 点击"添加义工"或"编辑义工"
   - 点击照片上传区域
   - 点击"手机扫码上传"
   - 扫描二维码

5. **手机上传**
   - 手机扫描二维码
   - 选择或拍摄照片
   - 上传完成

## 验证修复

### 检查二维码URL

在生成二维码后，查看链接地址：

**正确的格式：**
```
http://192.168.1.157:3000/mobile-upload?token=889ad5d8e89245b4cce796c917b29c56
```

**错误的格式：**
```
http://localhost:3000/mobile-upload?token=889ad5d8e89245b4cce796c917b29c56
```

### 测试手机访问

1. 复制二维码中的链接
2. 在手机浏览器中打开
3. 应该能看到上传页面

## 自动化方案

### 方案1：使用书签

创建一个浏览器书签，自动跳转到正确的IP地址：

```javascript
javascript:(function(){
  const ip = '192.168.1.157';  // 替换为你的IP
  const port = '3000';
  const url = `http://${ip}:${port}`;
  if (window.location.hostname === 'localhost') {
    window.location.href = url;
  }
})();
```

### 方案2：使用重定向

在 `apps/web/src/routes/__root.tsx` 中添加自动重定向：

```typescript
useEffect(() => {
  // 如果是通过localhost访问，自动重定向到IP地址
  if (window.location.hostname === 'localhost') {
    const localIP = '192.168.1.157';  // 从后端获取
    const newUrl = window.location.href.replace('localhost', localIP);
    window.location.href = newUrl;
  }
}, []);
```

## 常见问题

### Q1: 为什么必须用IP访问？

**答：** 因为手机和电脑在同一局域网内，手机需要通过IP地址访问电脑。`localhost` 只在本机有效，手机无法访问。

### Q2: 每次IP变化都要修改吗？

**答：** 不需要！现在配置是动态的，只要你通过正确的IP访问，二维码就会自动使用该IP。

### Q3: 如何快速找到当前IP？

**方法1：** 运行测试脚本
```bash
cd apps/api && bun run test-local-ip.ts
```

**方法2：** 查看浏览器地址栏
- 如果你已经在浏览器中打开了页面
- 地址栏显示的就是当前IP

**方法3：** 使用命令行
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

### Q4: 可以设置默认IP吗？

**答：** 可以，但不推荐。因为IP可能会变化。

如果确实需要，可以修改 `apps/web/src/config/network.ts`：

```typescript
// 强制使用指定的IP
const defaultLocalIP = '192.168.1.157';  // 写死的IP
```

但这样就失去了动态适应的优势。

### Q5: 手机和电脑不在同一WiFi怎么办？

**答：** 必须在同一WiFi网络。如果不在同一网络：

**方案1：** 连接到同一WiFi
- 手机和电脑都连接到同一个WiFi

**方案2：** 使用手机热点
- 手机开启热点
- 电脑连接到手机热点
- 使用电脑的新IP地址

**方案3：** 使用公网IP（需要配置）
- 配置路由器端口转发
- 使用公网IP访问
- 设置 `CURRENT_ENV = 'production'`

## 技术细节

### 配置优先级

1. **浏览器访问的主机名** - 最高优先级
   - 通过 `window.location.hostname` 获取
   - 自动适应当前访问方式

2. **后端返回的IP** - 备用方案
   - 通过 `/api/system/network` 获取
   - 用于初始化和验证

3. **环境变量** - 手动覆盖
   - `ATTENDANCE_DEVICE_BASE_URL`
   - 用于特殊情况

### 二维码生成流程

```
1. 用户点击"手机扫码上传"
   ↓
2. 获取当前浏览器的主机名
   window.location.hostname
   ↓
3. 生成上传令牌
   POST /api/upload/token
   ↓
4. 构建上传URL
   http://${hostname}:3000/mobile-upload?token=${token}
   ↓
5. 生成二维码
   QRCodeSVG
   ↓
6. 显示给用户
```

### 手机访问流程

```
1. 手机扫描二维码
   ↓
2. 打开浏览器访问URL
   http://192.168.1.157:3000/mobile-upload?token=xxx
   ↓
3. 验证令牌
   GET /api/upload/status/${token}
   ↓
4. 显示上传页面
   ↓
5. 用户选择照片
   ↓
6. 上传到服务器
   POST /api/upload/mobile
   ↓
7. 电脑端自动接收
   轮询检查上传状态
```

## 总结

**修复内容：**
- ✅ 修改 `LOCAL_IP` 为动态获取
- ✅ 使用 `window.location.hostname`
- ✅ 自动适应当前访问方式

**使用要点：**
- ✅ 通过IP地址访问（不要用localhost）
- ✅ 确保手机和电脑在同一WiFi
- ✅ IP变化后重启服务器

**用户体验：**
- ✅ 无需手动配置IP
- ✅ 自动适应当前访问方式
- ✅ 二维码始终可用
