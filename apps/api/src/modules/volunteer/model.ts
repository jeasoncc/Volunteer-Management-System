import { t } from 'elysia'

// 通用空字符串允许规则
const NullableString = t.Optional(
  t.Union([
    t.String({ minLength: 0 }), // 允许空字符串
    t.Undefined(), // 允许不传字段
    t.Null(), // 允许显式 null
  ]),
)

const NullableArray = t.Optional(
  t.Union([
    t.Array(t.String(), { minItems: 0 }), // 允许空数组 []
    t.Null(), // 允许显式 null
  ]),
)
// ==================== 基础字段定义 ====================
const BaseVolunteerSchema = {
  // 必填字段
  idNumber:     t.String({ minLength: 18, maxLength: 18 }), // 身份证号
  name:         t.String({ minLength: 2 }), // 姓名
  gender:       t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')]), // 性别
  phone:        t.String({ minLength: 11, maxLength: 20 }), // 手机号

  // 可选字段（有默认值）
  account:      t.Optional(t.String({ minLength: 3, maxLength: 50 })), // 登录账号（默认为手机号）
  password:     t.Optional(t.String({ minLength: 6 })), // 密码（默认为 123456）

  // ==================== 可选字段 ====================
  // lotusId 由系统自动生成，不需要在创建时提供

  // 义工联编号（可选）- 用于对接义工联系统
  // 很多义工可能没有这个编号，如果有则必须唯一
  volunteerId:  t.Optional(
    t.Union([
      t.String({ minLength: 1 }), // 如果提供，必须非空
      t.Null(),
      t.Undefined(),
    ]),
  ),
  wechat:       NullableString, // 微信
  address:      NullableString, // 地址
  avatar:       NullableString, // 头像URL
  dharmaName:   NullableString, // 法名
  memberStatus: t.Optional(t.Union([t.Literal('volunteer'), t.Literal('resident'), t.Null()])),
  roomId:       t.Optional(
    t.Union([
      t.Numeric({ minimum: 0 }), // 允许有效数字（≥0）
      t.Null(), // 允许显式传 null
      t.Undefined(), // 允许不传字段（会转为 undefined）
    ]),
  ),
  // 特殊格式字段
  birthDate:    t.Optional(
    t.Union([
      t.String({ format: 'date' }), // 非空时验证格式
      t.String({ minLength: 0 }), // 允许空字符串
      t.Null(),
    ]),
  ),
  email:        t.Optional(
    t.Union([
      t.String({ format: 'email' }), // 非空时验证格式
      t.String({ minLength: 0 }), // 允许空字符串
      t.Null(),
    ]),
  ),
}

// ==================== 分类信息字段 ====================
//
const CategoryFields = {
  // 枚举类字段：支持枚举值/空字符串/null/不传
  education:           t.Optional(
    t.Union([
      t.Literal('none'),
      t.Literal('elementary'),
      t.Literal('middle_school'),
      t.Literal('high_school'),
      t.Literal('bachelor'),
      t.Literal('master'),
      t.Literal('phd'),
      t.Literal('other'),
      t.Null(),
    ]),
  ),

  // 布尔字段：支持 true/false/null/不传
  hasBuddhismFaith:    t.Optional(t.Union([t.Boolean(), t.Null()])),

  // 其他枚举字段（复用模式）
  refugeStatus:        t.Optional(
    t.Union([
      t.Literal('none'),
      t.Literal('took_refuge'),
      t.Literal('five_precepts'),
      t.Literal('bodhisattva'),
      t.Null(),
    ]),
  ),
  healthConditions:    t.Optional(
    t.Union([
      t.Literal('healthy'),
      t.Literal('has_chronic_disease'),
      t.Literal('has_disability'),
      t.Literal('has_allergies'),
      t.Literal('recovering_from_illness'),
      t.Literal('other_conditions'),
      t.Null(),
    ]),
  ),
  religiousBackground: t.Optional(
    t.Union([
      t.Literal('upasaka'),
      t.Literal('upasika'),
      t.Literal('sramanera'),
      t.Literal('sramanerika'),
      t.Literal('bhikkhu'),
      t.Literal('bhikkhuni'),
      t.Literal('anagarika'),
      t.Literal('siladhara'),
      t.Literal('novice_monk'),
      t.Literal('buddhist_visitor'),
      t.Literal('none'),
      t.Null(),
    ]),
  ),
}

// ==================== 【服务字段】 ====================
const ServiceFields = {
  // 文本类字段（直接复用）
  joinReason:       NullableString,
  hobbies:          NullableString,
  emergencyContact: NullableString,

  // 数组类字段（直接复用）
  availableTimes:   NullableArray,
  trainingRecords:  NullableArray,

  // 枚举类字段
  familyConsent:    t.Optional(
    t.Union([
      t.Literal('approved'),
      t.Literal('partial'),
      t.Literal('rejected'),
      t.Literal('self_decided'),
      t.Null(),
    ]),
  ),
  severPosition:    t.Optional(
    t.Union([
      t.Literal('kitchen'),
      t.Literal('chanting'),
      t.Literal('cleaning'),
      t.Literal('reception'),
      t.Literal('security'),
      t.Literal('office'),
      t.Literal('other'),
      t.Null(),
    ]),
  ),
}

// ==================== Schema 组合 ====================
export const VolunteerCreateSchema = t.Object({
  ...BaseVolunteerSchema,
  ...CategoryFields,
  ...ServiceFields,
})

export const VolunteerUpdateSchema = t.Partial(VolunteerCreateSchema)

export const VolunteerIdSchema = t.Object({
  id: t.Numeric(),
})

export const VolunteerStatusUpdateSchema = t.Object({
  status: t.Union([
    t.Literal('applicant'),
    t.Literal('trainee'),
    t.Literal('registered'),
    t.Literal('inactive'),
    t.Literal('suspended'),
  ]),
})

export const VolunteerRoleUpdateSchema = t.Object({
  role: t.Union([t.Literal('admin'), t.Literal('volunteer')]),
})

export const VolunteerSearchQuerySchema = t.Object({
  keyword: t.String({ minLength: 1 }),
  limit:   t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
})

export const VolunteerListQuerySchema = t.Object({
  page:            t.Optional(t.Numeric({ minimum: 1 })),
  limit:           t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  keyword:         t.Optional(t.String()), // 搜索关键词（姓名、手机号、账号、邮箱）
  name:            t.Optional(t.String()),
  phone:           t.Optional(t.String()),
  status:          t.Optional(t.Union([t.Literal('active'), t.Literal('inactive')])),
  volunteerStatus: t.Optional(
    t.Union([
      t.Literal('applicant'),
      t.Literal('trainee'),
      t.Literal('registered'),
      t.Literal('inactive'),
      t.Literal('suspended'),
    ]),
  ),
  lotusRole:       t.Optional(
    t.Union([
      t.Literal('admin'),
      t.Literal('volunteer'),
    ]),
  ),
  severPosition:   t.Optional(
    t.Union([
      t.Literal('kitchen'),
      t.Literal('chanting'),
      t.Literal('cleaning'),
      t.Literal('reception'),
      t.Literal('security'),
      t.Literal('office'),
      t.Literal('other'),
    ]),
  ),
})

// 基于 lotusId 的 Schema
export const VolunteerLotusIdSchema = t.Object({
  lotusId: t.String({ minLength: 1 }),
})

export const VolunteerBatchDeleteSchema = t.Object({
  lotusIds: t.Array(t.String({ minLength: 1 }), { minItems: 1 }),
})

export const VolunteerCheckInSchema = t.Object({
  timestamp: t.Optional(t.String({ format: 'date-time' })),
})

export const VolunteerCheckOutSchema = t.Object({
  timestamp: t.Optional(t.String({ format: 'date-time' })),
})

export const VolunteerBatchImportSchema = t.Array(VolunteerCreateSchema)

// ==================== 类型导出 ====================
export type VolunteerCreateDto = typeof VolunteerCreateSchema.static
export type VolunteerUpdateDto = typeof VolunteerUpdateSchema.static
export type VolunteerIdParams = typeof VolunteerIdSchema.static
export type VolunteerStatusUpdateDto = typeof VolunteerStatusUpdateSchema.static
export type VolunteerSearchQuery = typeof VolunteerSearchQuerySchema.static
export type VolunteerListQuery = typeof VolunteerListQuerySchema.static
export type VolunteerCheckInDto = typeof VolunteerCheckInSchema.static
export type VolunteerCheckOutDto = typeof VolunteerCheckOutSchema.static
export type VolunteerBatchImportDto = typeof VolunteerBatchImportSchema.static
