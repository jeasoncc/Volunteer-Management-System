#!/bin/bash

# 测试 LaTeX 表格生成功能

echo "🧪 测试 LaTeX 表格生成功能"
echo "================================"

# 检查 xelatex 是否安装
echo ""
echo "1️⃣ 检查 XeLaTeX 安装..."
if command -v xelatex &> /dev/null; then
    echo "✅ XeLaTeX 已安装"
    xelatex --version | head -n 1
else
    echo "❌ XeLaTeX 未安装"
    echo "请运行: sudo apt-get install texlive-xetex texlive-lang-chinese"
    exit 1
fi

# 检查后端服务
echo ""
echo "2️⃣ 检查后端服务..."
if curl -s http://localhost:3001/api/document/excel > /dev/null; then
    echo "✅ 后端服务运行中"
else
    echo "❌ 后端服务未运行"
    echo "请运行: bun run dev"
    exit 1
fi

# 测试生成关怀登记表
echo ""
echo "3️⃣ 测试生成关怀登记表..."
response=$(curl -s -X POST http://localhost:3001/api/document/care-registration \
  -H "Content-Type: application/json" \
  -d '{
    "projectDate": "2025年11月17日",
    "serialNumber": "了缘 生根之床",
    "name": "测试人员",
    "gender": "男",
    "age": 70,
    "address": "深圳市罗湖区",
    "familyStatus": "家属姓名",
    "familyPhone": "13800138000",
    "illness": "测试病况"
  }')

if echo "$response" | grep -q "success"; then
    echo "✅ 关怀登记表生成成功"
    filename=$(echo "$response" | grep -o '"fileName":"[^"]*"' | cut -d'"' -f4)
    echo "   文件名: $filename"
else
    echo "❌ 关怀登记表生成失败"
    echo "$response"
fi

# 测试生成助念邀请承诺书
echo ""
echo "4️⃣ 测试生成助念邀请承诺书..."
response=$(curl -s -X POST http://localhost:3001/api/document/invitation-letter \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "莲花生命关怀团",
    "deceasedName": "测试人员",
    "familyName": "家属姓名"
  }')

if echo "$response" | grep -q "success"; then
    echo "✅ 助念邀请承诺书生成成功"
    filename=$(echo "$response" | grep -o '"fileName":"[^"]*"' | cut -d'"' -f4)
    echo "   文件名: $filename"
else
    echo "❌ 助念邀请承诺书生成失败"
    echo "$response"
fi

# 检查生成的文件
echo ""
echo "5️⃣ 检查生成的文件..."
pdf_count=$(find apps/api/public -name "*.pdf" -mmin -1 | wc -l)
if [ "$pdf_count" -gt 0 ]; then
    echo "✅ 找到 $pdf_count 个新生成的 PDF 文件"
    find apps/api/public -name "*.pdf" -mmin -1 -exec ls -lh {} \;
else
    echo "⚠️  未找到新生成的 PDF 文件"
fi

echo ""
echo "================================"
echo "✅ 测试完成！"
echo ""
echo "📝 查看生成的文件:"
echo "   ls -lh apps/api/public/*.pdf"
echo ""
echo "📖 查看文档:"
echo "   cat LATEX_FORMS_README.md"
