#!/bin/bash

# 批量导出志愿者服务时间统计表
# 用法: bash scripts/export-batch.sh 2025 9 10 11

if [ $# -lt 2 ]; then
  echo "用法: bash scripts/export-batch.sh <年份> <月份1> [月份2] [月份3] ..."
  echo "示例: bash scripts/export-batch.sh 2025 9 10 11"
  exit 1
fi

YEAR=$1
shift  # 移除第一个参数（年份）
MONTHS=("$@")  # 剩余参数作为月份数组

echo "======================================"
echo "📊 批量导出志愿者服务时间统计表"
echo "======================================"
echo "年份: ${YEAR}"
echo "月份: ${MONTHS[*]}"
echo "======================================"
echo ""

# 询问是否清理旧文件
read -p "是否清理 exports/ 文件夹中的旧文件？(y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [ -d "exports" ] && [ "$(ls -A exports/*.xlsx 2>/dev/null)" ]; then
    FILE_COUNT=$(ls -1 exports/*.xlsx 2>/dev/null | wc -l)
    rm exports/*.xlsx
    echo "✅ 已删除 $FILE_COUNT 个旧文件"
  else
    echo "ℹ️  没有需要清理的文件"
  fi
  echo ""
fi

# 循环导出每个月份
SUCCESS_COUNT=0
FAIL_COUNT=0

for MONTH in "${MONTHS[@]}"; do
  echo "📅 正在导出 ${YEAR}年${MONTH}月..."
  
  if bash scripts/export-monthly.sh $YEAR $MONTH > /dev/null 2>&1; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✅ ${YEAR}年${MONTH}月 导出成功"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "❌ ${YEAR}年${MONTH}月 导出失败"
  fi
  echo ""
done

echo "======================================"
echo "📊 导出完成"
echo "======================================"
echo "成功: $SUCCESS_COUNT 个月份"
echo "失败: $FAIL_COUNT 个月份"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
  echo "📁 导出的文件："
  ls -lh exports/*.xlsx
fi
