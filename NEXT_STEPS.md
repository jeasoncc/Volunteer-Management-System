# 下一步操作指南

## ✅ 当前状态

所有服务已启动并正常运行：
- ✅ 后端 API: http://192.168.5.4:3001
- ✅ 前端 Web: http://192.168.5.4:3000  
- ✅ API 文档: http://192.168.5.4:3001/swagger
- ✅ 数据库连接正常

## 🎯 立即可以做的事情

### 1. 浏览器访问
```
http://192.168.5.4:3000
```

### 2. 手机访问（同一局域网）
```
http://192.168.5.4:3000
```

### 3. 测试手机照片上传
1. 在电脑浏览器打开志愿者管理页面
2. 点击"手机上传"按钮
3. 用手机扫描二维码
4. 在手机上拍照或选择照片上传

### 4. 查看 API 文档
```
http://192.168.5.4:3001/swagger
```

## 🔧 如果需要修改配置

### 切换到本地开发模式
编辑 `apps/web/src/config/network.ts`:
```typescript
export const CURRENT_ENV: Environment = 'development';
```

### 切换到生产环境
编辑 `apps/web/src/config/network.ts`:
```typescript
export const CURRENT_ENV: Environment = 'production';

// 并更新生产环境配置
production: {
  frontend: 'http://your-domain.com',
  backend: 'http://your-domain.com/api',
}
```

修改后重启服务：
```bash
# 停止当前服务 (Ctrl+C)
# 重新启动
npm run dev
```

## 📋 快速测试清单

- [ ] 登录系统
- [ ] 查看志愿者列表
- [ ] 添加新志愿者
- [ ] 测试手机照片上传
- [ ] 查看助念管理页面
- [ ] 查看往生者管理页面
- [ ] 测试签到功能
- [ ] 导出数据

## 🐛 遇到问题？

### 服务无法访问
```bash
# 检查服务状态
./test-system.sh

# 重启服务
npm run dev
```

### 手机无法访问
1. 确保手机和电脑在同一 WiFi
2. 检查防火墙设置
3. 确认 IP 地址是否正确

### API 请求失败
1. 检查网络配置: `apps/web/src/config/network.ts`
2. 确认 `CURRENT_ENV` 设置正确
3. 重启开发服务器

## 📚 更多文档

- [完整状态说明](CURRENT_STATUS.md)
- [网络配置文档](apps/web/NETWORK_CONFIG.md)
- [手机上传指南](apps/web/MOBILE_UPLOAD_GUIDE.md)
- [环境切换指南](apps/web/ENVIRONMENT_SWITCH.md)

---

**提示**: 运行 `./test-system.sh` 可以快速检查系统状态
