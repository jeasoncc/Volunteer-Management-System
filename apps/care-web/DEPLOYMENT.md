# 部署指南

## 构建项目

在部署之前，需要先构建项目：

```bash
cd /home/lotus/project/lianhuazhai-monorepo/apps/care-web
npm run build
```

构建完成后，会在 `dist` 目录下生成生产环境的静态文件。

## 部署到服务器

### 使用 Nginx 部署

1. 将 `dist` 目录中的文件复制到服务器的 web 目录中：

```bash
# 示例：复制到 Nginx 默认目录
sudo cp -r dist/* /var/www/html/
```

2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

3. 重启 Nginx：

```bash
sudo systemctl restart nginx
```

### 使用 Docker 部署

1. 构建 Docker 镜像：

```bash
docker build -t lotus-care-web .
```

2. 运行容器：

```bash
docker run -d -p 80:80 --name lotus-care-web lotus-care-web
```

## 环境变量配置

在生产环境中，可能需要配置以下环境变量：

- `PUBLIC_URL`: 应用的公共 URL 路径
- `API_BASE_URL`: API 服务的基础 URL

## SSL 证书配置

建议使用 Let's Encrypt 免费 SSL 证书：

```bash
sudo certbot --nginx -d your-domain.com
```

## 性能优化建议

1. 启用 gzip 压缩
2. 配置静态资源缓存
3. 使用 CDN 加速静态资源
4. 启用 HTTP/2

## 监控和日志

建议配置以下监控：

1. 服务器资源监控（CPU、内存、磁盘）
2. Nginx 访问日志和错误日志
3. 应用性能监控（如果使用 Node.js 服务）

## 备份策略

定期备份以下内容：

1. 配置文件（Nginx 配置等）
2. SSL 证书
3. 应用数据（如果有）

## 故障排除

常见问题及解决方案：

1. 页面无法访问：检查 Nginx 配置和防火墙设置
2. 静态资源加载失败：检查文件路径和权限
3. SSL 证书问题：检查证书有效期和配置