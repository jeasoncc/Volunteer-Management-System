/**
 * 验证月度导出文件
 */

import ExcelJS from 'exceljs'

async function verifyMonthlyExport(filename: string, month: string) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📋 验证文件: ${filename}`)
  console.log('='.repeat(80))
  
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filename)
  
  const worksheet = workbook.worksheets[0]
  
  // 统计每个志愿者的记录数
  const volunteerStats = new Map<string, { name: string; count: number; totalHours: number }>()
  
  for (let i = 3; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)
    const volunteerId = row.getCell(2).value as string
    const name = row.getCell(3).value as string
    const hours = parseFloat(row.getCell(8).value as string) || 0
    
    if (!volunteerStats.has(volunteerId)) {
      volunteerStats.set(volunteerId, { name, count: 0, totalHours: 0 })
    }
    
    const stats = volunteerStats.get(volunteerId)!
    stats.count++
    stats.totalHours += hours
  }
  
  // 显示统计信息
  console.log(`\n📊 ${month} 统计:`)
  console.log(`   总行数: ${worksheet.rowCount}`)
  console.log(`   数据行数: ${worksheet.rowCount - 2}`)
  console.log(`   志愿者人数: ${volunteerStats.size}`)
  
  // 计算总时长
  const totalHours = Array.from(volunteerStats.values())
    .reduce((sum, stats) => sum + stats.totalHours, 0)
  console.log(`   总服务时长: ${totalHours.toFixed(1)} 小时`)
  
  // 显示前10名志愿者
  console.log(`\n👥 服务时长 TOP 10:`)
  console.log('   ' + '-'.repeat(76))
  console.log(`   ${'义工号'.padEnd(15)} | ${'姓名'.padEnd(10)} | ${'记录数'.padStart(6)} | ${'总时长(小时)'.padStart(12)}`)
  console.log('   ' + '-'.repeat(76))
  
  const sortedStats = Array.from(volunteerStats.entries())
    .sort((a, b) => b[1].totalHours - a[1].totalHours)
    .slice(0, 10)
  
  for (const [volunteerId, stats] of sortedStats) {
    const hours = stats.totalHours.toFixed(1)
    console.log(`   ${volunteerId.padEnd(15)} | ${stats.name.padEnd(10)} | ${stats.count.toString().padStart(6)} | ${hours.padStart(12)}`)
  }
  
  // 显示前3行数据示例
  console.log(`\n📝 数据示例（前3行）:`)
  for (let i = 3; i <= Math.min(5, worksheet.rowCount); i++) {
    const row = worksheet.getRow(i)
    const data = []
    for (let j = 1; j <= 8; j++) {
      data.push(row.getCell(j).value)
    }
    console.log(`   ${data.join(' | ')}`)
  }
}

async function main() {
  await verifyMonthlyExport('exports/志愿者服务时间统计表_2025年09月.xlsx', '2025年9月')
  await verifyMonthlyExport('exports/志愿者服务时间统计表_2025年10月.xlsx', '2025年10月')
  
  console.log('\n' + '='.repeat(80))
  console.log('🎉 验证完成！')
  console.log('='.repeat(80))
}

main()
