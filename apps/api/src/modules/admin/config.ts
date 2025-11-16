import { t } from 'elysia'
import {
  AdminCreateSchema,
  AdminDeleteSchema,
  AdminListQuerySchema,
  AdminUpdateByLotusSchema,
  AdminUpdateSchema,
  PermissionUpdateSchema,
  PromoteVolunteerSchema,
} from './model'

export const AdminConfig = {
  // ============== 创建管理员 ==============
  createAdmin:          {
    body:   AdminCreateSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '创建管理员',
      description: '创建新管理员账号（需关联志愿者账号）',
      responses:   {
        201: {
          description: '创建成功',
          content:     {
            'application/json': {
              example: {
                id:      1,
                lotusId: 'ADM-2023-001',
              },
            },
          },
        },
        400: {
          description: '参数校验失败',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '账号已存在',
              },
            },
          },
        },
      },
    },
  },

  // ============== 根据ID获取管理员详情 ==============
  getAdminById:         {
    params: t.Object({
      id: t.Numeric({
        description: '管理员ID（对应volunteer.id）',
        example:     1,
      }),
    }),
    detail: {
      tags:        ['Admin'],
      summary:     '根据ID获取管理员详情',
      description: '根据ID查询管理员完整信息（包含关联志愿者数据）',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                admin:     {
                  id:         1,
                  role:       'admin',
                  department: '技术部',
                  isActive:   true,
                },
                volunteer: {
                  name:    '张三',
                  phone:   '13800138000',
                  lotusId: 'VOL-2023-1001',
                },
              },
            },
          },
        },
        404: {
          description: '管理员不存在',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '管理员 123 不存在',
              },
            },
          },
        },
      },
    },
  },

  // ============== 根据lotusId查询管理员 ==============
  getAdminByLotusId:    {
    params: t.Object({
      lotusId: t.String({
        description: '莲花斋内部唯一ID',
        examples:    ['VOL-2023-1001'],
      }),
    }),
    query:  t.Object({
      includeVolunteer: t.Optional(
        t.Boolean({
          description: '是否返回关联志愿者信息',
          default:     false,
        }),
      ),
    }),
    detail: {
      tags:        ['Admin'],
      summary:     '根据lotusId查询管理员',
      description: '根据志愿者lotusID精确查询管理员信息',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              examples: {
                basic: {
                  summary: '基础信息',
                  value:   {
                    id:      1,
                    role:    'admin',
                    lotusId: 'VOL-2023-1001',
                  },
                },
                full:  {
                  summary: '包含志愿者信息',
                  value:   {
                    admin:     {
                      id:   1,
                      role: 'admin',
                    },
                    volunteer: {
                      name:    '张三',
                      lotusId: 'VOL-2023-1001',
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: '管理员不存在',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '未找到 lotusId 为 VOL-2023-1001 的管理员',
              },
            },
          },
        },
      },
    },
  },

  // ============== 根据id更新管理员 ==============
  updateAdminById:      {
    params: t.Object({
      id: t.Numeric(),
    }),
    body:   AdminUpdateSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '根据id更新管理员',
      description: '更新管理员角色/部门/状态等信息',
      responses:   {
        200: {
          description: '更新成功',
          content:     {
            'application/json': {
              example: { success: true },
            },
          },
        },
        403: {
          description: '禁止操作',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '禁止修改超级管理员信息',
              },
            },
          },
        },
        404: {
          description: '管理员不存在',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '管理员 123 不存在',
              },
            },
          },
        },
      },
    },
  },

  // ============== 根据LotusID更新管理员 ==============
  updateAdminByLotusId: {
    body:   AdminUpdateByLotusSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '根据LotusID更新管理员',
      description: '通过志愿者LotusID更新关联的管理员信息',
      responses:   {
        200: {
          description: '更新成功',
          content:     {
            'application/json': {
              example: {
                success:        true,
                updatedAdminId: 1,
                updatedFields:  ['department', 'role'] as const,
              },
            },
          },
        },
        404: {
          description: '志愿者不存在',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '未找到LotusID为 VOL-123 的志愿者',
              },
            },
          },
        },
      },
    },
  },

  // ============== 升级志愿者为管理员 ==============
  promoteVolunteer:     {
    body:   PromoteVolunteerSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '志愿者升级',
      description: '将现有志愿者账号升级为管理员账号',
      responses:   {
        201: {
          description: '升级成功',
          content:     {
            'application/json': {
              example: {
                id:            1,
                role:          'admin',
                volunteerInfo: {
                  name:    '原志愿者姓名',
                  lotusId: 'VOL-2023-1001',
                },
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
                error:   '该用户已是管理员',
              },
            },
          },
        },
      },
    },
  },

  // ============== 修改权限 ==============
  updatePermissions:    {
    body:   PermissionUpdateSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '权限管理',
      description: '修改管理员权限列表',
      responses:   {
        200: {
          description: '权限更新成功',
          content:     {
            'application/json': {
              example: {
                success:            true,
                updatedPermissions: ['user:manage', 'content:edit'],
              },
            },
          },
        },
        400: {
          description: '无效权限',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '权限格式无效',
              },
            },
          },
        },
      },
    },
  },

  // ============== 获取管理员列表 ==============
  getAdminList:         {
    query:  AdminListQuerySchema,
    detail: {
      tags:        ['Admin'],
      summary:     '管理员列表',
      description: '分页查询管理员列表，支持筛选',
      responses:   {
        200: {
          description: '查询成功',
          content:     {
            'application/json': {
              example: {
                data:       [
                  {
                    admin:     {
                      id:   1,
                      role: 'admin',
                    },
                    volunteer: {
                      name: '张三',
                    },
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

  // ============== 删除管理员 ==============
  deleteAdmin:          {
    params: t.Object({
      id: t.Numeric({ description: '管理员ID', example: 1 }),
    }),
    query:  AdminDeleteSchema,
    detail: {
      tags:        ['Admin'],
      summary:     '删除管理员',
      description: '删除管理员账号（可选级联删除关联志愿者）',
      responses:   {
        200: {
          description: '删除成功',
          content:     {
            'application/json': {
              examples: {
                singleDelete:  {
                  summary: '仅删除管理员',
                  value:   {
                    success:          true,
                    deletedAdminId:   1,
                    deletedVolunteer: null,
                  },
                },
                cascadeDelete: {
                  summary: '级联删除',
                  value:   {
                    success:          true,
                    deletedAdminId:   1,
                    deletedVolunteer: 1,
                  },
                },
              },
            },
          },
        },
        403: {
          description: '禁止操作',
          content:     {
            'application/json': {
              example: {
                success: false,
                error:   '禁止删除超级管理员',
              },
            },
          },
        },
      },
    },
  },

  // ============== 管理员搜索 ==============
  searchAdmin:          {
    query:  t.Object({
      keyword: t.String({
        minLength:   1,
        description: '搜索关键词（姓名/电话/账号/lotusId）',
        examples:    ['张', '13800138000', 'VOL-2023'],
      }),
      limit:   t.Optional(
        t.Numeric({
          minimum:     1,
          maximum:     100,
          default:     10,
          description: '返回结果数量',
        }),
      ),
    }),
    detail: {
      tags:        ['Admin'],
      summary:     '模糊搜索管理员',
      description: '根据姓名、电话、账号或lotusID模糊搜索管理员',
      responses:   {
        200: {
          description: '搜索成功',
          content:     {
            'application/json': {
              examples: {
                nameSearch:    {
                  value: [
                    {
                      admin:     { id: 1, role: 'admin' },
                      volunteer: { name: '张三', phone: '13800138000' },
                    },
                  ],
                },
                lotusIdSearch: {
                  value: [
                    {
                      admin:     { id: 2, role: 'operator' },
                      volunteer: { lotusId: 'VOL-2023-1001' },
                    },
                  ],
                },
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
                error:   '关键词长度至少1个字符',
              },
            },
          },
        },
      },
    },
  },
}
