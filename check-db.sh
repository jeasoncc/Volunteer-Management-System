#!/bin/bash

echo "=== 数据库健康检查 ==="
echo ""

# 检查测试数据库
echo "1. 检查测试数据库 (mysql_test)..."
if docker ps | grep -q mysql_test; then
    echo "   ✅ 测试数据库运行中 (端口 3307)"
else
    if docker ps -a | grep -q mysql_test; then
        echo "   ⚠️  测试数据库已停止，正在启动..."
        docker start mysql_test
        sleep 3
        if docker ps | grep -q mysql_test; then
            echo "   ✅ 测试数据库已启动"
        else
            echo "   ❌ 测试数据库启动失败"
            exit 1
        fi
    else
        echo "   ❌ 测试数据库容器不存在"
        echo "   💡 请运行: docker run --name mysql_test -e MYSQL_ROOT_PASSWORD=admin123 -p 3307:3306 -d mysql:8.0"
        exit 1
    fi
fi

echo ""

# 检查生产数据库
echo "2. 检查生产数据库 (mysql_prod)..."
if docker ps | grep -q mysql_prod; then
    echo "   ✅ 生产数据库运行中 (端口 3306)"
else
    if docker ps -a | grep -q mysql_prod; then
        echo "   ⚠️  生产数据库已停止"
        echo "   💡 如需启动: docker start mysql_prod"
    else
        echo "   ℹ️  生产数据库容器不存在"
    fi
fi

echo ""

# 测试数据库连接
echo "3. 测试数据库连接..."
if command -v mysql &> /dev/null; then
    if mysql -h 127.0.0.1 -P 3307 -u root -padmin123 -e "SELECT 1;" &> /dev/null; then
        echo "   ✅ 测试数据库连接成功"
        
        # 检查 lotus 数据库
        if mysql -h 127.0.0.1 -P 3307 -u root -padmin123 -e "USE lotus; SELECT 1;" &> /dev/null; then
            echo "   ✅ lotus 数据库存在"
            
            # 统计表数量
            table_count=$(mysql -h 127.0.0.1 -P 3307 -u root -padmin123 -D lotus -e "SHOW TABLES;" 2>/dev/null | wc -l)
            table_count=$((table_count - 1))
            echo "   📊 数据表数量: $table_count"
        else
            echo "   ⚠️  lotus 数据库不存在"
            echo "   💡 请运行: cd apps/api && bun run db:push"
        fi
    else
        echo "   ❌ 测试数据库连接失败"
        exit 1
    fi
else
    echo "   ⚠️  未安装 mysql 客户端，跳过连接测试"
fi

echo ""
echo "=== 检查完成 ==="
echo ""
echo "📝 数据库信息:"
echo "   测试数据库: mysql://root:admin123@localhost:3307/lotus"
echo "   生产数据库: mysql://root:admin123@localhost:3306/lotus"
echo ""
echo "🔧 常用命令:"
echo "   启动测试数据库: docker start mysql_test"
echo "   停止测试数据库: docker stop mysql_test"
echo "   查看数据库日志: docker logs mysql_test"
echo "   连接数据库: mysql -h 127.0.0.1 -P 3307 -u root -padmin123 -D lotus"
