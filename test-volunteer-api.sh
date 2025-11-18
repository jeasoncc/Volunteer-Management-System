#!/bin/bash

echo "=== 测试义工 API ==="
echo ""

# 登录获取 cookie
echo "1. 登录..."
curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"account":"admin","password":"admin123"}' \
    -c /tmp/cookies.txt > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ 登录成功"
else
    echo "❌ 登录失败"
    exit 1
fi

echo ""
echo "2. 获取义工列表..."
response=$(curl -s -b /tmp/cookies.txt "http://localhost:3001/volunteer?page=1&limit=10")

# 检查响应
if echo "$response" | grep -q '"data"'; then
    echo "✅ API 响应正常"
    
    # 提取统计信息
    total=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total', 0))" 2>/dev/null)
    page=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('page', 0))" 2>/dev/null)
    pageSize=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('pageSize', 0))" 2>/dev/null)
    totalPages=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('totalPages', 0))" 2>/dev/null)
    
    echo ""
    echo "📊 统计信息:"
    echo "   义工总数: $total"
    echo "   当前页: $page"
    echo "   每页数量: $pageSize"
    echo "   总页数: $totalPages"
else
    echo "❌ API 响应异常"
    echo "响应: $response"
    exit 1
fi

echo ""
echo "3. 检查数据库..."
db_count=$(mysql -h 127.0.0.1 -P 3307 -u root -padmin123 -D lotus -e "SELECT COUNT(*) FROM volunteer;" 2>&1 | grep -v "Deprecated" | tail -1)
echo "   数据库中的义工数: $db_count"

echo ""
echo "=== 测试完成 ==="
echo ""
echo "✅ 前端应该能正常显示义工总数了！"
echo ""
echo "📝 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
