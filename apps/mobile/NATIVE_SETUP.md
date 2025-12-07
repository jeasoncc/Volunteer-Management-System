# React Native 原生项目设置指南

## ⚠️ 重要提示

React Native 项目需要原生代码（Android/iOS）才能运行。当前项目已经创建了基础结构，但完整的原生项目需要通过 React Native CLI 初始化。

## 📱 初始化原生项目

### 方法 1: 使用初始化脚本（推荐）

```bash
cd apps/mobile
./init-native.sh
```

### 方法 2: 手动创建

```bash
# 1. 创建临时 React Native 项目
npx react-native@latest init VolunteerAppTemp \
  --template react-native-template-typescript \
  --skip-install \
  --directory /tmp/rn-temp

# 2. 复制原生代码
cp -r /tmp/rn-temp/android apps/mobile/
cp -r /tmp/rn-temp/ios apps/mobile/

# 3. 清理临时文件
rm -rf /tmp/rn-temp
```

### 方法 3: 使用 Expo（可选，更简单但功能受限）

如果你想使用 Expo，可以：

```bash
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript
```

## 🔧 配置步骤

### 1. Android 配置

#### 安装 Android Studio
- 下载并安装 [Android Studio](https://developer.android.com/studio)
- 安装 Android SDK (API 33+)
- 配置环境变量：

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

#### 配置 Gradle
编辑 `android/gradle.properties`，确保配置正确。

#### 创建签名密钥（可选，用于发布）
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. iOS 配置（仅 macOS）

#### 安装 Xcode
- 从 App Store 安装 Xcode
- 安装 Xcode Command Line Tools：
  ```bash
  xcode-select --install
  ```

#### 安装 CocoaPods
```bash
sudo gem install cocoapods
```

#### 安装 iOS 依赖
```bash
cd ios
pod install
cd ..
```

## 🚀 运行应用

### 启动 Metro Bundler

```bash
bun run start
```

### 运行 Android

```bash
# 确保 Android 模拟器或设备已连接
adb devices

# 运行应用
bun run android
```

### 运行 iOS（仅 macOS）

```bash
# 确保 iOS 模拟器可用
xcrun simctl list devices

# 运行应用
bun run ios
```

## 📝 项目配置

### 修改应用名称

编辑以下文件：
- Android: `android/app/src/main/res/values/strings.xml`
- iOS: `ios/VolunteerApp/Info.plist`

### 修改包名/Bundle ID

- Android: `android/app/build.gradle` 中的 `applicationId`
- iOS: `ios/VolunteerApp.xcodeproj/project.pbxproj` 中的 `PRODUCT_BUNDLE_IDENTIFIER`

### 配置 API 地址

编辑 `src/utils/network.ts`，修改 IP 地址。

## 🔍 故障排除

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
pod cache clean --all
pod install
cd ..
```

### Metro 缓存问题

```bash
bun run start --reset-cache
```

### 网络连接问题

确保：
1. 后端 API 服务正在运行
2. 手机/模拟器可以访问开发机器的 IP 地址
3. 防火墙允许连接

## 📚 更多资源

- [React Native 官方文档](https://reactnative.dev/)
- [React Navigation 文档](https://reactnavigation.org/)
- [React Native Paper 文档](https://callstack.github.io/react-native-paper/)

