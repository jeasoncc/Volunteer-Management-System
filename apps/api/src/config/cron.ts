/**
 * 定时任务配置
 */

export const cronConfig = {
  // 月度考勤汇总
  monthlySummary: {
    // 每月1号凌晨2点执行
    schedule: '0 2 1 * *',
    enabled: true,
    timezone: 'Asia/Shanghai',
    description: '生成上月考勤汇总',
  },
  
  // 可以添加更多定时任务
  // dailyBackup: {
  //   schedule: '0 3 * * *',
  //   enabled: false,
  //   timezone: 'Asia/Shanghai',
  //   description: '每日数据备份',
  // },
}

/**
 * Cron 表达式说明
 * 
 * 格式: 分 时 日 月 星期
 * 
 * 示例:
 * '0 2 1 * *'     每月1号凌晨2点
 * '0 0 * * *'     每天凌晨0点
 * '0 *\/6 * * *'  每6小时
 * '0 0 * * 0'     每周日凌晨0点
 * '0 0 1 1 *'     每年1月1号凌晨0点
 */
