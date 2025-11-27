import { and, count, eq, like, or } from 'drizzle-orm'
import { db } from '../../db'
import { admin, volunteer } from '../../db/schema'
import { VolunteerService } from '../volunteer/service'
import { NotFoundError } from './errors'
import {
  AdminCreateDto,
  AdminListQuery,
  AdminUpdateByLotusDto,
  AdminUpdateDto,
  PermissionUpdateDto,
  PromoteVolunteerDto,
} from './model'
import { validatePaginationParams } from '../../lib/validation/pagination'

export class AdminService {
  // ============== 创建管理员 ==============
  static async create(body: AdminCreateDto) {
    return db.transaction(async tx => {
      // 1. 创建志愿者基础记录（复用VolunteerService）
      const newVolunteer = await VolunteerService.create(body, tx)

      const [adminRecord] = await tx
        .insert(admin)
        .values({
          id:          newVolunteer.id,
          role:        body.role,
          department:  body.department,
          permissions: body.permissions || [],
          isActive:    true,
        })
        .$returningId()

      return {
        id:      adminRecord.id,
        lotusId: newVolunteer.lotusId,
      }
    })
  }

  // ============== 获取管理员详情 ==============
  static async getById(id: number) {
    const result = await db
      .select({
        volunteer: volunteer,
        admin:     admin,
      })
      .from(volunteer)
      .innerJoin(admin, eq(volunteer.id, admin.id))
      .where(eq(volunteer.id, id))
      .then(res => res[0])

    if (!result) {
      throw new NotFoundError('管理员不存在', id)
    }

    return result
  }
  /**
   * 根据 lotusId 查询管理员
   * @param lotusId 莲花斋内部ID
   * @param options.includeVolunteer 是否返回关联志愿者信息
   */
  static async findByLotusId(lotusId: string, options: { includeVolunteer?: boolean } = {}) {
    // 基础查询构建
    const query = db
      .select({
        admin: admin,
        ...(options.includeVolunteer ? { volunteer: volunteer } : {}), // 动态选择字段
      })
      .from(admin)
      .innerJoin(volunteer, eq(admin.id, volunteer.id))
      .where(eq(volunteer.lotusId, lotusId))

    const result = await query.then(res => res[0])

    if (!result) {
      throw new Error(`未找到 lotusId 为 ${lotusId} 的管理员`)
    }

    return options.includeVolunteer
      ? result // 返回完整联合结果
      : {
          ...result.admin,
          lotusId, // 手动注入lotusId
        }
  }
  // ============== 更新管理员信息 ==============
  static async update(id: number, body: AdminUpdateDto) {
    return db.transaction(async tx => {
      // 1. 类型安全的字段转换
      const adminUpdate: {
        role?:       'super' | 'admin' | 'operator'
        department?: string
        isActive?:   boolean
        updatedAt?:  Date
      } = {}

      if (body.role) adminUpdate.role = body.role
      if (body.department) adminUpdate.department = body.department
      if (body.isActive !== undefined) adminUpdate.isActive = body.isActive
      adminUpdate.updatedAt = new Date()

      // 2. 志愿者字段转换 (处理日期类型)
      const volunteerUpdate: {
        name?:      string
        phone?:     string
        email?:     string
        birthDate?: Date | null
        updatedAt?: Date
      } = {}

      if (body.name) volunteerUpdate.name = body.name
      if (body.phone) volunteerUpdate.phone = body.phone
      if (body.email) volunteerUpdate.email = body.email
      if (body.birthDate) volunteerUpdate.birthDate = new Date(body.birthDate) // 字符串转Date
      volunteerUpdate.updatedAt = new Date()

      // 3. 执行更新
      await tx.update(admin).set(adminUpdate).where(eq(admin.id, id))

      if (Object.keys(volunteerUpdate).length > 1) {
        // 排除updatedAt
        await tx.update(volunteer).set(volunteerUpdate).where(eq(volunteer.id, id))
      }

      return { success: true }
    })
  }
  /**
   * 根据LotusID更新管理员信息
   * @param body 包含lotusId和更新字段
   */
  static async updateByLotusId(body: AdminUpdateByLotusDto) {
    return db.transaction(async tx => {
      // 1. 获取关联的志愿者和管理员ID
      const volunteerRecord = await tx.query.volunteer.findFirst({
        where:   eq(volunteer.lotusId, body.lotusId),
        columns: { id: true },
      })

      if (!volunteerRecord) {
        throw new Error(`未找到LotusID为 ${body.lotusId} 的志愿者`)
      }

      const adminId = volunteerRecord.id

      // 2. 分离管理员和志愿者字段
      const { lotusId, role, department, isActive, ...volunteerFields } = body

      // 3. 更新管理员表
      if (role || department || isActive !== undefined) {
        await tx
          .update(admin)
          .set({
            ...(role && { role }),
            ...(department && { department }),
            ...(isActive !== undefined && { isActive }),
            updatedAt: new Date(),
          })
          .where(eq(admin.id, adminId))
      }

      // 4. 更新志愿者表（如果有字段需要更新）
      if (Object.keys(volunteerFields).length > 0) {
        await tx
          .update(volunteer)
          .set({
            ...volunteerFields,
            updatedAt: new Date(),
          })
          .where(eq(volunteer.id, adminId))
      }

      return {
        success:        true,
        updatedAdminId: adminId,
      }
    })
  }
  // ============== 删除管理员 ==============
  /**
   * 删除管理员
   * @param id 管理员ID（对应volunteer.id）
   * @param options 删除选项
   */
  static async delete(
    id: number,
    options: {
      cascade?: boolean // 是否级联删除关联志愿者
    } = { cascade: false },
  ) {
    return db.transaction(async tx => {
      // 1. 验证管理员存在
      const adminRecord = await tx.query.admin.findFirst({
        where: eq(admin.id, id),
      })

      if (!adminRecord) {
        throw new Error(`管理员 ${id} 不存在`)
      }

      // 2. 删除管理员记录
      await tx.delete(admin).where(eq(admin.id, id))

      // 3. 可选级联删除志愿者
      if (options.cascade) {
        await tx.delete(volunteer).where(eq(volunteer.id, id))
      }

      return {
        success:          true,
        deletedAdminId:   id,
        deletedVolunteer: options.cascade ? id : null,
      }
    })
  }

  // ============== 升级志愿者 ==============
  static async promote(body: PromoteVolunteerDto) {
    return db.transaction(async tx => {
      // 1. 验证志愿者存在且非管理员
      const existing = await tx
        .select()
        .from(volunteer)
        .where(eq(volunteer.lotusId, body.lotusId))
        .then(res => res[0])

      if (!existing) throw new Error(`志愿者 ${body.lotusId} 不存在`)
      if (existing.lotusRole === 'admin') {
        throw new Error(`用户 ${body.lotusId} 已是管理员`)
      }

      // 2. 更新志愿者角色
      await tx
        .update(volunteer)
        .set({
          lotusRole: 'admin',
          status:    'active',
          updatedAt: new Date(), // 确保更新时间戳
        })
        .where(eq(volunteer.lotusId, body.lotusId))

      // 3. 创建管理员记录（关联志愿者ID）
      // 3. 创建管理员记录（使用严格类型）
      const insertData = {
        id:          existing.id, // 必须字段
        role:        body.role,
        department:  body.department,
        permissions: body.grantPermissions || [],
        isActive:    true,
        createdAt:   new Date(),
      } // 关键类型断言
      const [adminRecord] = await tx.insert(admin).values(insertData).$returningId() // 使用returning()获取完整记录

      return {
        ...adminRecord,
        volunteerInfo: {
          // 返回关联的志愿者信息
          name:    existing.name,
          lotusId: existing.lotusId,
        },
      }
    })
  }
  // ============== 权限管理 ==============
  static async updatePermissions(body: PermissionUpdateDto) {}

  // ============== 获取管理员列表 ==============
  static async getList(query: AdminListQuery) {
    const { ...filters } = query
    
    // 🔒 验证分页参数
    const { page, pageSize: limit, offset } = validatePaginationParams({
      page: query.page,
      pageSize: query.limit,
    }, {
      defaultPageSize: 10,
      maxPageSize: 1000,
    })

    // 构建筛选条件
    const whereConditions = []
    if (filters.role) whereConditions.push(eq(admin.role, filters.role))
    if (filters.department) whereConditions.push(eq(admin.department, filters.department))
    if (filters.isActive !== undefined) whereConditions.push(eq(admin.isActive, filters.isActive))
    if (filters.name) whereConditions.push(like(volunteer.name, `%${filters.name}%`))

    const [admins, total] = await Promise.all([
      db
        .select({
          volunteer: volunteer,
          admin:     admin,
        })
        .from(volunteer)
        .innerJoin(admin, eq(volunteer.id, admin.id))
        .where(whereConditions.length ? and(...whereConditions) : undefined)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(volunteer)
        .innerJoin(admin, eq(volunteer.id, admin.id))
        .where(whereConditions.length ? and(...whereConditions) : undefined),
    ])

    return {
      data:       admins,
      pagination: {
        total:      Number(total[0]?.count) || 0,
        page,
        limit,
        totalPages: Math.ceil(Number(total[0]?.count) / limit),
      },
    }
  }

  // ============== 搜索管理员 ==============
  /**
   * 模糊搜索管理员
   * @param keyword 关键词（姓名/电话/账号/lotusId）
   * @param limit 返回数量限制
   */
  static async search(keyword: string, limit: number = 10) {
    if (keyword.length < 1) throw new Error('关键词长度至少1个字符')

    return db
      .select({
        admin:     {
          id:         admin.id,
          role:       admin.role,
          department: admin.department,
        },
        volunteer: {
          name:    volunteer.name,
          phone:   volunteer.phone,
          lotusId: volunteer.lotusId,
        },
      })
      .from(volunteer)
      .innerJoin(admin, eq(volunteer.id, admin.id))
      .where(
        or(
          like(volunteer.name, `%${keyword}%`),
          like(volunteer.phone, `%${keyword}%`),
          like(volunteer.account, `%${keyword}%`),
          like(volunteer.lotusId, `%${keyword}%`),
        ),
      )
      .limit(limit)
  }
}
