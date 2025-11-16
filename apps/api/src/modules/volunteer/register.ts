/**
 * 义工自助注册模块
 * 公开接口，不需要登录
 * 复用 VolunteerService.create() 方法
 */

import { Elysia, t } from 'elysia'
import { VolunteerService } from './service'
import { errorHandler } from '../../lib/middleware/error-handler'
import { createLogger } from '../../log'
import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { eq } from 'drizzle-orm'

const logger = createLogger()

export const volunteerRegisterModule = new Elysia({ prefix: '/volunteer/register' })
  .use(errorHandler)
  
  /**
   * 义工自助注册
   * POST /volunteer/register
   * 复用 VolunteerService.create() 方法
   */
  .post(
    '/',
    async ({ body, set }) => {
      try {
        // 添加默认状态为申请人
        const registerData = {
          ...body,
          volunteerStatus: 'applicant' as const,
          lotusRole: 'volunteer' as const,
        }
        
        // 复用现有的创建方法
        const result = await VolunteerService.create(registerData)
        
        set.status = 201
        return {
          success: true,
          message: '注册成功！请使用手机号和默认密码登录，并尽快修改密码。',
          data: {
            lotusId: result.lotusId,
            account: result.account,
            defaultPassword: result.defaultPassword || '123456',
            name: body.name,
            phone: body.phone,
            status: 'applicant',
          },
        }
      } catch (error: any) {
        logger.error('注册失败:', error)
        set.status = 400
        return {
          success: false,
          message: error.message || '注册失败',
        }
      }
    },
    {
      body: t.Object({
        // 基本信息（必填）
        name: t.String({ minLength: 2, maxLength: 50, description: '姓名' }),
        phone: t.String({ 
          pattern: '^1[3-9]\\d{9}$',
          description: '手机号（11位）',
        }),
        idNumber: t.String({ 
          minLength: 18, 
          maxLength: 18,
          description: '身份证号（18位）',
        }),
        
        // 可选信息
        gender: t.Optional(t.Union([
          t.Literal('male'),
          t.Literal('female'),
          t.Literal('other')
        ])),
        birthDate: t.Optional(t.String()),
        nation: t.Optional(t.String({ description: '民族' })),
        wechat: t.Optional(t.String({ maxLength: 50 })),
        email: t.Optional(t.String({ format: 'email' })),
        address: t.Optional(t.String()),
        education: t.Optional(t.Union([
          t.Literal('none'),
          t.Literal('elementary'),
          t.Literal('middle_school'),
          t.Literal('high_school'),
          t.Literal('bachelor'),
          t.Literal('master'),
          t.Literal('phd'),
          t.Literal('other')
        ])),
        avatar: t.Optional(t.String({ description: '头像URL' })),
        
        // 佛教信息
        dharmaName: t.Optional(t.String({ maxLength: 50 })),
        hasBuddhismFaith: t.Optional(t.Boolean()),
        refugeStatus: t.Optional(t.Union([
          t.Literal('none'),
          t.Literal('took_refuge'),
          t.Literal('five_precepts'),
          t.Literal('bodhisattva')
        ])),
        religiousBackground: t.Optional(t.String()),
        
        // 其他信息
        healthConditions: t.Optional(t.Union([
          t.Literal('healthy'),
          t.Literal('has_chronic_disease'),
          t.Literal('has_disability'),
          t.Literal('has_allergies'),
          t.Literal('recovering_from_illness'),
          t.Literal('other_conditions')
        ])),
        joinReason: t.Optional(t.String()),
        hobbies: t.Optional(t.String()),
        availableTimes: t.Optional(t.String()),
        emergencyContact: t.Optional(t.String({ maxLength: 50 })),
        familyConsent: t.Optional(t.Union([
          t.Literal('approved'),
          t.Literal('partial'),
          t.Literal('rejected'),
          t.Literal('self_decided')
        ])),
        
        // 新增字段
        volunteerId: t.Optional(t.String({ description: '深圳义工号' })),
        qq: t.Optional(t.String({ description: 'QQ号' })),
        accommodation: t.Optional(t.String({ description: '住宿情况' })),
      }),
      detail: {
        summary: '义工自助注册',
        description: '公开接口，用户可自行注册成为义工申请人',
        tags: ['Volunteer Register'],
      },
    },
  )
  
  /**
   * 检查身份证号是否已注册
   */
  .get(
    '/check-id/:idNumber',
    async ({ params: { idNumber }, set }) => {
      try {
        const existing = await db
          .select({ id: volunteer.id })
          .from(volunteer)
          .where(eq(volunteer.idNumber, idNumber))
          .limit(1)
        
        const exists = existing.length > 0
        
        return {
          success: true,
          data: {
            exists,
            message: exists ? '该身份证号已注册' : '该身份证号可以注册',
          },
        }
      } catch (error: any) {
        set.status = 400
        return {
          success: false,
          message: error.message || '检查失败',
        }
      }
    },
    {
      params: t.Object({
        idNumber: t.String({ minLength: 18, maxLength: 18 }),
      }),
      detail: {
        summary: '检查身份证号是否已注册',
        tags: ['Volunteer Register'],
      },
    },
  )
  
  /**
   * 检查手机号是否已注册
   */
  .get(
    '/check-phone/:phone',
    async ({ params: { phone }, set }) => {
      try {
        const existing = await db
          .select({ id: volunteer.id })
          .from(volunteer)
          .where(eq(volunteer.phone, phone))
          .limit(1)
        
        const exists = existing.length > 0
        
        return {
          success: true,
          data: {
            exists,
            message: exists ? '该手机号已注册' : '该手机号可以注册',
          },
        }
      } catch (error: any) {
        set.status = 400
        return {
          success: false,
          message: error.message || '检查失败',
        }
      }
    },
    {
      params: t.Object({
        phone: t.String({ pattern: '^1[3-9]\\d{9}$' }),
      }),
      detail: {
        summary: '检查手机号是否已注册',
        tags: ['Volunteer Register'],
      },
    },
  )
  
  /**
   * 获取注册统计
   */
  .get(
    '/stats',
    async () => {
      try {
        const result = await db
          .select({
            status: volunteer.volunteerStatus,
          })
          .from(volunteer)
        
        const stats = {
          total: result.length,
          applicant: result.filter(v => v.status === 'applicant').length,
          trainee: result.filter(v => v.status === 'trainee').length,
          registered: result.filter(v => v.status === 'registered').length,
          inactive: result.filter(v => v.status === 'inactive').length,
          suspended: result.filter(v => v.status === 'suspended').length,
        }
        
        return {
          success: true,
          data: stats,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取统计失败',
        }
      }
    },
    {
      detail: {
        summary: '获取注册统计',
        tags: ['Volunteer Register'],
      },
    },
  )
