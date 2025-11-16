import { InferInsertModel } from 'drizzle-orm'
import { volunteer } from '../../../db/schema'
import { VolunteerCreateDto } from '../model'
import { hashPassword } from '../../../lib/auth'

export async function mapToInsertData(
  body: VolunteerCreateDto,
  lotusId: string,
  hashedPassword: string,
): Promise<InferInsertModel<typeof volunteer>> {
  return {
    // ============== 用户提供的字段 ==============
    account:              body.account || body.phone,
    password:             hashedPassword, // 使用加密后的密码
    name:                 body.name,
    gender:               body.gender,
    phone:                body.phone,
    idNumber:             body.idNumber,
    volunteerId:          body.volunteerId ?? null, // 关键修复点！处理义工联编号
    email:                body.email ?? null,
    address:              body.address ?? null,
    wechat:               body.wechat ?? null,
    birthDate:            body.birthDate ? new Date(body.birthDate) : null,
    avatar:               body.avatar ?? null,
    dharmaName:           body.dharmaName ?? null, // 法名
    education:            body.education ?? null,
    hasBuddhismFaith:     body.hasBuddhismFaith ?? false,
    refugeStatus:         body.refugeStatus ?? null,
    healthConditions:     body.healthConditions ?? null,
    religiousBackground:  body.religiousBackground ?? null,
    joinReason:           body.joinReason ?? null,
    hobbies:              body.hobbies ?? null,
    availableTimes:       JSON.stringify(body.availableTimes || []),
    trainingRecords:      JSON.stringify(body.trainingRecords || []),
    emergencyContact:     body.emergencyContact ?? null,
    familyConsent:        body.familyConsent ?? null,
    severPosition:        body.severPosition ?? null,

    // ============== 系统生成的字段 ==============
    lotusId,
    status:               'active',
    volunteerStatus:      'applicant',
    createdAt:            new Date(),
    updatedAt:            new Date(),
    lotusRole:            'volunteer',
    isCertified:          false,
    serviceHours:         0,
    signedCommitment:     false,
    notes:                null,
    reviewer:             null,
    commitmentSignedDate: null,
  }
}
