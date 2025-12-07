# 莲花斋义工移动端应用

React Native 移动应用，供义工查看打卡信息和阅读佛经。

## 功能

- 📅 **打卡信息查看** - 查看个人打卡记录和详情
- 📖 **佛经阅读** - 阅读经典佛经，支持字体大小调节
- 👤 **个人中心** - 查看个人信息和管理账户

## 技术栈

- React Native 0.73
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- TanStack Query (数据获取)
- React Native Paper (UI 组件库)
- Axios (HTTP 客户端)
- Day.js (日期处理)

## 安装和运行

### 前置要求

1. **Node.js** >= 18.0.0
2. **Bun** >= 1.0.0
3. **React Native 开发环境**
   - iOS: Xcode (仅 macOS)
   - Android: Android Studio

### 1. 安装依赖

```bash
cd apps/mobile
bun install
```

### 2. 初始化原生项目

首次运行需要创建 Android 和 iOS 原生代码：

```bash
# 运行初始化脚本
./init-native.sh

# 或者手动创建
npx react-native init VolunteerAppTemp --template react-native-template-typescript --skip-install
# 然后复制 android/ 和 ios/ 目录到当前项目
```

### 3. iOS 设置 (仅 macOS)

```bash
cd ios
pod install
cd ..
```

### 4. 配置 API 地址

编辑 `src/utils/network.ts`，修改 `getLocalIP()` 函数返回你的本地 IP 地址：

```typescript
export function getLocalIP(): string {
  // 修改为你的实际 IP 地址
  // Windows: ipconfig
  // Mac/Linux: ifconfig 或 ip addr
  return '192.168.1.100';
}
```

### 5. 运行应用

#### 启动 Metro Bundler

```bash
bun run start
```

#### 运行 Android

```bash
bun run android
```

#### 运行 iOS (仅 macOS)

```bash
bun run ios
```

## 项目结构

```
apps/mobile/
├── src/
│   ├── components/        # 通用组件
│   │   ├── LoadingScreen.tsx
│   │   └── ErrorView.tsx
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── navigation/       # 导航配置
│   │   └── MainTabs.tsx
│   ├── screens/         # 页面组件
│   │   ├── LoginScreen.tsx
│   │   ├── CheckinScreen.tsx
│   │   ├── CheckinDetailScreen.tsx
│   │   ├── ScriptureScreen.tsx
│   │   ├── ScriptureReaderScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/        # API 服务
│   │   ├── api.ts
│   │   └── checkin.ts
│   ├── types/           # TypeScript 类型
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   └── network.ts
│   └── data/            # 静态数据
│       └── scriptures.ts
├── App.tsx              # 应用入口
├── index.js             # 注册组件
└── package.json
```

## API 配置

应用需要连接到后端 API。默认配置：

- **开发环境**: `http://YOUR_LOCAL_IP:3001`
- **生产环境**: `https://api.lianhuazhai.com`

修改 `src/utils/network.ts` 中的 IP 地址。

## 功能说明

### 打卡信息

- 查看个人打卡记录列表
- 显示打卡日期、时间、状态
- 查看打卡详情（地点、体温、设备信息等）
- 下拉刷新数据

### 佛经阅读

- 多部经典佛经（心经、大悲咒、金刚经、地藏经等）
- 可调节字体大小（小/中/大/特大）
- 支持滚动阅读
- 离线阅读

### 个人中心

- 查看个人信息
- 查看莲花斋ID、手机号、邮箱等
- 退出登录功能

## 开发注意事项

1. **网络配置**: React Native 不能使用 `localhost`，必须使用实际 IP 地址
2. **原生依赖**: iOS 需要运行 `pod install` 安装 CocoaPods 依赖
3. **Android SDK**: 确保已安装并配置 Android SDK
4. **Metro Bundler**: 开发时需要保持 Metro 运行

## 故障排除

### Android 构建失败

```bash
cd android
./gradlew clean
cd ..
bun run android
```

### iOS 构建失败

```bash
cd ios
pod deintegrate
pod install
cd ..
bun run ios
```

### Metro 缓存问题

```bash
bun run start --reset-cache
```

## 许可证

与主项目相同
