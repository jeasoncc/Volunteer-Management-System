#!/bin/bash

# 莲花斋义工移动端 - 开发启动脚本

set -e

echo "🚀 启动莲花斋义工移动端开发环境"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
  echo "📦 检测到未安装依赖，正在安装..."
  bun install
  echo ""
fi

# 检查 API 配置
echo "📡 检查 API 配置..."
API_URL=$(grep -o "return '[^']*'" src/utils/network.ts | head -1 | sed "s/return '//;s/';//")
echo "   当前 API 地址: $API_URL"
echo ""

# 提示用户配置 API 地址
if [[ "$API_URL" == *"localhost"* ]] || [[ "$API_URL" == *"10.0.2.2"* ]]; then
  echo "⚠️  提示：如果使用真机测试，请修改 src/utils/network.ts 中的 API 地址"
  echo "   真机需要使用你的开发机器 IP 地址，例如: http://192.168.1.100:3001"
  echo ""
fi

# 启动 Metro Bundler
echo "📱 启动 Metro Bundler..."
echo "   在另一个终端运行以下命令来启动应用："
echo "   - Android: bun run android"
echo "   - iOS: bun run ios"
echo ""

bun run start

