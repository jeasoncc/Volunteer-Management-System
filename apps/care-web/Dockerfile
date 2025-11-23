# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 安装 serve 用于服务静态文件
RUN npm install -g serve

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["serve", "-s", "dist", "-l", "80"]