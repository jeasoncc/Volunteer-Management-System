/**
 * 定时任务管理
 */

import cron from 'node-cron'
import dayjs from 'dayjs'
import { cronConfig } from '../config/cron'
import { CheckInSummaryService } from '../modules/checkin/summary.service'
import { createLogger } from '../log'

const logger = createLogger()

/**
 * 月度考勤汇总任务
 */
function monthlySummaryTask() {
  const config = cronConfig.monthlySummary
  
  if (!config.enabled) {
    logger.info('⏸️  月度汇总任务已禁用')
    return
  }
  
  const task = cron.schedule(
    config.schedule,
    async () => {
      try {
        logger.info('🚀 开始执行月度考勤汇总任务...')
        
        // 计算上个月
        const lastMonth = dayjs().subtract(1, 'month')
        const year = lastMonth.year()
        const month = lastMonth.month() + 1
        
        logger.info(`📅 处理月份: ${year}-${month}`)
        
        // 执行汇总
        const result = await CheckInSummaryService.generateMonthlySummary({
          year,
          month,
          force: false,
        })
        
        if (result.success) {
          logger.info('✅ 月度汇总任务执行成功')
          logger.info(`📊 统计: ${JSON.stringify(result.data)}`)
          
          // TODO: 发送通知（可选）
          // await sendNotification({
          //   title: '月度考勤汇总完成',
          //   content: `${year}-${month} 月度汇总已完成`,
          //   data: result.data
          // })
        } else {
          logger.error('❌ 月度汇总任务执行失败')
        }
      } catch (error) {
        logger.error('❌ 月度汇总任务执行异常:', error)
        
        // TODO: 发送错误通知
        // await sendErrorNotification(error)
      }
    },
    {
      timezone: config.timezone,
    }
  )
  
  logger.info(`⏰ 月度汇总任务已启动`)
  logger.info(`📅 执行计划: ${config.schedule} (${config.timezone})`)
  logger.info(`📝 说明: ${config.description}`)
  
  return task
}

/**
 * 启动所有定时任务
 */
export function startCronJobs() {
  logger.info('🚀 启动定时任务...')
  
  const tasks = []
  
  // 启动月度汇总任务
  if (cronConfig.monthlySummary.enabled) {
    tasks.push(monthlySummaryTask())
  }
  
  // 可以添加更多任务
  // if (cronConfig.dailyBackup.enabled) {
  //   tasks.push(dailyBackupTask())
  // }
  
  logger.info(`✅ 已启动 ${tasks.length} 个定时任务`)
  
  return tasks
}

/**
 * 停止所有定时任务
 */
export function stopCronJobs(tasks: any[]) {
  logger.info('⏹️  停止定时任务...')
  
  tasks.forEach(task => task.stop())
  
  logger.info('✅ 所有定时任务已停止')
}

/**
 * 手动触发月度汇总（用于测试）
 */
export async function triggerMonthlySummary(year?: number, month?: number) {
  const targetDate = year && month 
    ? dayjs(`${year}-${month}-01`)
    : dayjs().subtract(1, 'month')
  
  const targetYear = targetDate.year()
  const targetMonth = targetDate.month() + 1
  
  logger.info(`🔧 手动触发月度汇总: ${targetYear}-${targetMonth}`)
  
  const result = await CheckInSummaryService.generateMonthlySummary({
    year: targetYear,
    month: targetMonth,
    force: false,
  })
  
  return result
}
