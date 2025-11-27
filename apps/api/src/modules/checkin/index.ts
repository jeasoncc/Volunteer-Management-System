import { Elysia } from 'elysia'
import { CheckInService } from './service'
import { CheckInSummaryService } from './summary.service'
import { CheckInRecordService } from './record.service'
import { CheckInExportService } from './export.service'
import { CheckInConfig } from './config'
import { DuplicateCheckInError } from './errors'
import { errorHandler } from '../../lib/middleware/error-handler'

/**
 * 签到模块
 * 处理考勤设备的签到记录、陌生人记录等
 */
export const checkinModule = new Elysia({ prefix: '/api/v1' })
  // 使用统一的错误处理
  .use(errorHandler)
  // 特殊处理：重复签到返回成功
  .onError(({ error, set }) => {
    if (error instanceof DuplicateCheckInError) {
      set.status = 200
      return {
        success: true,
        Result: 0,
        Msg: '',
        data: '',
        message: '记录已存在',
      }
    }
  })

  // 陌生人记录
  .post(
    '/stranger',
    async ({ body }) => {
      const result = await CheckInService.processStrangerRecord(body.logs[0])
      return result
    },
    CheckInConfig.strangerRecord,
  )

  // 陌生人记录列表（后台查询）
  .get(
    '/stranger-records',
    async ({ query }) => {
      const { startDate, endDate, deviceSn, page = 1, pageSize = 50 } = query as any

      const filters: any = {
        page:     parseInt(page as any, 10) || 1,
        pageSize: parseInt(pageSize as any, 10) || 50,
      }

      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
      if (deviceSn) filters.deviceSn = deviceSn

      const result = await CheckInService.getStrangerList(filters)
      return result
    },
  )

  // 人脸识别签到
  .post(
    '/record/face',
    async ({ body }) => {
      const result = await CheckInService.processFaceCheckIn(body.logs[0], body)
      return result
    },
    CheckInConfig.faceCheckIn,
  )

  // ==================== 考勤汇总和报表接口 ====================

  // 查询用户考勤汇总
  .get(
    '/summary/user',
    async ({ query }) => {
      const { lotusId, startDate, endDate } = query as any
      
      if (!lotusId || !startDate || !endDate) {
        return {
          success: false,
          message: '缺少必要参数: lotusId, startDate, endDate',
        }
      }

      const result = await CheckInSummaryService.getUserSummary({
        lotusId,
        startDate,
        endDate,
      })
      
      return result
    },
  )

  // 生成月度考勤汇总（推荐）
  .post(
    '/summary/generate-monthly',
    async ({ body }) => {
      const { year, month, force } = body as any
      
      if (!year || !month) {
        return {
          success: false,
          message: '缺少必要参数: year, month',
        }
      }

      const result = await CheckInSummaryService.generateMonthlySummary({
        year: parseInt(year),
        month: parseInt(month),
        force: force || false,
      })
      
      return result
    },
  )

  // 生成某天的考勤汇总（保留用于特殊情况）
  .post(
    '/summary/daily',
    async ({ body }) => {
      const { date } = body as any
      
      if (!date) {
        return {
          success: false,
          message: '缺少必要参数: date (YYYY-MM-DD)',
        }
      }

      const result = await CheckInSummaryService.generateDailySummary(date)
      return result
    },
  )

  // 获取月度考勤报表
  .get(
    '/report/monthly',
    async ({ query }) => {
      const { year, month } = query as any
      
      if (!year || !month) {
        return {
          success: false,
          message: '缺少必要参数: year, month',
        }
      }

      const result = await CheckInSummaryService.getMonthlyReport({
        year: parseInt(year),
        month: parseInt(month),
      })
      
      return result
    },
  )

  // ==================== 汇总记录 CRUD 接口 ====================

  // 查询汇总记录列表
  .get(
    '/summary/list',
    async ({ query }) => {
      const result = await CheckInSummaryService.list(query as any)
      return result
    },
  )

  // 根据 ID 查询汇总记录
  .get(
    '/summary/:id',
    async ({ params }) => {
      const id = parseInt(params.id)
      const result = await CheckInSummaryService.getById(id)
      return result
    },
  )

  // 手动创建汇总记录
  .post(
    '/summary',
    async ({ body }) => {
      const result = await CheckInSummaryService.create(body as any)
      return result
    },
  )

  // 更新汇总记录
  .put(
    '/summary/:id',
    async ({ params, body }) => {
      const id = parseInt(params.id)
      const result = await CheckInSummaryService.update(id, body as any)
      return result
    },
  )

  // 删除汇总记录
  .delete(
    '/summary/:id',
    async ({ params }) => {
      const id = parseInt(params.id)
      const result = await CheckInSummaryService.delete(id)
      return result
    },
  )

  // 批量删除汇总记录
  .post(
    '/summary/batch-delete',
    async ({ body }) => {
      const { ids } = body as any
      
      if (!ids || !Array.isArray(ids)) {
        return {
          success: false,
          message: '缺少必要参数: ids (数组)',
        }
      }

      const result = await CheckInSummaryService.batchDelete(ids)
      return result
    },
  )

  // 重新计算汇总
  .post(
    '/summary/recalculate',
    async ({ body }) => {
      const { userId, date } = body as any
      
      if (!userId || !date) {
        return {
          success: false,
          message: '缺少必要参数: userId, date',
        }
      }

      const result = await CheckInSummaryService.recalculate({ userId, date })
      return result
    },
  )

  // ==================== 原始打卡记录接口 ====================

  // 查询原始打卡记录列表
  .get(
    '/checkin/records',
    async ({ query }) => {
      const result = await CheckInRecordService.getList(query as any)
      return result
    },
  )

  // 根据 ID 查询单条打卡记录
  .get(
    '/checkin/records/:id',
    async ({ params }) => {
      const id = parseInt(params.id)
      const result = await CheckInRecordService.getById(id)
      return result
    },
  )

  // 查询用户的打卡记录（带统计）
  .get(
    '/checkin/records/user/:lotusId',
    async ({ params, query }) => {
      const { lotusId } = params
      const { startDate, endDate } = query as any
      
      if (!startDate || !endDate) {
        return {
          success: false,
          message: '缺少必要参数: startDate, endDate',
        }
      }

      const result = await CheckInRecordService.getUserRecords({
        lotusId,
        startDate,
        endDate,
      })
      return result
    },
  )

  // 创建打卡记录
  .post(
    '/checkin/records',
    async ({ body }) => {
      const result = await CheckInRecordService.create(body as any)
      return result
    },
  )

  // 更新打卡记录
  .put(
    '/checkin/records/:id',
    async ({ params, body }) => {
      const id = parseInt(params.id)
      const result = await CheckInRecordService.update(id, body as any)
      return result
    },
  )

  // 删除打卡记录
  .delete(
    '/checkin/records/:id',
    async ({ params }) => {
      const id = parseInt(params.id)
      const result = await CheckInRecordService.delete(id)
      return result
    },
  )

  // 批量删除打卡记录
  .post(
    '/checkin/records/batch-delete',
    async ({ body }) => {
      const { ids } = body as any
      
      if (!ids || !Array.isArray(ids)) {
        return {
          success: false,
          message: '缺少必要参数: ids (数组)',
        }
      }

      const result = await CheckInRecordService.batchDelete(ids)
      return result
    },
  )

  // ==================== 导出接口 ====================

  // 导出志愿者服务时间统计表（Excel）
  .get(
    '/export/volunteer-service',
    async ({ query, set }) => {
      const { startDate, endDate, lotusIds, activityName } = query as any
      
      if (!startDate || !endDate) {
        return {
          success: false,
          message: '缺少必要参数: startDate, endDate',
        }
      }

      try {
        const result = await CheckInExportService.exportToExcel({
          startDate,
          endDate,
          lotusIds: lotusIds ? lotusIds.split(',') : undefined,
          activityName,
        })
        
        // 生成 Excel 文件
        const buffer = await result.workbook.xlsx.writeBuffer()
        
        // 设置响应头
        set.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        set.headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(result.filename)}"`
        
        return new Response(buffer)
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : '导出失败',
        }
      }
    },
  )
