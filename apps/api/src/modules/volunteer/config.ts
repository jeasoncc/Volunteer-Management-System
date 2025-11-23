import { t } from 'elysia'
import {
  VolunteerCreateSchema,
  VolunteerListQuerySchema,
  VolunteerRoleUpdateSchema,
  VolunteerSearchQuerySchema,
  VolunteerStatusUpdateSchema,
  VolunteerUpdateSchema,
} from './model'

/**
 * 义工模块 API 配置
 *
 * 统一规范：
 * - tags: 使用中文分组
 * - summary: 简短描述
 * - description: 详细说明
 * - 提供完整的请求/响应示例
 */
export const VolunteerConfig = {
  // ==================== 核心 CRUD ====================

  create:          {
    body:   VolunteerCreateSchema,
    detail: {
      tags:        ['义工管理-创建'],
      summary:     '创建义工',
      description: `
创建新的义工记录

**默认值**：
- 账号：如未提供，默认为手机号
- 密码：如未提供，默认为 123456（已加密）
- lotusId：系统自动生成

**注意**：
- 身份证号、手机号、账号必须唯一
- 创建后建议用户修改密码
      `,
      responses:   {
        200: {
          description: '创建成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    {
                  id:              1,
                  lotusId:         'LZ-V-1234567',
                  account:         '13128851618',
                  defaultPassword: '123456',
                },
              },
            },
          },
        },
        400: {
          description: '参数错误',
        },
        409: {
          description: '账号、身份证号或手机号已存在',
        },
      },
    },
  },

  getList:         {
    query:  VolunteerListQuerySchema,
    detail: {
      tags:        ['义工管理-查询-批量查询'],
      summary:     '获取义工列表',
      description: '分页获取义工列表，支持多种筛选条件',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    {
                  data:       [
                    {
                      lotusId: 'LZ-V-1234567',
                      name:    '刘金艳',
                      phone:   '13128851618',
                      status:  'active',
                    },
                  ],
                  pagination: {
                    total:      100,
                    page:       1,
                    limit:      10,
                    totalPages: 10,
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  getAll:          {
    query:  VolunteerListQuerySchema,
    detail: {
      tags:        ['义工管理-查询-批量查询'],
      summary:     '获取所有义工（不分页）',
      description: '获取所有义工数据，主要用于导出功能，支持筛选条件',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    [
                  {
                    lotusId: 'LZ-V-1234567',
                    name:    '刘金艳',
                    phone:   '13128851618',
                    status:  'active',
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  getByLotusId:    {
    params: t.Object({ lotusId: t.String() }),
    detail: {
      tags:        ['义工管理-查询-详细信息'],
      summary:     '获取义工详情',
      description: '根据 lotusId 获取义工详细信息',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    {
                  lotusId:    'LZ-V-1234567',
                  name:       '刘金艳',
                  phone:      '13128851618',
                  idNumber:   '430223199001018381',
                  gender:     'female',
                  dharmaName: '妙音',
                  status:     'active',
                },
              },
            },
          },
        },
        404: {
          description: '义工不存在',
        },
      },
    },
  },

  updateByLotusId: {
    params: t.Object({ lotusId: t.String() }),
    body:   VolunteerUpdateSchema,
    detail: {
      tags:        ['义工管理-更新'],
      summary:     '更新义工信息',
      description: '根据 lotusId 更新义工信息，支持部分更新',
      responses:   {
        200: {
          description: '更新成功',
        },
        404: {
          description: '义工不存在',
        },
      },
    },
  },

  deleteByLotusId: {
    params: t.Object({ lotusId: t.String() }),
    detail: {
      tags:        ['义工管理-删除'],
      summary:     '删除义工',
      description: '根据 lotusId 删除义工记录',
      responses:   {
        200: {
          description: '删除成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                message: '已删除义工: 刘金艳 (LZ-V-1234567)',
              },
            },
          },
        },
        404: {
          description: '义工不存在',
        },
      },
    },
  },

  // ==================== 批量操作 ====================

  batchImport:     {
    body:   t.Array(VolunteerCreateSchema),
    detail: {
      tags:        ['义工管理-批量操作-批量导入'],
      summary:     '批量导入义工',
      description: `
批量导入义工记录

**特点**：
- 自动设置默认值（账号、密码）
- 详细的成功/失败反馈
- 失败不影响其他记录

**返回**：
- 每条记录的处理结果
- 统计信息（成功/失败数量）
      `,
      responses:   {
        200: {
          description: '批量导入完成',
          content:     {
            'application/json': {
              example: {
                success: true,
                message: '批量导入完成: 成功 8, 失败 2',
                results: [
                  {
                    success:         true,
                    index:           1,
                    lotusId:         'LZ-V-1234567',
                    name:            '刘金艳',
                    account:         '13128851618',
                    defaultPassword: '123456',
                  },
                  {
                    success: false,
                    index:   2,
                    name:    '张三',
                    error:   '手机号已存在',
                  },
                ],
                summary: {
                  total:   10,
                  success: 8,
                  fail:    2,
                },
              },
            },
          },
        },
      },
    },
  },

  batchDelete:     {
    body:   t.Object({
      lotusIds: t.Array(t.String(), { minItems: 1 }),
    }),
    detail: {
      tags:        ['义工管理-批量操作-批量删除'],
      summary:     '批量删除义工',
      description: '根据 lotusId 数组批量删除义工',
      responses:   {
        200: {
          description: '批量删除完成',
          content:     {
            'application/json': {
              example: {
                success: true,
                message: '批量删除完成: 成功 5, 失败 0',
                results: [
                  {
                    success: true,
                    lotusId: 'LZ-V-1234567',
                    name:    '刘金艳',
                  },
                ],
                summary: {
                  total:   5,
                  success: 5,
                  fail:    0,
                },
              },
            },
          },
        },
      },
    },
  },

  // ==================== 查询功能 ====================

  search:          {
    query:  VolunteerSearchQuerySchema,
    detail: {
      tags:        ['义工管理-查询-模糊查询'],
      summary:     '搜索义工',
      description: '根据关键词搜索义工（姓名、手机号、账号、邮箱）',
      responses:   {
        200: {
          description: '搜索成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    [
                  {
                    lotusId: 'LZ-V-1234567',
                    name:    '刘金艳',
                    phone:   '13128851618',
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  getStats:        {
    detail: {
      tags:        ['义工管理-查询-统计数据'],
      summary:     '获取义工统计数据',
      description: '获取义工总数、本月新增、活跃义工等统计信息',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    {
                  total:            100,
                  newThisMonth:     10,
                  activeVolunteers: 80,
                },
              },
            },
          },
        },
      },
    },
  },

  // ==================== 功能操作 ====================

  changePassword:  {
    params: t.Object({ lotusId: t.String() }),
    body:   t.Object({
      oldPassword: t.String({ minLength: 6 }),
      newPassword: t.String({ minLength: 6 }),
    }),
    detail: {
      tags:        ['义工管理-功能-修改密码'],
      summary:     '修改密码',
      description: '用户修改自己的密码',
      responses:   {
        200: {
          description: '修改成功',
        },
        400: {
          description: '原密码错误',
        },
      },
    },
  },

  changeStatus:    {
    params: t.Object({ lotusId: t.String() }),
    body:   VolunteerStatusUpdateSchema,
    detail: {
      tags:        ['义工管理-功能-变更状态'],
      summary:     '变更状态',
      description: '变更义工状态（申请人、培训中、已注册等）',
      responses:   {
        200: {
          description: '变更成功',
        },
      },
    },
  },

  changeRole:      {
    params: t.Object({ lotusId: t.String() }),
    body:   VolunteerRoleUpdateSchema,
    detail: {
      tags:        ['义工管理-功能-角色管理'],
      summary:     '变更系统角色',
      description: '将义工升为管理员，或将管理员恢复为义工/驻堂',
      responses:   {
        200: {
          description: '角色更新成功',
        },
      },
    },
  },
}
