#!/bin/bash

echo "=========================================="
echo "照片显示问题诊断工具"
echo "=========================================="
echo ""

# 1. 检查照片文件
echo "1️⃣  检查照片文件..."
PHOTO_DIR="apps/api/public/upload/avatar"
if [ -d "$PHOTO_DIR" ]; then
    TOTAL_PHOTOS=$(ls -1 "$PHOTO_DIR"/*.jpg "$PHOTO_DIR"/*.jpeg "$PHOTO_DIR"/*.png 2>/dev/null | wc -l)
    JPG_COUNT=$(ls -1 "$PHOTO_DIR"/*.jpg 2>/dev/null | wc -l)
    JPEG_COUNT=$(ls -1 "$PHOTO_DIR"/*.jpeg 2>/dev/null | wc -l)
    PNG_COUNT=$(ls -1 "$PHOTO_DIR"/*.png 2>/dev/null | wc -l)
    
    echo "   ✅ 照片目录存在: $PHOTO_DIR"
    echo "   📊 照片统计:"
    echo "      - 总数: $TOTAL_PHOTOS"
    echo "      - JPG: $JPG_COUNT"
    echo "      - JPEG: $JPEG_COUNT"
    echo "      - PNG: $PNG_COUNT"
    
    if [ $TOTAL_PHOTOS -eq 0 ]; then
        echo "   ⚠️  警告: 没有找到任何照片文件！"
    fi
else
    echo "   ❌ 照片目录不存在: $PHOTO_DIR"
fi
echo ""

# 2. 检查数据库连接
echo "2️⃣  检查数据库..."
if docker ps | grep -q mysql_test; then
    echo "   ✅ 测试数据库容器运行中"
    
    # 查询数据库中的照片路径
    PHOTO_COUNT=$(docker exec mysql_test sh -c 'mysql -uroot -padmin123 -e "SELECT COUNT(*) FROM volunteer WHERE avatar IS NOT NULL;" lotus 2>/dev/null' | tail -1)
    echo "   📊 数据库中有照片的义工数: $PHOTO_COUNT"
    
    # 显示几个示例
    echo "   📸 示例照片路径:"
    docker exec mysql_test sh -c 'mysql -uroot -padmin123 -e "SELECT lotus_id, name, avatar FROM volunteer WHERE avatar IS NOT NULL LIMIT 5;" lotus 2>/dev/null' | tail -n +2 | while read line; do
        echo "      $line"
    done
else
    echo "   ❌ 测试数据库容器未运行"
fi
echo ""

# 3. 检查API服务器
echo "3️⃣  检查API服务器..."
if curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3001/api/health 2>/dev/null | grep -q "200"; then
    echo "   ✅ API服务器运行中: http://192.168.5.4:3001"
else
    echo "   ❌ API服务器未运行或无法访问"
    echo "   💡 请运行: cd apps/api && bun run dev"
fi
echo ""

# 4. 检查Web前端
echo "4️⃣  检查Web前端..."
if curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3000 2>/dev/null | grep -q "200"; then
    echo "   ✅ Web前端运行中: http://192.168.5.4:3000"
else
    echo "   ❌ Web前端未运行或无法访问"
    echo "   💡 请运行: cd apps/web && bun run dev"
fi
echo ""

# 5. 检查网络配置
echo "5️⃣  检查网络配置..."
echo "   📝 Web前端配置 (apps/web/src/config/network.ts):"
CURRENT_ENV=$(grep "CURRENT_ENV:" apps/web/src/config/network.ts | grep -oP "'[^']+'" | tr -d "'")
echo "      当前环境: $CURRENT_ENV"

if [ "$CURRENT_ENV" = "lan" ]; then
    echo "      ✅ 配置正确 (使用局域网IP)"
    echo "      后端地址: http://192.168.5.4:3001"
elif [ "$CURRENT_ENV" = "development" ]; then
    echo "      ⚠️  使用开发环境 (localhost)"
    echo "      后端地址: http://localhost:3001"
    echo "      💡 如果要在其他设备访问，请改为 'lan'"
fi
echo ""

# 6. 测试照片访问
echo "6️⃣  测试照片访问..."
TEST_PHOTO=$(ls -1 "$PHOTO_DIR"/*.jpg 2>/dev/null | head -1)
if [ -n "$TEST_PHOTO" ]; then
    PHOTO_NAME=$(basename "$TEST_PHOTO")
    PHOTO_URL="http://192.168.5.4:3001/upload/avatar/$PHOTO_NAME"
    echo "   测试照片: $PHOTO_NAME"
    echo "   完整URL: $PHOTO_URL"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PHOTO_URL" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ 照片可以访问 (HTTP $HTTP_CODE)"
    else
        echo "   ❌ 照片无法访问 (HTTP $HTTP_CODE)"
    fi
else
    echo "   ⚠️  没有找到测试照片"
fi
echo ""

# 7. 诊断结果
echo "=========================================="
echo "📋 诊断结果总结"
echo "=========================================="

ISSUES=0

if [ ! -d "$PHOTO_DIR" ] || [ $TOTAL_PHOTOS -eq 0 ]; then
    echo "❌ 问题1: 照片文件缺失"
    ISSUES=$((ISSUES + 1))
fi

if ! docker ps | grep -q mysql_test; then
    echo "❌ 问题2: 数据库未运行"
    ISSUES=$((ISSUES + 1))
fi

if ! curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3001/api/health 2>/dev/null | grep -q "200"; then
    echo "❌ 问题3: API服务器未运行"
    ISSUES=$((ISSUES + 1))
fi

if ! curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3000 2>/dev/null | grep -q "200"; then
    echo "❌ 问题4: Web前端未运行"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ 所有检查通过！"
    echo ""
    echo "💡 如果照片仍然无法显示，请检查:"
    echo "   1. 浏览器控制台是否有错误"
    echo "   2. 网络请求是否成功 (F12 -> Network)"
    echo "   3. 照片URL是否正确"
else
    echo ""
    echo "🔧 修复建议:"
    
    if ! curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3001/api/health 2>/dev/null | grep -q "200"; then
        echo "   1. 启动API服务器:"
        echo "      cd apps/api && bun run dev"
    fi
    
    if ! curl -s -o /dev/null -w "%{http_code}" http://192.168.5.4:3000 2>/dev/null | grep -q "200"; then
        echo "   2. 启动Web前端:"
        echo "      cd apps/web && bun run dev"
    fi
    
    if ! docker ps | grep -q mysql_test; then
        echo "   3. 启动数据库:"
        echo "      docker start mysql_test"
    fi
fi

echo ""
echo "=========================================="
