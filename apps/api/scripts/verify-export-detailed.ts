/**
 * 详细验证导出的 Excel 文件
 * 显示所有志愿者的统计信息
 */

import ExcelJS from 'exceljs'

async function verifyExportDetailed(filename: string) {
  console.log(`\n📋 验证文件: ${filename}`)
  console.log('='.repeat(80))
  
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filename)
  
  const worksheet = workbook.worksheets[0]
  
  // 验证第1行（标题）
  const titleRow = worksheet.getRow(1)
  const titleCell = titleRow.getCell(1)
  console.log(`\n✅ 第1行（标题）: ${titleCell.value}`)
  
  // 验证第2行（表头）
  const headerRow = worksheet.getRow(2)
  const headers = []
  for (let i = 1; i <= 8; i++) {
    const cell = headerRow.getCell(i)
    const value = cell.value as string
    const isRed = cell.font?.color?.argb === 'FFFF0000'
    headers.push(`${value}${isRed ? '[红]' : ''}`)
  }
  console.log(`\n✅ 第2行（表头）:\n   ${headers.join(' | ')}`)
  
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
  console.log(`\n📊 总体统计:`)
  console.log(`   总行数: ${worksheet.rowCount}`)
  console.log(`   数据行数: ${worksheet.rowCount - 2}`)
  console.log(`   志愿者人数: ${volunteerStats.size}`)
  
  // 显示每个志愿者的统计
  console.log(`\n👥 志愿者统计（按服务时长排序）:`)
  console.log('   ' + '-'.repeat(76))
  console.log(`   ${'义工号'.padEnd(15)} | ${'姓名'.padEnd(10)} | ${'记录数'.padStart(6)} | ${'总时长(小时)'.padStart(12)}`)
  console.log('   ' + '-'.repeat(76))
  
  const sortedStats = Array.from(volunteerStats.entries())
    .sort((a, b) => b[1].totalHours - a[1].totalHours)
  
  for (const [volunteerId, stats] of sortedStats) {
    const hours = stats.totalHours.toFixed(1)
    console.log(`   ${volunteerId.padEnd(15)} | ${stats.name.padEnd(10)} | ${stats.count.toString().padStart(6)} | ${hours.padStart(12)}`)
  }
  
  console.log('   ' + '-'.repeat(76))
  
  // 计算总时长
  const totalHours = Array.from(volunteerStats.values())
    .reduce((sum, stats) => sum + stats.totalHours, 0)
  console.log(`   ${'合计'.padEnd(15)} | ${' '.padEnd(10)} | ${(worksheet.rowCount - 2).toString().padStart(6)} | ${totalHours.toFixed(1).padStart(12)}`)
  
  // 显示前5行数据示例
  console.log(`\n📝 数据示例（前5行）:`)
  for (let i = 3; i <= Math.min(7, worksheet.rowCount); i++) {
    const row = worksheet.getRow(i)
    const data = []
    for (let j = 1; j <= 8; j++) {
      data.push(row.getCell(j).value)
    }
    console.log(`   ${data.join(' | ')}`)
  }
}

async function main() {
  const file = 'exports/志愿者服务时间统计表_20251101_20251130.xlsx'
  
  try {
    await verifyExportDetailed(file)
  } catch (error) {
    console.error(`❌ 验证失败: ${file}`, error)
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('🎉 验证完成！')
}

main()
