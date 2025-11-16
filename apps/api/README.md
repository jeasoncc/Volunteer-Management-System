# 莲花斋义工管理系统

一个基于 Elysia + Drizzle ORM + MySQL 的义工管理系统。

## 技术栈

- **运行时**: Bun
- **框架**: Elysia
- **数据库**: MySQL
- **ORM**: Drizzle ORM
- **认证**: JWT + bcrypt
- **API 文档**: Swagger

## 功能特性

### 用户管理
- ✅ 义工注册、登录、登出
- ✅ 管理员管理
- ✅ JWT 认证和会话管理
- ✅ 密码加密（bcrypt）

### 义工管理
- ✅ 义工 CRUD（基于 lotusId）
- ✅ 批量导入/删除
- ✅ 模糊搜索
- ✅ 分页查询
- ✅ 密码修改
- ✅ 状态管理

### 考勤管理
- ✅ 打卡记录管理
- ✅ 考勤数据统计
- ✅ 月度汇总生成
- ✅ 志愿者服务时间统计表导出
- ✅ 符合深圳志愿者管理系统格式

### 其他功能
- ✅ 文件上传（头像等）
- ✅ 文档管理
- ✅ WebSocket 实时通信
- ✅ Swagger API 文档
- ✅ 定时任务（月度汇总）

## 快速开始

### 环境要求

- Bun >= 1.0
- MySQL >= 8.0

### 安装依赖

```bash
bun install
```

### 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

主要配置项：
```env
# 数据库配置
PROD_DATABASE_URL=mysql://root:admin123@localhost:3306/lotus
TEST_DATABASE_URL=mysql://root:admin123@localhost:3307/lotus
CURR_DATABASE_URL=${TEST_DATABASE_URL}

# JWT 密钥
AUTH_PROFILE=your-secret-key-here
```

### 数据库迁移

```bash
# 生成迁移文件
bun run drizzle-kit generate

# 执行迁移
bun run drizzle-kit push
```

### 启动服务

```bash
# 开发模式（带热重载）
bun run dev

# 生产模式
bun run start
```

服务将在 http://localhost:3001 启动

## API 文档

启动服务后访问：http://localhost:3001/swagger

### 主要端点

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

#### 义工管理（需要登录）
- `GET /volunteer` - 获取义工列表
- `GET /volunteer/:lotusId` - 获取义工详情
- `POST /volunteer` - 创建义工
- `PUT /volunteer/:lotusId` - 更新义工信息
- `DELETE /volunteer/:lotusId` - 删除义工
- `POST /volunteer/batch/import` - 批量导入
- `POST /volunteer/batch/delete` - 批量删除
- `GET /volunteer/search` - 搜索义工
- `POST /volunteer/:lotusId/change-password` - 修改密码
- `PATCH /volunteer/:lotusId/status` - 变更状态

## 项目结构

```
.
├── src/
│   ├── db/                    # 数据库配置和 Schema
│   │   ├── index.ts          # 数据库连接
│   │   └── schema.ts         # 数据表定义
│   ├── lib/                   # 工具库
│   │   ├── auth.ts           # 认证相关（JWT、密码加密）
│   │   ├── errors/           # 错误类定义
│   │   └── middleware/       # 中间件
│   │       ├── auth.ts       # JWT 认证中间件
│   │       └── error-handler.ts  # 错误处理中间件
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── volunteer/       # 义工管理模块
│   │   ├── admin/           # 管理员模块
│   │   ├── checkin/         # 打卡模块
│   │   ├── document/        # 文档模块
│   │   ├── upload/          # 文件上传模块
│   │   └── ws/              # WebSocket 模块
│   ├── config/              # 配置文件
│   │   └── swagger.ts       # Swagger 配置
│   ├── utils/               # 工具函数
│   ├── log.ts               # 日志工具
│   └── index.ts             # 应用入口
├── scripts/                  # 脚本工具
│   ├── check-avatar-sync.ts # 检查头像同步
│   ├── check-volunteer-ids.ts # 检查义工 ID
│   ├── clean-duplicate-avatars.ts # 清理重复头像
│   ├── reset-plain-passwords.ts # 重置明文密码
│   ├── generate-checkin-summary.ts # 生成月度考勤汇总
│   ├── export-monthly.sh    # 导出月度统计表
│   ├── export-batch.sh      # 批量导出
│   ├── clean-exports.sh     # 清理导出文件
│   ├── verify-export.ts     # 验证导出文件
│   ├── verify-export-detailed.ts # 详细验证
│   ├── verify-monthly-exports.ts # 月度验证
│   └── verify-max-hours.ts  # 验证工时限制
├── public/                   # 静态文件
├── drizzle/                  # 数据库迁移文件
├── .env                      # 环境变量
├── drizzle.config.ts        # Drizzle 配置
├── package.json             # 项目依赖
└── tsconfig.json            # TypeScript 配置
```

## 数据模型

### 核心表

#### volunteer（义工表）
- 基础信息：姓名、性别、出生日期、联系方式
- 身份信息：身份证号、账号、密码
- 佛教信息：法名、皈依状态、宗教背景
- 义工信息：服务时长、培训记录、状态
- 系统字段：lotusId（莲花斋ID）、创建/更新时间

#### admin（管理员表）
- 管理员角色和权限
- 部门信息
- 关联到 volunteer 表

## 开发指南

### 添加新模块

1. 在 `src/modules/` 下创建新目录
2. 创建以下文件：
   - `index.ts` - 路由定义
   - `service.ts` - 业务逻辑
   - `model.ts` - 数据模型和验证
   - `config.ts` - Swagger 配置
3. 在 `src/index.ts` 中注册模块

### 数据库操作

使用 Drizzle ORM：

```typescript
import { db } from '../db'
import { volunteer } from '../db/schema'
import { eq } from 'drizzle-orm'

// 查询
const user = await db.select()
  .from(volunteer)
  .where(eq(volunteer.account, account))

// 插入
await db.insert(volunteer).values({...})

// 更新
await db.update(volunteer)
  .set({...})
  .where(eq(volunteer.id, id))

// 删除
await db.delete(volunteer)
  .where(eq(volunteer.id, id))
```

### 认证保护

在模块中使用 JWT 认证中间件：

```typescript
import { jwtPlugin } from '../../lib/middleware/auth'

export const myModule = new Elysia({ prefix: '/my-module' })
  .use(jwtPlugin)
  .derive(async ({ jwt, cookie: { auth } }) => {
    // 验证 token
    const user = await jwt.verify(auth.value)
    return { user }
  })
  .onBeforeHandle(({ user, set }) => {
    // 检查是否登录
    if (!user) {
      set.status = 401
      return { success: false, message: '未登录' }
    }
  })
```

## 常用脚本

### 开发和部署
```bash
# 开发模式（带热重载）
bun run dev

# 生产模式
bun run start

# 代码格式化
bun run format
bun run format:check
```

### 数据库管理
```bash
# 数据库迁移
bun run migrate

# 查看数据库（Drizzle Studio）
bun run studio
```

### 考勤导出
```bash
# 导出单个月份
bun run export:monthly 2025 11

# 导出多个月份
bun run export:batch 2025 9 10 11

# 清理导出文件
bun run clean-exports

# 验证导出文件
bun run export:verify
bun run export:verify-detailed
bun run export:verify-hours

# 测试导出功能
bun run export:test
```

### 数据维护
```bash
# 重置明文密码（加密）
bun run reset-passwords

# 检查义工 ID
bun run check-volunteer-ids

# 检查头像同步
bun run check-avatars

# 清理重复头像
bun run clean-avatars

# 生成月度考勤汇总
bun run generate-summary
```

## 志愿者服务时间统计表导出

### 功能特性

系统支持导出符合**深圳志愿者管理系统**格式的 Excel 文件，用于月度上报。

**主要特性：**
- ✅ 符合深圳志愿者管理系统格式要求
- ✅ 使用志愿者系统义工号（volunteer_id）
- ✅ 自动计算签到、签退、服务时长
- ✅ 支持单次打卡自动添加1小时假时长
- ✅ 最大工时限制为8小时/天
- ✅ 支持任意日期范围导出
- ✅ 支持指定用户筛选
- ✅ 支持自定义活动名称

### 快速开始

#### 1. 导出单个月份
```bash
# 使用 npm scripts（推荐）
npm run export:monthly 2025 11

# 或直接使用脚本
bash scripts/export-monthly.sh 2025 11

# 导出前清理旧文件
bash scripts/export-monthly.sh 2025 11 --clean
```

#### 2. 批量导出多个月份
```bash
# 一次性导出9月、10月、11月
npm run export:batch 2025 9 10 11

# 或直接使用脚本
bash scripts/export-batch.sh 2025 9 10 11
```

#### 3. 清理导出文件
```bash
# 交互式清理
npm run clean-exports

# 或直接使用脚本
bash scripts/clean-exports.sh
```

#### 4. 验证导出文件
```bash
# 基本验证
npm run export:verify

# 详细统计
npm run export:verify-detailed

# 验证工时限制
npm run export:verify-hours
```

### API 接口

#### 导出接口
```
GET /api/v1/export/volunteer-service
```

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 开始日期（YYYY-MM-DD） |
| endDate | string | ✅ | 结束日期（YYYY-MM-DD） |
| lotusIds | string | ❌ | 用户ID列表（逗号分隔） |
| activityName | string | ❌ | 活动名称 |

**示例：**
```bash
# 导出11月所有人的数据
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30' \
  -o exports/志愿者服务时间统计表_2025年11月.xlsx

# 导出指定用户
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&lotusIds=LZ-V-6020135' \
  -o exports/陈璋_11月.xlsx

# 自定义活动名称
curl 'http://localhost:3001/api/v1/export/volunteer-service?startDate=2025-11-01&endDate=2025-11-30&activityName=助念服务' \
  -o exports/助念服务_11月.xlsx
```

### Excel 格式

**文件结构：**
```
第1行：深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统）[合并单元格，居中]
第2行：序号 | 义工号[红] | 姓名 | 活动名称 | 服务开展日期[红] | 签到时间[红] | 签退时间[红] | 服务时长[红]
第3行开始：数据行...
```

### 工时计算规则

1. **单次打卡**：签退 = 签到 + 1小时，服务时长 = 1小时
2. **多次打卡**：签退 = 最后打卡时间，服务时长 = 签退 - 签到
3. **跨天打卡**：自动处理（签退时间 < 签到时间时加24小时）
4. **最大限制**：8小时/天（超过自动限制）

### 数据来源

导出功能**直接从原始打卡表 `volunteer_checkin` 获取数据**，实时计算工时。

**优势：**
- ✅ 可以导出任意时间段（不限于上个月）
- ✅ 不需要等待汇总表生成
- ✅ 数据实时准确
- ✅ 支持灵活筛选

### 文件管理

所有导出的文件保存在 `exports/` 文件夹中，已添加到 `.gitignore`，不会提交到 Git 仓库。

### 相关文档

**快速入门：**
- [快速参考](docs/checkin/EXPORT_QUICK_REFERENCE.md) ⭐ - 最常用的命令
- [使用指南](docs/checkin/EXPORT_USAGE.md) - 完整的使用说明

**详细文档：**
- [导出规则](docs/checkin/EXPORT_RULES.md) - 工时计算规则
- [数据来源](docs/checkin/EXPORT_DATA_SOURCE.md) - 数据获取逻辑
- [常见问题](docs/checkin/EXPORT_FAQ.md) - FAQ
- [完整指南](docs/checkin/EXPORT_COMPLETE_GUIDE.md) - 详细指南

**文档索引：**
- [考勤管理文档](docs/checkin/README.md) - 所有文档的索引

## 测试

```bash
# 测试认证和 API
bash test-final.sh

# 测试导出功能
npm run export:test
```

## 部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start bun --name "lotus-api" -- run start

# 查看日志
pm2 logs lotus-api

# 重启
pm2 restart lotus-api

# 停止
pm2 stop lotus-api
```

### 使用 Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

EXPOSE 3001

CMD ["bun", "run", "start"]
```

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PROD_DATABASE_URL` | 生产数据库连接 | `mysql://user:pass@host:3306/db` |
| `TEST_DATABASE_URL` | 测试数据库连接 | `mysql://user:pass@host:3307/db` |
| `CURR_DATABASE_URL` | 当前使用的数据库 | `${TEST_DATABASE_URL}` |
| `AUTH_PROFILE` | JWT 密钥 | `your-secret-key` |

## 常见问题

### 1. 数据库连接失败
检查 `.env` 中的数据库配置是否正确，确保 MySQL 服务已启动。

### 2. JWT 认证失败
确保 `AUTH_PROFILE` 环境变量已设置，且前端正确发送了 cookie。

### 3. 密码验证失败
确保密码已使用 bcrypt 加密，可以运行 `reset-plain-passwords.ts` 脚本重置。

## 文档

### 主要文档
- [脚本命令参考](docs/SCRIPTS_REFERENCE.md) - 所有 npm scripts 的详细说明
- [考勤管理文档](docs/checkin/README.md) - 考勤功能文档索引
- [导出功能快速参考](docs/checkin/EXPORT_QUICK_REFERENCE.md) - 最常用的导出命令

### 组织架构
- [组织架构完整说明](docs/ORGANIZATION_COMPLETE.md) - 组织架构设计

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

项目维护者：莲花斋开发团队
