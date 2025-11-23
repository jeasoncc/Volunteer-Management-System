import { and, count, eq, like, or, sql } from 'drizzle-orm'
import { MySqlTransaction } from 'drizzle-orm/mysql-core'
import { db } from '../../db'
import { volunteer, admin } from '../../db/schema'
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
   * 根据 lotusId 变更角色
   * 需要超级管理员权限
   */
  static async changeRoleByLotusId(
    lotusId: string,
    newRole: 'admin' | 'volunteer',
    operatorId: number,
    operatorAdminRole?: string,
  ) {
    return db.transaction(async tx => {
      // 检查操作者权限
      if (operatorAdminRole !== 'super') {
        throw new Error('权限不足，只有超级管理员可以变更用户角色')
      }

      const [existing] = await tx.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

      if (!existing) throw new Error('义工不存在')

      if (existing.lotusRole === newRole) {
        return {
          success: true,
          message: '角色未发生变化',
        }
      }

      // 如果是升为管理员，需要在 admin 表中创建记录
      if (newRole === 'admin' && existing.lotusRole !== 'admin') {
        // 检查 admin 表中是否已有记录
        const [existingAdmin] = await tx.select().from(admin).where(eq(admin.id, existing.id))

        if (!existingAdmin) {
          // 创建普通管理员记录
          await tx.insert(admin).values({
            id:          existing.id,
            role:        'admin', // 默认为普通管理员
            permissions: null,
            isActive:    true,
          })
        }
      }

      // 如果是从管理员降为其他角色，删除 admin 表记录（但保留 super admin）
      if (newRole !== 'admin' && existing.lotusRole === 'admin') {
        const [existingAdmin] = await tx.select().from(admin).where(eq(admin.id, existing.id))

        // 不允许降级超级管理员
        if (existingAdmin?.role === 'super') {
          throw new Error('不能降级超级管理员')
        }

        // 删除普通管理员记录
        if (existingAdmin) {
          await tx.delete(admin).where(eq(admin.id, existing.id))
        }
      }

      await tx
        .update(volunteer)
        .set({
          lotusRole: newRole,
          updatedAt: new Date(),
        })
        .where(eq(volunteer.lotusId, lotusId))

      return {
        success: true,
        message: `角色已更新为 ${newRole === 'admin' ? '管理员' : '义工'}`,
        data:    { lotusId, newRole, name: existing.name },
      }
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
    const { page = 1, limit = 10, keyword, ...filters } = query
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

    // 如果有关键词搜索，添加 OR 条件
    if (keyword && keyword.trim()) {
      const keywordCondition = or(
        like(volunteer.name, `%${keyword}%`),
        like(volunteer.phone, `%${keyword}%`),
        like(volunteer.account, `%${keyword}%`),
        like(volunteer.email, `%${keyword}%`),
        like(volunteer.lotusId, `%${keyword}%`),
      )
      whereConditions.push(keywordCondition as any)
    }

    const [volunteers, totalResult, newThisMonthResult, activeResult] = await Promise.all([
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
      db
        .select({ count: count() })
        .from(volunteer)
        .where(sql`
          YEAR(${volunteer.createdAt}) = YEAR(CURRENT_DATE)
          AND MONTH(${volunteer.createdAt}) = MONTH(CURRENT_DATE)
        `),
      db
        .select({ count: count() })
        .from(volunteer)
        .where(eq(volunteer.volunteerStatus, 'registered')),
    ])

    const total = Number(totalResult[0]?.count) || 0

    return {
      data:       volunteers,
      total,
      page,
      pageSize:   limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total,
        newThisMonth:    Number(newThisMonthResult[0]?.count) || 0,
        activeVolunteers: Number(activeResult[0]?.count) || 0,
      },
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

  /**
   * 获取义工统计数据
   */
  static async getStats() {
    const now = new Date()
    const thisMonth = now.getMonth() // JavaScript月份从0开始，0-11
    const thisYear = now.getFullYear()

    // 计算本月的起始和结束日期（转换为 ISO 字符串格式）
    const monthStart = new Date(thisYear, thisMonth, 1)
    const monthEnd = new Date(thisYear, thisMonth + 1, 0, 23, 59, 59, 999)

    console.log('📅 统计时间范围:', { monthStart, monthEnd, thisYear, thisMonth })

    // 获取总数
    const [totalResult] = await db
      .select({ count: count() })
      .from(volunteer)

    console.log('📊 总数查询结果:', totalResult)

    // 获取本月新增（使用日期范围查询，使用 SQL 函数）
    const [newThisMonthResult] = await db
      .select({ count: count() })
      .from(volunteer)
      .where(
        sql`YEAR(${volunteer.createdAt}) = ${thisYear} AND MONTH(${volunteer.createdAt}) = ${thisMonth + 1}`
      )

    console.log('📊 本月新增查询结果:', newThisMonthResult)

    // 获取活跃义工（已注册状态）
    const [activeResult] = await db
      .select({ count: count() })
      .from(volunteer)
      .where(eq(volunteer.volunteerStatus, 'registered'))

    console.log('📊 活跃义工查询结果:', activeResult)

    const result = {
      total:            Number(totalResult?.count) || 0,
      newThisMonth:     Number(newThisMonthResult?.count) || 0,
      activeVolunteers: Number(activeResult?.count) || 0,
    }

    console.log('📊 最终统计结果:', result)

    return result
  }
}
