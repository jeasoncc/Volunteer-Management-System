#!/bin/bash

# React Native 原生项目初始化脚本
# 这个脚本会创建 Android 和 iOS 原生项目结构

echo "🚀 开始初始化 React Native 原生项目..."

# 检查是否已安装 React Native CLI
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: 未找到 npx，请先安装 Node.js"
    exit 1
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📁 临时目录: $TEMP_DIR"

# 初始化 React Native 项目
echo "📦 正在创建 React Native 项目..."
npx react-native@latest init VolunteerAppTemp --template react-native-template-typescript --skip-install --directory "$TEMP_DIR"

# 复制原生代码
if [ -d "$TEMP_DIR/android" ]; then
    echo "📱 复制 Android 原生代码..."
    cp -r "$TEMP_DIR/android" .
    echo "✅ Android 目录已创建"
else
    echo "⚠️  警告: 未找到 Android 目录"
fi

if [ -d "$TEMP_DIR/ios" ]; then
    echo "🍎 复制 iOS 原生代码..."
    cp -r "$TEMP_DIR/ios" .
    echo "✅ iOS 目录已创建"
else
    echo "⚠️  警告: 未找到 iOS 目录"
fi

# 清理临时目录
rm -rf "$TEMP_DIR"
echo "🧹 已清理临时文件"

echo ""
echo "✅ 原生项目初始化完成！"
echo ""
echo "下一步："
echo "1. iOS (仅 macOS): cd ios && pod install && cd .."
echo "2. Android: 确保已安装 Android SDK"
echo "3. 运行: bun run android 或 bun run ios"

