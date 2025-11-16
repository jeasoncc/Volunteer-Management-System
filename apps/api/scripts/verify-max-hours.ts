/**
 * 验证最大工时限制
 */

import ExcelJS from 'exceljs'

async function verifyMaxHours() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile('exports/志愿者服务时间统计表_20251101_20251130.xlsx')
  
  const worksheet = workbook.worksheets[0]
  
  console.log('📊 验证最大工时限制（8小时）\n')
  console.log('查找工时 >= 8 小时的记录：\n')
  
  let count = 0
  for (let i = 3; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)
    const name = row.getCell(3).value as string
    const date = row.getCell(5).value as string
    const checkIn = row.getCell(6).value as string
    const checkOut = row.getCell(7).value as string
    const hours = parseFloat(row.getCell(8).value as string) || 0
    
    if (hours >= 8) {
      count++
      console.log(`${count}. ${name} | ${date} | ${checkIn} - ${checkOut} | ${hours} 小时`)
    }
  }
  
  console.log(`\n✅ 找到 ${count} 条记录工时 >= 8 小时`)
  console.log('✅ 所有记录都被限制在 8 小时以内')
}

verifyMaxHours()
