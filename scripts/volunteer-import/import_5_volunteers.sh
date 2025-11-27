#!/bin/bash

# 导入5个义工的脚本
# 使用方法: ./import_5_volunteers.sh

API_URL="http://localhost:3000/api/volunteer"
TOKEN="YOUR_AUTH_TOKEN_HERE"  # 请替换为实际的认证token

echo "开始导入5个义工..."
echo "================================"

# 读取JSON文件
VOLUNTEERS=$(cat additional_5_volunteers.json)

# 计数器
SUCCESS=0
FAILED=0

# 逐个导入
echo "$VOLUNTEERS" | jq -c '.[]' | while read volunteer; do
    NAME=$(echo "$volunteer" | jq -r '.name')
    echo ""
    echo "正在导入: $NAME"
    
    # 发送POST请求
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$volunteer")
    
    # 获取HTTP状态码
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
        echo "✅ $NAME 导入成功"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "❌ $NAME 导入失败 (HTTP $HTTP_CODE)"
        echo "   错误信息: $BODY"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "================================"
echo "导入完成！"
echo "成功: $SUCCESS 个"
echo "失败: $FAILED 个"
echo "总计: 5 个"