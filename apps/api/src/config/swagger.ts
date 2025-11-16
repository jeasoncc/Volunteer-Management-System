import type { ElysiaSwaggerConfig } from '@elysiajs/swagger'

export const SWAGGER_CONFIG: ElysiaSwaggerConfig = {
  documentation: {
    openapi:      '3.1.0',
    info:         {
      title:          '寺庙管理系统 API',
      version:        '1.0.0',
      description:    `
# 寺庙管理系统 API 文档

## 系统概述
寺庙管理系统提供完整的寺庙日常运营管理功能，包括人员管理、法事安排、义工调度等核心模块。

## 核心功能
- 僧众管理
- 义工调度
- 法事安排
- 常住管理
- 往生者记录

## 技术栈
- 后端: Elysia.js (Bun运行时)
- 数据库: PostgreSQL
- 认证: JWT
- 文档: OpenAPI 3.1
`,
      contact:        {
        name:  '技术支持团队',
        email: 'support@temple.org',
        url:   'https://support.temple.org',
      },
      license:        {
        name: 'MIT',
        url:  'https://opensource.org/licenses/MIT',
      },
      termsOfService: 'https://temple.org/terms',
    },
    tags:         [
      {
        name:         'admin',
        description:  `
## 管理员模块

### 权限矩阵
| 权限项         | 超级管理员 | 区域管理员 | 普通管理员 |
|----------------|------------|------------|------------|
| 用户管理       | ✓          | ✓          | ✗          |
| 系统配置       | ✓          | ✗          | ✗          |
| 数据导出       | ✓          | ✓          | ✓          |

### 安全规范
- 密码复杂度要求：最少8字符，包含大小写字母和数字
- 登录失败锁定：5次失败后锁定30分钟
- 会话超时：闲置30分钟自动登出
`,
        externalDocs: {
          description: '管理员操作手册',
          url:         'https://docs.temple.org/admin-manual',
        },
      },
      {
        name:         'volunteer',
        description:  `
## 义工管理

### 状态机
\`\`\`mermaid
stateDiagram-v2
    [*] --> 申请中: 提交申请
    申请中 --> 审核通过: 管理员审核
    审核通过 --> 活跃: 完成培训
    活跃 --> 暂停: 临时请假
    暂停 --> 活跃: 恢复服务
    活跃 --> 已退出: 申请退出
    暂停 --> 已退出: 申请退出
\`\`\`

### 排班算法
1. 优先匹配技能标签
2. 考虑历史服务时长均衡
3. 尊重个人可用时间
`,
        externalDocs: {
          description: '义工排班指南',
          url:         'https://docs.temple.org/volunteer-scheduling',
        },
      },
    ],
    servers:      [
      {
        url:         'http://localhost:3001',
        description: '开发环境',
        variables:   {
          port: {
            enum:    ['3000', '3001', '3002'],
            default: '3001',
          },
        },
      },
      {
        url:         'https://api.temple.org/{version}',
        description: '生产环境',
        variables:   {
          version: {
            enum:    ['v1', 'v2'],
            default: 'v1',
          },
        },
      },
    ],
    components:   {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          // description:
          //   'JWT认证流程\n\n' +
          //   '```mermaid\n' +
          //   'graph TD\n' +
          //   '  A[客户端] -->|1. 提交凭证| B(认证服务)\n' +
          //   '  B -->|2. 颁发Token| A\n' +
          //   '  A -->|3. 携带Token| C[业务API]\n' +
          //   '  C -->|4. 验证Token| B\n' +
          //   '  B -->|5. 返回用户信息| C\n' +
          //   '  C -->|6. 返回业务数据| A\n' +
          //   '```',
        },
      },
      schemas:         {
        Pagination:    {
          type:       'object',
          properties: {
            total:       { type: 'integer', example: 100 },
            perPage:     { type: 'integer', example: 10 },
            currentPage: { type: 'integer', example: 1 },
            lastPage:    { type: 'integer', example: 10 },
            data:        { type: 'array', items: { type: 'object' } },
          },
        },
        Volunteer:     {
          type:       'object',
          required:   ['name', 'contact'],
          properties: {
            id:      { type: 'integer', format: 'int64' },
            name:    { type: 'string', example: '张居士' },
            contact: {
              type:    'string',
              pattern: '^1[3-9]\\d{9}$',
              example: '13800138000',
            },
            skills:  {
              type:    'array',
              items:   {
                type: 'string',
                enum: ['接待', '清洁', '斋堂', '法会', '文书'],
              },
              example: ['接待', '法会'],
            },
          },
        },
        ErrorResponse: {
          type:       'object',
          properties: {
            code:    {
              type: 'string',
              enum: ['VALIDATION_ERROR', 'AUTH_ERROR', 'NOT_FOUND', 'PERMISSION_DENIED'],
            },
            message: { type: 'string' },
            details: {
              type:  'array',
              items: {
                type:       'object',
                properties: {
                  field: { type: 'string' },
                  issue: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses:       {
        PaginatedResponse: {
          description: '分页响应',
          content:     {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Pagination',
              },
            },
          },
        },
        ValidationError:   {
          description: '参数验证错误',
          content:     {
            'application/json': {
              schema:   {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                invalidDate: {
                  value: {
                    code:    'VALIDATION_ERROR',
                    message: '日期格式无效',
                    details: [
                      {
                        field: 'birthDate',
                        issue: '必须是有效日期',
                        value: '2023-02-30',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      parameters:      {
        page:  {
          name:        'page',
          in:          'query',
          description: '页码(从1开始)',
          required:    false,
          schema:      {
            type:    'integer',
            minimum: 1,
            default: 1,
          },
        },
        limit: {
          name:        'limit',
          in:          'query',
          description: '每页数量',
          required:    false,
          schema:      {
            type:    'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
      },
    },
    security:     [{ bearerAuth: [] }],
    externalDocs: {
      description: '完整API参考文档',
      url:         'https://docs.temple.org/api-reference',
    },
  },
}
