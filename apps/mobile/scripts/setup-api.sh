#!/bin/bash

# 配置 API 地址的辅助脚本

set -e

NETWORK_FILE="src/utils/network.ts"

echo "📡 配置 API 地址"
echo ""

# 获取当前 IP 地址（Linux/Mac）
if command -v ip &> /dev/null; then
  CURRENT_IP=$(ip route get 1.1.1.1 | awk '{print $7; exit}' 2>/dev/null || echo "")
elif command -v ifconfig &> /dev/null; then
  CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1 | sed 's/addr://')
else
  CURRENT_IP=""
fi

echo "请选择你的开发环境："
echo "1) Android 模拟器 (使用 10.0.2.2)"
echo "2) iOS 模拟器 (使用 localhost)"
echo "3) 真机测试 (使用当前 IP: ${CURRENT_IP:-未检测到})"
echo "4) 自定义 IP 地址"
echo "5) 取消"
echo ""

read -p "请选择 [1-5]: " choice

case $choice in
  1)
    API_URL="http://10.0.2.2:3001"
    ;;
  2)
    API_URL="http://localhost:3001"
    ;;
  3)
    if [ -z "$CURRENT_IP" ]; then
      read -p "请输入你的开发机器 IP 地址: " CURRENT_IP
    fi
    API_URL="http://${CURRENT_IP}:3001"
    ;;
  4)
    read -p "请输入 API 地址 (例如: http://192.168.1.100:3001): " API_URL
    ;;
  5)
    echo "已取消"
    exit 0
    ;;
  *)
    echo "无效选择"
    exit 1
    ;;
esac

# 备份原文件
cp "$NETWORK_FILE" "${NETWORK_FILE}.bak"

# 更新 API 地址
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|return '[^']*'|return '${API_URL}'|" "$NETWORK_FILE"
else
  # Linux
  sed -i "s|return '[^']*'|return '${API_URL}'|" "$NETWORK_FILE"
fi

echo ""
echo "✅ API 地址已更新为: $API_URL"
echo "   原文件已备份为: ${NETWORK_FILE}.bak"
echo ""

