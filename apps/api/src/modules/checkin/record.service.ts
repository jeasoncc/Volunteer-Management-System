import { and, between, desc, eq, like, or, sql } from 'drizzle-orm'
import { db } from '../../db'
import { volunteer, volunteerCheckIn } from '../../db/schema'
import { logger } from '../../lib/logger'

/**
 * 原始打卡记录服务
 * 处理 volunteer_checkin 表的 CRUD 操作
 */
export class CheckInRecordService {
  /**
   * 查询原始打卡记录列表
   */
  static async getList(params: {
    page?: number
    pageSize?: number
    lotusId?: string
    startDate?: string
    endDate?: string
    status?: string
    recordType?: string
  }) {
    // ✅ 修复：将字符串参数转换为数字并验证
    const page = parseInt(params.page as any) || 1
    const pageSize = parseInt(params.pageSize as any) || 20
    
    // 🔒 验证：确保参数有效
    if (isNaN(page) || page < 1) {
      throw new Error('无效的页码参数')
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 1000) {
      throw new Error('无效的每页数量参数（范围: 1-1000）')
    }
    
    const { lotusId, startDate, endDate, status, recordType } = params

    const offset = (page - 1) * pageSize

    // 构建查询条件
    const conditions: any[] = []

    // 日期筛选 - 需要导入 gte 和 lte
    if (startDate && endDate) {
      conditions.push(sql`${volunteerCheckIn.date} >= ${startDate}`)
      conditions.push(sql`${volunteerCheckIn.date} <= ${endDate}`)
    } else if (startDate) {
      conditions.push(sql`${volunteerCheckIn.date} >= ${startDate}`)
    } else if (endDate) {
      conditions.push(sql`${volunteerCheckIn.date} <= ${endDate}`)
    }

    if (status) {
      conditions.push(eq(volunteerCheckIn.status, status as any))
    }

    if (recordType) {
      conditions.push(eq(volunteerCheckIn.recordType, recordType as any))
    }

    // volunteer_checkin 表已经包含 lotusId 和 name 字段，无需 JOIN
    if (lotusId) {
      conditions.push(eq(volunteerCheckIn.lotusId, lotusId))
    }

    // 先获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(volunteerCheckIn)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const totalCount = Number(count)
    const totalPages = Math.ceil(totalCount / pageSize)

    // 按照 Drizzle 文档的标准方式进行分页
    const records = await db
      .select({
        id: volunteerCheckIn.id,
        userId: volunteerCheckIn.userId,
        date: volunteerCheckIn.date,
        checkIn: volunteerCheckIn.checkIn,
        status: volunteerCheckIn.status,
        location: volunteerCheckIn.location,
        notes: volunteerCheckIn.notes,
        originTime: volunteerCheckIn.originTime,
        recordType: volunteerCheckIn.recordType,
        createdAt: volunteerCheckIn.createdAt,
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(volunteerCheckIn.date), desc(volunteerCheckIn.checkIn))
      .limit(pageSize)
      .offset(offset)

    return {
      success: true,
      data: {
        records,
        total: totalCount,
        page,
        pageSize,
        totalPages,
      },
    }
  }

  /**
   * 根据 ID 查询单条记录
   */
  static async getById(id: number) {
    const [record] = await db
      .select({
        id: volunteerCheckIn.id,
        userId: volunteerCheckIn.userId,
        date: volunteerCheckIn.date,
        checkIn: volunteerCheckIn.checkIn,
        status: volunteerCheckIn.status,
        location: volunteerCheckIn.location,
        notes: volunteerCheckIn.notes,
        originTime: volunteerCheckIn.originTime,
        recordType: volunteerCheckIn.recordType,
        createdAt: volunteerCheckIn.createdAt,
        // 直接从 volunteerCheckIn 表获取
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(eq(volunteerCheckIn.id, id))

    if (!record) {
      throw new Error('打卡记录不存在')
    }

    return {
      success: true,
      data: record,
    }
  }

  /**
   * 查询用户的打卡记录（带统计信息）
   */
  static async getUserRecords(params: {
    lotusId: string
    startDate: string
    endDate: string
  }) {
    const { lotusId, startDate, endDate } = params

    // 直接用 lotusId 查询打卡记录（无需 JOIN volunteer 表）
    const records = await db
      .select()
      .from(volunteerCheckIn)
      .where(
        and(
          eq(volunteerCheckIn.lotusId, lotusId),
          between(volunteerCheckIn.date, startDate, endDate)
        )
      )
      .orderBy(desc(volunteerCheckIn.date), desc(volunteerCheckIn.checkIn))

    if (records.length === 0) {
      throw new Error('未找到打卡记录')
    }

    // 计算统计信息
    const totalDays = new Set(records.map(r => r.date)).size
    
    // 注意：表中没有 checkOut 字段，无法计算实际工时
    // 这里使用默认值：每次打卡记为 3 小时
    const totalHours = records.length * 3
    const avgHoursPerDay = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0

    return {
      success: true,
      data: {
        user: {
          lotusId: records[0].lotusId,
          name: records[0].name,
        },
        records,
        statistics: {
          totalDays,
          totalRecords: records.length,
          totalHours,
          avgHoursPerDay,
        },
      },
    }
  }

  /**
   * 创建打卡记录
   */
  static async create(data: {
    userId: number
    lotusId: string
    name: string
    date: string
    checkIn: string
    status?: string
    location?: string
    notes?: string
    recordType?: string
  }) {
    const [result] = await db.insert(volunteerCheckIn).values({
      userId: data.userId,
      lotusId: data.lotusId,
      name: data.name,
      date: data.date,
      checkIn: data.checkIn,
      status: (data.status as any) || 'present',
      location: data.location || '深圳市龙岗区慈海医院福慧园七栋一楼',
      notes: data.notes,
      originTime: data.checkIn,
      recordType: (data.recordType as any) || 'manual',
    }).$returningId()

    logger.info(`创建打卡记录: userId=${data.userId}, lotusId=${data.lotusId}, date=${data.date}`)

    return {
      success: true,
      data: { id: result.id },
      message: '创建成功',
    }
  }

  /**
   * 更新打卡记录
   */
  static async update(id: number, data: {
    checkIn?: string
    status?: string
    location?: string
    notes?: string
  }) {
    const [existing] = await db
      .select()
      .from(volunteerCheckIn)
      .where(eq(volunteerCheckIn.id, id))

    if (!existing) {
      throw new Error('打卡记录不存在')
    }

    await db
      .update(volunteerCheckIn)
      .set(data)
      .where(eq(volunteerCheckIn.id, id))

    logger.info(`更新打卡记录: id=${id}`)

    return {
      success: true,
      message: '更新成功',
    }
  }

  /**
   * 删除打卡记录
   */
  static async delete(id: number) {
    const [existing] = await db
      .select()
      .from(volunteerCheckIn)
      .where(eq(volunteerCheckIn.id, id))

    if (!existing) {
      throw new Error('打卡记录不存在')
    }

    await db.delete(volunteerCheckIn).where(eq(volunteerCheckIn.id, id))

    logger.info(`删除打卡记录: id=${id}`)

    return {
      success: true,
      message: '删除成功',
    }
  }

  /**
   * 批量删除打卡记录
   */
  static async batchDelete(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new Error('请提供要删除的记录ID')
    }

    const result = await db
      .delete(volunteerCheckIn)
      .where(sql`${volunteerCheckIn.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`)

    logger.info(`批量删除打卡记录: ${ids.length} 条`)

    return {
      success: true,
      message: `成功删除 ${ids.length} 条记录`,
    }
  }
}
