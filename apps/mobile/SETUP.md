# React Native 移动端应用设置指南

## 前置要求

1. **Node.js** >= 18.0.0
2. **Bun** >= 1.0.0
3. **React Native 开发环境**
   - iOS: Xcode (仅 macOS)
   - Android: Android Studio

## 安装步骤

### 1. 安装依赖

```bash
cd apps/mobile
bun install
```

### 2. iOS 设置 (仅 macOS)

```bash
cd ios
bun install  # 安装 CocoaPods 依赖
cd ..
```

### 3. Android 设置

确保已安装 Android SDK 和配置环境变量。

## 运行应用

### 启动 Metro Bundler

```bash
bun run start
```

### 运行 iOS (仅 macOS)

```bash
bun run ios
```

### 运行 Android

```bash
bun run android
```

## 配置 API 地址

编辑 `src/services/api.ts`，修改 `API_BASE_URL`：

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3001'  // 开发环境
  : 'https://api.lianhuazhai.com';  // 生产环境
```

## 项目结构

```
apps/mobile/
├── src/
│   ├── context/          # React Context (认证等)
│   ├── navigation/      # 导航配置
│   ├── screens/         # 页面组件
│   ├── services/        # API 服务
│   ├── types/           # TypeScript 类型
│   └── data/            # 静态数据（佛经等）
├── App.tsx              # 应用入口
├── index.js             # 注册组件
└── package.json
```

## 功能说明

### 1. 打卡信息
- 查看个人打卡记录
- 打卡详情（时间、地点、体温等）
- 下拉刷新

### 2. 佛经阅读
- 多部经典佛经
- 可调节字体大小
- 离线阅读

### 3. 个人中心
- 查看个人信息
- 退出登录

## 注意事项

1. 首次运行需要初始化 React Native 项目：
   ```bash
   npx react-native init VolunteerApp --template react-native-template-typescript
   ```
   然后将生成的文件复制到当前目录。

2. iOS 需要运行 `pod install` 安装原生依赖。

3. Android 需要配置 `android/local.properties` 指定 SDK 路径。

