# 莲花斋管理系统 - 当前状态

## 📅 更新时间
2025-11-26

## ✅ 已完成的主要功能

### 1. 网络配置统一管理
- ✅ 创建了 `apps/web/src/config/network.ts` 统一配置文件
- ✅ 支持三种环境切换：development / lan / production
- ✅ 所有前端 API 请求已迁移到统一配置
- ✅ 移除了所有硬编码的 localhost URL

### 2. 手机照片上传功能
- ✅ 实现了二维码扫码上传功能
- ✅ 支持手机拍照直接上传
- ✅ 自动适配局域网 IP 地址
- ✅ 后端上传接口已实现

### 3. 路由问题修复
- ✅ 修复了助念管理页面 404 错误
- ✅ 修复了往生者管理页面 404 错误
- ✅ 解决了志愿者编辑路由冲突
- ✅ 重新生成了路由树

### 4. 核心业务模块
- ✅ 志愿者管理（增删改查、批量导入、照片上传）
- ✅ 签到管理（人脸识别、手动签到、月度汇总）
- ✅ 助念管理（排班、记录）
- ✅ 往生者管理（信息登记）
- ✅ 文档生成（LaTeX、PDF导出）
- ✅ 权限管理（角色、权限控制）

## 🚀 当前运行状态

### 服务器地址
- **后端 API**: http://192.168.5.4:3001
- **前端 Web**: http://192.168.5.4:3000
- **API 文档**: http://192.168.5.4:3001/swagger

### 当前环境配置
```typescript
// apps/web/src/config/network.ts
export const CURRENT_ENV: Environment = 'lan';

export const NETWORK_CONFIG = {
  lan: {
    frontend: 'http://192.168.5.4:3000',
    backend: 'http://192.168.5.4:3001',
  },
};
```

## 📝 使用说明

### 切换环境

修改 `apps/web/src/config/network.ts` 中的 `CURRENT_ENV`：

```typescript
// 本地开发
export const CURRENT_ENV: Environment = 'development';

// 局域网访问（手机扫码）
export const CURRENT_ENV: Environment = 'lan';

// 生产环境
export const CURRENT_ENV: Environment = 'production';
```

修改后需要重启开发服务器。

### 手机照片上传

1. 在志愿者列表中点击"手机上传"按钮
2. 使用手机扫描二维码
3. 在手机上拍照或选择照片
4. 照片会自动上传到服务器

### API 请求规范

**推荐做法** ✅
```typescript
// 使用 axios
import { api } from "@/lib/api";
const data = await api.get("/api/volunteers");

// 使用配置函数
import { getBackendUrl, getApiEndpoint } from "@/config/network";
const response = await fetch(getApiEndpoint('/api/xxx'));
```

**避免做法** ❌
```typescript
// ❌ 不要硬编码
const response = await fetch("http://localhost:3001/api/xxx");
```

## 🔧 技术栈

### 前端
- React 18 + TypeScript
- TanStack Router (文件路由)
- TanStack Query (数据获取)
- Tailwind CSS + shadcn/ui
- Vite 7

### 后端
- Bun + Elysia
- Better Auth (认证)
- MySQL (数据库)
- WebSocket (实时通信)

## 📂 项目结构

```
lianhuazhai-monorepo/
├── apps/
│   ├── api/              # 后端 API
│   │   └── src/
│   │       ├── modules/  # 业务模块
│   │       └── index.ts
│   └── web/              # 前端应用
│       └── src/
│           ├── components/  # 组件
│           ├── routes/      # 路由页面
│           ├── services/    # API 服务
│           ├── config/      # 配置文件
│           └── lib/         # 工具函数
├── docs/                 # 文档
└── package.json
```

## 🎯 下一步建议

### 1. 测试验证
- [ ] 测试所有页面在局域网环境下是否正常
- [ ] 测试手机照片上传功能
- [ ] 测试助念和往生者管理功能
- [ ] 验证权限控制是否正常

### 2. 性能优化
- [ ] 添加图片压缩（上传前）
- [ ] 实现懒加载和代码分割
- [ ] 优化大数据列表渲染

### 3. 用户体验
- [ ] 添加加载状态提示
- [ ] 优化错误提示信息
- [ ] 添加操作确认对话框

### 4. 部署准备
- [ ] 配置生产环境域名
- [ ] 设置 HTTPS
- [ ] 配置 Nginx 反向代理
- [ ] 准备数据库备份方案

## 📚 相关文档

- [网络配置说明](apps/web/NETWORK_CONFIG.md)
- [环境切换指南](apps/web/ENVIRONMENT_SWITCH.md)
- [手机上传指南](apps/web/MOBILE_UPLOAD_GUIDE.md)
- [API 迁移总结](apps/web/API_MIGRATION_SUMMARY.md)
- [项目结构说明](PROJECT_STRUCTURE.md)

## ⚠️ 注意事项

1. **端口配置**: 前端默认使用 3000 端口，后端使用 3001 端口
2. **IP 地址**: 局域网 IP 可能会变化，需要相应更新配置
3. **环境切换**: 修改配置后必须重启开发服务器
4. **生产部署**: 建议使用域名而不是 IP 地址
5. **手机上传**: 二维码链接有效期为 5 分钟，过期需重新生成

## 🐛 已知问题

1. Node.js 版本警告（当前 22.1.0，建议 22.12+）- 不影响功能

## 💡 快速命令

```bash
# 启动所有服务
npm run dev

# 单独启动后端
cd apps/api && bun run dev

# 单独启动前端
cd apps/web && npm run dev

# 查看 API 文档
open http://192.168.5.4:3001/swagger

# 访问前端
open http://192.168.5.4:3000
```

---

**最后更新**: 2025-11-26 16:25
**状态**: ✅ 系统运行正常，所有核心功能已实现
