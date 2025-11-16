import { Workbook } from 'exceljs'
import { join } from 'path'
import { exec, execSync } from 'child_process'

export class documentService {
  static async createExcel() {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const dateRange = `${currentYear}年${currentMonth}月`
    const rowsNumber = 16
    const titleHeight = 81
    const rowHeight = 40
    // 1. 创建工作簿
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('助念统计表', {
      headerFooter: { firstHeader: 'Hello Exceljs', firstFooter: 'Hello World' },
    })

    // 2. 设置表头
    worksheet.columns = [
      { key: 'A', header: '月序号', width: 4 }, // 月序号 (A列)
      { key: 'B', header: '年序号', width: 4 }, // 年序号 (B列)
      { key: 'C', header: '总编号', width: 4 }, // 总编号 (C列)
      { key: 'D', header: '往生者姓名', width: 10 }, // 姓名 (D列)
      { key: 'E', header: '性别', width: 6 }, // 性别 (E列)
      { key: 'F', header: '年龄(岁)', width: 6 }, // 年龄 (F列)
      { key: 'G', header: '宗教信仰', width: 9 }, // 宗教信仰 (G列)
      { key: 'H', header: '是否皈依受戒', width: 6 }, // 皈依 (H列)
      { key: 'I', header: '现住址', width: 25 }, // 现住址 (I列)
      { key: 'J', header: '病因', width: 14 }, // 病因 (J列)
      { key: 'K', header: '临终是否移动抢救', width: 8 }, // 抢救 (K列)
      { key: 'L', header: '临终前是否关怀', width: 8 }, // 关怀 (L列)
      { key: 'M', header: '往生日期（按国历登记）', width: 13 }, // 日期 (M列)
      { key: 'N', header: '助念时间（小时）', width: 8 }, // 时间 (N列)
      { key: 'O', header: '助念地方', width: 6 }, // 地方 (O列)
      {
        key:    'P',
        header: '家属姓名',
        width:  8,
      },
      { key: 'Q', header: '家属电话', width: 14 }, // 电话 (Q列)
      {
        key:    'R',
        header: '备注',
        width:  10,
      },
    ]
    const titleRow = worksheet.getRow(1)
    titleRow.height = titleHeight

    titleRow.font = {
      bold:  true, // 关键参数
      size:  16, // 字号
      color: { argb: 'FF000000' }, // 黑色
    }
    titleRow.alignment = {
      wrapText:   true, // 关键参数
      vertical:   'middle', // 垂直居中（匹配截图样式）
      horizontal: 'center', // 水平居中
    }
    // 3. 设置表格边框
    const rows = worksheet.getRows(1, rowsNumber)
    const array = [...Array(18).keys()].map(x => x + 1)

    rows?.map((row, index) => {
      if (index !== 0) {
        row.height = rowHeight
      }
      array.map(cur => {
        const cell = row.getCell(cur)
        if (index === 0) {
          // cell.fill = {
          //
          //   type: 'pattern',
          //   pattern: 'solid',
          //   fgColor: { argb: 'FFFFFF00' } // 标准黄色
          // }
        }
        cell.border = {
          top:    { style: 'thin' },
          left:   { style: 'thin' },
          bottom: { style: 'thin' },
          right:  { style: 'thin' },
        }
      })
    })

    // const oddRows = rows?.filter((_, index) => (index + 1) % 2 !== 0)
    // const evenRows = rows?.filter((_, index) => (index + 1) % 2 === 0)
    //
    // evenRows?.map(row => {
    //   array?.map(cur => {
    //     const cell = row.getCell((cur))
    //     cell.fill = {
    //
    //       type: 'pattern',
    //       pattern: 'darkVertical',
    //       fgColor: { argb: 'ffa7ba59' }
    //     }
    //   })
    // })

    // 4. 设置表格Foot（合并单元格）
    worksheet.mergeCells(`A${rowsNumber}:R${rowsNumber}`)
    const footCell = worksheet.getCell(`A${rowsNumber}`)
    footCell.value = `福慧园莲花生命关怀团助念统计表（${dateRange}）`
    footCell.alignment = {
      wrapText:   true, // 关键参数
      vertical:   'middle', // 垂直居中（匹配截图样式）
      horizontal: 'center', // 水平居中
    }

    // 5. 添加打印设置
    worksheet.pageSetup = {
      orientation: 'landscape', // 横向打印
      margins:     {
        left:   0.1,
        right:  0.1,
        top:    0.1,
        bottom: 0.1,
        header: 0.1,
        footer: 0.1,
      },
      paperSize:   9, // A4纸
      fitToPage:   true,
      fitToWidth:  1,
      fitToHeight: 1,
    }

    // 6. 生成Excel文件
    const prefix = `${currentYear}-${currentMonth}`
    const foldpath = join(process.cwd(), 'public')
    const filePath = join(foldpath, `${prefix}.xlsx`)
    await workbook.xlsx.writeFile(filePath)

    console.log(`✅ 表格已生成: ${filePath}`)
    console.log('🖨️ 打印建议: 使用A4纸横向打印，缩放设置为"调整为一页宽"')

    // 7.  转换为PDF（兼容.ods和.xlsx）
    const pdfPath = join(foldpath, `${prefix}.pdf`)
    try {
      execSync(`libreoffice --headless --convert-to pdf ${filePath} --outdir ${foldpath}`)
      console.log('✅ 转换PDF成功')
    } catch (err) {
      throw new Error(`转换失败: ${err}`)
    }
    // 打印PDF
    try {
      execSync(`lp ${pdfPath}`)
      console.log('🖨️ 打印任务已发送')
    } finally {
      // 清理临时文件
      execSync(`rm ${pdfPath}`)
    }
    return '打印完成'
  }
}
