import { t } from 'elysia'
import { t } from 'elysia'
import {
  VolunteerCreateSchema,
  VolunteerIdSchema,
  VolunteerListQuerySchema,
  VolunteerSearchQuerySchema,
  VolunteerStatusUpdateSchema,
  VolunteerUpdateSchema,
} from './model'

export const VolunteerConfig = {
  createVolunteer:          {
    body:   VolunteerCreateSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '创建义工',
      responses: {
        201: {
          description: '创建成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    { id: 1, lotusId: 'VOL-001' },
              },
            },
          },
        },
        409: {
          description: '冲突',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'CONFLICT',
                message: '手机号已存在',
              },
            },
          },
        },
      },
    },
  },

  getVolunteerList:         {
    query:  VolunteerListQuerySchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '获取义工列表',
      responses: {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    {
                  data:       [{ id: 1, name: '张三' }],
                  pagination: { total: 100, page: 1, limit: 10 },
                },
              },
            },
          },
        },
      },
    },
  },

  getVolunteerById:         {
    params: VolunteerIdSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '获取义工详情',
      responses: {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    { id: 1, name: '张三', status: 'active' },
              },
            },
          },
        },
        404: {
          description: '未找到',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'NOT_FOUND',
                message: '义工不存在',
              },
            },
          },
        },
      },
    },
  },

  updateVolunteerById:      {
    params: VolunteerIdSchema,
    body:   VolunteerUpdateSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '更新义工信息',
      responses: {
        200: {
          description: '更新成功',
          content:     {
            'application/json': {
              example: { success: true },
            },
          },
        },
        422: {
          description: '验证失败',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'VALIDATION_FAILED',
                message: '出生日期格式无效',
              },
            },
          },
        },
      },
    },
  },

  deleteVolunteer:          {
    params: VolunteerIdSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '删除义工',
      responses: {
        200: {
          description: '删除成功',
          content:     {
            'application/json': {
              example: { success: true },
            },
          },
        },
        404: {
          description: '未找到',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'NOT_FOUND',
                message: '义工不存在',
              },
            },
          },
        },
      },
    },
  },

  batchImportVolunteers:    {
    body:   t.Array(VolunteerCreateSchema),
    detail: {
      tags:      ['volunteer'],
      summary:   '批量导入义工',
      responses: {
        207: {
          description: '多状态响应',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    [
                  { success: true, data: { id: 1, lotusId: 'VOL-001' } },
                  { success: false, error: '手机号已存在' },
                ],
              },
            },
          },
        },
      },
    },
  },

  changeVolunteerStatus:    {
    params: VolunteerIdSchema,
    body:   VolunteerStatusUpdateSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '变更义工状态',
      responses: {
        200: {
          description: '变更成功',
          content:     {
            'application/json': {
              example: { success: true },
            },
          },
        },
        400: {
          description: '无效状态',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'INVALID_STATUS',
                message: '无效的状态值',
              },
            },
          },
        },
      },
    },
  },

  searchVolunteer:          {
    query:  VolunteerSearchQuerySchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '搜索义工',
      responses: {
        200: {
          description: '搜索成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    [{ id: 1, name: '张三', phone: '13800138000' }],
              },
            },
          },
        },
        400: {
          description: '关键词过短',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'KEYWORD_TOO_SHORT',
                message: '关键词长度至少1个字符',
              },
            },
          },
        },
      },
    },
  },

  checkInVolunteer:         {
    params: VolunteerIdSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '义工签到',
      responses: {
        200: {
          description: '签到成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    { checkInTime: '2023-01-01T09:00:00Z' },
              },
            },
          },
        },
        409: {
          description: '重复签到',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'DUPLICATE_CHECKIN',
                message: '今日已签到',
              },
            },
          },
        },
      },
    },
  },

  checkOutVolunteer:        {
    params: VolunteerIdSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '义工签退',
      responses: {
        200: {
          description: '签退成功',
          content:     {
            'application/json': {
              example: {
                success: true,
                data:    { checkOutTime: '2023-01-01T17:00:00Z' },
              },
            },
          },
        },
        400: {
          description: '未签到',
          content:     {
            'application/json': {
              example: {
                success: false,
                code:    'NOT_CHECKED_IN',
                message: '请先完成签到',
              },
            },
          },
        },
      },
    },
  },

  // ==================== 基于 lotusId 的 CRUD ====================

  getVolunteerByLotusId:    {
    params: t.Object({ lotusId: t.String() }),
    detail: {
      tags:      ['volunteer'],
      summary:   '根据 lotusId 获取义工详情（推荐）',
      responses: {
        200: {
          description: '查询成功',
        },
      },
    },
  },

  updateVolunteerByLotusId: {
    params: t.Object({ lotusId: t.String() }),
    body:   VolunteerUpdateSchema,
    detail: {
      tags:      ['volunteer'],
      summary:   '根据 lotusId 更新义工信息（推荐）',
      responses: {
        200: {
          description: '更新成功',
        },
      },
    },
  },

  deleteVolunteerByLotusId: {
    params: t.Object({ lotusId: t.String() }),
    detail: {
      tags:      ['volunteer'],
      summary:   '根据 lotusId 删除义工（推荐）',
      responses: {
        200: {
          description: '删除成功',
        },
      },
    },
  },

  batchDeleteVolunteers:    {
    body:   t.Object({
      lotusIds: t.Array(t.String(), { minItems: 1 }),
    }),
    detail: {
      tags:      ['volunteer'],
      summary:   '批量删除义工',
      responses: {
        200: {
          description: '批量删除完成',
          content:     {
            'application/json': {
              example: {
                success: true,
                message: '批量删除完成: 成功 5, 失败 0',
                results: [
                  { success: true, lotusId: 'LZ-V-1234567', name: '张三' },
                  { success: true, lotusId: 'LZ-V-1234568', name: '李四' },
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
}
