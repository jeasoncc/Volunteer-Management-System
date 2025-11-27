# API请求统一配置迁移总结

## ✅ 已完成的迁移

所有API请求已统一使用 `@/config/network` 配置。

### 修改的文件

1. **apps/web/src/components/app-sidebar.tsx**
   - 从 `fetch("/api/volunteers...")` 改为使用 `api.get()`
   
2. **apps/web/src/services/document.ts**
   - 从 `import.meta.env.VITE_API_URL || "http://localhost:3001"` 改为 `getBackendUrl()`

3. **apps/web/src/routes/documents.tsx**
   - 所有 fetch 请求都使用 `getBackendUrl()`

4. **apps/web/src/routes/mobile-upload.tsx**
   - 使用 `getApiEndpoint()` 获取完整API地址

5. **apps/web/src/components/MobileUploadDialog.tsx**
   - 使用 `getFrontendUrl(true)` 生成手机可访问的链接

6. **apps/web/src/lib/api.ts**
   - axios baseURL 使用 `getBackendUrl()`

## 🎯 统一配置的好处

### 1. 集中管理
只需修改 `src/config/network.ts` 中的 `CURRENT_ENV` 即可切换环境

### 2. 类型安全
TypeScript 类型检查，避免拼写错误

### 3. 易于维护
不再有散落各处的 localhost 硬编码

### 4. 环境切换
一键切换开发/局域网/生产环境

## 📋 使用规范

### 推荐做法 ✅

```typescript
// 1. 使用 axios (推荐)
import { api } from "@/lib/api";
const data = await api.get("/api/volunteers");

// 2. 使用配置函数
import { getBackendUrl, getApiEndpoint } from "@/config/network";
const response = await fetch(`${getBackendUrl()}/api/xxx`);
// 或
const response = await fetch(getApiEndpoint('/api/xxx'));
```

### 避免做法 ❌

```typescript
// ❌ 不要硬编码 localhost
const response = await fetch("http://localhost:3001/api/xxx");

// ❌ 不要使用相对路径（除非配置了代理）
const response = await fetch("/api/xxx");

// ❌ 不要直接使用环境变量
const url = import.meta.env.VITE_API_URL;
```

## 🔍 检查清单

- [x] 所有 `fetch("http://localhost:3001/...")` 已替换
- [x] 所有 `import.meta.env.VITE_API_URL` 已替换
- [x] axios 配置使用统一配置
- [x] 手机上传使用正确的IP地址
- [x] 文档生成和下载使用统一配置

## 🚀 下一步

1. 测试所有功能在三种环境下是否正常
2. 如果发现遗漏的地方，按照推荐做法修改
3. 部署到生产环境时，修改 `CURRENT_ENV` 为 `'production'`

## 📝 注意事项

1. **修改配置后需要重启开发服务器**
2. **确保后端服务器也在对应地址运行**
3. **生产环境建议使用域名而不是IP**
4. **可以通过环境变量 `VITE_API_BASE_URL` 覆盖配置**
