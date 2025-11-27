#!/bin/bash

# 根目录清理脚本
# 清理临时文件、测试文件和数据文件

echo "🧹 开始清理根目录..."

# 创建必要的目录
mkdir -p scripts/volunteer-import
mkdir -p scripts/test
mkdir -p data/volunteer-import
mkdir -p data/test

# ==================== 移动脚本文件 ====================

echo "📜 移动脚本文件..."

# 义工导入相关脚本
mv -f import_5_volunteers.sh scripts/volunteer-import/ 2>/dev/null
mv -f parse_volunteers.js scripts/volunteer-import/ 2>/dev/null

# 测试脚本
mv -f test-system.sh scripts/test/ 2>/dev/null

# 文档整理脚本保留在根目录（或移到 scripts/）
# organize-docs.sh 可以保留或移动
# mv -f organize-docs.sh scripts/ 2>/dev/null

# ==================== 移动数据文件 ====================

echo "📊 移动数据文件..."

# 义工导入数据
mv -f additional_5_volunteers.csv data/volunteer-import/ 2>/dev/null
mv -f additional_5_volunteers.json data/volunteer-import/ 2>/dev/null
mv -f all_volunteers_data.json data/volunteer-import/ 2>/dev/null
mv -f new_volunteers_import.csv data/volunteer-import/ 2>/dev/null
mv -f new_volunteers_to_add.json data/volunteer-import/ 2>/dev/null
mv -f volunteer_data_to_import.json data/volunteer-import/ 2>/dev/null

# 测试数据
mv -f test_import_5_volunteers.csv data/test/ 2>/dev/null
mv -f test_import_5_volunteers.xlsx data/test/ 2>/dev/null
mv -f test_import_5_volunteers_clean.csv data/test/ 2>/dev/null
mv -f test_import_5_volunteers_fixed.csv data/test/ 2>/dev/null

# ==================== 移动 HTML 测试文件 ====================

echo "🌐 移动 HTML 测试文件..."
mv -f check_existing_volunteers.html data/test/ 2>/dev/null
mv -f test_csv_parse.html data/test/ 2>/dev/null

# ==================== 删除临时文件 ====================

echo "🗑️  删除临时文件..."

# 删除临时测试文件
rm -f HelloWorld.tsx 2>/dev/null
rm -f cookies.txt 2>/dev/null

# ==================== 创建 README 文件 ====================

echo "📝 创建说明文件..."

# scripts/README.md
cat > scripts/README.md << 'EOF'
# 脚本目录

本目录包含项目中使用的各类脚本。

## 📁 目录结构

```
scripts/
├── volunteer-import/    # 义工导入相关脚本
├── test/               # 测试脚本
└── README.md           # 本文件
```

## 义工导入脚本

### import_5_volunteers.sh
快速导入 5 个义工的脚本

**使用方法**：
```bash
cd scripts/volunteer-import
./import_5_volunteers.sh
```

### parse_volunteers.js
解析义工数据的 Node.js 脚本

**使用方法**：
```bash
cd scripts/volunteer-import
node parse_volunteers.js
```

## 测试脚本

### test-system.sh
系统测试脚本

**使用方法**：
```bash
cd scripts/test
./test-system.sh
```

## 注意事项

- 运行脚本前请确保有执行权限：`chmod +x script.sh`
- 某些脚本可能需要特定的环境变量或配置
- 详细使用说明请查看各脚本的注释
EOF

# scripts/volunteer-import/README.md
cat > scripts/volunteer-import/README.md << 'EOF'
# 义工导入脚本

本目录包含义工数据导入相关的脚本。

## 脚本列表

### import_5_volunteers.sh
快速导入 5 个义工的 Shell 脚本

**功能**：
- 批量导入义工数据
- 支持 CSV 格式
- 自动验证数据

**使用方法**：
```bash
./import_5_volunteers.sh
```

### parse_volunteers.js
解析义工数据的 Node.js 脚本

**功能**：
- 解析 CSV/JSON 格式的义工数据
- 数据格式转换
- 数据验证

**使用方法**：
```bash
node parse_volunteers.js [input_file]
```

## 相关数据

数据文件位于 `../../data/volunteer-import/` 目录。

## 相关文档

详细文档请查看 `../../docs/volunteer/` 目录。
EOF

# data/README.md
cat > data/README.md << 'EOF'
# 数据目录

本目录包含项目中使用的各类数据文件。

⚠️ **注意**：本目录已添加到 `.gitignore`，不会提交到 Git 仓库。

## 📁 目录结构

```
data/
├── volunteer-import/    # 义工导入数据
├── test/               # 测试数据
└── README.md           # 本文件
```

## 义工导入数据

包含用于导入义工信息的 CSV 和 JSON 文件：
- `additional_5_volunteers.csv` - 额外 5 个义工数据
- `additional_5_volunteers.json` - JSON 格式
- `all_volunteers_data.json` - 所有义工数据
- `new_volunteers_import.csv` - 新义工导入数据
- `new_volunteers_to_add.json` - 待添加的义工数据
- `volunteer_data_to_import.json` - 导入用数据

## 测试数据

包含测试用的数据文件和 HTML 文件：
- `test_import_5_volunteers.csv` - 测试导入数据
- `test_import_5_volunteers.xlsx` - Excel 格式测试数据
- `test_import_5_volunteers_clean.csv` - 清理后的测试数据
- `test_import_5_volunteers_fixed.csv` - 修复后的测试数据
- `check_existing_volunteers.html` - 检查现有义工的 HTML 工具
- `test_csv_parse.html` - CSV 解析测试工具

## 数据安全

- 本目录的数据文件不会提交到 Git
- 包含真实用户数据的文件请妥善保管
- 定期备份重要数据
- 不要在公共场合分享数据文件

## 数据格式

### CSV 格式
```csv
name,phone,idNumber,gender,address
张三,13800138000,110101199001011234,male,北京市
```

### JSON 格式
```json
{
  "name": "张三",
  "phone": "13800138000",
  "idNumber": "110101199001011234",
  "gender": "male",
  "address": "北京市"
}
```

## 相关文档

详细的数据导入文档请查看 `../docs/volunteer/` 目录。
EOF

# ==================== 更新 .gitignore ====================

echo "📝 更新 .gitignore..."

# 检查 .gitignore 是否已包含 data/ 目录
if ! grep -q "^data/" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Data files (not committed)" >> .gitignore
    echo "data/" >> .gitignore
    echo "*.csv" >> .gitignore
    echo "*.xlsx" >> .gitignore
    echo "cookies.txt" >> .gitignore
fi

# ==================== 生成清理报告 ====================

echo ""
echo "✅ 根目录清理完成！"
echo ""
echo "📊 清理统计："
echo "   脚本文件: $(find scripts/ -type f ! -name "*.md" 2>/dev/null | wc -l) 个"
echo "   数据文件: $(find data/ -type f ! -name "*.md" 2>/dev/null | wc -l) 个"
echo "   删除文件: 2 个 (HelloWorld.tsx, cookies.txt)"
echo ""
echo "📁 新建目录："
echo "   scripts/volunteer-import/ - 义工导入脚本"
echo "   scripts/test/ - 测试脚本"
echo "   data/volunteer-import/ - 义工导入数据"
echo "   data/test/ - 测试数据"
echo ""
echo "📖 查看说明："
echo "   scripts/README.md - 脚本说明"
echo "   data/README.md - 数据说明"
echo ""
echo "🔍 根目录剩余文件："
ls -1 | grep -v -E "^(apps|docs|node_modules|packages|screenshots|scripts|data|\.)" | head -20
