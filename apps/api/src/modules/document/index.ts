import { Elysia, t } from 'elysia'
import { documentService } from './service'
import { LatexGenerator } from './latex-generator'

export const documentModule = new Elysia({ prefix: 'api/document' })
  .get('excel', () => documentService.createExcel())
  .post('care-record', async ({ body }) => {
    return await documentService.createCareRecordForm(body)
  }, {
    body: t.Object({
      // 基本信息
      name: t.String(),
      gender: t.Union([t.Literal('男'), t.Literal('女')]),
      age: t.Number(),
      education: t.Optional(t.String()),
      address: t.String(),
      workplace: t.Optional(t.String()),
      
      // 报损信息
      reportDate: t.String(),
      reportReason: t.Optional(t.String()),
      hasInsurance: t.Boolean(),
      
      // 助念信息
      assistantStartTime: t.Optional(t.String()),
      assistantDuration: t.Optional(t.String()),
      hasFamily: t.Boolean(),
      familyCount: t.Optional(t.Number()),
      
      // 法名和受戒
      dharmaName: t.Optional(t.String()),
      hasTakingRefuge: t.Boolean(),
      hasFivePrecepts: t.Boolean(),
      hasBodhisattvaPrecepts: t.Boolean(),
      hasOtherPrecepts: t.Boolean(),
      
      // 受戒情形
      baptismType: t.Optional(t.Union([
        t.Literal('修行打坐'),
        t.Literal('听经'),
        t.Literal('诵经'),
        t.Literal('念佛'),
        t.Literal('拜忏'),
      ])),
      
      // 平生信仰
      religion: t.Optional(t.Union([
        t.Literal('佛教教'),
        t.Literal('天主教'),
        t.Literal('回教'),
        t.Literal('其它'),
      ])),
      
      // 临终状态
      deathCondition: t.Union([t.Literal('安详'), t.Literal('疾苦')]),
      hasFamily2: t.Boolean(),
      hasChanting: t.Boolean(),
      hasSuffering: t.Boolean(),
      hasMovement: t.Boolean(),
      
      // 入殓信息
      burialTime: t.Optional(t.String()),
      hasLawyer: t.Boolean(),
      
      // 兴趣爱好
      hobbies: t.Optional(t.Array(t.String())),
      personality: t.Optional(t.String()),
      
      // 对待子女
      childrenAttitude: t.Optional(t.Array(t.String())),
      
      // 善事
      goodDeeds: t.Optional(t.Array(t.String())),
      
      // 心愿
      unfinishedWishes: t.Optional(t.String()),
      
      // 生平总结
      lifeSummary: t.Optional(t.String()),
      
      // 主事家属
      mainFamily: t.Object({
        name: t.String(),
        phone: t.String(),
        relationship: t.Union([
          t.Literal('夫'),
          t.Literal('妻'),
          t.Literal('儿'),
          t.Literal('女'),
          t.Literal('其它'),
        ]),
      }),
      
      // 家属地址
      familyAddress: t.String(),
    }),
  })
  // 生成关怀登记表（LaTeX）
  .post('care-registration', async ({ body }) => {
    return await LatexGenerator.generateCareRegistrationForm(body)
  }, {
    body: t.Object({
      projectDate: t.String(),
      serialNumber: t.String(),
      name: t.String(),
      gender: t.Union([t.Literal('男'), t.Literal('女')]),
      age: t.Number(),
      religion: t.Optional(t.String()),
      belief: t.Optional(t.String()),
      address: t.String(),
      familyStatus: t.String(),
      familyPhone: t.String(),
      illness: t.String(),
      careDate: t.Optional(t.String()),
      patientCondition: t.Optional(t.String()),
      familyCondition: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  })
  // 生成助念邀请承诺书（LaTeX）
  .post('invitation-letter', async ({ body }) => {
    return await LatexGenerator.generateInvitationLetter(body)
  }, {
    body: t.Object({
      teamName: t.String(),
      deceasedName: t.String(),
      familyName: t.String(),
    }),
  })
