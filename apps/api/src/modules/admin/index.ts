import { Elysia } from 'elysia'
import { AdminConfig } from './config'
import { AdminService } from './service'
import { authMiddleware } from '../../lib/middleware/auth'
import { errorHandler } from '../../lib/middleware/error-handler'

export const adminModule = new Elysia({ prefix: '/api/admin' })
  // 使用统一的错误处理
  .use(errorHandler)
  // 使用统一的认证中间件 - 所有 admin 接口都需要登录
  .use(authMiddleware)

  // 创建管理员
  .post(
    '/',
    async ({ body }) => {
      return await AdminService.create(body)
    },
    AdminConfig.createAdmin,
  )

  // 获取管理员列表
  .get(
    '/',
    async ({ query }) => {
      return await AdminService.getList(query)
    },
    AdminConfig.getAdminList,
  )

  // 根据ID获取详情
  .get(
    '/:id',
    async ({ params }) => {
      return await AdminService.getById(Number(params.id))
    },
    AdminConfig.getAdminById,
  )

  // 更新管理员信息
  .put(
    '/:id',
    async ({ params, body }) => {
      return await AdminService.update(Number(params.id), body)
    },
    AdminConfig.updateAdminById,
  )

  // 删除管理员
  .delete(
    '/:id',
    async ({ params, query }) => {
      return await AdminService.delete(Number(params.id), {
        cascade: query.cascade ?? false,
      })
    },
    AdminConfig.deleteAdmin,
  )

  // 根据LotusID查询
  .get(
    '/search/lotus/:lotusId',
    async ({ params, query }) => {
      return await AdminService.findByLotusId(params.lotusId, query)
    },
    AdminConfig.getAdminByLotusId,
  )

  // 根据LotusID更新
  .patch(
    '/by-lotus',
    async ({ body }) => {
      return await AdminService.updateByLotusId(body)
    },
    AdminConfig.updateAdminByLotusId,
  )

  // 升级志愿者
  .post(
    '/promote',
    async ({ body }) => {
      return await AdminService.promote(body)
    },
    AdminConfig.promoteVolunteer,
  )

  // 修改权限
  .patch(
    '/permissions',
    async ({ body }) => {
      return await AdminService.updatePermissions(body)
    },
    AdminConfig.updatePermissions,
  )

  // 搜索管理员
  .get(
    '/search',
    async ({ query }) => {
      return await AdminService.search(query.keyword, query.limit)
    },
    AdminConfig.searchAdmin,
  )
