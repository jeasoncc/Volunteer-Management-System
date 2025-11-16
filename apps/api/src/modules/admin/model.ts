import { t } from 'elysia'
import { VolunteerCreateSchema } from '../volunteer/model'

// ============== 管理员创建模型 ==============
export const AdminCreateSchema = t.Composite([
  VolunteerCreateSchema, // 复用志愿者所有字段
  t.Object({
    // 管理员特有必填字段
    role:        t.Union([t.Literal('super'), t.Literal('admin'), t.Literal('operator')]),
    department:  t.String({ minLength: 2 }),

    // 管理员特有可选字段
    permissions: t.Optional(t.Array(t.String())),
    accessLevel: t.Optional(t.Numeric({ minimum: 1, maximum: 10 })),
  }),
])

// ============== 更新管理员模型 ==============
// 管理员更新模型 (严格模式)
export const AdminUpdateSchema = t.Partial(
  t.Object({
    // 志愿者基础信息 (排除不可变字段)
    name:       t.String(),
    phone:      t.String(),
    email:      t.String({ format: 'email' }),
    birthDate:  t.String({ format: 'date' }), // 前端传字符串

    // 管理员专属字段
    role:       t.Union([t.Literal('super'), t.Literal('admin'), t.Literal('operator')]),
    department: t.String(),
    isActive:   t.Boolean(),
  }),
)
// 根据LotusID更新管理员的DTO
export const AdminUpdateByLotusSchema = t.Composite([
  t.Object({
    lotusId: t.String({ description: '志愿者唯一LotusID' }),
  }),
  t.Partial(
    t.Object({
      role:       t.Union([t.Literal('admin'), t.Literal('operator')]),
      department: t.String(),
      isActive:   t.Boolean(),
      // 可选的志愿者基础信息更新
      name:       t.Optional(t.String()),
      phone:      t.Optional(t.String({ pattern: '^1[3-9]\\d{9}$' })),
    }),
  ),
])

// ============== 志愿者升级管理员模型 ==============
export const PromoteVolunteerSchema = t.Object({
  lotusId:          t.String(),
  role:             t.Union([t.Literal('admin'), t.Literal('operator')]),
  department:       t.String(),
  grantPermissions: t.Optional(t.Array(t.String())),
})

// ============== 权限管理模型 ==============
export const PermissionUpdateSchema = t.Object({
  adminId:     t.Numeric(),
  permissions: t.Array(t.String()),
  operation:   t.Union([t.Literal('add'), t.Literal('remove'), t.Literal('replace')]),
})

// ============== ID参数模型 ==============
export const AdminIdSchema = t.Object({
  id: t.Numeric(),
})

// ============== 列表查询模型 ==============
export const AdminListQuerySchema = t.Object({
  page:       t.Optional(t.Numeric({ minimum: 1 })),
  limit:      t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  name:       t.Optional(t.String()),
  role:       t.Optional(t.Union([t.Literal('super'), t.Literal('admin'), t.Literal('operator')])),
  department: t.Optional(t.String()),
  isActive:   t.Optional(t.Boolean()),
})

// 删除管理员DTO
export const AdminDeleteSchema = t.Object({
  cascade: t.Optional(
    t.Boolean({
      default:     false,
      description: '是否级联删除关联的志愿者记录',
    }),
  ),
})
// 根据莲华斋义工号搜索参数类型
export const AdminSearchByLotusIdSchema = t.Object({
  lotusId:          t.String({
    minLength:   10,
    description: '莲花斋内部ID',
  }),
  includeVolunteer: t.Optional(
    t.Boolean({
      default:     false,
      description: '是否返回关联的志愿者信息',
    }),
  ),
})

// 全局搜索响应类型
export const AdminSearchResultSchema = t.Object({
  admin:     t.Object({
    id:         t.Number(),
    role:       t.Union([t.Literal('admin'), t.Literal('operator')]),
    department: t.String(),
  }),
  volunteer: t.Object({
    name:    t.String(),
    phone:   t.String(),
    lotusId: t.String(),
  }),
})

// ============== 类型导出 ==============
export type AdminCreateDto = typeof AdminCreateSchema.static
export type AdminUpdateDto = typeof AdminUpdateSchema.static
export type AdminUpdateByLotusDto = typeof AdminUpdateByLotusSchema.static
export type PromoteVolunteerDto = typeof PromoteVolunteerSchema.static
export type PermissionUpdateDto = typeof PermissionUpdateSchema.static
export type AdminListQuery = typeof AdminListQuerySchema.static
export type AdminDeleteDto = typeof AdminDeleteSchema.static
export type AdminSearchByLotusIdDto = typeof AdminSearchByLotusIdSchema.static
export type AdminSearchResult = typeof AdminSearchResultSchema.static
