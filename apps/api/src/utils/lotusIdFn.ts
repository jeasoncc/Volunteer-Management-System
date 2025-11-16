import { and, eq, inArray, like } from 'drizzle-orm'
import { db } from '../db'
import { volunteer } from '../db/schema'

// 类型码映射
const VOLUNTEER_TYPES = {
  REGULAR: 'V',
  SPECIAL: 'S',
  ADMIN:   'A',
} as const

/**
 * 生成随机6位数字 + Luhn校验码
 */
function generateRandomCode(): string {
  const random6Digits = Math.floor(100000 + Math.random() * 900000).toString()
  const luhnCheckDigit = calculateLuhnCheckDigit(random6Digits)
  return random6Digits + luhnCheckDigit
}

/**
 * Luhn算法校验码生成
 */
function calculateLuhnCheckDigit(partialCode: string): string {
  const sum = partialCode
    .split('')
    .reverse()
    .map((char, idx) => {
      let digit = parseInt(char, 10)
      if (idx % 2 === 0) digit *= 2
      return digit > 9 ? digit - 9 : digit
    })
    .reduce((acc, val) => acc + val, 0)

  return ((10 - (sum % 10)) % 10).toString()
}

/**
 * 生成唯一义工编号（自动去重）
 */
export async function generateLotusId(
  type: keyof typeof VOLUNTEER_TYPES = 'REGULAR',
  tx = db,
): Promise<string> {
  let attempts = 0
  const maxAttempts = 5 // 防止无限循环

  while (attempts < maxAttempts) {
    const candidate = `LZ-${VOLUNTEER_TYPES[type]}-${generateRandomCode()}`

    // 检查是否已存在
    const [existing] = await tx
      .select()
      .from(volunteer)
      .where(eq(volunteer.lotusId, candidate))
      .limit(1)

    if (!existing) return candidate

    attempts++
  }

  throw new Error('无法生成唯一义工编号，请重试')
}

/**
 * 批量生成义工编号（高性能版）
 */
export async function generateVolunteerIds(
  count: number,
  type: keyof typeof VOLUNTEER_TYPES = 'REGULAR',
  tx = db,
): Promise<string[]> {
  const ids = new Set<string>()
  let attempts = 0

  while (ids.size < count && attempts < count * 2) {
    const candidate = `LZ-${VOLUNTEER_TYPES[type]}-${generateRandomCode()}`
    ids.add(candidate)
    attempts++
  }

  // 批量检查数据库是否存在
  const existingIds = await tx
    .select()
    .from(volunteer)
    .where(
      and(
        like(volunteer.lotusId, `LZ-${VOLUNTEER_TYPES[type]}-%`),
        inArray(volunteer.lotusId, [...ids]),
      ),
    )
    .fields({ lotusId: true })

  const existingSet = new Set(existingIds.map((r: { lotusId: any }) => r.lotusId))
  const validIds = [...ids].filter(id => !existingSet.has(id))

  if (validIds.length >= count) {
    return validIds.slice(0, count)
  }

  // 补充不足部分
  const additionalIds = await generateVolunteerIds(count - validIds.length, type, tx)
  return [...validIds, ...additionalIds]
}
