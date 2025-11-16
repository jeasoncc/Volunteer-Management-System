#!/bin/bash

# 志愿者服务时间统计表月度导出脚本
# 用法: bash scripts/export-monthly.sh 2025 9 [--clean]

if [ $# -lt 2 ]; then
  echo "用法: bash scripts/export-monthly.sh <年份> <月份> [--clean]"
  echo "示例: bash scripts/export-monthly.sh 2025 9"
  echo "      bash scripts/export-monthly.sh 2025 9 --clean  # 导出前清理旧文件"
  exit 1
fi

YEAR=$1
MONTH=$2
CLEAN_FLAG=$3

# 格式化月份（补零）
MONTH_PADDED=$(printf "%02d" $MONTH)

# 如果指定了 --clean 参数，清理旧文件
if [ "$CLEAN_FLAG" = "--clean" ]; then
  echo "🗑️  清理旧文件..."
  if [ -d "exports" ] && [ "$(ls -A exports/*.xlsx 2>/dev/null)" ]; then
    rm exports/*.xlsx
    echo "✅ 已删除 exports/ 文件夹中的所有 .xlsx 文件"
  else
    echo "ℹ️  没有需要清理的文件"
  fi
  echo ""
fi

# 计算月份的最后一天
if [ $MONTH -eq 2 ]; then
  # 2月特殊处理（简化版，不考虑闰年）
  LAST_DAY=28
elif [ $MONTH -eq 4 ] || [ $MONTH -eq 6 ] || [ $MONTH -eq 9 ] || [ $MONTH -eq 11 ]; then
  LAST_DAY=30
else
  LAST_DAY=31
fi

START_DATE="${YEAR}-${MONTH_PADDED}-01"
END_DATE="${YEAR}-${MONTH_PADDED}-${LAST_DAY}"
OUTPUT_FILE="exports/志愿者服务时间统计表_${YEAR}年${MONTH_PADDED}月.xlsx"

echo "======================================"
echo "📊 导出志愿者服务时间统计表"
echo "======================================"
echo "年份: ${YEAR}"
echo "月份: ${MONTH}月"
echo "日期范围: ${START_DATE} 至 ${END_DATE}"
echo "输出文件: ${OUTPUT_FILE}"
echo "======================================"
echo ""

# 导出文件
BASE_URL="http://localhost:3001/api/v1"
curl -s "${BASE_URL}/export/volunteer-service?startDate=${START_DATE}&endDate=${END_DATE}" \
  -o "$OUTPUT_FILE"

# 检查文件是否生成
if [ -f "$OUTPUT_FILE" ]; then
  FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
  echo "✅ 文件已生成: $OUTPUT_FILE"
  echo "📦 文件大小: $FILE_SIZE"
  echo ""
  
  # 使用 file 命令检查文件类型
  file "$OUTPUT_FILE"
  echo ""
  
  echo "✅ 导出完成！"
else
  echo "❌ 文件生成失败"
  exit 1
fi
