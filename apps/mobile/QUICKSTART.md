# React Native 移动端快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd apps/mobile
bun install
```

### 2. 配置 API 地址

编辑 `src/utils/network.ts`，修改为你的本地 IP：

```typescript
export function getLocalIP(): string {
  // 修改为你的实际 IP 地址
  // Windows: ipconfig 查看 IPv4 地址
  // Mac/Linux: ifconfig 或 ip addr 查看
  return '192.168.1.100'; // 替换为你的 IP
}
```

### 3. 初始化原生项目（首次运行）

```bash
# 运行初始化脚本
./init-native.sh

# 或者手动创建
npx react-native init VolunteerAppTemp --template react-native-template-typescript --skip-install
# 然后复制 android/ 和 ios/ 目录
```

### 4. iOS 设置（仅 macOS）

```bash
cd ios
pod install
cd ..
```

### 5. 启动应用

#### 启动 Metro Bundler

```bash
bun run start
```

#### 运行 Android

```bash
bun run android
```

#### 运行 iOS（仅 macOS）

```bash
bun run ios
```

## 📱 功能说明

### 打卡信息
- 查看个人打卡记录
- 显示打卡时间、状态、地点
- 查看打卡详情

### 佛经阅读
- 多部经典佛经
- 可调节字体大小
- 离线阅读

### 个人中心
- 查看个人信息
- 退出登录

## ⚠️ 注意事项

1. **网络配置**: React Native 不能使用 `localhost`，必须使用实际 IP 地址
2. **Android**: 确保已安装 Android SDK 并配置环境变量
3. **iOS**: 需要 macOS 和 Xcode
4. **首次运行**: 需要先初始化原生项目

## 🔧 故障排除

### Metro 缓存问题
```bash
bun run start --reset-cache
```

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

