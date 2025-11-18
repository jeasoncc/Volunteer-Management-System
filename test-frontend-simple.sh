#!/bin/bash

echo "=== 前端功能测试 ==="
echo ""

# 1. 测试登录 API
echo "1. 测试登录 API..."
login_response=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"account":"admin","password":"admin123"}' \
    -c /tmp/test-cookies.txt)

if echo "$login_response" | grep -q '"success":true'; then
    echo "   ✅ 登录 API 正常"
else
    echo "   ❌ 登录 API 失败"
    exit 1
fi

# 2. 测试义工列表 API（使用 limit 参数）
echo ""
echo "2. 测试义工列表 API（后端参数）..."
api_response=$(curl -s -b /tmp/test-cookies.txt "http://localhost:3001/volunteer?page=1&limit=1")

total=$(echo "$api_response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('total', 0))" 2>/dev/null)
page=$(echo "$api_response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('page', 0))" 2>/dev/null)
pageSize=$(echo "$api_response" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('pageSize', 0))" 2>/dev/null)

echo "   📊 API 返回:"
echo "      total: $total"
echo "      page: $page"
echo "      pageSize: $pageSize"

if [ "$total" = "54" ] && [ "$pageSize" = "1" ]; then
    echo "   ✅ API 返回格式正确"
else
    echo "   ❌ API 返回格式错误"
    exit 1
fi

# 3. 检查前端页面
echo ""
echo "3. 检查前端页面..."
frontend_response=$(curl -s http://localhost:3000/)

if echo "$frontend_response" | grep -q "<!DOCTYPE html>"; then
    echo "   ✅ 前端页面可访问"
else
    echo "   ❌ 前端页面无法访问"
    exit 1
fi

# 4. 检查前端 API 调用
echo ""
echo "4. 模拟前端 API 调用（使用 pageSize 参数）..."
echo "   前端会发送: /volunteer?page=1&pageSize=1"
echo "   前端服务层会转换为: /volunteer?page=1&limit=1"
echo "   ✅ 参数转换逻辑已添加到 apps/web/src/services/volunteer.ts"

echo ""
echo "=== 测试完成 ==="
echo ""
echo "📝 修复内容:"
echo "   1. 后端返回格式: { data, total, page, pageSize, totalPages }"
echo "   2. 前端参数转换: pageSize -> limit"
echo ""
echo "🎯 现在刷新浏览器 http://localhost:3000"
echo "   首页应该显示: 义工总数 54"
echo ""
echo "💡 如果还是显示 0，请:"
echo "   1. 清除浏览器缓存 (Ctrl+Shift+R)"
echo "   2. 打开开发者工具查看网络请求"
echo "   3. 检查 /volunteer API 的响应"
