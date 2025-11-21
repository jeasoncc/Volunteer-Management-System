import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db } from '../../db'
import { chantingSchedule, volunteer, deceased } from '../../db/schema'
import type { CreateChantingScheduleDTO, UpdateChantingScheduleDTO, ChantingScheduleListQuery } from './types'

export class ChantingService {
  /**
   * 获取助念排班列表（分页）
   */
  async getList(query: ChantingScheduleListQuery) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      location,
      status,
      deceasedId,
    } = query

    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions = []

    if (startDate) {
      conditions.push(gte(chantingSchedule.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(chantingSchedule.date, endDate))
    }

    if (location) {
      conditions.push(eq(chantingSchedule.location, location as any))
    }

    if (status) {
      conditions.push(eq(chantingSchedule.status, status as any))
    }

    if (deceasedId) {
      conditions.push(eq(chantingSchedule.deceasedId, BigInt(deceasedId)))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // 查询数据（带关联）
    const [data, countResult] = await Promise.all([
      db
        .select({
          id: chantingSchedule.id,
          location: chantingSchedule.location,
          date: chantingSchedule.date,
          timeSlot: chantingSchedule.timeSlot,
          bellVolunteerId: chantingSchedule.bellVolunteerId,
          teachingVolunteerId: chantingSchedule.teachingVolunteerId,
          backupVolunteerId: chantingSchedule.backupVolunteerId,
          deceasedId: chantingSchedule.deceasedId,
          status: chantingSchedule.status,
          actualStartTime: chantingSchedule.actualStartTime,
          actualEndTime: chantingSchedule.actualEndTime,
          feedback: chantingSchedule.feedback,
          expectedParticipants: chantingSchedule.expectedParticipants,
          specialRequirements: chantingSchedule.specialRequirements,
          createdBy: chantingSchedule.createdBy,
          createdAt: chantingSchedule.createdAt,
          updatedAt: chantingSchedule.updatedAt,
        })
        .from(chantingSchedule)
        .where(whereClause)
        .orderBy(desc(chantingSchedule.date), desc(chantingSchedule.timeSlot))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: chantingSchedule.id })
        .from(chantingSchedule)
        .where(whereClause),
    ])

    // 获取关联的义工和往生者信息
    const enrichedData = await Promise.all(
      data.map(async (schedule) => {
        const [bellVolunteer, teachingVolunteer, backupVolunteer, deceasedInfo] =
          await Promise.all([
            schedule.bellVolunteerId
              ? db
                  .select({ name: volunteer.name })
                  .from(volunteer)
                  .where(eq(volunteer.id, schedule.bellVolunteerId))
                  .limit(1)
              : Promise.resolve([]),
            schedule.teachingVolunteerId
              ? db
                  .select({ name: volunteer.name })
                  .from(volunteer)
                  .where(eq(volunteer.id, schedule.teachingVolunteerId))
                  .limit(1)
              : Promise.resolve([]),
            schedule.backupVolunteerId
              ? db
                  .select({ name: volunteer.name })
                  .from(volunteer)
                  .where(eq(volunteer.id, schedule.backupVolunteerId))
                  .limit(1)
              : Promise.resolve([]),
            db
              .select({ name: deceased.name })
              .from(deceased)
              .where(eq(deceased.id, Number(schedule.deceasedId)))
              .limit(1),
          ])

        return {
          ...schedule,
          bellVolunteerName: bellVolunteer[0]?.name,
          teachingVolunteerName: teachingVolunteer[0]?.name,
          backupVolunteerName: backupVolunteer[0]?.name,
          deceasedName: deceasedInfo[0]?.name,
        }
      }),
    )

    const total = countResult.length

    return {
      data: enrichedData,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 根据 ID 获取排班详情
   */
  async getById(id: number) {
    const result = await db
      .select()
      .from(chantingSchedule)
      .where(eq(chantingSchedule.id, id))
      .limit(1)

    if (result.length === 0) {
      throw new Error('排班不存在')
    }

    const schedule = result[0]

    // 获取关联信息
    const [bellVolunteer, teachingVolunteer, backupVolunteer, deceasedInfo, creator] =
      await Promise.all([
        schedule.bellVolunteerId
          ? db
              .select({ name: volunteer.name })
              .from(volunteer)
              .where(eq(volunteer.id, schedule.bellVolunteerId))
              .limit(1)
          : Promise.resolve([]),
        schedule.teachingVolunteerId
          ? db
              .select({ name: volunteer.name })
              .from(volunteer)
              .where(eq(volunteer.id, schedule.teachingVolunteerId))
              .limit(1)
          : Promise.resolve([]),
        schedule.backupVolunteerId
          ? db
              .select({ name: volunteer.name })
              .from(volunteer)
              .where(eq(volunteer.id, schedule.backupVolunteerId))
              .limit(1)
          : Promise.resolve([]),
        db
          .select({ name: deceased.name })
          .from(deceased)
          .where(eq(deceased.id, Number(schedule.deceasedId)))
          .limit(1),
        schedule.createdBy
          ? db
              .select({ name: volunteer.name })
              .from(volunteer)
              .where(eq(volunteer.id, schedule.createdBy))
              .limit(1)
          : Promise.resolve([]),
      ])

    return {
      ...schedule,
      bellVolunteerName: bellVolunteer[0]?.name,
      teachingVolunteerName: teachingVolunteer[0]?.name,
      backupVolunteerName: backupVolunteer[0]?.name,
      deceasedName: deceasedInfo[0]?.name,
      createdByName: creator[0]?.name,
    }
  }

  /**
   * 创建助念排班
   */
  async create(data: CreateChantingScheduleDTO, userId?: number) {
    const result = await db.insert(chantingSchedule).values({
      location: data.location as any,
      date: data.date,
      timeSlot: data.timeSlot,
      bellVolunteerId: data.bellVolunteerId ? BigInt(data.bellVolunteerId) : null,
      teachingVolunteerId: data.teachingVolunteerId
        ? BigInt(data.teachingVolunteerId)
        : null,
      backupVolunteerId: data.backupVolunteerId ? BigInt(data.backupVolunteerId) : null,
      deceasedId: BigInt(data.deceasedId),
      status: (data.status as any) || 'pending',
      expectedParticipants: data.expectedParticipants,
      specialRequirements: data.specialRequirements,
      createdBy: userId ? BigInt(userId) : null,
    })

    return this.getById(Number(result.insertId))
  }

  /**
   * 更新助念排班
   */
  async update(id: number, data: UpdateChantingScheduleDTO) {
    // 检查是否存在
    await this.getById(id)

    const updateData: any = {}

    if (data.location !== undefined) updateData.location = data.location
    if (data.date !== undefined) updateData.date = data.date
    if (data.timeSlot !== undefined) updateData.timeSlot = data.timeSlot
    if (data.bellVolunteerId !== undefined) {
      updateData.bellVolunteerId = data.bellVolunteerId ? BigInt(data.bellVolunteerId) : null
    }
    if (data.teachingVolunteerId !== undefined) {
      updateData.teachingVolunteerId = data.teachingVolunteerId
        ? BigInt(data.teachingVolunteerId)
        : null
    }
    if (data.backupVolunteerId !== undefined) {
      updateData.backupVolunteerId = data.backupVolunteerId
        ? BigInt(data.backupVolunteerId)
        : null
    }
    if (data.deceasedId !== undefined) updateData.deceasedId = BigInt(data.deceasedId)
    if (data.status !== undefined) updateData.status = data.status
    if (data.expectedParticipants !== undefined) {
      updateData.expectedParticipants = data.expectedParticipants
    }
    if (data.specialRequirements !== undefined) {
      updateData.specialRequirements = data.specialRequirements
    }

    await db.update(chantingSchedule).set(updateData).where(eq(chantingSchedule.id, id))

    return this.getById(id)
  }

  /**
   * 删除助念排班
   */
  async delete(id: number) {
    // 检查是否存在
    await this.getById(id)

    await db.delete(chantingSchedule).where(eq(chantingSchedule.id, id))

    return { success: true }
  }

  /**
   * 更新排班状态
   */
  async updateStatus(
    id: number,
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  ) {
    await this.getById(id)

    await db
      .update(chantingSchedule)
      .set({ status: status as any })
      .where(eq(chantingSchedule.id, id))

    return this.getById(id)
  }

  /**
   * 记录实际执行时间
   */
  async recordActualTime(
    id: number,
    data: {
      actualStartTime?: string
      actualEndTime?: string
      feedback?: string
    },
  ) {
    await this.getById(id)

    const updateData: any = {}
    if (data.actualStartTime) updateData.actualStartTime = data.actualStartTime
    if (data.actualEndTime) updateData.actualEndTime = data.actualEndTime
    if (data.feedback !== undefined) updateData.feedback = data.feedback

    await db.update(chantingSchedule).set(updateData).where(eq(chantingSchedule.id, id))

    return this.getById(id)
  }

  /**
   * 获取日历数据
   */
  async getCalendar(year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const result = await this.getList({
      startDate,
      endDate,
      limit: 1000, // 一个月最多31天 * 12时段 = 372条
    })

    return result.data
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const today = new Date().toISOString().split('T')[0]

    const [totalResult, todayResult, pendingResult, completedResult] = await Promise.all([
      db.select({ count: chantingSchedule.id }).from(chantingSchedule),
      db
        .select({ count: chantingSchedule.id })
        .from(chantingSchedule)
        .where(eq(chantingSchedule.date, today)),
      db
        .select({ count: chantingSchedule.id })
        .from(chantingSchedule)
        .where(eq(chantingSchedule.status, 'pending')),
      db
        .select({ count: chantingSchedule.id })
        .from(chantingSchedule)
        .where(eq(chantingSchedule.status, 'completed')),
    ])

    return {
      total: totalResult.length,
      today: todayResult.length,
      pending: pendingResult.length,
      completed: completedResult.length,
    }
  }
}

export const chantingService = new ChantingService()
