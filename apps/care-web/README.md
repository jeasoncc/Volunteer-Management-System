# 莲花生命关怀官网 (Care-Web)

> 以温柔、稳定、可信赖的心，守护生命最后的尊严与安宁

## 项目简介

莲花生命关怀官网是一个现代化的公益组织网站，展示组织使命、服务项目，并提供实时的义工服务数据展示。

### 核心功能

- 🏠 **首页** - 展示组织使命和核心价值
- 📊 **实时数据** - 展示义工服务和考勤统计
- 👥 **关于我们** - 组织介绍和团队展示
- 🤝 **志愿服务** - 服务项目和流程介绍
- 📰 **新闻动态** - 最新活动和资讯
- 💝 **加入我们** - 义工申请和招募
- 💰 **捐赠支持** - 捐赠方式和项目
- 📞 **联系我们** - 联系方式和位置

## 技术栈

- **框架**: React 19
- **路由**: TanStack Router 1.0
- **样式**: Tailwind CSS 4.0
- **图标**: Lucide React
- **构建**: Vite 5
- **语言**: TypeScript 5

## 快速开始

### 安装依赖

```bash
bun install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_URL=http://localhost:3001
VITE_SITE_NAME=莲花生命关怀
VITE_SITE_URL=http://localhost:4000
```

### 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:4000

### 构建生产版本

```bash
bun run build
```

### 预览生产版本

```bash
bun run preview
```

### 测试 API 接口

```bash
bun run test:api
```

## 项目结构

```
apps/care-web/
├── public/                 # 静态资源
├── scripts/               # 脚本工具
│   └── test-api.ts       # API 测试脚本
├── src/
│   ├── components/        # React 组件
│   │   ├── ui/           # UI 基础组件
│   │   └── stats/        # 统计相关组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   │   ├── api.ts        # API 客户端
│   │   └── utils.ts      # 通用工具
│   ├── pages/            # 页面组件
│   ├── routes/           # 路由配置
│   ├── main.tsx          # 应用入口
│   ├── router.tsx        # 路由配置
│   └── styles.css        # 全局样式
├── .env.example          # 环境变量示例
├── DEPLOYMENT_GUIDE.md   # 部署指南
├── FEATURES.md           # 功能清单
├── QUICKSTART.md         # 快速启动指南
├── REALTIME_STATS.md     # 实时数据功能说明
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 核心功能

### 实时数据展示

实时数据页面 (`/stats`) 展示：

- **统计卡片**
  - 注册义工总数
  - 活跃义工数量
  - 累计服务时长
  - 今日签到数量

- **今日签到动态**
  - 最新签到记录
  - 每30秒自动刷新
  - 显示姓名、时间、地点、状态

- **本月服务排行榜**
  - 前10名义工
  - 出勤天数和服务时长
  - 日均服务时长

### API 集成

项目集成了以下 API 接口：

- `GET /api/stats/volunteers` - 获取义工统计
- `GET /api/stats/checkins/today` - 获取今日签到
- `GET /api/stats/leaderboard/monthly` - 获取月度排行

详见 [REALTIME_STATS.md](REALTIME_STATS.md)

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/routes/` 创建路由文件
3. 在 `Header.tsx` 添加导航链接

示例：

```typescript
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>新页面</div>;
}

// src/routes/new.tsx
import { createFileRoute } from '@tanstack/react-router';
import { NewPage } from '../pages/NewPage';

export const Route = createFileRoute('/new')({
  component: NewPage,
});
```

### 调用 API

```typescript
import { getVolunteerStats } from '../lib/api';

function MyComponent() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    getVolunteerStats().then(setStats);
  }, []);
  
  return <div>{stats?.totalVolunteers}</div>;
}
```

### 样式开发

使用 Tailwind CSS：

```tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-2xl font-bold mb-4">标题</h2>
  <p className="text-gray-600">内容</p>
</div>
```

## 部署

### 开发环境

```bash
bun run dev
```

### 生产环境

详见 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

简要步骤：

1. 构建项目：`bun run build`
2. 配置 Nginx
3. 配置 SSL 证书
4. 部署到服务器

## 文档

- 📖 [快速启动指南](QUICKSTART.md) - 5分钟快速体验
- 🚀 [部署指南](DEPLOYMENT_GUIDE.md) - 生产环境部署
- 📊 [实时数据功能](REALTIME_STATS.md) - 实时数据功能说明
- ✨ [功能清单](FEATURES.md) - 完整功能列表

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 性能

- ⚡️ Vite 快速构建
- 📦 代码分割
- 🎨 CSS 按需加载
- 🖼️ 图片懒加载（待实现）

## 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- 网站：https://care.lianhuazhai.org
- 邮箱：contact@lianhuazhai.org

---

用 ❤️ 和 React 构建
