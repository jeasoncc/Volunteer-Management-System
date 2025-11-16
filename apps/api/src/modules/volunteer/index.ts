import { Elysia } from 'elysia'
import { VolunteerConfig } from './config'
import { VolunteerService } from './service'
import { jwtPlugin } from '../../lib/middleware/auth'
import { errorHandler } from '../../lib/middleware/error-handler'

/**
 * 义工管理模块
 *
 * 设计原则：
 * 1. 使用 lotusId 而不是数据库 ID
 * 2. 所有接口需要登录
 * 3. 提供完整的 CRUD 功能
 */
export const volunteerModule = new Elysia({ prefix: '/volunteer' })
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
  })

  // ==================== 核心 CRUD（基于 lotusId）====================

  /**
   * 创建义工
   * - 账号默认为手机号
   * - 密码默认为 123456
   */
  .post(
    '/',
    async ({ body }) => {
      return await VolunteerService.create(body)
    },
    VolunteerConfig.create,
  )

  /**
   * 获取义工列表（分页）
   */
  .get(
    '/',
    async ({ query }) => {
      return await VolunteerService.getList(query)
    },
    VolunteerConfig.getList,
  )

  /**
   * 根据 lotusId 获取详情
   */
  .get(
    '/:lotusId',
    async ({ params }: any) => {
      return await VolunteerService.getByLotusId(params.lotusId)
    },
    VolunteerConfig.getByLotusId,
  )

  /**
   * 根据 lotusId 更新信息
   */
  .put(
    '/:lotusId',
    async ({ params, body }: any) => {
      return await VolunteerService.updateByLotusId(params.lotusId, body)
    },
    VolunteerConfig.updateByLotusId,
  )

  /**
   * 根据 lotusId 删除
   */
  .delete(
    '/:lotusId',
    async ({ params }: any) => {
      return await VolunteerService.deleteByLotusId(params.lotusId)
    },
    VolunteerConfig.deleteByLotusId,
  )

  // ==================== 批量操作 ====================

  /**
   * 批量导入义工
   */
  .post(
    '/batch/import',
    async ({ body }) => {
      return await VolunteerService.batchImport(body)
    },
    VolunteerConfig.batchImport,
  )

  /**
   * 批量删除义工
   */
  .post(
    '/batch/delete',
    async ({ body }: any) => {
      return await VolunteerService.batchDelete(body.lotusIds)
    },
    VolunteerConfig.batchDelete,
  )

  // ==================== 查询功能 ====================

  /**
   * 搜索义工
   */
  .get(
    '/search',
    async ({ query }) => {
      return await VolunteerService.search(query.keyword, query.limit)
    },
    VolunteerConfig.search,
  )

  /**
   * 修改密码
   */
  .post(
    '/:lotusId/change-password',
    async ({ params, body }: any) => {
      return await VolunteerService.changePassword(
        params.lotusId,
        body.oldPassword,
        body.newPassword,
      )
    },
    VolunteerConfig.changePassword,
  )

  /**
   * 变更状态
   */
  .patch(
    '/:lotusId/status',
    async ({ params, body }: any) => {
      return await VolunteerService.changeStatusByLotusId(params.lotusId, body.status)
    },
    VolunteerConfig.changeStatus,
  )
