# Web端照片显示问题修复

## 问题描述

在Web端（义工管理界面）无法看到义工的照片。

## 根本原因

**API服务器和Web前端没有运行**，导致：
1. 前端无法加载页面
2. 照片URL无法访问
3. 数据库查询无法执行

## 诊断结果

运行诊断脚本后发现：

```bash
bash scripts/diagnose-photo-display.sh
```

结果：
- ✅ 照片文件存在：57个照片（31个JPG，26个JPEG）
- ✅ 数据库运行正常：38个义工有照片
- ✅ 网络配置正确：使用局域网IP (192.168.5.4)
- ❌ **API服务器未运行**
- ❌ **Web前端未运行**

## 解决方案

### 方法1：手动启动（推荐）

**启动API服务器：**
```bash
cd apps/api
bun run dev
```

**启动Web前端（新终端）：**
```bash
cd apps/web
bun run dev
```

### 方法2：使用启动脚本

```bash
bash scripts/start-dev.sh
```

### 方法3：使用后台进程

```bash
# 启动API
cd apps/api && nohup bun run dev > api.log 2>&1 &

# 启动Web
cd apps/web && nohup bun run dev > web.log 2>&1 &
```

## 验证修复

1. **检查服务器状态：**
```bash
# API服务器
curl http://192.168.5.4:3001/api/health

# Web前端
curl http://192.168.5.4:3000
```

2. **访问Web界面：**
   - 打开浏览器访问：http://192.168.5.4:3000
   - 登录后进入义工管理页面
   - 检查义工列表中的头像是否显示

3. **测试照片URL：**
```bash
# 测试单个照片
curl -I http://192.168.5.4:3001/upload/avatar/LZ-V-1241702-ba7c416f.jpg
```

应该返回 `HTTP/1.1 200 OK`

## 照片显示逻辑

Web端使用以下逻辑显示照片：

1. **数据库存储：** 相对路径（如 `/upload/avatar/xxx.jpg`）
2. **前端处理：** 使用 `getAvatarUrl()` 函数拼接完整URL
3. **完整URL：** `http://192.168.5.4:3001/upload/avatar/xxx.jpg`

**相关文件：**
- `apps/web/src/lib/image.ts` - 照片URL处理
- `apps/web/src/config/network.ts` - 网络配置
- `apps/web/src/components/VolunteerDataTable.tsx` - 义工列表显示

## 常见问题

### Q1: 服务器启动后照片还是不显示？

**检查浏览器控制台：**
1. 按 F12 打开开发者工具
2. 查看 Console 标签是否有错误
3. 查看 Network 标签，检查照片请求是否成功

**可能的原因：**
- 照片URL不正确
- 网络配置错误
- 照片文件不存在

### Q2: 如何检查照片文件是否存在？

```bash
# 查看所有照片
ls -lh apps/api/public/upload/avatar/

# 查看特定义工的照片
docker exec mysql_test sh -c 'mysql -uroot -padmin123 -e "SELECT lotus_id, name, avatar FROM volunteer WHERE lotus_id=\"LZ-V-1241702\";" lotus'
```

### Q3: 如何修改网络配置？

编辑 `apps/web/src/config/network.ts`：

```typescript
// 开发环境（本机）
export const CURRENT_ENV: Environment = 'development';

// 局域网环境（推荐）
export const CURRENT_ENV: Environment = 'lan';

// 生产环境（外网）
export const CURRENT_ENV: Environment = 'production';
```

### Q4: JPEG格式的照片会有问题吗？

在Web端显示没有问题，但考勤机可能不支持 `.jpeg` 格式。

如果需要同步到考勤机，建议转换为 `.jpg` 格式：

```bash
# 运行转换脚本
bun run scripts/fix-photo-format.ts
```

## 数据统计

当前数据库状态：
- 总义工数：约100+
- 有照片的义工：38人
- JPG格式：18个
- JPEG格式：17个

照片文件状态：
- 总照片文件：57个
- JPG格式：31个
- JPEG格式：26个

> 注意：文件数量多于数据库记录，说明有些照片已上传但未关联到义工。

## 预防措施

1. **使用进程管理工具：**
   - PM2
   - systemd
   - Docker Compose

2. **设置开机自启动：**
```bash
# 创建 systemd 服务
sudo nano /etc/systemd/system/lianhuazhai-api.service
sudo nano /etc/systemd/system/lianhuazhai-web.service

# 启用服务
sudo systemctl enable lianhuazhai-api
sudo systemctl enable lianhuazhai-web
```

3. **监控服务状态：**
```bash
# 定期检查
watch -n 60 'curl -s http://192.168.5.4:3001/api/health'
```

## 总结

问题的根本原因是**服务器没有运行**，而不是照片文件或配置的问题。

**修复步骤：**
1. ✅ 启动API服务器
2. ✅ 启动Web前端
3. ✅ 访问Web界面验证

**后续建议：**
- 使用进程管理工具保持服务运行
- 设置开机自启动
- 定期监控服务状态
