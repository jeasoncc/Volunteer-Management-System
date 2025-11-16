/**
 * 考勤导出服务
 * 用于导出符合深圳志愿者管理系统格式的 Excel 文件
 */

import ExcelJS from 'exceljs'
import { db } from '../../db'
import { volunteer, volunteerCheckIn } from '../../db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import dayjs from 'dayjs'
import { createLogger } from '../../log'

const logger = createLogger()

interface ExportParams {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  lotusIds?: string[] // 可选：指定用户
  activityName?: string // 活动名称，默认为日期范围
}

/**
 * 导出志愿者服务时间统计表
 */
export class CheckInExportService {
  /**
   * 生成 Excel 文件
   */
  static async exportToExcel(params: ExportParams) {
    const { startDate, endDate, lotusIds, activityName } = params
    
    logger.info(`📊 开始导出考勤数据: ${startDate} 至 ${endDate}`)
    
    // 1. 查询数据（关联 volunteer 表获取 volunteer_id）
    const conditions = [
      gte(volunteerCheckIn.date, new Date(startDate)),
      lte(volunteerCheckIn.date, new Date(endDate)),
    ]
    
    if (lotusIds && lotusIds.length > 0) {
      conditions.push(sql`${volunteerCheckIn.lotusId} IN (${sql.join(lotusIds.map(id => sql`${id}`), sql`, `)})`)
    }
    
    const records = await db
      .select({
        lotusId: volunteerCheckIn.lotusId,
        volunteerId: volunteer.volunteerId,
        name: volunteerCheckIn.name,
        date: volunteerCheckIn.date,
        checkIn: volunteerCheckIn.checkIn,
        originTime: volunteerCheckIn.originTime,
      })
      .from(volunteerCheckIn)
      .innerJoin(volunteer, eq(volunteerCheckIn.userId, volunteer.id))
      .where(and(...conditions))
      .orderBy(volunteerCheckIn.lotusId, volunteerCheckIn.date, volunteerCheckIn.checkIn)
    
    logger.info(`📝 查询到 ${records.length} 条记录`)
    
    // 2. 按用户和日期分组，计算每天的签到签退和工时
    const groupedData = this.groupAndCalculate(records)
    
    // 3. 生成 Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('志愿者服务时间统计表')
    
    // 4. 添加标题行（第一行）
    worksheet.mergeCells('A1:H1')
    worksheet.getCell('A1').value = '深圳志愿者（义工）服务时间统计表（用于组织管理员导入系统）'
    worksheet.getCell('A1').font = { bold: true, size: 14 }
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
    
    // 5. 添加表头行（第二行）
    const headers = ['序号', '义工号', '姓名', '活动名称', '服务开展日期(yyyy/MM/dd)', '签到时间(HH:mm)', '签退时间(HH:mm)', '服务时长（单位：小时）']
    const redHeaders = ['义工号', '服务开展日期(yyyy/MM/dd)', '签到时间(HH:mm)', '签退时间(HH:mm)', '服务时长（单位：小时）']
    
    worksheet.addRow(headers)
    
    // 6. 设置列宽
    worksheet.columns = [
      { width: 8 },   // 序号
      { width: 15 },  // 义工号
      { width: 12 },  // 姓名
      { width: 30 },  // 活动名称
      { width: 25 },  // 服务开展日期
      { width: 18 },  // 签到时间
      { width: 18 },  // 签退时间
      { width: 22 },  // 服务时长
    ]
    
    // 7. 设置表头样式
    const headerRow = worksheet.getRow(2)
    headerRow.font = { bold: true }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    
    // 8. 设置指定列标题为红色
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      if (redHeaders.includes(header)) {
        cell.font = { bold: true, color: { argb: 'FFFF0000' } } // 红色
      }
    })
    
    // 9. 填充数据
    const defaultActivityName = activityName || `${dayjs(startDate).format('YYYY.MMDD')}.${dayjs(endDate).format('MMDD')}生命关怀`
    
    let rowIndex = 1
    for (const item of groupedData) {
      const dataRow = worksheet.addRow([
        rowIndex,
        item.volunteerId,
        item.name,
        defaultActivityName,
        dayjs(item.date).format('YYYY-MM-DD'),
        item.checkInTime,
        item.checkOutTime,
        item.serviceHours,
      ])
      
      // 设置数据行样式（居中对齐）
      dataRow.alignment = { vertical: 'middle', horizontal: 'center' }
      
      rowIndex++
    }
    
    logger.info(`✅ Excel 生成完成，共 ${groupedData.length} 行数据`)
    
    return {
      workbook,
      filename: `志愿者服务时间统计表_${dayjs(startDate).format('YYYYMMDD')}_${dayjs(endDate).format('YYYYMMDD')}.xlsx`,
      recordCount: groupedData.length,
    }
  }
  
  /**
   * 分组并计算工时
   */
  private static groupAndCalculate(records: any[]) {
    // 按用户和日期分组
    const grouped = new Map<string, any[]>()
    
    for (const record of records) {
      const key = `${record.lotusId}_${dayjs(record.date).format('YYYY-MM-DD')}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(record)
    }
    
    // 计算每天的签到签退和工时
    const result = []
    
    for (const [key, dayRecords] of grouped) {
      // 按时间排序
      dayRecords.sort((a, b) => {
        const timeA = a.checkIn || '00:00:00'
        const timeB = b.checkIn || '00:00:00'
        return timeA.localeCompare(timeB)
      })
      
      const firstRecord = dayRecords[0]
      const lastRecord = dayRecords[dayRecords.length - 1]
      
      let checkInTime = this.formatTime(firstRecord.checkIn)
      let checkOutTime = this.formatTime(lastRecord.checkIn)
      
      // 计算工时
      let serviceHours = 0
      if (dayRecords.length === 1) {
        // 只有一次打卡，签退时间 = 签到时间 + 1 小时
        const start = dayjs(`${dayjs(firstRecord.date).format('YYYY-MM-DD')} ${firstRecord.checkIn}`)
        const end = start.add(1, 'hour')
        checkOutTime = end.format('HH:mm')
        serviceHours = 1
      } else {
        // 计算实际时长
        const start = dayjs(`${dayjs(firstRecord.date).format('YYYY-MM-DD')} ${firstRecord.checkIn}`)
        const end = dayjs(`${dayjs(lastRecord.date).format('YYYY-MM-DD')} ${lastRecord.checkIn}`)
        
        // 检查是否跨天
        if (end.isBefore(start)) {
          // 跨天：加24小时
          serviceHours = end.add(1, 'day').diff(start, 'hour', true)
        } else {
          serviceHours = end.diff(start, 'hour', true)
        }
        
        // 限制最大8小时
        if (serviceHours > 8) {
          serviceHours = 8
        }
        
        // 保留一位小数
        serviceHours = Math.round(serviceHours * 10) / 10
      }
      
      result.push({
        volunteerId: firstRecord.volunteerId || firstRecord.lotusId, // 优先使用 volunteer_id
        name: firstRecord.name,
        date: firstRecord.date,
        checkInTime,
        checkOutTime,
        serviceHours,
      })
    }
    
    return result
  }
  
  /**
   * 格式化时间为 HH:mm
   */
  private static formatTime(time: string | null): string {
    if (!time) return ''
    
    // time 格式可能是 HH:mm:ss 或 HH:mm
    const parts = time.split(':')
    return `${parts[0]}:${parts[1]}`
  }
}
