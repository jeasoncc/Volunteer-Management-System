import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { volunteer, volunteerCheckIn, volunteerCheckInSummary } from '../../db/schema'
import { eq, and, gte, sql, count, sum } from 'drizzle-orm'
import dayjs from 'dayjs'

/**
 * 统计数据模块 - 为官网提供实时数据
 */
export const statsModule = new Elysia({ prefix: '/api/stats' })
  /**
   * 获取义工统计数据
   */
  .get('/volunteers', async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD')
      
      // 总义工数
      const [totalResult] = await db
        .select({ count: count() })
        .from(volunteer)
      
      // 活跃义工数（本月有签到记录）
      const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
      const [activeResult] = await db
        .select({ count: count() })
        .from(volunteerCheckInSummary)
        .where(gte(volunteerCheckInSummary.date, new Date(firstDayOfMonth)))
        .groupBy(volunteerCheckInSummary.userId)
      
      // 累计服务时长
      const [hoursResult] = await db
        .select({ total: sum(volunteerCheckInSummary.workHours) })
        .from(volunteerCheckInSummary)
      
      // 今日签到数
      const [todayResult] = await db
        .select({ count: count() })
        .from(volunteerCheckIn)
        .where(sql`DATE(${volunteerCheckIn.date}) = ${today}`)
      
      return {
        totalVolunteers: totalResult?.count || 0,
        activeVolunteers: activeResult?.count || 0,
        totalServiceHours: Math.round((Number(hoursResult?.total) || 0) / 60), // 转换为小时
        todayCheckIns: todayResult?.count || 0,
      }
    } catch (error) {
      console.error('Error fetching volunteer stats:', error)
      return {
        totalVolunteers: 0,
        activeVolunteers: 0,
        totalServiceHours: 0,
        todayCheckIns: 0,
      }
    }
  })
  
  /**
   * 获取今日签到记录
   */
  .get('/checkins/today', async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD')
      
      const records = await db
        .select({
          id: volunteerCheckIn.id,
          lotusId: volunteerCheckIn.lotusId,
          name: volunteerCheckIn.name,
          date: volunteerCheckIn.date,
          checkIn: volunteerCheckIn.checkIn,
          status: volunteerCheckIn.status,
          location: volunteerCheckIn.location,
        })
        .from(volunteerCheckIn)
        .where(sql`DATE(${volunteerCheckIn.date}) = ${today}`)
        .orderBy(sql`${volunteerCheckIn.checkIn} DESC`)
        .limit(20)
      
      return {
        records: records.map(r => ({
          ...r,
          date: dayjs(r.date).format('YYYY-MM-DD'),
          checkIn: r.checkIn || '',
        })),
      }
    } catch (error) {
      console.error('Error fetching today checkins:', error)
      return { records: [] }
    }
  })
  
  /**
   * 获取月度排行榜
   */
  .get('/leaderboard/monthly', async ({ query }) => {
    try {
      const year = query.year ? parseInt(query.year) : dayjs().year()
      const month = query.month ? parseInt(query.month) : dayjs().month() + 1
      
      const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
      const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD')
      
      const summaries = await db
        .select({
          lotusId: volunteerCheckInSummary.lotusId,
          name: volunteerCheckInSummary.name,
          totalHours: sql<number>`SUM(${volunteerCheckInSummary.workHours})`,
          presentDays: sql<number>`COUNT(DISTINCT ${volunteerCheckInSummary.date})`,
        })
        .from(volunteerCheckInSummary)
        .where(
          and(
            gte(volunteerCheckInSummary.date, new Date(startDate)),
            sql`${volunteerCheckInSummary.date} <= ${endDate}`
          )
        )
        .groupBy(volunteerCheckInSummary.lotusId, volunteerCheckInSummary.name)
        .orderBy(sql`SUM(${volunteerCheckInSummary.workHours}) DESC`)
        .limit(10)
      
      return {
        summaries: summaries.map(s => ({
          lotusId: s.lotusId,
          name: s.name,
          totalHours: Math.round((Number(s.totalHours) || 0) / 60 * 10) / 10, // 转换为小时，保留1位小数
          presentDays: Number(s.presentDays) || 0,
          avgHoursPerDay: s.presentDays > 0 
            ? Math.round((Number(s.totalHours) || 0) / 60 / Number(s.presentDays) * 10) / 10
            : 0,
        })),
      }
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error)
      return { summaries: [] }
    }
  }, {
    query: t.Object({
      year: t.Optional(t.String()),
      month: t.Optional(t.String()),
    }),
  })
