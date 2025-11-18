# Implementation Plan

- [x] 1. 配置 Better-Auth 核心
  - 更新 `src/lib/auth.ts` 配置文件，启用账号密码认证和 username 插件
  - 配置数据库适配器使用 Drizzle ORM
  - 设置会话过期时间为7天
  - 添加必要的环境变量配置
  - _Requirements: 2.4, 3.1, 4.1_

- [ ] 2. 创建和配置数据库表
  - [ ] 2.1 运行 Better-Auth 数据库迁移
    - 执行 better-auth 的数据库迁移命令创建必要的表（user, session, account）
    - 验证表结构是否正确创建
    - _Requirements: 1.4, 2.4_
  
  - [ ] 2.2 更新数据库 schema 文件
    - 在 `src/db/schema.ts` 中导入 better-auth 生成的表定义
    - 更新数据库实例配置以包含新表
    - _Requirements: 1.4_

- [ ] 3. 实现认证路由模块
  - [ ] 3.1 创建认证路由处理器
    - 更新 `src/modules/auth/index.ts` 使用 better-auth handler
    - 配置路由前缀为 `/api/auth`
    - 将所有 `/api/auth/*` 请求转发给 better-auth
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 3.2 在主应用中注册认证模块
    - 在 `src/index.ts` 中启用 authModule（取消注释）
    - 确保路由顺序正确
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 4. 实现认证中间件
  - 创建 `src/modules/auth/middleware.ts` 文件
  - 实现会话验证逻辑
  - 提供 `requireAuth` 辅助函数用于保护路由
  - 从请求头中提取和验证会话令牌
  - _Requirements: 3.2, 3.3, 5.1_

- [ ] 5. 实现用户注册功能
  - [ ] 5.1 配置注册端点
    - 确保 better-auth 的 `/api/auth/sign-up/email` 端点可用
    - 配置密码最小长度为6个字符
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 5.2 添加注册输入验证
    - 验证账号格式和唯一性
    - 验证密码强度
    - 验证邮箱格式（可以使用假邮箱）
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. 实现用户登录功能
  - 确保 better-auth 的 `/api/auth/sign-in/email` 端点可用
  - 配置登录凭证验证逻辑
  - 实现会话创建和令牌返回
  - 配置 HTTP-only Cookie 存储会话令牌
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.5_

- [ ] 7. 实现会话管理功能
  - [ ] 7.1 实现获取当前会话端点
    - 配置 `/api/auth/get-session` 端点
    - 从 Cookie 中读取会话令牌
    - 验证令牌有效性并返回用户信息
    - _Requirements: 3.2, 5.1, 5.2, 5.4_
  
  - [ ] 7.2 实现登出功能
    - 配置 `/api/auth/sign-out` 端点
    - 销毁当前会话
    - 清除客户端 Cookie
    - _Requirements: 3.4_

- [ ] 8. 实现错误处理
  - 创建 `src/modules/auth/errors.ts` 文件定义认证相关错误
  - 实现统一的错误响应格式
  - 处理常见错误场景（账号已存在、密码错误、未授权等）
  - 确保不泄露敏感信息
  - _Requirements: 1.2, 2.2, 2.3, 3.3, 5.4_

- [ ] 9. 集成现有 Volunteer 系统
  - [ ] 9.1 创建用户关联服务
    - 创建 `src/modules/auth/volunteer-integration.ts` 文件
    - 实现注册时自动创建 volunteer 记录的逻辑
    - 实现登录后获取完整 volunteer 信息的逻辑
    - _Requirements: 5.2, 5.3_
  
  - [ ] 9.2 扩展会话信息
    - 在会话中包含 volunteer 角色信息
    - 在会话中包含管理员权限信息（如果是管理员）
    - _Requirements: 5.2, 5.3_

- [ ] 10. 配置环境变量
  - 在 `.env` 文件中添加 `BETTER_AUTH_SECRET`
  - 在 `.env` 文件中添加 `BETTER_AUTH_URL`
  - 更新 `.env.example` 文件（如果存在）
  - _Requirements: 3.1, 4.1_

- [ ] 11. 更新 CORS 配置
  - 在 `src/index.ts` 中配置 CORS 允许携带凭证
  - 配置允许的源域名
  - _Requirements: 3.5_

- [ ] 12. 添加 API 文档
  - 在 Swagger 配置中添加认证端点文档
  - 添加请求和响应示例
  - 添加错误响应文档
  - _Requirements: 6.5_

- [ ]* 13. 编写测试
  - [ ]* 13.1 编写注册功能测试
    - 测试成功注册场景
    - 测试重复账号注册失败
    - 测试密码强度验证
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 13.2 编写登录功能测试
    - 测试成功登录场景
    - 测试错误密码登录失败
    - 测试不存在账号登录失败
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 13.3 编写会话管理测试
    - 测试会话创建和验证
    - 测试会话过期处理
    - 测试登出功能
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 13.4 编写集成测试
    - 测试完整的注册-登录-访问受保护资源流程
    - 测试与 volunteer 系统的集成
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 14. 清理旧的认证代码
  - 移除 `src/modules/auth/service.ts` 中的旧登录逻辑
  - 移除 `src/modules/auth/guard.ts` 中的旧 JWT 验证逻辑
  - 移除不再使用的依赖（如 @elysiajs/jwt）
  - 更新相关导入语句
  - _Requirements: 所有需求_
