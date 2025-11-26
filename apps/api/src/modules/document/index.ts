import { Elysia, t } from 'elysia'
import { LatexGenerator } from './latex-generator'

export const documentModule = new Elysia({ prefix: '/api/document' })
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
