#!/bin/bash

# 莲花斋管理系统 - 快速测试脚本

echo "🔍 系统状态检查"
echo "================================"

# 检查后端服务
echo ""
echo "1️⃣ 检查后端 API..."
if curl -s http://192.168.5.4:3001/api/v1/health > /dev/null 2>&1; then
    echo "   ✅ 后端服务正常 (http://192.168.5.4:3001)"
else
    echo "   ❌ 后端服务无响应"
fi

# 检查前端服务
echo ""
echo "2️⃣ 检查前端服务..."
if curl -s http://192.168.5.4:3000 > /dev/null 2>&1; then
    echo "   ✅ 前端服务正常 (http://192.168.5.4:3000)"
else
    echo "   ❌ 前端服务无响应"
fi

# 检查 Swagger 文档
echo ""
echo "3️⃣ 检查 API 文档..."
if curl -s http://192.168.5.4:3001/swagger > /dev/null 2>&1; then
    echo "   ✅ Swagger 文档可访问 (http://192.168.5.4:3001/swagger)"
else
    echo "   ❌ Swagger 文档无法访问"
fi

# 检查数据库连接
echo ""
echo "4️⃣ 检查数据库连接..."
if curl -s http://192.168.5.4:3001/api/v1/volunteers?page=1&pageSize=1 > /dev/null 2>&1; then
    echo "   ✅ 数据库连接正常"
else
    echo "   ❌ 数据库连接失败"
fi

# 显示网络信息
echo ""
echo "================================"
echo "📡 网络信息"
echo "================================"
echo "本机 IP: $(hostname -I | awk '{print $1}')"
echo "后端地址: http://192.168.5.4:3001"
echo "前端地址: http://192.168.5.4:3000"
echo "API 文档: http://192.168.5.4:3001/swagger"

echo ""
echo "================================"
echo "📱 手机访问"
echo "================================"
echo "1. 确保手机和电脑在同一局域网"
echo "2. 在手机浏览器访问: http://192.168.5.4:3000"
echo "3. 使用手机扫描二维码上传照片"

echo ""
echo "✅ 检查完成！"
