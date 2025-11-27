# 考勤机照片同步问题修复

## 问题描述

同步义工到考勤机时，考勤机返回错误：
```
照片下载错误，请检查照片链接是否能访问
```

## 问题原因

### 1. 网络访问问题
当前配置的BASE_URL是 `http://192.168.101.100:3001`，考勤机设备可能无法访问这个地址，原因可能是：

- **网络隔离**：考勤机和服务器不在同一网络
- **端口问题**：3001端口可能被防火墙阻止
- **IP地址错误**：192.168.101.100 可能不是考勤机能访问的地址

### 2. 照片路径问题
照片URL格式：`http://192.168.101.100:3001/uploads/avatars/xxx.jpg`

考勤机需要能够通过HTTP GET请求下载这个照片。

## 解决方案

### 方案1：使用环境变量配置（推荐）

让BASE_URL可配置，支持不同环境：

```typescript
// apps/api/src/modules/ws/service.ts
export class WebSocketService {
  // 从环境变量读取，如果没有则使用默认值
  private static readonly BASE_URL = process.env.ATTENDANCE_DEVICE_BASE_URL || 'http://192.168.101.100:3001'
}
```

在 `.env` 文件中配置：
```env
# 考勤机能访问的服务器地址
ATTENDANCE_DEVICE_BASE_URL=http://你的公网IP:3001
# 或者使用内网地址
ATTENDANCE_DEVICE_BASE_URL=http://192.168.1.100:3001
```

### 方案2：使用公网地址

如果服务器有公网IP或域名：
```typescript
private static readonly BASE_URL = 'https://yourdomain.com'
```

### 方案3：使用Nginx反向代理

配置Nginx，让考勤机通过特定端口访问：
```nginx
server {
    listen 8080;
    server_name 192.168.101.100;
    
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
    }
}
```

然后修改BASE_URL：
```typescript
private static readonly BASE_URL = 'http://192.168.101.100:8080'
```

### 方案4：添加调试日志

添加详细的日志来诊断问题：

```typescript
const command: AddUserCommand = {
  cmd:           'addUser',
  mode:          0,
  name:          user.name,
  user_id:       user.lotusId!,
  user_id_card:  user.idNumber,
  face_template: `${this.BASE_URL}${user.avatar}`,
  phone:         user.phone,
}

// 添加日志
console.log(`📸 照片URL: ${command.face_template}`)
console.log(`🔍 请在考勤机网络环境测试此URL是否可访问`)
```

## 测试步骤

### 1. 测试照片URL可访问性

在考勤机所在的网络环境中，使用浏览器或curl测试：
```bash
curl -I http://192.168.101.100:3001/uploads/avatars/xxx.jpg
```

应该返回 200 OK。

### 2. 检查防火墙

确保3001端口对考勤机开放：
```bash
# 检查端口是否监听
netstat -tlnp | grep 3001

# 添加防火墙规则（如果需要）
sudo ufw allow 3001
```

### 3. 测试网络连通性

从考勤机网络ping服务器：
```bash
ping 192.168.101.100
```

### 4. 检查照片文件是否存在

```bash
ls -la apps/api/public/uploads/avatars/
```

## 临时解决方案

如果需要快速测试，可以：

1. **使用本地网络地址**
   ```typescript
   private static readonly BASE_URL = 'http://192.168.1.100:3001'
   ```

2. **使用考勤机能访问的任何HTTP服务器**
   - 将照片上传到公网图床
   - 使用CDN服务
   - 使用局域网内的文件服务器

## 推荐配置

```typescript
// apps/api/src/modules/ws/service.ts
export class WebSocketService {
  // 优先使用环境变量，支持多环境部署
  private static readonly BASE_URL = 
    process.env.ATTENDANCE_DEVICE_BASE_URL || 
    process.env.PUBLIC_URL || 
    'http://192.168.101.100:3001'
  
  // 添加URL验证
  private static validatePhotoUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  static async addUser(lotusId: string) {
    const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))
    
    if (!user) {
      throw new UserNotFoundError(lotusId)
    }
    
    const photoUrl = user.avatar ? `${this.BASE_URL}${user.avatar}` : ''
    
    // 验证URL
    if (photoUrl && !this.validatePhotoUrl(photoUrl)) {
      console.warn(`⚠️  无效的照片URL: ${photoUrl}`)
    }
    
    console.log(`📸 同步照片: ${photoUrl}`)
    
    const command: AddUserCommand = {
      cmd:           'addUser',
      mode:          0,
      name:          user.name,
      user_id:       user.lotusId!,
      user_id_card:  user.idNumber,
      face_template: photoUrl,
      phone:         user.phone,
    }
    
    // ... 其余代码
  }
}
```

## 环境变量配置示例

创建或修改 `apps/api/.env`：
```env
# 考勤机访问的服务器地址
# 选项1：使用局域网IP
ATTENDANCE_DEVICE_BASE_URL=http://192.168.1.100:3001

# 选项2：使用公网域名
# ATTENDANCE_DEVICE_BASE_URL=https://api.yourdomain.com

# 选项3：使用公网IP
# ATTENDANCE_DEVICE_BASE_URL=http://123.456.789.0:3001
```

## 验证修复

修复后，重新同步义工，日志应该显示：
```
✅ 添加成功: 房石安(LZ-V-1241702)
```

而不是：
```
❌ 照片下载错误，请检查照片链接是否能访问
```

## 相关文件

- `apps/api/src/modules/ws/service.ts` - WebSocket服务
- `apps/api/.env` - 环境变量配置
- `apps/api/public/uploads/avatars/` - 照片存储目录
