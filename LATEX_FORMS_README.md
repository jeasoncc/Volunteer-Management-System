# LaTeX 表格生成功能说明

## 概述

使用 LaTeX 生成专业的 PDF 表格文档，包括：
1. **深圳莲花关怀团关怀登记表**
2. **助念邀请承诺书**

## 为什么使用 LaTeX？

### 优势
- ✅ **更简单** - LaTeX 专门用于文档排版，表格语法清晰
- ✅ **更专业** - 输出的 PDF 质量更高，适合打印
- ✅ **更灵活** - 容易调整样式和布局
- ✅ **更可靠** - 不需要复杂的 Excel 单元格操作
- ✅ **中文支持好** - 使用 ctex 宏包完美支持中文

### 对比 ExcelJS
| 特性 | LaTeX | ExcelJS |
|------|-------|---------|
| 复杂表格 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 中文支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 打印质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 代码简洁 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 学习曲线 | ⭐⭐⭐ | ⭐⭐⭐⭐ |

## 系统要求

### 安装 TeX Live（包含 XeLaTeX）

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install texlive-full texlive-xetex texlive-lang-chinese
```

#### macOS
```bash
brew install --cask mactex
```

#### 验证安装
```bash
xelatex --version
```

应该看到类似输出：
```
XeTeX 3.141592653-2.6-0.999995 (TeX Live 2023)
```

## API 端点

### 1. 生成关怀登记表

```
POST /api/document/care-registration
```

**请求体**:
```json
{
  "projectDate": "2025年11月17日",
  "serialNumber": "了缘 生根之床",
  "name": "柯景金",
  "gender": "男",
  "age": 69,
  "religion": "佛",
  "address": "深圳市罗湖区布心路东乐花园4A栋5A",
  "familyStatus": "柯锦燕",
  "familyPhone": "13602504789",
  "illness": "尿毒症",
  "careDate": "参加莲友",
  "patientCondition": "同意义工关怀\\n同意助念流程\\n家属们助念配合",
  "notes": "身高172cm，体重50斤"
}
```

**响应**:
```json
{
  "success": true,
  "filePath": "/path/to/file.pdf",
  "fileName": "关怀登记表_柯景金_2024-11-20T10-30-00.pdf",
  "downloadUrl": "/public/关怀登记表_柯景金_2024-11-20T10-30-00.pdf"
}
```

### 2. 生成助念邀请承诺书

```
POST /api/document/invitation-letter
```

**请求体**:
```json
{
  "teamName": "莲花生命关怀团",
  "deceasedName": "柯景金",
  "familyName": "柯锦燕"
}
```

**响应**:
```json
{
  "success": true,
  "filePath": "/path/to/file.pdf",
  "fileName": "助念邀请承诺书_柯景金_2024-11-20T10-30-00.pdf",
  "downloadUrl": "/public/助念邀请承诺书_柯景金_2024-11-20T10-30-00.pdf"
}
```

## 前端使用

### 在文档管理页面

1. 登录系统
2. 进入"文档管理"页面
3. 在"表格文档生成"卡片中：
   - 点击"生成关怀登记表"按钮
   - 或点击"生成助念邀请承诺书"按钮
4. 系统自动生成并下载 PDF 文件

### 示例代码

```typescript
// 生成关怀登记表
const response = await fetch('/api/document/care-registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectDate: '2025年11月17日',
    name: '柯景金',
    gender: '男',
    age: 69,
    // ... 其他字段
  }),
});

const result = await response.json();
// 下载 PDF
window.open(result.downloadUrl);
```

## LaTeX 模板说明

### 关怀登记表模板

使用的 LaTeX 包：
- `ctex` - 中文支持
- `geometry` - 页面布局
- `longtable` - 长表格支持
- `booktabs` - 专业表格线

关键特性：
- A4 纸张大小
- 自动换行
- 单元格合并
- 边框样式

### 助念邀请承诺书模板

使用的 LaTeX 包：
- `ctex` - 中文支持
- `geometry` - 页面布局

关键特性：
- 标准文档格式
- 段落缩进
- 签名栏
- 边框框架

## 自定义模板

### 修改表格样式

编辑 `apps/api/src/modules/document/latex-generator.ts`：

```typescript
// 修改页边距
\\geometry{left=2cm,right=2cm,top=2cm,bottom=2cm}

// 修改字体大小
\\documentclass[a4paper,14pt]{article}  // 改为14pt

// 修改表格列宽
\\begin{longtable}{|p{4cm}|p{2cm}|...}  // 调整列宽
```

### 添加新字段

1. 在接口中添加字段定义
2. 在 LaTeX 模板中添加对应行
3. 更新 API 路由的验证规则

## 故障排除

### 问题1: xelatex 命令未找到

**解决方案**: 安装 TeX Live
```bash
sudo apt-get install texlive-xetex
```

### 问题2: 中文显示乱码

**解决方案**: 安装中文字体包
```bash
sudo apt-get install texlive-lang-chinese
```

### 问题3: 编译超时

**解决方案**: 增加超时时间
```typescript
execSync(`xelatex ...`, {
  stdio: 'pipe',
  timeout: 30000  // 30秒
})
```

### 问题4: PDF 无法下载

**检查**:
1. `public` 目录是否存在
2. 文件权限是否正确
3. 路径是否正确

## 性能优化

### 1. 缓存编译结果

对于相同数据，可以缓存生成的 PDF：

```typescript
const cacheKey = JSON.stringify(data);
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 2. 异步处理

对于大量文档生成，使用队列：

```typescript
import Bull from 'bull';

const pdfQueue = new Bull('pdf-generation');

pdfQueue.process(async (job) => {
  return await LatexGenerator.generateCareRegistrationForm(job.data);
});
```

### 3. 清理临时文件

定期清理旧的 PDF 文件：

```bash
# 删除7天前的文件
find public -name "*.pdf" -mtime +7 -delete
```

## 文件结构

```
apps/api/src/modules/document/
├── service.ts              # 原有的 Excel 生成服务
├── latex-generator.ts      # 新的 LaTeX 生成服务
└── index.ts               # API 路由

apps/web/src/routes/
└── documents.tsx          # 文档管理页面（包含生成按钮）

public/                    # 生成的 PDF 文件存储目录
├── 关怀登记表_*.pdf
└── 助念邀请承诺书_*.pdf
```

## 后续优化

### 短期
- [ ] 添加表单输入界面（替代硬编码数据）
- [ ] 支持批量生成
- [ ] 添加预览功能
- [ ] 支持模板选择

### 中期
- [ ] 添加更多表格模板
- [ ] 支持自定义字段
- [ ] 添加水印功能
- [ ] 支持电子签名

### 长期
- [ ] 在线编辑器
- [ ] 模板市场
- [ ] 版本控制
- [ ] 协作编辑

## 相关资源

- [LaTeX 官方文档](https://www.latex-project.org/)
- [CTeX 宏包文档](https://ctan.org/pkg/ctex)
- [XeLaTeX 教程](https://www.overleaf.com/learn/latex/XeLaTeX)
- [表格生成工具](https://www.tablesgenerator.com/)

## 技术支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查系统日志
3. 联系开发团队

---

**实现时间**: 2024-11-20
**版本**: v1.0.0
**状态**: ✅ 可用
