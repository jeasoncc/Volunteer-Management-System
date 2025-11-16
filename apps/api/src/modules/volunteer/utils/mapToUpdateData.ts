import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { volunteer } from '../../../db/schema'
import { VolunteerUpdateDto } from '../model'

export function mapToUpdateData(
  body: VolunteerUpdateDto,
  existingData: InferSelectModel<typeof volunteer>,
): Partial<InferInsertModel<typeof volunteer>> {
  // 改为返回部分更新字段
  return {
    // 只包含需要更新的字段
    ...(body.name && { name: body.name }),
    ...(body.gender && { gender: body.gender }),
    ...(body.phone && { phone: body.phone }),
    ...(body.idNumber && { idNumber: body.idNumber }),
    ...(body.email !== undefined && { email: body.email ?? null }),
    ...(body.address !== undefined && { address: body.address ?? null }),
    ...(body.wechat !== undefined && { wechat: body.wechat ?? null }),
    ...(body.birthDate && { birthDate: new Date(body.birthDate) }), // 确保转换为Date
    ...(body.avatar !== undefined && { avatar: body.avatar ?? null }),

    // 系统字段
    updatedAt: new Date(),
  }
}
