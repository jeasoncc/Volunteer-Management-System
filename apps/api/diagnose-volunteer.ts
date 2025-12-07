/**
 * 诊断义工数据问题
 */

import { db } from './src/db'
import { volunteer } from './src/db/schema'
import { like, or } from 'drizzle-orm'

const searchName = '史栓香'

console.log('🔍 诊断义工数据问题')
console.log('='.repeat(80))
console.log(`搜索姓名: ${searchName}`)
console.log('='.repeat(80))

// 1. 精确搜索
console.log('\n1️⃣  精确搜索:')
const exactMatch = await db
  .select()
  .from(volunteer)
  .where(like(volunteer.name, searchName))

if (exactMatch.length > 0) {
  console.log(`✅ 找到 ${exactMatch.length} 个精确匹配:`)
  exactMatch.forEach(v => {
    console.log(`   - ${v.name} (${v.lotusId}) - 手机: ${v.phone}`)
  })
} else {
  console.log('❌ 没有找到精确匹配')
}

// 2. 模糊搜索
console.log('\n2️⃣  模糊搜索:')
const fuzzyMatch = await db
  .select()
  .from(volunteer)
  .where(like(volunteer.name, `%${searchName}%`))

if (fuzzyMatch.length > 0) {
  console.log(`✅ 找到 ${fuzzyMatch.length} 个模糊匹配:`)
  fuzzyMatch.forEach(v => {
    console.log(`   - ${v.name} (${v.lotusId}) - 手机: ${v.phone}`)
  })
} else {
  console.log('❌ 没有找到模糊匹配')
}

// 3. 搜索包含"史"、"栓"、"香"的义工
console.log('\n3️⃣  搜索包含单个字的义工:')
const charMatch = await db
  .select()
  .from(volunteer)
  .where(
    or(
      like(volunteer.name, '%史%'),
      like(volunteer.name, '%栓%'),
      like(volunteer.name, '%香%')
    )
  )

if (charMatch.length > 0) {
  console.log(`✅ 找到 ${charMatch.length} 个包含相关字的义工:`)
  charMatch.forEach(v => {
    console.log(`   - ${v.name} (${v.lotusId}) - 手机: ${v.phone}`)
  })
} else {
  console.log('❌ 没有找到包含相关字的义工')
}

// 4. 检查所有义工的姓名（查看是否有编码问题）
console.log('\n4️⃣  检查所有义工姓名（前20个）:')
const allVolunteers = await db
  .select({
    name: volunteer.name,
    lotusId: volunteer.lotusId,
    phone: volunteer.phone,
  })
  .from(volunteer)
  .limit(20)

console.log(`总共 ${allVolunteers.length} 个义工:`)
allVolunteers.forEach((v, index) => {
  console.log(`   ${index + 1}. ${v.name} (${v.lotusId})`)
})

// 5. 检查是否有重复的义工编号
console.log('\n5️⃣  检查重复的义工编号:')
const duplicateVolunteerIds = await db
  .select({
    volunteerId: volunteer.volunteerId,
  })
  .from(volunteer)
  .where(like(volunteer.volunteerId, '%'))

const volunteerIdMap = new Map<string, number>()
duplicateVolunteerIds.forEach(v => {
  if (v.volunteerId) {
    volunteerIdMap.set(v.volunteerId, (volunteerIdMap.get(v.volunteerId) || 0) + 1)
  }
})

const duplicates = Array.from(volunteerIdMap.entries()).filter(([_, count]) => count > 1)
if (duplicates.length > 0) {
  console.log(`⚠️  发现 ${duplicates.length} 个重复的义工编号:`)
  duplicates.forEach(([id, count]) => {
    console.log(`   - ${id}: ${count} 次`)
  })
} else {
  console.log('✅ 没有重复的义工编号')
}

// 6. 检查最近创建的义工
console.log('\n6️⃣  最近创建的义工（最新10个）:')
const recentVolunteers = await db
  .select({
    name: volunteer.name,
    lotusId: volunteer.lotusId,
    phone: volunteer.phone,
    volunteerId: volunteer.volunteerId,
    createdAt: volunteer.createdAt,
  })
  .from(volunteer)
  .orderBy(volunteer.createdAt)
  .limit(10)

recentVolunteers.forEach((v, index) => {
  console.log(`   ${index + 1}. ${v.name} (${v.lotusId}) - 义工号: ${v.volunteerId || '无'} - 创建时间: ${v.createdAt}`)
})

console.log('\n' + '='.repeat(80))
console.log('诊断完成！')
console.log('='.repeat(80))

process.exit(0)
