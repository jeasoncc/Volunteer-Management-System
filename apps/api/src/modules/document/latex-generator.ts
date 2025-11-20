import { join } from 'path'
import { writeFileSync, unlinkSync } from 'fs'
import { execSync } from 'child_process'

interface CareRegistrationData {
  // 项目日期
  projectDate: string
  // 编号
  serialNumber: string
  
  // 基本信息
  name: string
  gender: '男' | '女'
  age: number
  religion?: string
  belief?: string
  
  // 地址和联系
  address: string
  familyStatus: string
  familyPhone: string
  
  // 病况
  illness: string
  
  // 关怀日期和情况
  careDate?: string
  patientCondition?: string
  familyCondition?: string
  
  // 备注
  notes?: string
}

export class LatexGenerator {
  /**
   * 生成深圳莲花关怀团关怀登记表
   */
  static async generateCareRegistrationForm(data: CareRegistrationData) {
    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[UTF8]{ctex}
\\usepackage{geometry}
\\usepackage{array}

\\geometry{left=2.5cm,right=2.5cm,top=2.5cm,bottom=2.5cm}

\\begin{document}

\\begin{center}
\\Large\\textbf{深圳莲花关怀团关怀登记表}
\\end{center}

\\vspace{0.5cm}

\\noindent
项目日期：${data.projectDate} \\hfill ${data.serialNumber}

\\vspace{0.5cm}

\\begin{tabular}{|p{2cm}|p{3cm}|p{2cm}|p{2cm}|p{2cm}|p{2cm}|}
\\hline
\\textbf{姓名} & ${data.name} & \\textbf{性别} & ${data.gender} & \\textbf{年龄} & ${data.age} \\\\
\\hline
\\textbf{住址} & \\multicolumn{5}{p{11cm}|}{${data.address}} \\\\
\\hline
\\textbf{病况} & \\multicolumn{5}{p{11cm}|}{${data.illness}} \\\\
\\hline
\\textbf{关怀日期} & ${data.careDate || '参加莲友'} & \\multicolumn{4}{p{8cm}|}{\\textbf{病者状况}（病况变化、饮食、睡眠、心念、对助念的态度等）\\newline\\textbf{家属状况}（对助法、助念的认识和态度等）} \\\\
\\cline{1-2}
 & & \\multicolumn{4}{p{8cm}|}{${data.patientCondition || '同意义工关怀'}} \\\\
\\cline{1-2}
 & & \\multicolumn{4}{p{8cm}|}{同意助念流程} \\\\
\\cline{1-2}
 & & \\multicolumn{4}{p{8cm}|}{家属们助念配合} \\\\
\\hline
\\multicolumn{6}{|p{13.5cm}|}{\\textbf{申请送花衣一套}\\newline${data.notes || '身高 172cm，体重 50 斤'}} \\\\
\\hline
\\end{tabular}

\\vspace{1cm}

\\noindent
\\textbf{家属信息：}

\\begin{itemize}
\\item 家属姓名：${data.familyStatus}
\\item 联系电话：${data.familyPhone}
\\end{itemize}

\\end{document}
`

    // 生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `关怀登记表_${data.name}_${timestamp}`
    const texPath = join(process.cwd(), 'public', `${fileName}.tex`)
    const pdfPath = join(process.cwd(), 'public', `${fileName}.pdf`)
    
    // 写入 LaTeX 文件
    writeFileSync(texPath, latexContent, 'utf-8')
    
    try {
      // 编译 LaTeX 为 PDF
      execSync(`cd ${join(process.cwd(), 'public')} && xelatex -interaction=nonstopmode ${fileName}.tex`, {
        stdio: 'pipe'
      })
      
      // 清理临时文件
      const tempFiles = ['.aux', '.log', '.tex']
      tempFiles.forEach(ext => {
        try {
          unlinkSync(join(process.cwd(), 'public', `${fileName}${ext}`))
        } catch (e) {
          // 忽略删除错误
        }
      })
      
      console.log(`✅ 关怀登记表已生成: ${pdfPath}`)
      
      return {
        success: true,
        filePath: pdfPath,
        fileName: `${fileName}.pdf`,
        downloadUrl: `/public/${fileName}.pdf`,
      }
    } catch (error) {
      // 清理文件
      try {
        unlinkSync(texPath)
      } catch (e) {}
      
      throw new Error(`LaTeX 编译失败: ${error}`)
    }
  }

  /**
   * 生成助念邀请承诺书
   */
  static async generateInvitationLetter(data: {
    teamName: string
    deceasedName: string
    familyName: string
  }) {
    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[UTF8]{ctex}
\\usepackage{geometry}

\\geometry{left=3cm,right=3cm,top=3cm,bottom=3cm}

\\begin{document}

\\begin{center}
\\LARGE\\textbf{助念邀请承诺书}
\\end{center}

\\vspace{1cm}

\\noindent
南无阿弥陀佛！

\\vspace{0.5cm}

\\noindent
尊敬的家属：

\\vspace{0.5cm}

\\noindent
\\hspace{2em}非常随喜赞叹您们发心为亲人助念，也感谢您们对我团的信任。人生之最后能够得到临终关怀是很难得的，这也是您们的家人善根福德所感。请您们及家属们珍惜这次助念的机缘，让我们一起努力，帮助您们的家人蒙佛力加持离苦得乐、往生西方极乐世界。

\\vspace{0.5cm}

\\noindent
\\textbf{亡者家属注意事项：}

\\vspace{0.3cm}

\\noindent
\\textbf{1.} \\hspace{1em}承诺做到第一时间尽快赶到现场，并指定在亡者家族中说话能算数的主事家属负责全程配合衔接。

\\vspace{0.3cm}

\\noindent
\\textbf{2.} \\hspace{1em}承诺做到 24 小时至诚恳切轮班助念时参与临终助念流程（每班至少有一位家属跟进）。

\\vspace{0.3cm}

\\noindent
\\textbf{3.} \\hspace{1em}承诺做到助念流程中，劝告至亲家属不吸烟、不饮酒食肉及不杀生害命。

\\vspace{0.3cm}

\\noindent
\\textbf{4.} \\hspace{1em}承诺做到助念现场任何一个班次中不随意进出、不随意走动、不打开手机、不说闲话、不打妄念、不打瞌睡、不嬉二郎腿及其它任何不恭敬的举止，若有孩子陪念不能在现场嬉闹。

\\vspace{0.5cm}

\\noindent
\\hspace{2em}请仔细阅读亡者家属注意事项，若有违背，不听劝告者因果自负，本协会将会中止助念流程。请恭敬填写助念邀请承诺书及各种信息来集表。谢谢合作。

\\vspace{1cm}

\\noindent
\\fbox{\\parbox{\\textwidth}{
尊敬的\\textbf{${data.teamName}}，今特邀请贵团为 \\underline{\\hspace{3cm}} 临终助念佛号。并声明：助念期间严格遵照贵团团规，听从贵团负责人员安排，决无违背。南无阿弥陀佛！

\\vspace{1cm}

\\hfill 主事家属签名：\\underline{\\hspace{4cm}}
}}

\\vspace{1cm}

\\begin{flushright}
深圳市莲花生命关怀志愿者协会
\\end{flushright}

\\end{document}
`

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `助念邀请承诺书_${data.deceasedName}_${timestamp}`
    const texPath = join(process.cwd(), 'public', `${fileName}.tex`)
    const pdfPath = join(process.cwd(), 'public', `${fileName}.pdf`)
    
    writeFileSync(texPath, latexContent, 'utf-8')
    
    try {
      execSync(`cd ${join(process.cwd(), 'public')} && xelatex -interaction=nonstopmode ${fileName}.tex`, {
        stdio: 'pipe'
      })
      
      const tempFiles = ['.aux', '.log', '.tex']
      tempFiles.forEach(ext => {
        try {
          unlinkSync(join(process.cwd(), 'public', `${fileName}${ext}`))
        } catch (e) {}
      })
      
      console.log(`✅ 助念邀请承诺书已生成: ${pdfPath}`)
      
      return {
        success: true,
        filePath: pdfPath,
        fileName: `${fileName}.pdf`,
        downloadUrl: `/public/${fileName}.pdf`,
      }
    } catch (error) {
      try {
        unlinkSync(texPath)
      } catch (e) {}
      
      throw new Error(`LaTeX 编译失败: ${error}`)
    }
  }
}
