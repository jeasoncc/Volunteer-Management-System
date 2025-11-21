import { Elysia, t } from 'elysia'
import { chantingService } from './service'
import { authMiddleware } from '../auth/middleware'

export const chantingModule = new Elysia({ prefix: '/chanting' })
  .use(authMiddleware)
  .get(
    '/',
    async ({ query }) => {
      try {
        const result = await chantingService.getList(query)
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取排班列表失败',
        }
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        location: t.Optional(t.String()),
        status: t.Optional(t.String()),
        deceasedId: t.Optional(t.Numeric()),
      }),
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      try {
        const result = await chantingService.getById(Number(params.id))
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取排班详情失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .post(
    '/',
    async ({ body, user }) => {
      try {
        const result = await chantingService.create(body, user?.id)
        return {
          success: true,
          data: result,
          message: '创建成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '创建排班失败',
        }
      }
    },
    {
      body: t.Object({
        location: t.Union([t.Literal('fuhuiyuan'), t.Literal('waiqin')]),
        date: t.String(),
        timeSlot: t.String(),
        bellVolunteerId: t.Optional(t.Number()),
        teachingVolunteerId: t.Optional(t.Number()),
        backupVolunteerId: t.Optional(t.Number()),
        deceasedId: t.Number(),
        status: t.Optional(
          t.Union([
            t.Literal('pending'),
            t.Literal('confirmed'),
            t.Literal('in_progress'),
            t.Literal('completed'),
            t.Literal('cancelled'),
          ]),
        ),
        expectedParticipants: t.Optional(t.Number()),
        specialRequirements: t.Optional(t.String()),
      }),
    },
  )
  .put(
    '/:id',
    async ({ params, body }) => {
      try {
        const result = await chantingService.update(Number(params.id), body)
        return {
          success: true,
          data: result,
          message: '更新成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '更新排班失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Partial(
        t.Object({
          location: t.Union([t.Literal('fuhuiyuan'), t.Literal('waiqin')]),
          date: t.String(),
          timeSlot: t.String(),
          bellVolunteerId: t.Number(),
          teachingVolunteerId: t.Number(),
          backupVolunteerId: t.Number(),
          deceasedId: t.Number(),
          status: t.Union([
            t.Literal('pending'),
            t.Literal('confirmed'),
            t.Literal('in_progress'),
            t.Literal('completed'),
            t.Literal('cancelled'),
          ]),
          expectedParticipants: t.Number(),
          specialRequirements: t.String(),
        }),
      ),
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      try {
        await chantingService.delete(Number(params.id))
        return {
          success: true,
          message: '删除成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '删除排班失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .patch(
    '/:id/status',
    async ({ params, body }) => {
      try {
        const result = await chantingService.updateStatus(Number(params.id), body.status)
        return {
          success: true,
          data: result,
          message: '状态更新成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '更新状态失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal('pending'),
          t.Literal('confirmed'),
          t.Literal('in_progress'),
          t.Literal('completed'),
          t.Literal('cancelled'),
        ]),
      }),
    },
  )
  .patch(
    '/:id/actual-time',
    async ({ params, body }) => {
      try {
        const result = await chantingService.recordActualTime(Number(params.id), body)
        return {
          success: true,
          data: result,
          message: '记录成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '记录失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        actualStartTime: t.Optional(t.String()),
        actualEndTime: t.Optional(t.String()),
        feedback: t.Optional(t.String()),
      }),
    },
  )
  .get(
    '/calendar',
    async ({ query }) => {
      try {
        const result = await chantingService.getCalendar(query.year, query.month)
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取日历数据失败',
        }
      }
    },
    {
      query: t.Object({
        year: t.Numeric(),
        month: t.Numeric(),
      }),
    },
  )
  .get('/stats', async () => {
    try {
      const result = await chantingService.getStats()
      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '获取统计信息失败',
      }
    }
  })
