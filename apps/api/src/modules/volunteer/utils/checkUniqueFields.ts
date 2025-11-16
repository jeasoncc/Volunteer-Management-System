import { eq } from 'drizzle-orm'
import { MySqlTransaction } from 'drizzle-orm/mysql-core'
import { volunteer } from '../../../db/schema'
import { ValidationError } from '../../../utils/errors'
import { VolunteerCreateDto } from '../model'

export async function checkUniqueFields(
  tx: MySqlTransaction<any, any, any, any>,
  body: VolunteerCreateDto,
): Promise<void> {
  // 明确指定返回 Promise<void>
  console.log('开始检查唯一字段')

  // 定义检查项数组（明确指定字段类型）
  const checks: {
    field:   keyof typeof volunteer.$inferSelect
    value:   string | undefined
    message: string
  }[] = [
    { field: 'account', value: body.account, message: '登录账号已存在' },
    { field: 'idNumber', value: body.idNumber, message: '身份证号已存在' },
    { field: 'phone', value: body.phone, message: '手机号已存在' },
    { field: 'email', value: body.email, message: '邮箱已存在' },
    { field: 'lotusId', value: body.lotusId, message: '莲花斋ID已存在' },
    { field: 'volunteerId', value: body.volunteerId, message: '义工编号已存在' },
  ]

  // 逐个检查每个字段
  for (const { field, value, message } of checks) {
    if (value) {
      console.log(`检查字段: ${field}, 值: ${value}`)

      const existing = await tx.select().from(volunteer).where(eq(volunteer[field], value)).limit(1)

      console.log(`查询结果:`, existing)

      if (existing.length > 0) {
        console.log(`字段 ${field} 的值 ${value} 已存在`)

        throw new ValidationError(message, field)
      }
    }
  }

  console.log('所有唯一字段检查通过')
}
