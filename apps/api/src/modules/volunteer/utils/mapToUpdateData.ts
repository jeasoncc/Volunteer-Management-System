import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { volunteer } from '../../../db/schema'
import { VolunteerUpdateDto } from '../model'

export function mapToUpdateData(
  body: VolunteerUpdateDto,
  existingData: InferSelectModel<typeof volunteer>,
): Partial<InferInsertModel<typeof volunteer>> {
  // 改为返回部分更新字段
  return {
    // 基本信息
    ...(body.name && { name: body.name }),
    ...(body.gender && { gender: body.gender }),
    ...(body.phone && { phone: body.phone }),
    ...(body.idNumber && { idNumber: body.idNumber }),
    ...(body.email !== undefined && { email: body.email ?? null }),
    ...(body.address !== undefined && { address: body.address ?? null }),
    ...(body.wechat !== undefined && { wechat: body.wechat ?? null }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }), // 确保转换为Date
    ...(body.avatar !== undefined && { avatar: body.avatar ?? null }),

    // 佛教信息
    ...(body.dharmaName !== undefined && { dharmaName: body.dharmaName ?? null }),
    ...(body.education && { education: body.education }),
    ...(body.hasBuddhismFaith !== undefined && { hasBuddhismFaith: body.hasBuddhismFaith }),
    ...(body.refugeStatus && { refugeStatus: body.refugeStatus }),
    ...(body.religiousBackground && { religiousBackground: body.religiousBackground }),

    // 健康和其他信息
    ...(body.healthConditions && { healthConditions: body.healthConditions }),
    ...(body.joinReason !== undefined && { joinReason: body.joinReason ?? null }),
    ...(body.hobbies !== undefined && { hobbies: body.hobbies ?? null }),
    ...(body.availableTimes !== undefined && { availableTimes: body.availableTimes ?? null }),
    ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact ?? null }),

    // 义工状态和岗位
    ...(body.volunteerStatus && { volunteerStatus: body.volunteerStatus }),
    ...(body.severPosition && { severPosition: body.severPosition }),
    ...(body.familyConsent && { familyConsent: body.familyConsent }),

    // 系统字段
    updatedAt: new Date(),
  }
}
