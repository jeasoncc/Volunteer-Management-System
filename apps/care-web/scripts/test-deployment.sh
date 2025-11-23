#!/bin/bash

# 部署测试脚本

echo "开始部署测试..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null
then
    echo "错误: Node.js 未安装"
    exit 1
fi

echo "Node.js 版本: $(node --version)"

# 检查 npm 是否安装
if ! command -v npm &> /dev/null
then
    echo "错误: npm 未安装"
    exit 1
fi

echo "npm 版本: $(npm --version)"

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 检查构建是否成功
if [ -d "dist" ]; then
    echo "构建成功! 生成的文件在 dist 目录中"
    
    # 检查关键文件是否存在
    if [ -f "dist/index.html" ]; then
        echo "✓ index.html 存在"
    else
        echo "✗ index.html 不存在"
        exit 1
    fi
    
    if [ -d "dist/assets" ]; then
        echo "✓ assets 目录存在"
    else
        echo "✗ assets 目录不存在"
        exit 1
    fi
    
else
    echo "构建失败!"
    exit 1
fi

echo "部署测试完成!"
echo "可以通过以下命令启动本地服务器进行测试:"
echo "npx serve dist"