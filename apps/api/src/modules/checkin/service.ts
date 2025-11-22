import { db } from '../../db'
import { strangerCheckIn, volunteer, volunteerCheckIn } from '../../db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { v4 as uuidv4 } from 'uuid'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { CheckInData, CheckInRecord } from './types'
import { DuplicateCheckInError, UserNotFoundError, AvatarSaveError } from './errors'
import { createLogger } from '../../log'

const logger = createLogger()

dayjs.extend(utc)
dayjs.extend(timezone)

const AVATAR_DIR = join(process.cwd(), 'public/upload/avatar')

/**
 * 签到服务类
 */
export class CheckInService {
  /**
   * 处理人脸识别签到
   * 
   * 验证逻辑：
   * 1. 验证用户是否存在于系统中
   * 2. 验证时间格式是否正确
   * 3. 检查是否重复签到（多维度比对）
   * 
   * 返回格式统一为考勤设备要求的格式
   */
  static async processFaceCheckIn(data: CheckInData, requestData?: any) {
    const record = new CheckInRecord(data)

    // ==================== 1. 验证用户是否存在 ====================
    const [user] = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.lotusId, record.user_id))
      .limit(1)

    if (!user) {
      logger.warn(`❌ 用户不存在: ${record.user_id}`)
      return {
        success: false,
        Result: 0, // 仍返回 0，避免设备重试
        Msg: `用户不存在: ${record.user_id}`,
        reason: 'USER_NOT_FOUND',
        data: {
          user_id: record.user_id,
          recog_time: record.recog_time,
        },
      }
    }

    // ==================== 2. 验证时间格式 ====================
    const recogTime = dayjs(record.recog_time).tz('Asia/Shanghai')
    
    if (!recogTime.isValid()) {
      logger.warn(`❌ 时间格式错误: ${record.recog_time}`)
      return {
        success: false,
        Result: 0,
        Msg: `时间格式错误: ${record.recog_time}`,
        reason: 'INVALID_TIME_FORMAT',
        data: {
          user_id: record.user_id,
          recog_time: record.recog_time,
        },
      }
    }

    // ==================== 3. 多维度检查重复签到 ====================
    // 检查条件：用户ID + 时间 + 识别类型
    const existingRecord = await db
      .select()
      .from(volunteerCheckIn)
      .where(
        and(
          eq(volunteerCheckIn.lotusId, record.user_id),
          eq(volunteerCheckIn.originTime, record.recog_time),
          eq(volunteerCheckIn.recordType, record.recog_type),
        ),
      )
      .limit(1)

    if (existingRecord.length > 0) {
      logger.debug(`⏭️  重复签到: ${user.name}(${record.user_id}) - ${record.recog_time}`)
      
      return {
        success: true,
        Result: 0,
        Msg: '记录已存在（重复签到）',
        reason: 'DUPLICATE_RECORD',
        data: {
          lotusId: record.user_id,
          name: user.name,
          recog_time: record.recog_time,
          recog_type: record.recog_type,
          existing_id: existingRecord[0].id,
        },
      }
    }

    // ==================== 4. 创建签到记录 ====================
    try {
      const checkInData = {
        userId: user.id, // 使用 user_id 外键
        lotusId: record.user_id,
        date: recogTime.toDate(),
        checkIn: recogTime.format('HH:mm:ss'),
        name: user.name, // 使用数据库中的用户名
        originTime: record.recog_time,
        recordType: record.recog_type,
        deviceSn: requestData?.sn || null,
        bodyTemperature: record.body_temperature || null,
        confidence: record.confidence || null,
      }

      await db.insert(volunteerCheckIn).values(checkInData)

      logger.info(
        `✅ 签到成功: ${user.name}(${record.user_id}) - ${recogTime.format('YYYY-MM-DD HH:mm:ss')} [设备: ${requestData?.sn || 'unknown'}]`,
      )

      return {
        success: true,
        Result: 0,
        Msg: '签到成功',
        reason: 'SUCCESS',
        data: checkInData,
      }
    } catch (error) {
      logger.error(`❌ 签到失败: ${user.name}(${record.user_id})`, error)
      
      return {
        success: false,
        Result: 0,
        Msg: '数据库写入失败',
        reason: 'DATABASE_ERROR',
        data: {
          user_id: record.user_id,
          error: error instanceof Error ? error.message : '未知错误',
        },
      }
    }
  }

  /**
   * 处理陌生人记录
   * 
   * 陌生人记录触发条件：
   * 1. 设备设置为"任何人可通行"
   * 2. 设备本机录入的用户（user_id 以 DL 开头）
   */
  static async processStrangerRecord(data: CheckInData) {
    const record = new CheckInRecord(data)

    // 验证时间格式
    const recogTime = dayjs(record.recog_time).tz('Asia/Shanghai')
    
    if (!recogTime.isValid()) {
      logger.warn(`❌ 陌生人记录时间格式错误: ${record.recog_time}`)
      return {
        success: false,
        Result: 0,
        Msg: `时间格式错误: ${record.recog_time}`,
        reason: 'INVALID_TIME_FORMAT',
        data: {
          user_id: record.user_id,
          recog_time: record.recog_time,
        },
      }
    }

    logger.warn(`⚠️  陌生人记录: ${record.user_name || '未知'}(${record.user_id}) - ${record.recog_time}`)

    try {
      const date = recogTime.toDate()

      await db.insert(strangerCheckIn).values({
        deviceSn:        data?.location?.code || null,
        date,
        time:            recogTime.format('HH:mm:ss') as any,
        userId:          record.user_id,
        userName:        record.user_name || null,
        gender:          record.gender,
        bodyTemperature: record.body_temperature || null,
        confidence:      record.confidence || null,
        photo:           record.photo || null,
        location:        record.location || null,
        originTime:      record.recog_time,
        recordType:      record.recog_type,
      })

      return {
        success: true,
        Result: 0,
        Msg: '陌生人记录已保存',
        reason: 'STRANGER_RECORDED',
        data: {
          user_id: record.user_id,
          user_name: record.user_name,
          recog_time: record.recog_time,
          recog_type: record.recog_type,
        },
      }
    } catch (error) {
      logger.error(`❌ 陌生人记录保存失败: ${record.user_id} - ${record.recog_time}`, error)

      return {
        success: false,
        Result: 0,
        Msg: '陌生人记录保存失败',
        reason: 'DATABASE_ERROR',
        data: {
          user_id: record.user_id,
          error: error instanceof Error ? error.message : '未知错误',
        },
      }
    }
  }

  /**
   * 同步用户照片
   */
  static async syncUserPhoto(userId: string, photoBase64: string) {
    // 检查用户是否存在
    const [existing] = await db.select().from(volunteer).where(eq(volunteer.lotusId, userId))

    if (!existing) {
      throw new UserNotFoundError(userId)
    }

    // 检查用户是否已有头像，如果有则跳过
    if (existing.avatar) {
      logger.debug(`📸 用户 ${userId}(${existing.name}) 已有头像，跳过同步`)
      return {
        success: true,
        message: '用户已有头像，跳过同步',
        data: {
          userId,
          avatarUrl: existing.avatar,
          skipped: true,
        },
      }
    }

    // 保存头像
    const avatarUrl = await this.saveAvatar(photoBase64, userId)

    // 更新用户头像
    await db.update(volunteer).set({ avatar: avatarUrl }).where(eq(volunteer.lotusId, userId))

    logger.info(`📸 用户 ${userId}(${existing.name}) 头像同步成功: ${avatarUrl}`)

    return {
      success: true,
      message: '同步信息完成',
      data: {
        userId,
        avatarUrl,
        skipped: false,
      },
    }
  }

  /**
   * 保存头像文件
   */
  private static async saveAvatar(photoBase64: string, lotusId: string): Promise<string> {
    try {
      // 确保目录存在
      if (!existsSync(AVATAR_DIR)) {
        mkdirSync(AVATAR_DIR, { recursive: true })
      }

      // 解码 Base64
      const dataUrl = decodeURIComponent(photoBase64)
      const raw = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const buf = Buffer.from(raw, 'base64')

      // 生成文件名
      const fileName = `${lotusId}-${uuidv4().slice(0, 8)}.jpg`
      const fullPath = join(AVATAR_DIR, fileName)

      // 保存文件
      writeFileSync(fullPath, buf)

      // 返回公开访问路径
      return `/upload/avatar/${fileName}`
    } catch (error) {
      throw new AvatarSaveError('头像保存失败', error instanceof Error ? error.message : error)
    }
  }

  /**
   * 获取签到记录列表
   */
  static async getCheckInList(params: {
    lotusId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }) {
    const { lotusId, startDate, endDate, limit = 50, offset = 0 } = params

    const conditions = [] as any[]

    if (lotusId) {
      conditions.push(eq(volunteerCheckIn.lotusId, lotusId))
    }

    if (startDate) {
      conditions.push(gte(volunteerCheckIn.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(volunteerCheckIn.date, endDate))
    }

    const records = await db
      .select()
      .from(volunteerCheckIn)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(volunteerCheckIn.createdAt)

    return {
      success: true,
      data: records,
      pagination: {
        limit,
        offset,
        total: records.length,
      },
    }
  }


  static async getStrangerList(params: {
    startDate?: string
    endDate?: string
    deviceSn?: string
    page?: number
    pageSize?: number
  }) {
    const { startDate, endDate, deviceSn, page = 1, pageSize = 50 } = params

    const conditions = [] as any[]

    if (startDate) {
      conditions.push(gte(strangerCheckIn.date, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(strangerCheckIn.date, new Date(endDate)))
    }

    if (deviceSn) {
      conditions.push(eq(strangerCheckIn.deviceSn, deviceSn))
    }

    const limit = pageSize
    const offset = (page - 1) * pageSize

    const records = await db
      .select()
      .from(strangerCheckIn)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(strangerCheckIn.createdAt)

    return {
      success: true,
      data: records,
      pagination: {
        page,
        pageSize,
        total: records.length,
      },
    }
  }
}
