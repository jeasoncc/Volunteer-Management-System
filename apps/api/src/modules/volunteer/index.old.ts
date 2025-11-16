import { Elysia } from 'elysia'
import { VolunteerConfig } from './config'
import { VolunteerService } from './service'
import { authMiddleware } from '../../lib/middleware/auth'
import { errorHandler } from '../../lib/middleware/error-handler'

export const volunteerModule = new Elysia({ prefix: '/volunteer' })
  // 使用统一的错误处理
  .use(errorHandler)
  // 使用统一的认证中间件 - 所有 volunteer 接口都需要登录
  .use(authMiddleware)

  // 创建义工
  .post(
    '/',
    async ({ body }) => {
      return await VolunteerService.create(body)
    },
    VolunteerConfig.createVolunteer,
  )

  // 获取义工列表
  .get(
    '/',
    async ({ query }) => {
      return await VolunteerService.getList(query)
    },
    VolunteerConfig.getVolunteerList,
  )

  // 根据ID获取详情
  .get(
    '/:id',
    async ({ params }) => {
      return await VolunteerService.getById(Number(params.id))
    },
    VolunteerConfig.getVolunteerById,
  )

  // 更新义工信息
  .put(
    '/:id',
    async ({ params, body }) => {
      return await VolunteerService.update(Number(params.id), body)
    },
    VolunteerConfig.updateVolunteerById,
  )

  // 删除义工
  .delete(
    '/:id',
    async ({ params }) => {
      return await VolunteerService.delete(Number(params.id))
    },
    VolunteerConfig.deleteVolunteer,
  )

  // 批量导入义工
  .post(
    '/batch-import',
    async ({ body }) => {
      return await VolunteerService.batchImport(body)
    },
    VolunteerConfig.batchImportVolunteers,
  )

  // 变更义工状态
  .patch(
    '/:id/status',
    async ({ params, body }) => {
      return await VolunteerService.changeStatus(Number(params.id), body.status)
    },
    VolunteerConfig.changeVolunteerStatus,
  )

  // 搜索义工
  .get(
    '/search',
    async ({ query }) => {
      return await VolunteerService.search(query.keyword, query.limit)
    },
    VolunteerConfig.searchVolunteer,
  )

  // 义工签到
  .post(
    '/:id/check-in',
    async ({ params }) => {
      return await VolunteerService.checkIn(Number(params.id))
    },
    VolunteerConfig.checkInVolunteer,
  )

  // 义工签退
  .post(
    '/:id/check-out',
    async ({ params }) => {
      return await VolunteerService.checkOut(Number(params.id))
    },
    VolunteerConfig.checkOutVolunteer,
  )

  // ==================== 基于 lotusId 的 CRUD（推荐使用）====================

  // 根据 lotusId 获取详情
  .get(
    '/lotus/:lotusId',
    async ({ params }: any) => {
      return await VolunteerService.getByLotusId(params.lotusId)
    },
    VolunteerConfig.getVolunteerByLotusId,
  )

  // 根据 lotusId 更新信息
  .put(
    '/lotus/:lotusId',
    async ({ params, body }: any) => {
      return await VolunteerService.updateByLotusId(params.lotusId, body)
    },
    VolunteerConfig.updateVolunteerByLotusId,
  )

  // 根据 lotusId 删除
  .delete(
    '/lotus/:lotusId',
    async ({ params }: any) => {
      return await VolunteerService.deleteByLotusId(params.lotusId)
    },
    VolunteerConfig.deleteVolunteerByLotusId,
  )

  // 批量删除（根据 lotusId 数组）
  .post(
    '/batch-delete',
    async ({ body }: any) => {
      return await VolunteerService.batchDelete(body.lotusIds)
    },
    VolunteerConfig.batchDeleteVolunteers,
  )
