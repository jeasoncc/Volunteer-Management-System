/**
 * 义工审批模块
 * 处理义工申请的审批流程
 */

import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { eq, and, or, count } from 'drizzle-orm'
import { jwtPlugin } from '../../lib/middleware/auth'
import { errorHandler } from '../../lib/middleware/error-handler'

// 审批请求 Schema
const ApprovalRequestSchema = t.Object({
  action: t.Union([t.Literal('approve'), t.Literal('reject')]),
  notes: t.Optional(t.String()),
})

// 批量审批 Schema
const BatchApprovalSchema = t.Object({
  lotusIds: t.Array(t.String()),
  action: t.Union([t.Literal('approve'), t.Literal('reject')]),
  notes: t.Optional(t.String()),
})

/**
 * 审批模块路由
 */
export const approvalModule = new Elysia({ prefix: '/volunteer/approval' })
  .use(errorHandler)
  .use(jwtPlugin)
  .derive(async ({ jwt, cookie: { auth } }) => {
    let user = null

    if (auth?.value) {
      try {
        const payload = await jwt.verify(auth.value)
        if (payload) {
          user = payload
        }
      } catch (error) {
        // Token 无效
      }
    }

    return { user }
  })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401
      return {
        success: false,
        code: 'UNAUTHORIZED',
        message: '未登录，请先登录',
      }
    }

    // 只有管理员可以审批
    if (user.role !== 'admin') {
      set.status = 403
      return {
        success: false,
        code: 'FORBIDDEN',
        message: '权限不足，只有管理员可以审批',
      }
    }
  })

  /**
   * 获取待审批列表
   */
  .get(
    '/pending',
    async ({ query }) => {
      const { page = 1, limit = 20 } = query
      const offset = (page - 1) * limit

      const [volunteers, totalResult] = await Promise.all([
        db
          .select()
          .from(volunteer)
          .where(eq(volunteer.volunteerStatus, 'applicant'))
          .limit(limit)
          .offset(offset)
          .orderBy(volunteer.createdAt),
        db
          .select({ count: count() })
          .from(volunteer)
          .where(eq(volunteer.volunteerStatus, 'applicant')),
      ])

      const total = Number(totalResult[0]?.count) || 0

      return {
        success: true,
        data: volunteers,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric({ minimum: 1 })),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
      }),
      detail: {
        tags: ['义工审批'],
        summary: '获取待审批义工列表',
        description: '获取所有状态为 applicant 的义工申请',
      },
    },
  )

  /**
   * 审批单个义工
   */
  .post(
    '/:lotusId',
    async ({ params, body, user }) => {
      const { lotusId } = params
      const { action, notes } = body

      return db.transaction(async tx => {
        // 查找义工
        const [existingVolunteer] = await tx
          .select()
          .from(volunteer)
          .where(eq(volunteer.lotusId, lotusId))

        if (!existingVolunteer) {
          throw new Error('义工不存在')
        }

        if (existingVolunteer.volunteerStatus !== 'applicant') {
          throw new Error('该义工不是待审批状态')
        }

        // 更新状态
        const newStatus = action === 'approve' ? 'registered' : 'inactive'
        const reviewNotes = notes
          ? `${action === 'approve' ? '通过' : '拒绝'}: ${notes}`
          : action === 'approve'
          ? '审批通过'
          : '审批拒绝'

        await tx
          .update(volunteer)
          .set({
            volunteerStatus: newStatus,
            reviewer: user.account,
            notes: reviewNotes,
            updatedAt: new Date(),
          })
          .where(eq(volunteer.lotusId, lotusId))

        return {
          success: true,
          message: `审批${action === 'approve' ? '通过' : '拒绝'}成功`,
          data: {
            lotusId,
            status: newStatus,
            reviewer: user.account,
          },
        }
      })
    },
    {
      params: t.Object({
        lotusId: t.String(),
      }),
      body: ApprovalRequestSchema,
      detail: {
        tags: ['义工审批'],
        summary: '审批单个义工',
        description: '批准或拒绝义工申请',
      },
    },
  )

  /**
   * 批量审批
   */
  .post(
    '/batch',
    async ({ body, user }) => {
      const { lotusIds, action, notes } = body

      if (lotusIds.length === 0) {
        throw new Error('请选择要审批的义工')
      }

      return db.transaction(async tx => {
        // 查找所有义工
        const volunteers = await tx
          .select()
          .from(volunteer)
          .where(
            and(
              or(...lotusIds.map(id => eq(volunteer.lotusId, id))),
              eq(volunteer.volunteerStatus, 'applicant'),
            ),
          )

        if (volunteers.length === 0) {
          throw new Error('没有找到待审批的义工')
        }

        if (volunteers.length !== lotusIds.length) {
          throw new Error('部分义工不存在或不是待审批状态')
        }

        // 批量更新
        const newStatus = action === 'approve' ? 'registered' : 'inactive'
        const reviewNotes = notes
          ? `${action === 'approve' ? '批量通过' : '批量拒绝'}: ${notes}`
          : action === 'approve'
          ? '批量审批通过'
          : '批量审批拒绝'

        for (const vol of volunteers) {
          await tx
            .update(volunteer)
            .set({
              volunteerStatus: newStatus,
              reviewer: user.account,
              notes: reviewNotes,
              updatedAt: new Date(),
            })
            .where(eq(volunteer.lotusId, vol.lotusId))
        }

        return {
          success: true,
          message: `批量审批${action === 'approve' ? '通过' : '拒绝'}成功`,
          data: {
            count: volunteers.length,
            status: newStatus,
            reviewer: user.account,
          },
        }
      })
    },
    {
      body: BatchApprovalSchema,
      detail: {
        tags: ['义工审批'],
        summary: '批量审批义工',
        description: '批量批准或拒绝义工申请',
      },
    },
  )

  /**
   * 获取审批历史
   */
  .get(
    '/history',
    async ({ query }) => {
      const { page = 1, limit = 20 } = query
      const offset = (page - 1) * limit

      const [volunteers, totalResult] = await Promise.all([
        db
          .select()
          .from(volunteer)
          .where(
            or(
              eq(volunteer.volunteerStatus, 'registered'),
              eq(volunteer.volunteerStatus, 'inactive'),
            ),
          )
          .limit(limit)
          .offset(offset)
          .orderBy(volunteer.updatedAt),
        db
          .select({ count: count() })
          .from(volunteer)
          .where(
            or(
              eq(volunteer.volunteerStatus, 'registered'),
              eq(volunteer.volunteerStatus, 'inactive'),
            ),
          ),
      ])

      const total = Number(totalResult[0]?.count) || 0

      return {
        success: true,
        data: volunteers,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric({ minimum: 1 })),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
      }),
      detail: {
        tags: ['义工审批'],
        summary: '获取审批历史',
        description: '获取已审批的义工记录',
      },
    },
  )
