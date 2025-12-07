#!/bin/bash

echo "🚀 启动开发服务器..."
echo ""

# 检查是否已经在运行
if curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3001/api/health 2>/dev/null | grep -q "200"; then
    echo "⚠️  API服务器已经在运行"
else
    echo "📦 启动API服务器..."
    cd apps/api
    bun run dev &
    API_PID=$!
    echo "   PID: $API_PID"
    cd ../..
fi

sleep 2

if curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3000 2>/dev/null | grep -q "200"; then
    echo "⚠️  Web前端已经在运行"
else
    echo "🌐 启动Web前端..."
    cd apps/web
    bun run dev &
    WEB_PID=$!
    echo "   PID: $WEB_PID"
    cd ../..
fi

echo ""
echo "✅ 服务器启动完成！"
echo ""
echo "📍 访问地址:"
echo "   - Web前端: http://192.168.5.4:3000"
echo "   - API后端: http://192.168.5.4:3001"
echo ""
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 查看日志: tail -f apps/api/logs/*.log"
echo ""

# 等待用户中断
wait
