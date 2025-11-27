# 快速参考卡片 🚀

## 📡 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://192.168.5.4:3000 | Web 界面 |
| 后端 | http://192.168.5.4:3001 | API 服务 |
| 文档 | http://192.168.5.4:3001/swagger | API 文档 |

## 🔧 快速命令

```bash
# 启动所有服务
npm run dev

# 检查系统状态
./test-system.sh

# 重启服务（如果需要）
# Ctrl+C 停止，然后重新运行
npm run dev
```

## 📱 手机上传

### 步骤
1. 电脑端：志愿者管理 → 点击"手机上传"
2. 手机端：扫描二维码（5分钟内有效）
3. 选择照片或拍照上传
4. 完成！

### 常见问题
| 问题 | 解决方法 |
|------|----------|
| 链接过期 | 返回电脑端重新生成二维码 |
| 无法访问 | 确保手机和电脑在同一 WiFi |
| 上传失败 | 检查图片大小（<5MB）和格式 |

## 🌐 环境切换

编辑 `apps/web/src/config/network.ts`：

```typescript
// 本地开发
export const CURRENT_ENV = 'development';

// 局域网（手机测试）
export const CURRENT_ENV = 'lan';

// 生产环境
export const CURRENT_ENV = 'production';
```

**⚠️ 修改后需要重启服务！**

## 🎯 核心功能

- ✅ 志愿者管理（增删改查）
- ✅ 签到管理（人脸识别）
- ✅ 助念管理（排班记录）
- ✅ 往生者管理（信息登记）
- ✅ 文档生成（PDF导出）
- ✅ 手机照片上传
- ✅ 权限管理

## 📚 文档索引

| 文档 | 内容 |
|------|------|
| `CURRENT_STATUS.md` | 系统完整状态 |
| `PORT_UPDATE_SUMMARY.md` | 端口更新说明 |
| `NEXT_STEPS.md` | 下一步操作 |
| `apps/web/MOBILE_UPLOAD_GUIDE.md` | 手机上传详细指南 |

## ⚡ 故障排查

### 前端无法访问
```bash
# 检查端口是否被占用
lsof -i :3000

# 或者使用其他端口
cd apps/web && npm run dev -- --port 3002
```

### 后端无法访问
```bash
# 检查后端服务
curl http://192.168.5.4:3001/api/v1/health

# 重启后端
cd apps/api && bun run dev
```

### 数据库连接失败
```bash
# 检查 MySQL 是否运行
docker ps | grep mysql

# 或检查本地 MySQL
systemctl status mysql
```

## 💡 小贴士

1. **开发时使用 `development` 环境**，速度更快
2. **测试手机功能时切换到 `lan` 环境**
3. **二维码有效期 5 分钟**，过期重新生成即可
4. **修改配置后记得重启服务**
5. **使用 `./test-system.sh` 快速检查状态**

---

**需要帮助？** 查看详细文档或运行 `./test-system.sh` 检查系统状态
