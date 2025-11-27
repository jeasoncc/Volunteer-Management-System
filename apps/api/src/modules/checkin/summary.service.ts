import { db } from '../../db'
import { volunteer, volunteerCheckIn, volunteerCheckInSummary } from '../../db/schema'
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm'
import dayjs from 'dayjs'
import { createLogger } from '../../log'

const logger = createLogger()

/**
 * 考勤汇总服务
 * 负责计算每日工时和生成考勤汇总
 */
export class CheckInSummaryService {
  /**
   * 计算单个用户某天的工时
   * 
   * 规则：
   * 1. 只打一次卡 → 默认 3 小时
   * 2. 打两次卡 → 计算实际时长（最后一次 - 第一次）
   * 3. 打多次卡 → 计算实际时长（最后一次 - 第一次）
   * 4. 跨夜班 → 特殊处理（23:00 打卡，次日 01:00 打卡 = 2小时）
   */
  static async calculateDailyWorkHours(params: {
    userId: number
    lotusId: string
    date: string // YYYY-MM-DD
  }) {
    const { userId, lotusId, date } = params

    // 1. 查询当天所有打卡记录
    logger.debug(`查询考勤记录: lotusId=${lotusId}, date=${date}`)
    
    const records = await db
      .select()
      .from(volunteerCheckIn)
      .where(
        and(
          eq(volunteerCheckIn.lotusId, lotusId),
          sql`DATE(${volunteerCheckIn.date}) = ${date}`
        )
      )
      .orderBy(volunteerCheckIn.checkIn)
    
    logger.debug(`找到 ${records.length} 条记录`)

    if (records.length === 0) {
      return {
        workHours: 0,
        status: 'absent',
        calculationRule: 'no_record',
        firstCheckIn: null,
        lastCheckIn: null,
        checkinCount: 0,
      }
    }

    const firstRecord = records[0]
    const lastRecord = records[records.length - 1]
    const checkinCount = records.length

    let workHours = 0
    let calculationRule = ''
    let isNightShift = false

    // 2. 只打一次卡
    if (checkinCount === 1) {
      workHours = 1 // 默认 1 小时
      calculationRule = 'single_card_1h'
    } 
    // 3. 打两次及以上
    else {
      const firstTime = dayjs(`${date} ${firstRecord.checkIn}`)
      const lastTime = dayjs(`${date} ${lastRecord.checkIn}`)

      // 检查是否跨夜
      if (lastTime.isBefore(firstTime)) {
        // 跨夜情况：最后打卡时间 < 第一次打卡时间
        // 说明最后一次是第二天凌晨
        const nextDayLastTime = lastTime.add(1, 'day')
        workHours = nextDayLastTime.diff(firstTime, 'hour', true)
        isNightShift = true
        calculationRule = 'night_shift_actual'
      } else {
        // 正常情况：计算时间差
        workHours = lastTime.diff(firstTime, 'hour', true)
        calculationRule = 'double_card_actual'
      }

      // 限制最大工时为 12 小时（防止异常数据）
      if (workHours > 12) {
        logger.warn(`⚠️  异常工时: ${lotusId} 在 ${date} 的工时为 ${workHours.toFixed(2)} 小时，已限制为 12 小时`)
        workHours = 12
        calculationRule += '_capped'
      }

      // 保留两位小数
      workHours = Math.round(workHours * 100) / 100
    }

    // 4. 判断考勤状态（简化版，可以后续扩展）
    let status = 'present'
    if (checkinCount === 0) {
      status = 'absent'
    }

    return {
      workHours,
      status,
      calculationRule,
      firstCheckIn: firstRecord.checkIn,
      lastCheckIn: lastRecord.checkIn,
      checkinCount,
      isNightShift,
      deviceSn: firstRecord.deviceSn || null,
      bodyTemperature: firstRecord.bodyTemperature || null,
      confidence: firstRecord.confidence || null,
    }
  }

  /**
   * 生成月度考勤汇总（推荐使用）
   * 每月初处理上月数据，性能更好
   */
  static async generateMonthlySummary(params: {
    year: number
    month: number
    force?: boolean  // 是否强制重新生成
  }) {
    const { year, month, force = false } = params
    
    logger.info(`📊 开始生成 ${year}-${month} 的月度考勤汇总...`)
    
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
    
    logger.info(`📅 处理范围: ${startDate} 至 ${endDate}`)
    
    // 如果强制重新生成，先删除该月的汇总数据
    if (force) {
      await db
        .delete(volunteerCheckInSummary)
        .where(
          and(
            gte(volunteerCheckInSummary.date, new Date(startDate)),
            lte(volunteerCheckInSummary.date, new Date(endDate))
          )
        )
      logger.info(`🗑️  已删除该月的现有汇总数据`)
    }
    
    // 查询该月所有有打卡记录的用户
    const users = await db
      .select({
        userId: volunteerCheckIn.userId,
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(
        and(
          gte(volunteerCheckIn.date, new Date(startDate)),
          lte(volunteerCheckIn.date, new Date(endDate))
        )
      )
      .groupBy(volunteerCheckIn.userId, volunteerCheckIn.lotusId, volunteerCheckIn.name)
    
    logger.info(`👥 找到 ${users.length} 个用户有打卡记录`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const summaries = []
    
    // 为每个用户生成该月的所有日期汇总
    for (const user of users) {
      // 查询该用户该月的所有打卡记录
      const records = await db
        .select()
        .from(volunteerCheckIn)
        .where(
          and(
            eq(volunteerCheckIn.userId, user.userId),
            gte(volunteerCheckIn.date, new Date(startDate)),
            lte(volunteerCheckIn.date, new Date(endDate))
          )
        )
        .orderBy(volunteerCheckIn.date, volunteerCheckIn.checkIn)
      
      // 按日期分组
      const recordsByDate = records.reduce((acc, record) => {
        const dateKey = dayjs(record.date).format('YYYY-MM-DD')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(record)
        return acc
      }, {} as Record<string, typeof records>)
      
      // 为每一天生成汇总
      for (const [dateKey, dayRecords] of Object.entries(recordsByDate)) {
        try {
          // 检查是否已存在
          if (!force) {
            const existing = await db
              .select()
              .from(volunteerCheckInSummary)
              .where(
                and(
                  eq(volunteerCheckInSummary.userId, user.userId),
                  sql`DATE(${volunteerCheckInSummary.date}) = ${dateKey}`
                )
              )
              .limit(1)
            
            if (existing.length > 0) {
              skipCount++
              continue
            }
          }
          
          const summary = await this.calculateDailyWorkHours({
            userId: user.userId,
            lotusId: user.lotusId,
            date: dateKey,
          })
          
          if (summary.checkinCount === 0) continue
          
          summaries.push({
            userId: user.userId,
            lotusId: user.lotusId,
            name: user.name,
            date: new Date(dateKey),
            firstCheckinTime: summary.firstCheckIn!,
            lastCheckinTime: summary.lastCheckIn!,
            checkinCount: summary.checkinCount,
            workHours: summary.workHours,
            calculationRule: summary.calculationRule,
            status: summary.status as any,
            isNightShift: summary.isNightShift,
            deviceSn: summary.deviceSn,
            bodyTemperature: summary.bodyTemperature,
            confidence: summary.confidence,
          })
          
          successCount++
          
          if (successCount % 100 === 0) {
            logger.info(`✅ 已处理 ${successCount} 条记录...`)
          }
        } catch (error) {
          errorCount++
          logger.error(`❌ 处理失败: ${user.name}(${user.lotusId}) - ${dateKey}`, error)
        }
      }
    }
    
    // 批量插入汇总数据
    if (summaries.length > 0) {
      const batchSize = 100
      for (let i = 0; i < summaries.length; i += batchSize) {
        const batch = summaries.slice(i, i + batchSize)
        await db.insert(volunteerCheckInSummary).values(batch)
      }
    }
    
    const totalHours = summaries.reduce((sum, s) => sum + s.workHours, 0)
    
    logger.info(`\n📊 月度汇总完成！`)
    logger.info(`✅ 成功: ${successCount} 条`)
    logger.info(`⏭️  跳过: ${skipCount} 条（已存在）`)
    logger.info(`❌ 失败: ${errorCount} 条`)
    logger.info(`⏱️  总工时: ${totalHours.toFixed(2)} 小时`)
    
    return {
      success: true,
      message: '月度汇总完成',
      data: {
        year,
        month,
        startDate,
        endDate,
        totalRecords: successCount,
        skippedRecords: skipCount,
        failedRecords: errorCount,
        totalHours: Math.round(totalHours * 100) / 100,
        processedUsers: users.length,
      },
    }
  }

  /**
   * 生成某天的考勤汇总（保留用于特殊情况）
   * 推荐使用 generateMonthlySummary 代替
   */
  static async generateDailySummary(date: string) {
    logger.info(`📊 开始生成 ${date} 的考勤汇总...`)

    // 1. 查询当天有打卡记录的所有用户
    const checkinUsers = await db
      .select({
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(eq(volunteerCheckIn.date, new Date(date)))
      .groupBy(volunteerCheckIn.lotusId, volunteerCheckIn.name)

    logger.info(`📝 找到 ${checkinUsers.length} 个用户有打卡记录`)

    const summaries = []

    // 2. 为每个用户计算工时
    for (const user of checkinUsers) {
      // 获取用户ID
      const [volunteerRecord] = await db
        .select({ id: volunteer.id })
        .from(volunteer)
        .where(eq(volunteer.lotusId, user.lotusId))
        .limit(1)

      if (!volunteerRecord) {
        logger.warn(`⚠️  用户不存在: ${user.lotusId}`)
        continue
      }

      const summary = await this.calculateDailyWorkHours({
        userId: volunteerRecord.id,
        lotusId: user.lotusId,
        date,
      })

      summaries.push({
        userId: volunteerRecord.id,
        lotusId: user.lotusId,
        name: user.name,
        date: new Date(date),
        firstCheckinTime: summary.firstCheckIn,
        lastCheckinTime: summary.lastCheckIn,
        checkinCount: summary.checkinCount,
        workHours: summary.workHours,
        calculationRule: summary.calculationRule,
        status: summary.status,
        isNightShift: summary.isNightShift,
        deviceSn: summary.deviceSn,
        bodyTemperature: summary.bodyTemperature,
        confidence: summary.confidence,
      })
    }

    logger.info(`✅ 生成了 ${summaries.length} 条考勤汇总`)

    return {
      success: true,
      date,
      count: summaries.length,
      summaries,
    }
  }

  /**
   * 查询用户的考勤汇总
   */
  static async getUserSummary(params: {
    lotusId: string
    startDate: string
    endDate: string
  }) {
    const { lotusId, startDate, endDate } = params

    // 实时计算每天的工时
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    const days = end.diff(start, 'day') + 1

    const summaries = []

    for (let i = 0; i < days; i++) {
      const currentDate = start.add(i, 'day').format('YYYY-MM-DD')
      
      const [volunteerRecord] = await db
        .select({ id: volunteer.id })
        .from(volunteer)
        .where(eq(volunteer.lotusId, lotusId))
        .limit(1)

      if (!volunteerRecord) {
        continue
      }

      const summary = await this.calculateDailyWorkHours({
        userId: volunteerRecord.id,
        lotusId,
        date: currentDate,
      })

      summaries.push({
        date: currentDate,
        ...summary,
      })
    }

    // 计算总计
    const totalHours = summaries.reduce((sum, s) => sum + s.workHours, 0)
    const presentDays = summaries.filter(s => s.status === 'present').length
    const absentDays = summaries.filter(s => s.status === 'absent').length

    return {
      success: true,
      lotusId,
      startDate,
      endDate,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        presentDays,
        absentDays,
        totalDays: days,
      },
      details: summaries,
    }
  }

  /**
   * 获取月度考勤报表
   */
  static async getMonthlyReport(params: {
    year: number
    month: number
  }) {
    const { year, month } = params
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

    logger.info(`📊 生成 ${year}年${month}月 考勤报表...`)

    // 查询该月所有有打卡记录的用户
    const users = await db
      .select({
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(
        and(
          gte(volunteerCheckIn.date, new Date(startDate)),
          lte(volunteerCheckIn.date, new Date(endDate))
        )
      )
      .groupBy(volunteerCheckIn.lotusId, volunteerCheckIn.name)

    const reports = []

    for (const user of users) {
      const summary = await this.getUserSummary({
        lotusId: user.lotusId,
        startDate,
        endDate,
      })

      reports.push({
        lotusId: user.lotusId,
        name: user.name,
        ...summary.summary,
      })
    }

    // 按总工时排序
    reports.sort((a, b) => b.totalHours - a.totalHours)

    return {
      success: true,
      data: {
        year,
        month,
        startDate,
        endDate,
        totalUsers: reports.length,
        volunteers: reports,  // 使用 volunteers 字段名，与前端保持一致
      },
    }
  }

  // ==================== CRUD 操作 ====================

  /**
   * 查询汇总记录列表（分页）
   */
  static async list(params: {
    lotusId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const {
      lotusId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = params

    const offset = (page - 1) * limit
    const conditions = []

    if (lotusId) {
      conditions.push(eq(volunteerCheckInSummary.lotusId, lotusId))
    }

    if (startDate) {
      conditions.push(gte(volunteerCheckInSummary.date, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(volunteerCheckInSummary.date, new Date(endDate)))
    }

    // 查询记录
    const records = await db
      .select()
      .from(volunteerCheckInSummary)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(volunteerCheckInSummary.date), desc(volunteerCheckInSummary.createdAt))
      .limit(limit)
      .offset(offset)

    // 查询总数
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(volunteerCheckInSummary)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return {
      success: true,
      data: records,
      pagination: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    }
  }

  /**
   * 根据 ID 查询单条汇总记录
   */
  static async getById(id: number) {
    const [record] = await db
      .select()
      .from(volunteerCheckInSummary)
      .where(eq(volunteerCheckInSummary.id, id))
      .limit(1)

    if (!record) {
      return {
        success: false,
        message: '记录不存在',
      }
    }

    return {
      success: true,
      data: record,
    }
  }

  /**
   * 手动创建汇总记录
   */
  static async create(data: {
    userId: number
    lotusId: string
    name: string
    date: string
    firstCheckinTime: string
    lastCheckinTime?: string
    checkinCount: number
    workHours: number
    calculationRule: string
    status?: string
    notes?: string
    adjustedBy?: string
  }) {
    try {
      // 检查是否已存在
      const existing = await db
        .select()
        .from(volunteerCheckInSummary)
        .where(
          and(
            eq(volunteerCheckInSummary.userId, data.userId),
            sql`DATE(${volunteerCheckInSummary.date}) = ${data.date}`
          )
        )
        .limit(1)

      if (existing.length > 0) {
        return {
          success: false,
          message: '该用户在该日期已有汇总记录',
        }
      }

      const [result] = await db.insert(volunteerCheckInSummary).values({
        userId: data.userId,
        lotusId: data.lotusId,
        name: data.name,
        date: new Date(data.date),
        firstCheckinTime: data.firstCheckinTime,
        lastCheckinTime: data.lastCheckinTime || data.firstCheckinTime,
        checkinCount: data.checkinCount,
        workHours: data.workHours,
        calculationRule: data.calculationRule,
        status: (data.status as any) || 'manual',
        notes: data.notes,
        isManual: true,
        adjustedBy: data.adjustedBy,
        adjustedAt: new Date(),
      })

      logger.info(`✅ 手动创建汇总记录: ${data.name}(${data.lotusId}) - ${data.date}`)

      return {
        success: true,
        message: '创建成功',
        data: {
          id: result.insertId,
        },
      }
    } catch (error) {
      logger.error('❌ 创建汇总记录失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '创建失败',
      }
    }
  }

  /**
   * 更新汇总记录
   */
  static async update(id: number, data: {
    workHours?: number
    status?: string
    notes?: string
    adjustedBy?: string
  }) {
    try {
      // 检查记录是否存在
      const [existing] = await db
        .select()
        .from(volunteerCheckInSummary)
        .where(eq(volunteerCheckInSummary.id, id))
        .limit(1)

      if (!existing) {
        return {
          success: false,
          message: '记录不存在',
        }
      }

      // 更新记录
      await db
        .update(volunteerCheckInSummary)
        .set({
          workHours: data.workHours ?? existing.workHours,
          status: (data.status as any) ?? existing.status,
          notes: data.notes ?? existing.notes,
          isManual: true,
          adjustedBy: data.adjustedBy,
          adjustedAt: new Date(),
        })
        .where(eq(volunteerCheckInSummary.id, id))

      logger.info(`✅ 更新汇总记录: ID=${id}`)

      return {
        success: true,
        message: '更新成功',
      }
    } catch (error) {
      logger.error('❌ 更新汇总记录失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新失败',
      }
    }
  }

  /**
   * 删除汇总记录
   */
  static async delete(id: number) {
    try {
      // 检查记录是否存在
      const [existing] = await db
        .select()
        .from(volunteerCheckInSummary)
        .where(eq(volunteerCheckInSummary.id, id))
        .limit(1)

      if (!existing) {
        return {
          success: false,
          message: '记录不存在',
        }
      }

      // 删除记录
      await db
        .delete(volunteerCheckInSummary)
        .where(eq(volunteerCheckInSummary.id, id))

      logger.info(`✅ 删除汇总记录: ${existing.name}(${existing.lotusId}) - ${existing.date}`)

      return {
        success: true,
        message: '删除成功',
      }
    } catch (error) {
      logger.error('❌ 删除汇总记录失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败',
      }
    }
  }

  /**
   * 批量删除汇总记录
   */
  static async batchDelete(ids: number[]) {
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      }

      for (const id of ids) {
        const result = await this.delete(id)
        if (result.success) {
          results.success++
        } else {
          results.failed++
          results.errors.push(`ID ${id}: ${result.message}`)
        }
      }

      return {
        success: true,
        message: `删除完成：成功 ${results.success} 条，失败 ${results.failed} 条`,
        data: results,
      }
    } catch (error) {
      logger.error('❌ 批量删除失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '批量删除失败',
      }
    }
  }

  /**
   * 重新计算某天的汇总数据
   */
  static async recalculate(params: {
    userId: number
    date: string
  }) {
    const { userId, date } = params

    try {
      // 删除现有汇总
      await db
        .delete(volunteerCheckInSummary)
        .where(
          and(
            eq(volunteerCheckInSummary.userId, userId),
            sql`DATE(${volunteerCheckInSummary.date}) = ${date}`
          )
        )

      // 重新计算
      const [user] = await db
        .select()
        .from(volunteer)
        .where(eq(volunteer.id, userId))
        .limit(1)

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        }
      }

      const summary = await this.calculateDailyWorkHours({
        userId,
        lotusId: user.lotusId!,
        date,
      })

      if (summary.checkinCount === 0) {
        return {
          success: true,
          message: '该日期无打卡记录',
        }
      }

      // 插入新汇总
      await db.insert(volunteerCheckInSummary).values({
        userId,
        lotusId: user.lotusId!,
        name: user.name,
        date: new Date(date),
        firstCheckinTime: summary.firstCheckIn!,
        lastCheckinTime: summary.lastCheckIn!,
        checkinCount: summary.checkinCount,
        workHours: summary.workHours,
        calculationRule: summary.calculationRule,
        status: summary.status as any,
        isNightShift: summary.isNightShift,
        deviceSn: summary.deviceSn,
        bodyTemperature: summary.bodyTemperature,
        confidence: summary.confidence,
      })

      logger.info(`✅ 重新计算汇总: ${user.name}(${user.lotusId}) - ${date}`)

      return {
        success: true,
        message: '重新计算成功',
        data: summary,
      }
    } catch (error) {
      logger.error('❌ 重新计算失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '重新计算失败',
      }
    }
  }
}
