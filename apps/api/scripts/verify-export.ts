/**
 * 验证导出的 Excel 文件格式和内容
 */

import ExcelJS from 'exceljs'

async function verifyExport(filename: string) {
  console.log(`\n📋 验证文件: ${filename}`)
  console.log('='.repeat(60))
  
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
    headers.push(`${value}${isRed ? '[红色]' : ''}`)
  }
  console.log(`\n✅ 第2行（表头）:\n   ${headers.join(' | ')}`)
  
  // 验证数据行
  console.log(`\n✅ 数据行示例（前3行）:`)
  for (let i = 3; i <= Math.min(5, worksheet.rowCount); i++) {
    const row = worksheet.getRow(i)
    const data = []
    for (let j = 1; j <= 8; j++) {
      data.push(row.getCell(j).value)
    }
    console.log(`   ${data.join(' | ')}`)
  }
  
  console.log(`\n📊 统计信息:`)
  console.log(`   总行数: ${worksheet.rowCount}`)
  console.log(`   数据行数: ${worksheet.rowCount - 2}`)
  console.log(`   列数: ${worksheet.columnCount}`)
}

async function main() {
  const files = [
    'exports/志愿者服务时间统计表_20251101_20251130.xlsx',
    'exports/志愿者服务时间统计表_指定用户_10月.xlsx',
    'exports/志愿者服务时间统计表_助念服务_9月.xlsx',
  ]
  
  for (const file of files) {
    try {
      await verifyExport(file)
    } catch (error) {
      console.error(`❌ 验证失败: ${file}`, error)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 验证完成！')
}

main()
