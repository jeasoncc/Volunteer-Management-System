/**
 * 生成考勤汇总数据
 * 从 volunteer_checkin 表读取原始打卡记录，生成每日汇总数据
 */

import { db } from '../src/db'
import { volunteer, volunteerCheckIn, volunteerCheckInSummary } from '../src/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import dayjs from 'dayjs'

async function generateSummary() {
  console.log('📊 开始生成考勤汇总数据...')

  // 1. 查询所有不同的日期
  const dates = await db
    .select({ date: volunteerCheckIn.date })
    .from(volunteerCheckIn)
    .groupBy(volunteerCheckIn.date)
    .orderBy(volunteerCheckIn.date)

  console.log(`📅 找到 ${dates.length} 个不同的日期`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  // 2. 为每个日期生成汇总
  for (const { date } of dates) {
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    
    // 查询该日期的所有用户
    const users = await db
      .select({
        userId: volunteerCheckIn.userId,
        lotusId: volunteerCheckIn.lotusId,
        name: volunteerCheckIn.name,
      })
      .from(volunteerCheckIn)
      .where(sql`DATE(${volunteerCheckIn.date}) = ${dateStr}`)
      .groupBy(volunteerCheckIn.userId, volunteerCheckIn.lotusId, volunteerCheckIn.name)

    // 3. 为每个用户计算当天的工时
    for (const user of users) {
      try {
        // 检查是否已存在汇总
        const existing = await db
          .select()
          .from(volunteerCheckInSummary)
          .where(
            and(
              eq(volunteerCheckInSummary.userId, user.userId),
              sql`DATE(${volunteerCheckInSummary.date}) = ${dateStr}`
            )
          )
          .limit(1)

        if (existing.length > 0) {
          skipCount++
          continue
        }

        // 查询该用户当天的所有打卡记录
        const records = await db
          .select()
          .from(volunteerCheckIn)
          .where(
            and(
              eq(volunteerCheckIn.userId, user.userId),
              sql`DATE(${volunteerCheckIn.date}) = ${dateStr}`
            )
          )
          .orderBy(volunteerCheckIn.checkIn)

        if (records.length === 0) continue

        const firstRecord = records[0]
        const lastRecord = records[records.length - 1]
        const checkinCount = records.length

        // 计算工时
        let workHours = 0
        let calculationRule = ''
        let isNightShift = false

        if (checkinCount === 1) {
          // 只打一次卡，默认 1 小时
          workHours = 1
          calculationRule = 'single_card_1h'
        } else {
          // 打两次及以上，计算实际时长
          const firstTime = dayjs(`${dateStr} ${firstRecord.checkIn}`)
          const lastTime = dayjs(`${dateStr} ${lastRecord.checkIn}`)

          // 检查是否跨夜
          if (lastTime.isBefore(firstTime)) {
            const nextDayLastTime = lastTime.add(1, 'day')
            workHours = nextDayLastTime.diff(firstTime, 'hour', true)
            isNightShift = true
            calculationRule = 'night_shift_actual'
          } else {
            workHours = lastTime.diff(firstTime, 'hour', true)
            calculationRule = 'double_card_actual'
          }

          // 限制最大工时为 12 小时
          if (workHours > 12) {
            workHours = 12
            calculationRule += '_capped'
          }

          // 保留两位小数
          workHours = Math.round(workHours * 100) / 100
        }

        // 插入汇总数据
        await db.insert(volunteerCheckInSummary).values({
          userId: user.userId,
          lotusId: user.lotusId,
          name: user.name,
          date: new Date(dateStr),
          firstCheckinTime: firstRecord.checkIn,
          lastCheckinTime: lastRecord.checkIn,
          checkinCount,
          workHours,
          calculationRule,
          status: 'present',
          isNightShift,
          deviceSn: firstRecord.deviceSn,
          bodyTemperature: firstRecord.bodyTemperature,
          confidence: firstRecord.confidence,
        })

        successCount++
        
        if (successCount % 100 === 0) {
          console.log(`✅ 已处理 ${successCount} 条记录...`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ 处理失败: ${user.name}(${user.lotusId}) - ${dateStr}`, error)
      }
    }
  }

  console.log('\n📊 汇总完成！')
  console.log(`✅ 成功: ${successCount} 条`)
  console.log(`⏭️  跳过: ${skipCount} 条（已存在）`)
  console.log(`❌ 失败: ${errorCount} 条`)

  process.exit(0)
}

generateSummary().catch(error => {
  console.error('❌ 生成失败:', error)
  process.exit(1)
})
