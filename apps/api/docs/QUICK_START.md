# 快速开始指南

## 5 分钟快速启动

### 1. 安装依赖
```bash
bun install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接
```

### 3. 启动服务
```bash
bun run dev
```

### 4. 访问 API 文档
打开浏览器访问：http://localhost:3001/swagger

### 5. 测试登录
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13129546291",
    "password": "123456"
  }'
```

## 常用命令

```bash
# 开发模式（热重载）
bun run dev

# 生产模式
bun run start

# 数据库迁移
bun run drizzle-kit push

# 查看数据库
bun run drizzle-kit studio

# 运行测试
bash test-final.sh
```

## 默认测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| 13129546291 | 123456 | 义工 |

## API 端点速查

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 义工管理
- `GET /volunteer` - 列表
- `GET /volunteer/:lotusId` - 详情
- `POST /volunteer` - 创建
- `PUT /volunteer/:lotusId` - 更新
- `DELETE /volunteer/:lotusId` - 删除

## 项目结构速查

```
src/
├── modules/          # 业务模块
│   ├── auth/        # 认证
│   ├── volunteer/   # 义工管理
│   └── admin/       # 管理员
├── lib/             # 工具库
│   ├── auth.ts      # 认证工具
│   └── middleware/  # 中间件
└── db/              # 数据库
    ├── index.ts     # 连接
    └── schema.ts    # 表定义
```

## 故障排查

### 服务启动失败
1. 检查端口 3001 是否被占用
2. 检查数据库连接配置
3. 查看日志输出

### 登录失败
1. 确认账号密码正确
2. 检查数据库中用户是否存在
3. 确认密码已加密

### 数据库连接失败
1. 确认 MySQL 服务已启动
2. 检查 .env 中的数据库配置
3. 测试数据库连接

## 获取帮助

- 查看完整文档：README.md
- 查看项目状态：PROJECT_STATUS.md
- 查看 API 文档：http://localhost:3001/swagger
