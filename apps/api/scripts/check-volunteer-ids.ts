#!/usr/bin/env bun

/**
 * 检查 volunteerId 使用情况
 * 帮助决定是否需要这个字段
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import { isNull, isNotNull, sql } from 'drizzle-orm'

async function checkVolunteerIds() {
  console.log('📊 检查 volunteerId 使用情况...\n')

  // 统计总数
  const allUsers = await db.select().from(volunteer)
  const totalUsers = allUsers.length

  // 统计有 volunteerId 的用户
  const usersWithVolunteerId = await db
    .select()
    .from(volunteer)
    .where(isNotNull(volunteer.volunteerId))

  // 统计没有 volunteerId 的用户
  const usersWithoutVolunteerId = await db
    .select()
    .from(volunteer)
    .where(isNull(volunteer.volunteerId))

  console.log('📈 统计结果:')
  console.log(`   总用户数: ${totalUsers}`)
  console.log(
    `   有义工联编号: ${usersWithVolunteerId.length} (${((usersWithVolunteerId.length / totalUsers) * 100).toFixed(1)}%)`,
  )
  console.log(
    `   无义工联编号: ${usersWithoutVolunteerId.length} (${((usersWithoutVolunteerId.length / totalUsers) * 100).toFixed(1)}%)`,
  )

  if (usersWithVolunteerId.length > 0) {
    console.log('\n✅ 有义工联编号的用户 (前10个):')
    usersWithVolunteerId.slice(0, 10).forEach(user => {
      console.log(`   - ${user.name} (${user.lotusId}) → 义工联编号: ${user.volunteerId}`)
    })

    if (usersWithVolunteerId.length > 10) {
      console.log(`   ... 还有 ${usersWithVolunteerId.length - 10} 个用户`)
    }
  }

  if (usersWithoutVolunteerId.length > 0) {
    console.log('\n⚠️  没有义工联编号的用户 (前10个):')
    usersWithoutVolunteerId.slice(0, 10).forEach(user => {
      console.log(`   - ${user.name} (${user.lotusId})`)
    })

    if (usersWithoutVolunteerId.length > 10) {
      console.log(`   ... 还有 ${usersWithoutVolunteerId.length - 10} 个用户`)
    }
  }

  // 检查是否有重复的 volunteerId
  const duplicateCheck = await db
    .select({
      volunteerId: volunteer.volunteerId,
      count:       sql<number>`count(*)`,
    })
    .from(volunteer)
    .where(isNotNull(volunteer.volunteerId))
    .groupBy(volunteer.volunteerId)
    .having(sql`count(*) > 1`)

  if (duplicateCheck.length > 0) {
    console.log('\n⚠️  发现重复的义工联编号:')
    duplicateCheck.forEach(item => {
      console.log(`   - ${item.volunteerId}: ${item.count} 个用户`)
    })
  } else {
    console.log('\n✅ 没有重复的义工联编号')
  }

  console.log('\n💡 建议:')
  if (usersWithVolunteerId.length === 0) {
    console.log('   - 没有用户使用义工联编号')
    console.log('   - 建议：可以考虑移除这个字段')
  } else if (usersWithVolunteerId.length < totalUsers * 0.1) {
    console.log('   - 只有少数用户有义工联编号')
    console.log('   - 建议：保留字段，但明确它是可选的')
  } else {
    console.log('   - 有相当数量的用户使用义工联编号')
    console.log('   - 建议：保留字段，用于对接义工联系统')
  }

  console.log('\n📚 相关文档:')
  console.log('   - docs/DATA_MODEL_CLARIFICATION.md')

  process.exit(0)
}

checkVolunteerIds().catch(console.error)
