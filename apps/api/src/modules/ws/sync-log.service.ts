/**
 * 同步记录服务
 * 用于保存和查询考勤机同步记录
 */

import { db } from '../../db'
import { attendanceSyncLog, attendanceSyncBatch } from '../../db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { logger } from '../../lib/logger'

export class SyncLogService {
  /**
   * 创建同步批次
   */
  static async createBatch(params: {
    batchId: string
    totalCount: number
    syncStrategy: 'all' | 'unsynced' | 'changed' | 'retry'
    operatorId?: number
    operatorName?: string
  }) {
    const { batchId, totalCount, syncStrategy, operatorId, operatorName } = params

    // 根据是否有 operatorId 和 operatorName 来决定 SQL
    if (operatorId && operatorName) {
      await db.execute(sql`
        INSERT INTO attendance_sync_batch 
        (id, total_count, success_count, failed_count, skipped_count, status, sync_strategy, started_at, operator_id, operator_name)
        VALUES (${batchId}, ${totalCount}, 0, 0, 0, 'syncing', ${syncStrategy}, NOW(), ${operatorId}, ${operatorName})
      `)
    } else {
      // 不插入 operator_id 和 operator_name，让数据库使用默认值 NULL
      await db.execute(sql`
        INSERT INTO attendance_sync_batch 
        (id, total_count, success_count, failed_count, skipped_count, status, sync_strategy, started_at)
        VALUES (${batchId}, ${totalCount}, 0, 0, 0, 'syncing', ${syncStrategy}, NOW())
      `)
    }

    logger.info(`📝 创建同步批次: ${batchId}`)
    return batchId
  }

  /**
   * 记录单个用户的同步
   */
  static async logSync(params: {
    batchId: string
    lotusId: string
    name: string
    photoUrl?: string
    status: 'pending' | 'success' | 'failed' | 'skipped'
    errorCode?: number
    errorMessage?: string
    syncType?: 'single' | 'batch' | 'retry'
  }) {
    const { batchId, lotusId, name, photoUrl, status, errorCode, errorMessage, syncType = 'batch' } = params

    // 根据状态决定是否设置 confirmed_at
    if (status !== 'pending') {
      await db.execute(sql`
        INSERT INTO attendance_sync_log 
        (lotus_id, name, device_sn, photo_url, status, error_code, error_message, sync_batch_id, sync_type, synced_at, confirmed_at)
        VALUES (${lotusId}, ${name}, 'YET88476', ${photoUrl || null}, ${status}, ${errorCode || null}, ${errorMessage || null}, ${batchId}, ${syncType}, NOW(), NOW())
      `)
    } else {
      await db.execute(sql`
        INSERT INTO attendance_sync_log 
        (lotus_id, name, device_sn, photo_url, status, error_code, error_message, sync_batch_id, sync_type, synced_at)
        VALUES (${lotusId}, ${name}, 'YET88476', ${photoUrl || null}, ${status}, ${errorCode || null}, ${errorMessage || null}, ${batchId}, ${syncType}, NOW())
      `)
    }
  }

  /**
   * 更新同步记录状态
   */
  static async updateSyncStatus(params: {
    batchId: string
    lotusId: string
    status: 'success' | 'failed'
    errorCode?: number
    errorMessage?: string
  }) {
    const { batchId, lotusId, status, errorCode, errorMessage } = params

    await db
      .update(attendanceSyncLog)
      .set({
        status,
        errorCode,
        errorMessage,
        confirmedAt: new Date(),
      })
      .where(
        and(
          eq(attendanceSyncLog.syncBatchId, batchId),
          eq(attendanceSyncLog.lotusId, lotusId),
          eq(attendanceSyncLog.status, 'pending')
        )
      )
  }

  /**
   * 完成同步批次
   */
  static async completeBatch(params: {
    batchId: string
    successCount: number
    failedCount: number
    skippedCount: number
  }) {
    const { batchId, successCount, failedCount, skippedCount } = params

    // 获取批次开始时间
    const [batch] = await db
      .select()
      .from(attendanceSyncBatch)
      .where(eq(attendanceSyncBatch.id, batchId))

    const duration = batch?.startedAt 
      ? Math.round((Date.now() - new Date(batch.startedAt).getTime()) / 1000)
      : 0

    await db
      .update(attendanceSyncBatch)
      .set({
        successCount,
        failedCount,
        skippedCount,
        status: 'completed',
        completedAt: new Date(),
        duration,
      })
      .where(eq(attendanceSyncBatch.id, batchId))

    logger.info(`📝 同步批次完成: ${batchId}, 耗时 ${duration}秒`)
  }

  /**
   * 获取同步批次列表
   */
  static async getBatchList(params: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  }) {
    const { page = 1, pageSize = 20, startDate, endDate } = params
    const offset = (page - 1) * pageSize

    const conditions = []
    if (startDate) {
      conditions.push(gte(attendanceSyncBatch.startedAt, new Date(startDate)))
    }
    if (endDate) {
      conditions.push(lte(attendanceSyncBatch.startedAt, new Date(endDate)))
    }

    const [batches, [{ count }]] = await Promise.all([
      db
        .select()
        .from(attendanceSyncBatch)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(attendanceSyncBatch.startedAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(attendanceSyncBatch)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ])

    return {
      success: true,
      data: {
        records: batches,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    }
  }

  /**
   * 获取批次详情（包含所有同步记录）
   */
  static async getBatchDetail(batchId: string) {
    const [batch] = await db
      .select()
      .from(attendanceSyncBatch)
      .where(eq(attendanceSyncBatch.id, batchId))

    if (!batch) {
      throw new Error('同步批次不存在')
    }

    const logs = await db
      .select()
      .from(attendanceSyncLog)
      .where(eq(attendanceSyncLog.syncBatchId, batchId))
      .orderBy(desc(attendanceSyncLog.syncedAt))

    return {
      success: true,
      data: {
        batch,
        logs,
        summary: {
          total: logs.length,
          success: logs.filter(l => l.status === 'success').length,
          failed: logs.filter(l => l.status === 'failed').length,
          skipped: logs.filter(l => l.status === 'skipped').length,
          pending: logs.filter(l => l.status === 'pending').length,
        },
      },
    }
  }

  /**
   * 获取用户的同步历史
   */
  static async getUserSyncHistory(lotusId: string, limit = 10) {
    const logs = await db
      .select()
      .from(attendanceSyncLog)
      .where(eq(attendanceSyncLog.lotusId, lotusId))
      .orderBy(desc(attendanceSyncLog.syncedAt))
      .limit(limit)

    return {
      success: true,
      data: logs,
    }
  }

  /**
   * 获取最近失败的同步记录
   */
  static async getRecentFailures(limit = 50) {
    const logs = await db
      .select()
      .from(attendanceSyncLog)
      .where(eq(attendanceSyncLog.status, 'failed'))
      .orderBy(desc(attendanceSyncLog.syncedAt))
      .limit(limit)

    return {
      success: true,
      data: logs,
    }
  }

  /**
   * 获取同步统计
   */
  static async getSyncStats(days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [totalStats, dailyStats] = await Promise.all([
      // 总体统计
      db
        .select({
          totalBatches: sql<number>`count(*)`,
          totalSuccess: sql<number>`sum(success_count)`,
          totalFailed: sql<number>`sum(failed_count)`,
          totalSkipped: sql<number>`sum(skipped_count)`,
          avgDuration: sql<number>`avg(duration)`,
        })
        .from(attendanceSyncBatch)
        .where(gte(attendanceSyncBatch.startedAt, startDate)),
      
      // 每日统计
      db
        .select({
          date: sql<string>`DATE(started_at)`,
          batchCount: sql<number>`count(*)`,
          successCount: sql<number>`sum(success_count)`,
          failedCount: sql<number>`sum(failed_count)`,
        })
        .from(attendanceSyncBatch)
        .where(gte(attendanceSyncBatch.startedAt, startDate))
        .groupBy(sql`DATE(started_at)`)
        .orderBy(sql`DATE(started_at)`),
    ])

    return {
      success: true,
      data: {
        summary: totalStats[0],
        daily: dailyStats,
      },
    }
  }
}
