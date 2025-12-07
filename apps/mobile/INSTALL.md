# React Native 移动端安装指南

## 📦 使用 Bun 安装依赖

本项目使用 **Bun** 作为包管理器，安装速度更快。

### 安装 Bun（如果还没有）

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# 或使用 npm
npm install -g bun
```

### 安装项目依赖

```bash
cd apps/mobile
bun install
```

## 🚀 初始化原生项目

React Native 需要原生代码（Android/iOS），首次运行需要初始化：

### 方法 1: 使用初始化脚本（推荐）

```bash
cd apps/mobile
./init-native.sh
```

### 方法 2: 手动创建

```bash
# 创建临时项目
npx react-native init VolunteerAppTemp --template react-native-template-typescript --skip-install

# 复制原生代码
cp -r VolunteerAppTemp/android .
cp -r VolunteerAppTemp/ios .

# 清理临时项目
rm -rf VolunteerAppTemp
```

## 📱 iOS 设置（仅 macOS）

```bash
cd ios
pod install
cd ..
```

## 🤖 Android 设置

1. 安装 Android Studio
2. 配置 Android SDK
3. 设置环境变量：
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## ⚙️ 配置 API 地址

编辑 `src/utils/network.ts`：

```typescript
export function getLocalIP(): string {
  // 修改为你的实际 IP 地址
  // Windows: ipconfig
  // Mac/Linux: ifconfig 或 ip addr
  return '192.168.1.100'; // 替换为你的 IP
}
```

## ▶️ 运行应用

### 启动 Metro Bundler

```bash
bun run start
```

### 运行 Android

```bash
bun run android
```

### 运行 iOS（仅 macOS）

```bash
bun run ios
```

## 🔧 故障排除

### 依赖安装失败

```bash
# 清理缓存
rm -rf node_modules
rm -rf bun.lockb

# 重新安装
bun install
```

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

### iOS Pod 安装失败

```bash
cd ios
pod deintegrate
pod install
cd ..
```

## 📝 注意事项

1. **使用 Bun**: 所有安装都使用 `bun install`，不要使用 `npm` 或 `yarn`
2. **网络配置**: React Native 不能使用 `localhost`，必须使用实际 IP
3. **首次运行**: 需要先初始化原生项目
4. **开发环境**: 确保后端 API 服务正在运行

