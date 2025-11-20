import { Workbook } from 'exceljs'
import { join } from 'path'
import { exec, execSync } from 'child_process'

interface CareRecordData {
  // 基本信息
  name: string // 姓名
  gender: '男' | '女' // 性别
  age: number // 年龄
  education?: string // 学历
  address: string // 籍贯住址
  workplace?: string // 职业/单位
  
  // 报损信息
  reportDate: string // 会损时间
  reportReason?: string // 会损原因
  hasInsurance: boolean // 是否准备心脏起搏器
  
  // 助念信息
  assistantStartTime?: string // 助念开始时间
  assistantDuration?: string // 助念时长（小时）
  hasFamily: boolean // 是否有家属
  familyCount?: number // 家属人数
  
  // 法名和受戒
  dharmaName?: string // 法名
  hasTakingRefuge: boolean // 是否皈依
  hasFivePrecepts: boolean // 是否五戒
  hasBodhisattvaPrecepts: boolean // 是否十善戒
  hasOtherPrecepts: boolean // 是否其他
  
  // 受戒情形
  baptismType?: '修行打坐' | '听经' | '诵经' | '念佛' | '拜忏' // 修行情形
  
  // 平生信仰
  religion?: '佛教教' | '天主教' | '回教' | '其它' // 宗教信仰
  
  // 临终疾苦或是安详
  deathCondition: '安详' | '疾苦' // 临终状态
  hasFamily2: boolean // 临终家人是否愿意
  hasChanting: boolean // 亡者临终是否念佛
  hasSuffering: boolean // 时内是否痛苦
  hasMovement: boolean // 助念期间是否移动遗体
  
  // 何时入殓
  burialTime?: string // 入殓时间
  hasLawyer: boolean // 有否法师居士开示
  
  // 兴趣爱好
  hobbies?: string[] // 兴趣爱好
  personality?: string // 个性习性
  
  // 对待子女
  childrenAttitude?: string[] // 对待子女态度
  
  // 做何善事
  goodDeeds?: string[] // 做何善事
  
  // 有何心愿未了
  unfinishedWishes?: string // 未了心愿
  
  // 生平事迹总结
  lifeSummary?: string // 生平事迹
  
  // 主事家属
  mainFamily: {
    name: string // 姓名
    phone: string // 电话
    relationship: '夫' | '妻' | '儿' | '女' | '其它' // 与往生者关系
  }
  
  // 家属现住址
  familyAddress: string // 家属地址
}

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

  /**
   * 生成深圳莲花关怀团助念记录表
   */
  static async createCareRecordForm(data: CareRecordData) {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('助念记录表')
    
    // 设置页面为A4纵向
    worksheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9, // A4
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
      },
    }
    
    // 设置默认字体
    worksheet.properties.defaultRowHeight = 20
    worksheet.properties.defaultColWidth = 10
    
    // 标题行
    worksheet.mergeCells('A1:H1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = '深圳莲花关怀团助念记录表'
    titleCell.font = { size: 18, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(1).height = 30
    
    // 编号（右上角）
    worksheet.mergeCells('I1:J1')
    const numberCell = worksheet.getCell('I1')
    numberCell.value = `了缘 生根之床` // 可以根据需要动态生成
    numberCell.alignment = { horizontal: 'right', vertical: 'middle' }
    
    let currentRow = 2
    
    // 辅助函数：添加表格行
    const addRow = (label: string, value: any, colSpan: number = 8) => {
      const row = worksheet.getRow(currentRow)
      row.getCell(1).value = label
      row.getCell(1).font = { bold: true }
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      
      if (colSpan > 1) {
        worksheet.mergeCells(currentRow, 2, currentRow, colSpan + 1)
      }
      row.getCell(2).value = value
      row.getCell(2).alignment = { vertical: 'middle' }
      
      // 添加边框
      for (let i = 1; i <= 10; i++) {
        const cell = row.getCell(i)
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      }
      
      currentRow++
      return row
    }
    
    // 基本信息行
    const basicRow = worksheet.getRow(currentRow)
    basicRow.getCell(1).value = '姓 名'
    basicRow.getCell(2).value = data.name
    basicRow.getCell(3).value = '性别'
    basicRow.getCell(4).value = data.gender
    basicRow.getCell(5).value = '年龄'
    basicRow.getCell(6).value = data.age
    basicRow.getCell(7).value = '学历'
    basicRow.getCell(8).value = data.education || ''
    currentRow++
    
    // 籍贯住址
    addRow('籍贯住址', data.address, 8)
    
    // 职业/单位
    const workRow = worksheet.getRow(currentRow)
    workRow.getCell(1).value = '职业/单位'
    worksheet.mergeCells(currentRow, 2, currentRow, 5)
    workRow.getCell(2).value = data.workplace || ''
    workRow.getCell(6).value = '地点'
    worksheet.mergeCells(currentRow, 7, currentRow, 9)
    workRow.getCell(7).value = data.workplace ? '□住生堂 □住宅医院 □家中 ☑医院仪馆 □其它地点' : ''
    currentRow++
    
    // 会损时间
    const reportRow = worksheet.getRow(currentRow)
    reportRow.getCell(1).value = '会损时间'
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    reportRow.getCell(2).value = data.reportDate
    reportRow.getCell(4).value = '会损原因'
    worksheet.mergeCells(currentRow, 5, currentRow, 9)
    reportRow.getCell(5).value = data.reportReason || ''
    currentRow++
    
    // 是否准备心脏起搏器
    const insuranceRow = worksheet.getRow(currentRow)
    insuranceRow.getCell(1).value = '是否准备心脏起搏器'
    insuranceRow.getCell(2).value = data.hasInsurance ? '☑' : '□'
    currentRow++
    
    // 助念开始时间
    const assistRow = worksheet.getRow(currentRow)
    assistRow.getCell(1).value = '助念开始时间'
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    assistRow.getCell(2).value = data.assistantStartTime || ''
    assistRow.getCell(4).value = '助念结束时间'
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    assistRow.getCell(5).value = ''
    assistRow.getCell(7).value = '助念时长'
    assistRow.getCell(8).value = data.assistantDuration || ''
    assistRow.getCell(9).value = '小时'
    currentRow++
    
    // 是否有家属
    const familyRow = worksheet.getRow(currentRow)
    familyRow.getCell(1).value = '是否有家属'
    familyRow.getCell(2).value = data.hasFamily ? '☑' : '□'
    familyRow.getCell(3).value = '家属人数'
    familyRow.getCell(4).value = data.familyCount || ''
    familyRow.getCell(5).value = '法名'
    worksheet.mergeCells(currentRow, 6, currentRow, 9)
    familyRow.getCell(6).value = data.dharmaName || ''
    currentRow++
    
    // 受戒情形
    const preceptsRow = worksheet.getRow(currentRow)
    preceptsRow.getCell(1).value = '受戒情形'
    preceptsRow.getCell(2).value = data.hasTakingRefuge ? '☑五戒' : '□五戒'
    preceptsRow.getCell(3).value = data.hasFivePrecepts ? '☑八关戒' : '□八关戒'
    preceptsRow.getCell(4).value = '修行情形'
    worksheet.mergeCells(currentRow, 5, currentRow, 9)
    preceptsRow.getCell(5).value = data.baptismType || ''
    currentRow++
    
    // 平生信仰
    const religionRow = worksheet.getRow(currentRow)
    religionRow.getCell(1).value = '平生信仰'
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    religionRow.getCell(2).value = data.religion || '□佛教教 □天主教 □回教 □其它'
    religionRow.getCell(4).value = '信仰程度'
    worksheet.mergeCells(currentRow, 5, currentRow, 9)
    currentRow++
    
    // 临终疾苦或是安详
    const deathRow = worksheet.getRow(currentRow)
    deathRow.getCell(1).value = '临终疾苦或是安详'
    deathRow.getCell(2).value = data.deathCondition === '安详' ? '☑安详' : '☑疾苦'
    deathRow.getCell(3).value = '临终家人是否愿意'
    deathRow.getCell(4).value = data.hasFamily2 ? '☑' : '□'
    deathRow.getCell(5).value = '亡者临终是否念佛'
    deathRow.getCell(6).value = data.hasChanting ? '☑' : '□'
    deathRow.getCell(7).value = '在医院或家中断气'
    worksheet.mergeCells(currentRow, 8, currentRow, 9)
    deathRow.getCell(8).value = '医院'
    currentRow++
    
    // 何时入殓
    const burialRow = worksheet.getRow(currentRow)
    burialRow.getCell(1).value = '何时入殓或火化'
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    burialRow.getCell(2).value = data.burialTime || ''
    burialRow.getCell(4).value = '有否慈善团体助念'
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    burialRow.getCell(5).value = data.hasLawyer ? '☑' : '□'
    burialRow.getCell(7).value = '有否法师居士开示'
    worksheet.mergeCells(currentRow, 8, currentRow, 9)
    burialRow.getCell(8).value = data.hasLawyer ? '☑' : '□'
    currentRow++
    
    // 兴趣爱好
    const hobbiesRow = worksheet.getRow(currentRow)
    hobbiesRow.getCell(1).value = '兴趣爱好'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    hobbiesRow.getCell(2).value = data.hobbies?.join('、') || '□看书 □登山 □唱歌 □旅游 □助人 □钓鱼 □其它'
    hobbiesRow.getCell(5).value = '个性习性'
    worksheet.mergeCells(currentRow, 6, currentRow, 9)
    hobbiesRow.getCell(6).value = data.personality || ''
    currentRow++
    
    // 对待子女
    const childrenRow = worksheet.getRow(currentRow)
    childrenRow.getCell(1).value = '对待子女'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    childrenRow.getCell(2).value = data.childrenAttitude?.join('、') || '☑慈教 ☑慈爱 □训斥'
    childrenRow.getCell(5).value = '对待长辈'
    worksheet.mergeCells(currentRow, 6, currentRow, 7)
    childrenRow.getCell(6).value = '☑孝养 ☑乱孝 □不孝'
    childrenRow.getCell(8).value = '有何理想'
    worksheet.mergeCells(currentRow, 9, currentRow, 9)
    currentRow++
    
    // 做何善事
    const goodDeedsRow = worksheet.getRow(currentRow)
    goodDeedsRow.getCell(1).value = '做何善事'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    goodDeedsRow.getCell(2).value = data.goodDeeds?.join('、') || '□印经 ☑供佛 □放生 □救难 □造佛像 ☑做生 □慈善寺庙 □其它'
    currentRow++
    
    // 有何心愿未了
    const wishesRow = worksheet.getRow(currentRow)
    wishesRow.getCell(1).value = '有何心愿未了'
    worksheet.mergeCells(currentRow, 2, currentRow, 9)
    worksheet.mergeCells(currentRow, 1, currentRow + 1, 1)
    wishesRow.getCell(2).value = data.unfinishedWishes || ''
    worksheet.getRow(currentRow).height = 30
    currentRow += 2
    
    // 生平事迹总结
    const summaryRow = worksheet.getRow(currentRow)
    summaryRow.getCell(1).value = '生平事迹总结'
    worksheet.mergeCells(currentRow, 2, currentRow, 9)
    worksheet.mergeCells(currentRow, 1, currentRow + 1, 1)
    summaryRow.getCell(2).value = data.lifeSummary || ''
    worksheet.getRow(currentRow).height = 30
    currentRow += 2
    
    // 主事家属
    const mainFamilyRow = worksheet.getRow(currentRow)
    mainFamilyRow.getCell(1).value = '主事家属姓 名'
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    mainFamilyRow.getCell(2).value = data.mainFamily.name
    mainFamilyRow.getCell(4).value = '电话'
    worksheet.mergeCells(currentRow, 5, currentRow, 6)
    mainFamilyRow.getCell(5).value = data.mainFamily.phone
    mainFamilyRow.getCell(7).value = '与往生者关系'
    worksheet.mergeCells(currentRow, 8, currentRow, 9)
    mainFamilyRow.getCell(8).value = `□夫 □妻 □儿 ☑女 □其它`
    currentRow++
    
    // 家属现住址
    const familyAddressRow = worksheet.getRow(currentRow)
    familyAddressRow.getCell(1).value = '家属现住城市区域'
    worksheet.mergeCells(currentRow, 2, currentRow, 9)
    familyAddressRow.getCell(2).value = data.familyAddress
    currentRow++
    
    // 添加所有单元格边框
    for (let row = 2; row < currentRow; row++) {
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getRow(row).getCell(col)
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      }
    }
    
    // 生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `助念记录表_${data.name}_${timestamp}.xlsx`
    const filePath = join(process.cwd(), 'public', fileName)
    
    await workbook.xlsx.writeFile(filePath)
    
    console.log(`✅ 助念记录表已生成: ${filePath}`)
    
    return {
      success: true,
      filePath,
      fileName,
      downloadUrl: `/public/${fileName}`,
    }
  }

  /**
   * 生成助念邀请承诺书
   */
  static async createInvitationLetter(data: { teamName: string; deceasedName: string; familyName: string }) {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('助念邀请承诺书')
    
    // 设置页面为A4纵向
    worksheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9,
      margins: {
        left: 0.75,
        right: 0.75,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    }
    
    // 设置列宽
    worksheet.columns = [
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
      { width: 5 },
    ]
    
    let currentRow = 1
    
    // 标题
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const titleCell = worksheet.getCell(`A${currentRow}`)
    titleCell.value = '助念邀请承诺书'
    titleCell.font = { size: 18, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(currentRow).height = 30
    currentRow++
    
    // 空行
    currentRow++
    
    // 称呼
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const greetingCell = worksheet.getCell(`A${currentRow}`)
    greetingCell.value = '南无阿弥陀佛！'
    greetingCell.font = { size: 14, bold: true }
    greetingCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 空行
    currentRow++
    
    // 正文开始
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const line1 = worksheet.getCell(`A${currentRow}`)
    line1.value = '尊敬的家属：'
    line1.font = { size: 12 }
    line1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true }
    worksheet.getRow(currentRow).height = 20
    currentRow++
    
    // 空行
    currentRow++
    
    // 正文内容
    const content = `    非常随喜赞叹您们发心为亲人助念，也感谢您们对我团的信任。人生之最后能够得到临终关怀是很难得的，这也是您们的家人善根福德所感。请您们及家属们珍惜这次助念的机缘，让我们一起努力，帮助您们的家人蒙佛力加持离苦得乐、往生西方极乐世界。`
    
    worksheet.mergeCells(`A${currentRow}:J${currentRow + 3}`)
    const contentCell = worksheet.getCell(`A${currentRow}`)
    contentCell.value = content
    contentCell.font = { size: 12 }
    contentCell.alignment = { horizontal: 'left', vertical: 'top', indent: 1, wrapText: true }
    worksheet.getRow(currentRow).height = 80
    currentRow += 4
    
    // 空行
    currentRow++
    
    // 注意事项标题
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const noticeTitle = worksheet.getCell(`A${currentRow}`)
    noticeTitle.value = '亡者家属注意事项：'
    noticeTitle.font = { size: 12, bold: true }
    noticeTitle.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    worksheet.getRow(currentRow).height = 20
    currentRow++
    
    // 空行
    currentRow++
    
    // 注意事项列表
    const notices = [
      '1.    承诺做到第一时间尽快赶到现场，并指定在亡者家族中说话能算数的主事家属负责全程配合衔接。',
      '2.    承诺做到 24 小时至诚恳切轮班助念时参与临终助念流程(每班至少有一位家属跟进)。',
      '3.    承诺做到助念流程中，劝告至亲家属不吸烟、不饮酒食肉及不杀生害命。',
      '4.    承诺做到助念现场任何一个班次中不随意进出、不随意走动、不打开手机、不说闲话、不打妄念、不打瞌睡、不嬉二郎腿及其它任何不恭敬的举止，若有孩子陪念不能在现场嬉闹。',
    ]
    
    for (const notice of notices) {
      worksheet.mergeCells(`A${currentRow}:J${currentRow + 1}`)
      const noticeCell = worksheet.getCell(`A${currentRow}`)
      noticeCell.value = notice
      noticeCell.font = { size: 11 }
      noticeCell.alignment = { horizontal: 'left', vertical: 'top', indent: 1, wrapText: true }
      worksheet.getRow(currentRow).height = 35
      currentRow += 2
    }
    
    // 空行
    currentRow++
    
    // 结尾说明
    const endingText = `    请仔细阅读亡者家属注意事项，若有违背，不听劝告者因果自负，本协会将会中止助念流程。请恭敬填写助念邀请承诺书及各种信息来集表。谢谢合作。`
    
    worksheet.mergeCells(`A${currentRow}:J${currentRow + 2}`)
    const endingCell = worksheet.getCell(`A${currentRow}`)
    endingCell.value = endingText
    endingCell.font = { size: 11 }
    endingCell.alignment = { horizontal: 'left', vertical: 'top', indent: 1, wrapText: true }
    worksheet.getRow(currentRow).height = 60
    currentRow += 3
    
    // 空行
    currentRow++
    
    // 承诺框
    worksheet.mergeCells(`A${currentRow}:J${currentRow + 3}`)
    const promiseBox = worksheet.getCell(`A${currentRow}`)
    promiseBox.value = `    尊敬的${data.teamName}，今特邀请贵团为 ${data.deceasedName}  临终助念佛号。并声明：助念期间严格遵照贵团团规，听从贵团负责人员安排，决无违背。南无阿弥陀佛！`
    promiseBox.font = { size: 12 }
    promiseBox.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true }
    promiseBox.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
    worksheet.getRow(currentRow).height = 70
    currentRow += 4
    
    // 空行
    currentRow++
    
    // 签名行
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const signatureCell = worksheet.getCell(`A${currentRow}`)
    signatureCell.value = `                                                                                主事家属签名：${data.familyName}`
    signatureCell.font = { size: 12 }
    signatureCell.alignment = { horizontal: 'right', vertical: 'middle' }
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 空行
    currentRow++
    
    // 落款
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    const footerCell = worksheet.getCell(`A${currentRow}`)
    footerCell.value = '深圳市莲花生命关怀志愿者协会'
    footerCell.font = { size: 12 }
    footerCell.alignment = { horizontal: 'right', vertical: 'middle' }
    worksheet.getRow(currentRow).height = 20
    
    // 生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `助念邀请承诺书_${data.deceasedName}_${timestamp}.xlsx`
    const filePath = join(process.cwd(), 'public', fileName)
    
    await workbook.xlsx.writeFile(filePath)
    
    console.log(`✅ 助念邀请承诺书已生成: ${filePath}`)
    
    return {
      success: true,
      filePath,
      fileName,
      downloadUrl: `/public/${fileName}`,
    }
  }

  /**
   * 生成深圳莲花关怀团关怀登记表
   */
  static async createCareRegistrationForm(data: {
    projectDate: string
    serialNumber: string
    name: string
    gender: '男' | '女'
    age: number
    religion?: string
    hasTakingRefuge?: boolean
    address: string
    illness?: string
    careDate?: string
    careDetails?: string
    familyName: string
    familyPhone: string
  }) {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('关怀登记表')
    
    // 设置页面为A4纵向
    worksheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    }
    
    // 设置列宽
    worksheet.columns = [
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
    ]
    
    let currentRow = 1
    
    // 标题
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`)
    const titleCell = worksheet.getCell(`A${currentRow}`)
    titleCell.value = '深圳莲花关怀团关怀登记表'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(currentRow).height = 30
    currentRow++
    
    // 项目日期和编号行
    const dateRow = worksheet.getRow(currentRow)
    dateRow.getCell(1).value = '项目日期：'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    dateRow.getCell(2).value = data.projectDate
    worksheet.mergeCells(currentRow, 5, currentRow, 8)
    dateRow.getCell(5).value = `了缘 生根之床`
    dateRow.getCell(5).alignment = { horizontal: 'right' }
    worksheet.getRow(currentRow).height = 20
    currentRow++
    
    // 基本信息行
    const basicRow = worksheet.getRow(currentRow)
    basicRow.getCell(1).value = '姓名'
    basicRow.getCell(2).value = data.name
    basicRow.getCell(3).value = '性别'
    basicRow.getCell(4).value = data.gender
    basicRow.getCell(5).value = '年龄'
    basicRow.getCell(6).value = data.age
    basicRow.getCell(7).value = '宗教信仰'
    basicRow.getCell(8).value = data.religion || '佛'
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 住址行
    const addressRow = worksheet.getRow(currentRow)
    addressRow.getCell(1).value = '住址'
    worksheet.mergeCells(currentRow, 2, currentRow, 8)
    addressRow.getCell(2).value = data.address
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 病况行
    const illnessRow = worksheet.getRow(currentRow)
    illnessRow.getCell(1).value = '病况'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    illnessRow.getCell(2).value = data.illness || ''
    illnessRow.getCell(5).value = '是否皈依受戒'
    worksheet.mergeCells(currentRow, 6, currentRow, 8)
    illnessRow.getCell(6).value = data.hasTakingRefuge ? '是' : '否'
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 关怀日期行
    const careDateRow = worksheet.getRow(currentRow)
    careDateRow.getCell(1).value = '关怀日期'
    worksheet.mergeCells(currentRow, 2, currentRow, 8)
    careDateRow.getCell(2).value = data.careDate || '参加莲友'
    worksheet.getRow(currentRow).height = 25
    currentRow++
    
    // 关怀状况大框
    worksheet.mergeCells(currentRow, 1, currentRow + 10, 1)
    const careStatusLabel = worksheet.getCell(currentRow, 1)
    careStatusLabel.value = '关怀状况（病况变化、饮食、睡眠、心念、对助念的态度及等等）'
    careStatusLabel.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    careStatusLabel.font = { size: 10 }
    
    worksheet.mergeCells(currentRow, 2, currentRow + 10, 8)
    const careDetailsCell = worksheet.getCell(currentRow, 2)
    careDetailsCell.value = data.careDetails || `同意义工关怀\n同意助念流程\n家属们助配合\n\n申请送花衣一套\n\n身高 172cm，体重 50 公斤`
    careDetailsCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    careDetailsCell.font = { size: 11 }
    
    // 设置大框的行高
    for (let i = 0; i < 11; i++) {
      worksheet.getRow(currentRow + i).height = 30
    }
    currentRow += 11
    
    // 添加所有单元格边框
    for (let row = 2; row <= currentRow; row++) {
      for (let col = 1; col <= 8; col++) {
        const cell = worksheet.getRow(row).getCell(col)
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        if (!cell.alignment) {
          cell.alignment = { vertical: 'middle' }
        }
      }
    }
    
    // 生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `关怀登记表_${data.name}_${timestamp}.xlsx`
    const filePath = join(process.cwd(), 'public', fileName)
    
    await workbook.xlsx.writeFile(filePath)
    
    console.log(`✅ 关怀登记表已生成: ${filePath}`)
    
    return {
      success: true,
      filePath,
      fileName,
      downloadUrl: `/public/${fileName}`,
    }
  }
}
