#!/bin/bash

# 设备连接诊断脚本
# 用于快速诊断设备 YET88476 未连接的问题

echo "========================================="
echo "设备 YET88476 连接诊断工具"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
BACKEND_HOST="192.168.5.4"
BACKEND_PORT="3001"
DEVICE_SN="YET88476"

# 1. 检查后端服务
echo "1️⃣  检查后端服务..."
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务正在运行（端口 $BACKEND_PORT）${NC}"
    lsof -i :$BACKEND_PORT | grep LISTEN
else
    echo -e "${RED}❌ 后端服务未运行（端口 $BACKEND_PORT）${NC}"
    echo "   请启动后端服务: cd apps/api && bun run dev"
    exit 1
fi
echo ""

# 2. 测试设备状态 API
echo "2️⃣  测试设备状态 API..."
RESPONSE=$(curl -s "http://$BACKEND_HOST:$BACKEND_PORT/device/status")
echo "   响应: $RESPONSE"

# 解析 JSON 响应（需要 jq）
if command -v jq &> /dev/null; then
    ONLINE=$(echo $RESPONSE | jq -r '.data.devices[0].online')
    TOTAL_ONLINE=$(echo $RESPONSE | jq -r '.data.totalOnline')
    
    if [ "$ONLINE" = "true" ]; then
        echo -e "${GREEN}✅ 设备 $DEVICE_SN 在线${NC}"
        echo "   在线设备数: $TOTAL_ONLINE"
    else
        echo -e "${RED}❌ 设备 $DEVICE_SN 离线${NC}"
        echo "   在线设备数: $TOTAL_ONLINE"
    fi
else
    echo -e "${YELLOW}⚠️  未安装 jq，无法解析 JSON 响应${NC}"
    echo "   安装: sudo apt install jq (Ubuntu/Debian)"
fi
echo ""

# 3. 检查网络连通性
echo "3️⃣  检查网络连通性..."
if ping -c 1 $BACKEND_HOST > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务器 $BACKEND_HOST 可达${NC}"
else
    echo -e "${RED}❌ 服务器 $BACKEND_HOST 不可达${NC}"
fi
echo ""

# 4. 检查防火墙
echo "4️⃣  检查防火墙..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep "Status:" | awk '{print $2}')
    if [ "$UFW_STATUS" = "active" ]; then
        echo -e "${YELLOW}⚠️  防火墙已启用${NC}"
        PORT_ALLOWED=$(sudo ufw status | grep $BACKEND_PORT)
        if [ -n "$PORT_ALLOWED" ]; then
            echo -e "${GREEN}✅ 端口 $BACKEND_PORT 已开放${NC}"
        else
            echo -e "${RED}❌ 端口 $BACKEND_PORT 未开放${NC}"
            echo "   开放端口: sudo ufw allow $BACKEND_PORT/tcp"
        fi
    else
        echo -e "${GREEN}✅ 防火墙未启用${NC}"
    fi
else
    echo "   未检测到 ufw 防火墙"
fi
echo ""

# 5. 检查后端日志
echo "5️⃣  检查后端日志（最近 20 行）..."
echo "   查找关键词: 'WebSocket', '设备', 'YET88476'"
echo ""

# 如果在项目根目录运行
if [ -d "apps/api" ]; then
    echo "   提示: 请手动查看后端控制台日志"
    echo "   关键日志:"
    echo "   - ✅ 'WebSocket 连接已建立' - 设备尝试连接"
    echo "   - ✅ '设备 YET88476 已注册' - 设备成功注册"
    echo "   - ❌ 如果没有这些日志，说明设备没有连接"
fi
echo ""

# 6. WebSocket 连接测试
echo "6️⃣  WebSocket 连接测试..."
if command -v wscat &> /dev/null; then
    echo "   使用 wscat 测试 WebSocket 连接:"
    echo "   wscat -c ws://$BACKEND_HOST:$BACKEND_PORT/ws"
    echo ""
    echo "   发送声明消息:"
    echo '   {"cmd":"declare","type":"device","sn":"YET88476","ip":"192.168.1.100","version_code":"20000015","version_name":"2.0.15","timestamp":1732800000,"token":"test"}'
else
    echo -e "${YELLOW}⚠️  未安装 wscat${NC}"
    echo "   安装: npm install -g wscat"
    echo "   测试命令: wscat -c ws://$BACKEND_HOST:$BACKEND_PORT/ws"
fi
echo ""

# 7. 诊断总结
echo "========================================="
echo "诊断总结"
echo "========================================="
echo ""

if [ "$ONLINE" = "true" ]; then
    echo -e "${GREEN}✅ 设备连接正常${NC}"
    echo ""
    echo "设备信息:"
    echo "  - 设备 SN: $DEVICE_SN"
    echo "  - 状态: 在线"
    echo "  - 服务器: $BACKEND_HOST:$BACKEND_PORT"
else
    echo -e "${RED}❌ 设备未连接${NC}"
    echo ""
    echo "可能的原因:"
    echo "  1. 设备 WebSocket 地址配置错误"
    echo "     应该配置为: ws://$BACKEND_HOST:$BACKEND_PORT/ws"
    echo ""
    echo "  2. 设备和服务器网络不通"
    echo "     检查设备和服务器是否在同一网络"
    echo ""
    echo "  3. 设备没有发送声明消息"
    echo "     检查设备固件或配置"
    echo ""
    echo "  4. 设备 SN 不匹配"
    echo "     检查设备实际 SN 是否为 $DEVICE_SN"
    echo ""
    echo "下一步操作:"
    echo "  1. 查看后端日志: cd apps/api && 查看控制台"
    echo "  2. 使用 wscat 测试: wscat -c ws://$BACKEND_HOST:$BACKEND_PORT/ws"
    echo "  3. 查看详细文档: docs/fixes/DEVICE_YET88476_CONNECTION_DIAGNOSIS.md"
fi
echo ""

echo "========================================="
echo "诊断完成"
echo "========================================="
