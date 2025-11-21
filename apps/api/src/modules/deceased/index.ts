import { Elysia, t } from 'elysia'
import { deceasedService } from './service'
import { authMiddleware } from '../auth/middleware'

export const deceasedModule = new Elysia({ prefix: '/deceased' })
  .use(authMiddleware)
  .get(
    '/',
    async ({ query }) => {
      try {
        const result = await deceasedService.getList(query)
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取往生者列表失败',
        }
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        keyword: t.Optional(t.String()),
        gender: t.Optional(t.String()),
        chantPosition: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
      }),
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      try {
        const result = await deceasedService.getById(Number(params.id))
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '获取往生者详情失败',
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
    async ({ body }) => {
      try {
        const result = await deceasedService.create(body)
        return {
          success: true,
          data: result,
          message: '创建成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '创建往生者失败',
        }
      }
    },
    {
      body: t.Object({
        name: t.String(),
        title: t.String(),
        chantNumber: t.Optional(t.String()),
        chantPosition: t.Optional(
          t.Union([
            t.Literal('room-one'),
            t.Literal('room-two'),
            t.Literal('room-three'),
            t.Literal('room-four'),
            t.Literal('unknow'),
          ]),
        ),
        gender: t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')]),
        deathDate: t.String(),
        deathTime: t.Optional(t.String()),
        age: t.Optional(t.Number()),
        visitTime: t.Optional(t.String()),
        visitationTeam: t.Optional(t.Array(t.String())),
        birthDate: t.Optional(t.String()),
        religion: t.Optional(t.String()),
        isOrdained: t.Optional(t.Boolean()),
        address: t.String(),
        causeOfDeath: t.Optional(t.String()),
        familyContact: t.Optional(t.String()),
        familyRelationship: t.Optional(t.String()),
        familyPhone: t.String(),
        specialNotes: t.Optional(t.String()),
        funeralArrangements: t.Optional(t.String()),
      }),
    },
  )
  .put(
    '/:id',
    async ({ params, body }) => {
      try {
        const result = await deceasedService.update(Number(params.id), body)
        return {
          success: true,
          data: result,
          message: '更新成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '更新往生者失败',
        }
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Partial(
        t.Object({
          name: t.String(),
          title: t.String(),
          chantNumber: t.String(),
          chantPosition: t.Union([
            t.Literal('room-one'),
            t.Literal('room-two'),
            t.Literal('room-three'),
            t.Literal('room-four'),
            t.Literal('unknow'),
          ]),
          gender: t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')]),
          deathDate: t.String(),
          deathTime: t.String(),
          age: t.Number(),
          visitTime: t.String(),
          visitationTeam: t.Array(t.String()),
          birthDate: t.String(),
          religion: t.String(),
          isOrdained: t.Boolean(),
          address: t.String(),
          causeOfDeath: t.String(),
          familyContact: t.String(),
          familyRelationship: t.String(),
          familyPhone: t.String(),
          specialNotes: t.String(),
          funeralArrangements: t.String(),
        }),
      ),
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      try {
        await deceasedService.delete(Number(params.id))
        return {
          success: true,
          message: '删除成功',
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '删除往生者失败',
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
    '/batch/delete',
    async ({ body }) => {
      try {
        const result = await deceasedService.batchDelete(body.ids)
        return {
          success: true,
          data: result,
          message: `成功删除 ${result.count} 个往生者`,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '批量删除失败',
        }
      }
    },
    {
      body: t.Object({
        ids: t.Array(t.Number()),
      }),
    },
  )
  .get(
    '/search',
    async ({ query }) => {
      try {
        const result = await deceasedService.search(query.keyword, query.limit)
        return {
          success: true,
          data: result,
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || '搜索失败',
        }
      }
    },
    {
      query: t.Object({
        keyword: t.String(),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .get('/stats', async () => {
    try {
      const result = await deceasedService.getStats()
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
