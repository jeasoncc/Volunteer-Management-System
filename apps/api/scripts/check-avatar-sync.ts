#!/usr/bin/env bun

/**
 * 检查头像同步状态
 * 统计有多少用户有头像，多少用户没有头像
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import { isNull, isNotNull } from 'drizzle-orm'

async function checkAvatarSync() {
  console.log('📊 检查头像同步状态...\n')

  // 统计总用户数
  const allUsers = await db.select().from(volunteer)
  const totalUsers = allUsers.length

  // 统计有头像的用户
  const usersWithAvatar = await db.select().from(volunteer).where(isNotNull(volunteer.avatar))

  // 统计没有头像的用户
  const usersWithoutAvatar = await db.select().from(volunteer).where(isNull(volunteer.avatar))

  console.log('📈 统计结果:')
  console.log(`   总用户数: ${totalUsers}`)
  console.log(
    `   有头像: ${usersWithAvatar.length} (${((usersWithAvatar.length / totalUsers) * 100).toFixed(1)}%)`,
  )
  console.log(
    `   无头像: ${usersWithoutAvatar.length} (${((usersWithoutAvatar.length / totalUsers) * 100).toFixed(1)}%)`,
  )

  if (usersWithoutAvatar.length > 0) {
    console.log('\n⚠️  没有头像的用户 (前10个):')
    usersWithoutAvatar.slice(0, 10).forEach(user => {
      console.log(`   - ${user.name} (${user.lotusId})`)
    })

    if (usersWithoutAvatar.length > 10) {
      console.log(`   ... 还有 ${usersWithoutAvatar.length - 10} 个用户`)
    }
  }

  console.log('\n💡 提示:')
  console.log('   - 考勤机只能同步有头像的用户')
  console.log('   - 考勤机会自动推送人脸照片到 /api/v1/user/inf_photo')
  console.log('   - 如果用户已有头像，系统会跳过重复同步')

  process.exit(0)
}

checkAvatarSync().catch(console.error)
