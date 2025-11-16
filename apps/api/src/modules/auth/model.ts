import { t } from 'elysia'

// ==================== Request Schemas ====================

/**
 * 用户注册请求
 */
export const RegisterRequestSchema = t.Object({
  account:  t.String({ minLength: 3 }),
  password: t.String({ minLength: 6 }),
  name:     t.String({ minLength: 2 }),
  phone:    t.String({ minLength: 11 }),
  gender:   t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')]),
  idNumber: t.String({ minLength: 18, maxLength: 18 }),
  email:    t.Optional(t.String()),
})

/**
 * 用户登录请求
 */
export const LoginRequestSchema = t.Object({
  account:  t.String({ minLength: 3 }),
  password: t.String({ minLength: 3 }),
})

// ==================== Response Schemas ====================

/**
 * 用户信息响应
 */
export const UserProfileSchema = t.Object({
  id:      t.Number(),
  account: t.String(),
  name:    t.String(),
  role:    t.Optional(t.String()),
  avatar:  t.Optional(t.String()),
  email:   t.Optional(t.String()),
})

/**
 * 管理员信息响应
 */
export const AdminInfoSchema = t.Object({
  role:        t.Union([t.Literal('super'), t.Literal('admin'), t.Literal('operator')]),
  permissions: t.Optional(t.Any()),
  department:  t.Optional(t.String()),
})

/**
 * 登录响应
 */
export const LoginResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.String(),
  data:    t.Object({
    user:      UserProfileSchema,
    adminInfo: t.Optional(AdminInfoSchema),
    token:     t.String(),
  }),
})

// ==================== TypeScript Types ====================

export type RegisterRequestDto = typeof RegisterRequestSchema.static
export type LoginRequestDto = typeof LoginRequestSchema.static
export type UserProfileDto = typeof UserProfileSchema.static
export type AdminInfoDto = typeof AdminInfoSchema.static
export type LoginResponseDto = typeof LoginResponseSchema.static

// ==================== Legacy Types (保留兼容) ====================

/**
 * @deprecated 使用 LoginRequestDto 代替
 */
export type AdminLoginDto = LoginRequestDto
