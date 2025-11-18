#!/bin/bash

echo "=== 测试登录功能 ==="
echo ""

echo "1. 检查后端服务..."
if curl -s http://localhost:3001/api/auth/login > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常 (http://localhost:3001)"
else
    echo "❌ 后端服务无法访问"
    exit 1
fi

echo ""
echo "2. 检查前端服务..."
if curl -s http://localhost:3002/ > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常 (http://localhost:3002)"
else
    echo "❌ 前端服务无法访问"
    exit 1
fi

echo ""
echo "3. 测试登录 API..."
response=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"account":"admin","password":"admin123"}')

if echo "$response" | grep -q '"success":true'; then
    echo "✅ 登录成功！"
    echo ""
    echo "响应数据:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
    echo "❌ 登录失败"
    echo "响应: $response"
    exit 1
fi

echo ""
echo "=== 所有测试通过！==="
echo ""
echo "📝 访问地址:"
echo "   前端: http://localhost:3002"
echo "   后端: http://localhost:3001"
echo "   API 文档: http://localhost:3001/swagger"
echo ""
echo "🔑 测试账号:"
echo "   账号: admin"
echo "   密码: admin123"
