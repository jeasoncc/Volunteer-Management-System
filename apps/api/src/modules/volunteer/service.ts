import { and, count, eq, like, or } from 'drizzle-orm'
import { MySqlTransaction } from 'drizzle-orm/mysql-core'
import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { generateLotusId } from '../../utils/lotusIdFn'
import { VolunteerCreateDto, VolunteerListQuery, VolunteerUpdateDto } from './model'
import { filterableFields, VolunteerStatus } from './types'
import { checkUniqueFields } from './utils/checkUniqueFields'
import { mapToInsertData } from './utils/mapToInsertData'
import { mapToUpdateData } from './utils/mapToUpdateData'
import { hashPassword, verifyPassword } from '../../lib/auth'

export class VolunteerService {
  static checkIn(arg0: number) {
    throw new Error('Method not implemented.')
  }
  static checkOut(arg0: number) {
    throw new Error('Method not implemented.')
  }
  /**
   * 创建义工
   */
  static async create(body: VolunteerCreateDto, tx?: MySqlTransaction<any, any, any, any>) {
    const dbInstance = tx || db // 支持外部事务

    return dbInstance.transaction(async tx => {
      // 设置默认值
      const dataWithDefaults = {
        ...body,
        account:  body.account || body.phone, // 默认账号为手机号
        password: body.password || '123456', // 默认密码为 123456
      }

      // 检查唯一字段
      await checkUniqueFields(tx, dataWithDefaults)

      // 加密密码
      const hashedPassword = await hashPassword(dataWithDefaults.password)

      // 生成莲花斋ID
      const lotusId = await generateLotusId()

      // 准备插入数据
      const insertData = await mapToInsertData(dataWithDefaults, lotusId, hashedPassword)

      // 执行插入
      const [newVolunteer] = await tx.insert(volunteer).values(insertData).$returningId()

      if (!newVolunteer?.id) {
        throw new Error('创建义工失败')
      }

      return {
        id:              newVolunteer.id,
        lotusId,
        account:         dataWithDefaults.account,
        defaultPassword: body.password ? undefined : '123456', // 如果使用默认密码，返回提示
      }
    })
  }
  /**
   * 获取义工详情
   */
  static async getById(id: number) {
    const result = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.id, id))
      .then(res => res[0])

    if (!result) {
      throw new Error('义工不存在')
    }

    return result
  }

  /**
   * 更新义工信息
   */
  static async update(id: number, body: VolunteerUpdateDto) {
    return db.transaction(async tx => {
      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.id, id))

      if (!existing) throw new Error('义工不存在')

      const updateData = mapToUpdateData(body, existing)

      await tx.update(volunteer).set(updateData).where(eq(volunteer.id, id))

      return { success: true }
    })
  }

  /**
   * 删除义工（根据 ID）
   */
  static async delete(id: number) {
    await db.delete(volunteer).where(eq(volunteer.id, id))
    return { success: true }
  }

  /**
   * 根据 lotusId 获取详情（推荐）
   */
  static async getByLotusId(lotusId: string) {
    const result = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.lotusId, lotusId))
      .then(res => res[0])

    if (!result) {
      throw new Error('义工不存在')
    }

    return result
  }

  /**
   * 根据 lotusId 更新信息（推荐）
   */
  static async updateByLotusId(lotusId: string, body: VolunteerUpdateDto) {
    return db.transaction(async tx => {
      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

      if (!existing) throw new Error('义工不存在')

      const updateData = mapToUpdateData(body, existing)

      await tx.update(volunteer).set(updateData).where(eq(volunteer.lotusId, lotusId))

      return { success: true }
    })
  }

  /**
   * 根据 lotusId 删除（推荐）
   */
  static async deleteByLotusId(lotusId: string) {
    const [existing] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

    if (!existing) {
      throw new Error('义工不存在')
    }

    await db.delete(volunteer).where(eq(volunteer.lotusId, lotusId))

    return {
      success: true,
      message: `已删除义工: ${existing.name} (${lotusId})`,
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(lotusId: string, oldPassword: string, newPassword: string) {
    return db.transaction(async tx => {
      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

      if (!existing) {
        throw new Error('义工不存在')
      }

      // 验证旧密码
      const isValid = await verifyPassword(oldPassword, existing.password)
      if (!isValid) {
        throw new Error('原密码错误')
      }

      // 加密新密码
      const hashedPassword = await hashPassword(newPassword)

      // 更新密码
      await tx
        .update(volunteer)
        .set({ password: hashedPassword })
        .where(eq(volunteer.lotusId, lotusId))

      return {
        success: true,
        message: '密码修改成功',
      }
    })
  }

  /**
   * 根据 lotusId 变更状态
   */
  static async changeStatusByLotusId(lotusId: string, newStatus: VolunteerStatus) {
    return db.transaction(async tx => {
      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

      if (!existing) throw new Error('义工不存在')

      await tx
        .update(volunteer)
        .set({
          status:    newStatus,
          updatedAt: new Date(),
        })
        .where(eq(volunteer.lotusId, lotusId))

      return { success: true }
    })
  }

  /**
   * 批量删除（根据 lotusId 数组）
   */
  static async batchDelete(lotusIds: string[]) {
    if (!lotusIds || lotusIds.length === 0) {
      throw new Error('请提供要删除的义工编号')
    }

    return db.transaction(async tx => {
      const results = []

      for (const lotusId of lotusIds) {
        try {
          const [existing] = await tx.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

          if (!existing) {
            results.push({
              success: false,
              lotusId,
              error:   '义工不存在',
            })
            continue
          }

          await tx.delete(volunteer).where(eq(volunteer.lotusId, lotusId))

          results.push({
            success: true,
            lotusId,
            name:    existing.name,
          })
        } catch (error) {
          results.push({
            success: false,
            lotusId,
            error:   error instanceof Error ? error.message : '删除失败',
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      return {
        success: true,
        message: `批量删除完成: 成功 ${successCount}, 失败 ${failCount}`,
        results,
        summary: {
          total:   lotusIds.length,
          success: successCount,
          fail:    failCount,
        },
      }
    })
  }

  /**
   * 获取义工列表
   */
  static async getList(query: VolunteerListQuery) {
    const { page = 1, limit = 10, ...filters } = query
    const offset = (page - 1) * limit

    // 构建筛选条件 - 完全类型安全
    const whereConditions = (Object.entries(filters) as Array<[keyof typeof filterableFields, any]>)
      .filter(([key, value]) => {
        // 确保字段可筛选且值不为undefined
        return key in filterableFields && value !== undefined
      })
      .map(([key, value]) => {
        // 现在key的类型是已知的列名
        const comparisonType = filterableFields[key]

        return comparisonType === 'like'
          ? like(volunteer[key], `%${value}%`)
          : eq(volunteer[key], value)
      })

    const [volunteers, totalResult] = await Promise.all([
      db
        .select()
        .from(volunteer)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(limit)
        .offset(offset)
        .orderBy(volunteer.createdAt),
      db
        .select({ count: count() })
        .from(volunteer)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
    ])

    const total = Number(totalResult[0]?.count) || 0

    return {
      data:       volunteers,
      total,
      page,
      pageSize:   limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 获取所有义工（不分页）
   */
  static async getAll(filters?: Partial<VolunteerListQuery>) {
    // 构建筛选条件 - 完全类型安全
    const whereConditions = filters
      ? (Object.entries(filters) as Array<[keyof typeof filterableFields, any]>)
          .filter(([key, value]) => {
            // 确保字段可筛选且值不为undefined
            return key in filterableFields && value !== undefined
          })
          .map(([key, value]) => {
            // 现在key的类型是已知的列名
            const comparisonType = filterableFields[key]

            return comparisonType === 'like'
              ? like(volunteer[key], `%${value}%`)
              : eq(volunteer[key], value)
          })
      : []

    const volunteers = await db
      .select()
      .from(volunteer)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(volunteer.createdAt)

    return volunteers
  }
  /**
   * 批量导入义工（改进版）
   */
  static async batchImport(volunteers: VolunteerCreateDto[]) {
    if (!volunteers || volunteers.length === 0) {
      throw new Error('请提供要导入的义工数据')
    }

    return db.transaction(async tx => {
      const results = []
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < volunteers.length; i++) {
        const body = volunteers[i]
        try {
          // 设置默认值
          const dataWithDefaults = {
            ...body,
            account:  body.account || body.phone, // 默认账号为手机号
            password: body.password || '123456', // 默认密码为 123456
          }

          // 检查唯一字段
          await checkUniqueFields(tx, dataWithDefaults)

          // 加密密码
          const hashedPassword = await hashPassword(dataWithDefaults.password)

          // 生成 lotusId
          const lotusId = await generateLotusId()
          const insertData = await mapToInsertData(dataWithDefaults, lotusId, hashedPassword)

          // 插入数据
          const [newVolunteer] = await tx.insert(volunteer).values(insertData).$returningId()

          results.push({
            success:         true,
            index:           i + 1,
            lotusId,
            name:            body.name,
            phone:           body.phone,
            account:         dataWithDefaults.account,
            defaultPassword: body.password ? undefined : '123456',
          })

          successCount++
        } catch (error) {
          results.push({
            success: false,
            index:   i + 1,
            name:    body.name,
            phone:   body.phone,
            error:   error instanceof Error ? error.message : '导入失败',
          })

          failCount++
        }
      }

      return {
        success: true,
        message: `批量导入完成: 成功 ${successCount}, 失败 ${failCount}`,
        results,
        summary: {
          total:   volunteers.length,
          success: successCount,
          fail:    failCount,
        },
      }
    })
  }
  /**
   * 变更义工状态
   */
  static async changeStatus(volunteerId: number, newStatus: VolunteerStatus) {
    return db.transaction(async tx => {
      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.id, volunteerId))

      if (!existing) throw new Error('义工不存在')

      await tx
        .update(volunteer)
        .set({
          status:    newStatus,
          updatedAt: new Date(),
        })
        .where(eq(volunteer.id, volunteerId))

      return { success: true }
    })
  }
  /**
   * 搜索义工
   */
  static async search(keyword: string, limit: number = 10) {
    return db
      .select()
      .from(volunteer)
      .where(
        or(
          like(volunteer.name, `%${keyword}%`),
          like(volunteer.phone, `%${keyword}%`),
          like(volunteer.account, `%${keyword}%`),
          like(volunteer.email, `%${keyword}%`),
        ),
      )
      .limit(limit)
      .orderBy(volunteer.name)
  }
}
