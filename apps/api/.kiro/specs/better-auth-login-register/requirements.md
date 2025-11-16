# Requirements Document

## Introduction

本文档定义了志愿者管理系统中使用 better-auth 实现账号密码登录和注册功能的需求。系统需要支持志愿者和管理员通过账号密码进行身份认证，并提供安全的会话管理。

## Glossary

- **System**: 志愿者管理系统（Volunteer Management System）
- **User**: 系统用户，包括志愿者和管理员
- **Better-Auth**: 第三方认证库，用于处理用户认证和会话管理
- **Volunteer**: 志愿者用户
- **Admin**: 管理员用户
- **Session**: 用户登录后的会话状态
- **Credential**: 用户凭证，包括账号和密码

## Requirements

### Requirement 1: 用户注册功能

**User Story:** 作为一个新用户，我想要通过账号密码注册系统，以便我可以访问系统功能

#### Acceptance Criteria

1. WHEN User 提交注册请求，THE System SHALL 验证账号是否已存在
2. WHEN User 提交的账号已存在，THE System SHALL 返回错误提示"账号已存在"
3. WHEN User 提交的密码长度小于6个字符，THE System SHALL 返回错误提示"密码至少需要6个字符"
4. WHEN User 提交有效的注册信息，THE System SHALL 创建新用户记录并加密存储密码
5. WHEN 用户注册成功，THE System SHALL 返回成功消息和用户基本信息

### Requirement 2: 用户登录功能

**User Story:** 作为一个已注册用户，我想要通过账号密码登录系统，以便我可以使用系统功能

#### Acceptance Criteria

1. WHEN User 提交登录请求，THE System SHALL 验证账号是否存在
2. WHEN User 提交的账号不存在，THE System SHALL 返回错误提示"账号不存在"
3. WHEN User 提交的密码不正确，THE System SHALL 返回错误提示"密码错误"
4. WHEN User 提交正确的账号密码，THE System SHALL 创建用户会话并返回访问令牌
5. WHEN 用户登录成功，THE System SHALL 返回用户信息和会话令牌

### Requirement 3: 会话管理功能

**User Story:** 作为一个已登录用户，我想要系统能够维护我的登录状态，以便我不需要频繁登录

#### Acceptance Criteria

1. WHEN User 成功登录，THE System SHALL 创建有效期为7天的会话
2. WHEN User 访问受保护的资源，THE System SHALL 验证会话令牌的有效性
3. WHEN 会话令牌无效或过期，THE System SHALL 返回401未授权错误
4. WHEN User 请求登出，THE System SHALL 销毁当前会话
5. THE System SHALL 在 HTTP-only Cookie 中存储会话令牌以提高安全性

### Requirement 4: 密码安全功能

**User Story:** 作为系统管理员，我想要确保用户密码安全存储，以便保护用户账号安全

#### Acceptance Criteria

1. WHEN User 注册或修改密码，THE System SHALL 使用 bcrypt 算法加密密码
2. THE System SHALL NOT 以明文形式存储用户密码
3. WHEN 验证密码，THE System SHALL 使用 bcrypt 比对加密后的密码
4. THE System SHALL 使用至少10轮的 bcrypt 加密强度

### Requirement 5: 用户信息获取功能

**User Story:** 作为一个已登录用户，我想要获取我的个人信息，以便查看和管理我的账号

#### Acceptance Criteria

1. WHEN User 请求个人信息，THE System SHALL 验证用户会话有效性
2. WHEN 会话有效，THE System SHALL 返回用户的基本信息（不包括密码）
3. THE System SHALL 返回用户的角色信息（志愿者或管理员）
4. THE System SHALL NOT 在响应中包含敏感信息如密码哈希值

### Requirement 6: API 端点规范

**User Story:** 作为前端开发者，我想要清晰的 API 端点定义，以便正确调用认证接口

#### Acceptance Criteria

1. THE System SHALL 提供 POST /api/auth/sign-up 端点用于用户注册
2. THE System SHALL 提供 POST /api/auth/sign-in/email 端点用于用户登录
3. THE System SHALL 提供 POST /api/auth/sign-out 端点用于用户登出
4. THE System SHALL 提供 GET /api/auth/get-session 端点用于获取当前会话信息
5. THE System SHALL 在 Swagger 文档中展示所有认证相关的 API 端点
