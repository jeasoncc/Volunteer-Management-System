import { eq, and, like, or, gte, lte, desc } from 'drizzle-orm'
import { db } from '../../db'
import { deceased } from '../../db/schema'
import type { CreateDeceasedDTO, UpdateDeceasedDTO, DeceasedListQuery } from './types'
import { validatePaginationParams } from '../../lib/validation/pagination'

export class DeceasedService {
  /**
   * 获取往生者列表（分页）
   */
  async getList(query: DeceasedListQuery) {
    const {
      keyword,
      gender,
      chantPosition,
      startDate,
      endDate,
    } = query

    // 🔒 验证分页参数
    const { page, pageSize: limit, offset } = validatePaginationParams({
      page: query.page,
      pageSize: query.limit,
    }, {
      defaultPageSize: 20,
      maxPageSize: 1000,
    })

    // 构建查询条件
    const conditions = []

    if (keyword) {
      conditions.push(
        or(
          like(deceased.name, `%${keyword}%`),
          like(deceased.title, `%${keyword}%`),
          like(deceased.familyContact, `%${keyword}%`),
          like(deceased.familyPhone, `%${keyword}%`),
        ),
      )
    }

    if (gender) {
      conditions.push(eq(deceased.gender, gender as any))
    }

    if (chantPosition) {
      conditions.push(eq(deceased.chantPosition, chantPosition as any))
    }

    if (startDate) {
      conditions.push(gte(deceased.deathDate, startDate))
    }

    if (endDate) {
      conditions.push(lte(deceased.deathDate, endDate))
    }

    // 查询数据
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(deceased)
        .where(whereClause)
        .orderBy(desc(deceased.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: deceased.id })
        .from(deceased)
        .where(whereClause),
    ])

    const total = countResult.length

    return {
      data,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 根据 ID 获取往生者详情
   */
  async getById(id: number) {
    const result = await db
      .select()
      .from(deceased)
      .where(eq(deceased.id, id))
      .limit(1)

    if (result.length === 0) {
      throw new Error('往生者不存在')
    }

    return result[0]
  }

  /**
   * 创建往生者
   */
  async create(data: CreateDeceasedDTO) {
    const result = await db.insert(deceased).values({
      name: data.name,
      title: data.title,
      chantNumber: data.chantNumber,
      chantPosition: data.chantPosition as any,
      gender: data.gender as any,
      deathDate: data.deathDate,
      deathTime: data.deathTime,
      age: data.age,
      visitTime: data.visitTime,
      visitationTeam: data.visitationTeam ? JSON.stringify(data.visitationTeam) : null,
      birthDate: data.birthDate,
      religion: data.religion,
      isOrdained: data.isOrdained || false,
      address: data.address,
      causeOfDeath: data.causeOfDeath,
      familyContact: data.familyContact,
      familyRelationship: data.familyRelationship,
      familyPhone: data.familyPhone,
      specialNotes: data.specialNotes,
      funeralArrangements: data.funeralArrangements,
    })

    return this.getById(Number(result.insertId))
  }

  /**
   * 更新往生者信息
   */
  async update(id: number, data: UpdateDeceasedDTO) {
    // 检查是否存在
    await this.getById(id)

    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.title !== undefined) updateData.title = data.title
    if (data.chantNumber !== undefined) updateData.chantNumber = data.chantNumber
    if (data.chantPosition !== undefined) updateData.chantPosition = data.chantPosition
    if (data.gender !== undefined) updateData.gender = data.gender
    if (data.deathDate !== undefined) updateData.deathDate = data.deathDate
    if (data.deathTime !== undefined) updateData.deathTime = data.deathTime
    if (data.age !== undefined) updateData.age = data.age
    if (data.visitTime !== undefined) updateData.visitTime = data.visitTime
    if (data.visitationTeam !== undefined) {
      updateData.visitationTeam = JSON.stringify(data.visitationTeam)
    }
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate
    if (data.religion !== undefined) updateData.religion = data.religion
    if (data.isOrdained !== undefined) updateData.isOrdained = data.isOrdained
    if (data.address !== undefined) updateData.address = data.address
    if (data.causeOfDeath !== undefined) updateData.causeOfDeath = data.causeOfDeath
    if (data.familyContact !== undefined) updateData.familyContact = data.familyContact
    if (data.familyRelationship !== undefined) {
      updateData.familyRelationship = data.familyRelationship
    }
    if (data.familyPhone !== undefined) updateData.familyPhone = data.familyPhone
    if (data.specialNotes !== undefined) updateData.specialNotes = data.specialNotes
    if (data.funeralArrangements !== undefined) {
      updateData.funeralArrangements = data.funeralArrangements
    }

    await db.update(deceased).set(updateData).where(eq(deceased.id, id))

    return this.getById(id)
  }

  /**
   * 删除往生者
   */
  async delete(id: number) {
    // 检查是否存在
    await this.getById(id)

    await db.delete(deceased).where(eq(deceased.id, id))

    return { success: true }
  }

  /**
   * 批量删除往生者
   */
  async batchDelete(ids: number[]) {
    if (ids.length === 0) {
      throw new Error('请选择要删除的往生者')
    }

    // 使用 Promise.all 并发删除
    await Promise.all(ids.map((id) => this.delete(id)))

    return { success: true, count: ids.length }
  }

  /**
   * 搜索往生者
   */
  async search(keyword: string, limit = 10) {
    if (!keyword) {
      return []
    }

    const result = await db
      .select()
      .from(deceased)
      .where(
        or(
          like(deceased.name, `%${keyword}%`),
          like(deceased.title, `%${keyword}%`),
          like(deceased.familyContact, `%${keyword}%`),
          like(deceased.familyPhone, `%${keyword}%`),
        ),
      )
      .orderBy(desc(deceased.createdAt))
      .limit(limit)

    return result
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const [totalResult, todayResult] = await Promise.all([
      db.select({ count: deceased.id }).from(deceased),
      db
        .select({ count: deceased.id })
        .from(deceased)
        .where(eq(deceased.deathDate, new Date().toISOString().split('T')[0])),
    ])

    return {
      total: totalResult.length,
      today: todayResult.length,
    }
  }
}

export const deceasedService = new DeceasedService()
