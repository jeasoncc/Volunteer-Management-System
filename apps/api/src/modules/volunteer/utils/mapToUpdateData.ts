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
    ...(body.birthDate !== undefined && { 
      birthDate: body.birthDate ? new Date(body.birthDate) : null 
    }),
    ...(body.avatar !== undefined && { avatar: body.avatar ?? null }),

    // 佛教信息
    ...(body.dharmaName !== undefined && { dharmaName: body.dharmaName ?? null }),
    ...(body.education !== undefined && { education: body.education ?? null }),
    ...(body.hasBuddhismFaith !== undefined && { hasBuddhismFaith: body.hasBuddhismFaith }),
    ...(body.refugeStatus !== undefined && { refugeStatus: body.refugeStatus ?? null }),
    ...(body.religiousBackground !== undefined && { religiousBackground: body.religiousBackground ?? null }),

    // 健康和其他信息
    ...(body.healthConditions !== undefined && { healthConditions: body.healthConditions ?? null }),
    ...(body.joinReason !== undefined && { joinReason: body.joinReason ?? null }),
    ...(body.hobbies !== undefined && { hobbies: body.hobbies ?? null }),
    ...(body.availableTimes !== undefined && { 
      availableTimes: body.availableTimes 
        ? (Array.isArray(body.availableTimes) ? JSON.stringify(body.availableTimes) : body.availableTimes)
        : null 
    }),
    ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact ?? null }),

    // 义工状态和岗位
    ...(body.volunteerStatus !== undefined && { volunteerStatus: body.volunteerStatus ?? null }),
    ...(body.severPosition !== undefined && { severPosition: body.severPosition ?? null }),
    ...(body.familyConsent !== undefined && { familyConsent: body.familyConsent ?? null }),
    ...(body.requireFullAttendance !== undefined && { requireFullAttendance: body.requireFullAttendance }),
    ...(body.attendanceTier !== undefined && { attendanceTier: body.attendanceTier }),

    // 系统字段
    updatedAt: new Date(),
  }
}
