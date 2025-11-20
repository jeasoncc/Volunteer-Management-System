# 助念记录表功能安装指南

## 安装步骤

### 1. 安装前端依赖

```bash
cd apps/web
bun add @radix-ui/react-radio-group
```

### 2. 安装后端依赖（如果还没有）

```bash
cd apps/api
bun add exceljs
```

### 3. 启动项目

```bash
# 在项目根目录
bun run dev
```

## 验证安装

### 1. 检查后端 API

```bash
curl -X POST http://localhost:3001/api/document/care-record \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "gender": "男",
    "age": 70,
    "address": "深圳",
    "reportDate": "2024-11-20",
    "hasInsurance": false,
    "hasFamily": true,
    "hasTakingRefuge": false,
    "hasFivePrecepts": false,
    "hasBodhisattvaPrecepts": false,
    "hasOtherPrecepts": false,
    "deathCondition": "安详",
    "hasFamily2": true,
    "hasChanting": true,
    "hasSuffering": false,
    "hasMovement": false,
    "hasLawyer": true,
    "mainFamily": {
      "name": "家属",
      "phone": "13800138000",
      "relationship": "女"
    },
    "familyAddress": "深圳"
  }'
```

### 2. 检查前端页面

1. 访问 http://localhost:3000
2. 登录系统
3. 进入"文档管理"页面
4. 应该能看到"助念记录表"卡片
5. 点击"创建助念记录表"按钮
6. 应该能打开表单对话框

## 文件清单

### 新增文件

#### 后端
- `apps/api/src/modules/document/service.ts` - 更新（添加 createCareRecordForm 方法）
- `apps/api/src/modules/document/index.ts` - 更新（添加 POST /care-record 路由）

#### 前端
- `apps/web/src/services/document.ts` - 更新（添加 createCareRecord 和 downloadCareRecord 方法）
- `apps/web/src/components/CareRecordForm.tsx` - 新增（表单组件）
- `apps/web/src/components/ui/radio-group.tsx` - 新增（单选按钮组件）
- `apps/web/src/routes/documents.tsx` - 更新（添加助念记录表功能）

#### 文档
- `test-care-record.md` - 测试指南
- `助念记录表功能说明.md` - 功能说明
- `INSTALL_CARE_RECORD.md` - 本文件

## 常见问题

### Q: 提示找不到 RadioGroup 组件
A: 运行 `cd apps/web && bun add @radix-ui/react-radio-group`

### Q: 生成的文件在哪里？
A: 文件保存在 `apps/api/public/` 目录下，前端会自动触发下载

### Q: 如何自定义表格样式？
A: 修改 `apps/api/src/modules/document/service.ts` 中的 `createCareRecordForm` 方法

### Q: 如何添加新字段？
A: 
1. 在 `CareRecordData` 接口中添加字段定义
2. 在 `CareRecordForm.tsx` 中添加表单输入
3. 在 `createCareRecordForm` 方法中添加表格行

### Q: 如何修改表格布局？
A: 修改 `createCareRecordForm` 方法中的单元格合并和行高设置

## 技术栈

- **后端**: Elysia + Bun + ExcelJS
- **前端**: React 19 + TanStack Router + shadcn/ui
- **表格生成**: ExcelJS
- **表单验证**: React Hook Form (可选)

## 下一步

1. ✅ 测试基本功能
2. ✅ 测试必填字段验证
3. ✅ 测试文件生成和下载
4. ⏳ 添加表单草稿保存功能
5. ⏳ 添加历史记录查询功能
6. ⏳ 添加模板管理功能
7. ⏳ 添加 PDF 导出功能

## 支持

如有问题，请查看：
- `test-care-record.md` - 详细测试指南
- `助念记录表功能说明.md` - 功能说明
- 或联系开发团队

---

**安装时间**: 2024-11-20
**版本**: v1.0.0
