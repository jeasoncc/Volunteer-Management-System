# 助念记录表功能测试指南

## 功能概述

已在后端 document 模块添加生成"深圳莲花关怀团助念记录表"的功能。

## 后端实现

### API 端点

```
POST /api/document/care-record
```

### 请求体示例

```json
{
  "name": "柯景金",
  "gender": "男",
  "age": 69,
  "education": "",
  "address": "了东省深圳市(县)罗湖区(镇)布心路",
  "workplace": "了东省深圳市罗湖区布心路下水径",
  "reportDate": "2025年11月17日12时30分",
  "reportReason": "",
  "hasInsurance": false,
  "assistantStartTime": "",
  "assistantDuration": "小时",
  "hasFamily": true,
  "familyCount": 1,
  "dharmaName": "",
  "hasTakingRefuge": false,
  "hasFivePrecepts": false,
  "hasBodhisattvaPrecepts": false,
  "hasOtherPrecepts": false,
  "baptismType": "修行打坐",
  "religion": "佛教教",
  "deathCondition": "安详",
  "hasFamily2": true,
  "hasChanting": true,
  "hasSuffering": true,
  "hasMovement": true,
  "burialTime": "",
  "hasLawyer": true,
  "hobbies": ["看书", "登山"],
  "personality": "",
  "childrenAttitude": ["慈教", "慈爱"],
  "goodDeeds": ["供佛", "做生"],
  "unfinishedWishes": "女三儿内对6时限",
  "lifeSummary": "乐于助人 乐善好施",
  "mainFamily": {
    "name": "柯锦燕",
    "phone": "13602504789",
    "relationship": "女"
  },
  "familyAddress": "了东省深圳市(县)罗湖区(镇)布心路"
}
```

### 响应示例

```json
{
  "success": true,
  "filePath": "/path/to/file.xlsx",
  "fileName": "助念记录表_柯景金_2024-11-20T10-30-00.xlsx",
  "downloadUrl": "/public/助念记录表_柯景金_2024-11-20T10-30-00.xlsx"
}
```

## 前端实现

### 1. 服务层 (apps/web/src/services/document.ts)

添加了以下方法：
- `createCareRecord(data)` - 生成助念记录表
- `downloadCareRecord(downloadUrl)` - 下载生成的文件

### 2. 表单组件 (apps/web/src/components/CareRecordForm.tsx)

完整的表单组件，包含所有字段：
- 基本信息（姓名、性别、年龄、学历、地址等）
- 报损信息（时间、原因、心脏起搏器）
- 助念信息（开始时间、时长、家属情况）
- 法名和受戒（法名、皈依、五戒、菩萨戒等）
- 临终状态（安详/疾苦、家人意愿、念佛情况）
- 其他信息（兴趣爱好、个性、心愿、生平总结）
- 主事家属（姓名、电话、关系、地址）

### 3. 文档管理页面 (apps/web/src/routes/documents.tsx)

在文档管理页面添加了"助念记录表"卡片，点击后打开表单对话框。

## 使用流程

### 前端使用

1. 登录系统
2. 进入"文档管理"页面
3. 点击"创建助念记录表"按钮
4. 填写表单信息
5. 点击"生成记录表"
6. 系统自动生成并下载 Excel 文件

### API 测试

使用 curl 测试：

```bash
curl -X POST http://localhost:3001/api/document/care-record \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试人员",
    "gender": "男",
    "age": 70,
    "address": "深圳市罗湖区",
    "reportDate": "2024-11-20 10:00",
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
      "name": "家属姓名",
      "phone": "13800138000",
      "relationship": "女"
    },
    "familyAddress": "深圳市罗湖区"
  }'
```

## 生成的表格特点

1. **完整的表单结构**：包含所有必填和选填字段
2. **专业的格式**：符合深圳莲花关怀团的标准格式
3. **自动边框**：所有单元格自动添加边框
4. **合理的布局**：多列合并、行高设置等
5. **易于打印**：A4 纵向打印格式

## 表格字段说明

### 基本信息
- 姓名、性别、年龄、学历
- 籍贯住址、职业/单位

### 报损信息
- 会损时间、会损原因
- 是否准备心脏起搏器

### 助念信息
- 助念开始/结束时间
- 助念时长（小时）
- 是否有家属、家属人数

### 法名和受戒
- 法名
- 受戒情形（皈依、五戒、菩萨戒、其他）
- 修行情形（修行打坐、听经、诵经、念佛、拜忏）
- 平生信仰（佛教、天主教、回教、其它）

### 临终状态
- 临终疾苦或是安详
- 临终家人是否愿意
- 亡者临终是否念佛
- 时内是否痛苦
- 助念期间是否移动遗体
- 在医院或家中断气

### 入殓信息
- 何时入殓或火化
- 有否慈善团体助念
- 有否法师居士开示

### 兴趣爱好
- 兴趣爱好（看书、登山、唱歌、旅游、助人、钓鱼、其它）
- 个性习性

### 对待子女
- 对待子女（慈教、慈爱、训斥）
- 对待长辈（孝养、乱孝、不孝）
- 有何理想

### 做何善事
- 印经、供佛、放生、救难、造佛像、做生、慈善寺庙、其它

### 有何心愿未了
- 自由文本输入

### 生平事迹总结
- 自由文本输入

### 主事家属
- 姓名、电话
- 与往生者关系（夫、妻、儿、女、其它）

### 家属现住址
- 省、市、区、镇、路

## 注意事项

1. **必填字段**：姓名、性别、年龄、地址、报损时间、临终状态、主事家属信息、家属地址
2. **日期格式**：建议使用 ISO 8601 格式或中文格式
3. **文件命名**：自动生成，格式为 `助念记录表_姓名_时间戳.xlsx`
4. **文件存储**：生成的文件保存在 `public` 目录下
5. **下载方式**：前端自动触发下载

## 后续优化建议

1. **模板管理**：支持保存常用模板
2. **历史记录**：保存已生成的记录表
3. **批量生成**：支持批量生成多个记录表
4. **PDF 导出**：除了 Excel，也支持导出 PDF
5. **打印预览**：生成前预览打印效果
6. **数据验证**：增强表单验证规则
7. **自动填充**：从义工信息自动填充部分字段

## 相关文件

### 后端
- `apps/api/src/modules/document/service.ts` - 服务实现
- `apps/api/src/modules/document/index.ts` - API 路由

### 前端
- `apps/web/src/services/document.ts` - 服务层
- `apps/web/src/components/CareRecordForm.tsx` - 表单组件
- `apps/web/src/components/ui/radio-group.tsx` - 单选按钮组件
- `apps/web/src/routes/documents.tsx` - 文档管理页面

## 测试清单

- [ ] 后端 API 测试
- [ ] 前端表单填写测试
- [ ] 文件生成测试
- [ ] 文件下载测试
- [ ] 必填字段验证测试
- [ ] 边界情况测试（空值、特殊字符等）
- [ ] 打印效果测试
- [ ] 多用户并发测试

---

**实现时间**: 2024-11-20
**实现人**: Kiro AI Assistant
**功能状态**: ✅ 已完成
