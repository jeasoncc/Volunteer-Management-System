#!/bin/bash

# 清理导出文件脚本

echo "======================================"
echo "🗑️  清理导出文件"
echo "======================================"
echo ""

if [ ! -d "exports" ]; then
  echo "ℹ️  exports/ 文件夹不存在"
  exit 0
fi

# 统计文件数量
FILE_COUNT=$(ls -1 exports/*.xlsx 2>/dev/null | wc -l)

if [ $FILE_COUNT -eq 0 ]; then
  echo "ℹ️  没有需要清理的文件"
  exit 0
fi

echo "📊 当前文件列表："
ls -lh exports/*.xlsx
echo ""

# 询问确认
read -p "确认删除这 $FILE_COUNT 个文件吗？(y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm exports/*.xlsx
  echo "✅ 已删除 $FILE_COUNT 个文件"
else
  echo "❌ 取消删除"
fi
