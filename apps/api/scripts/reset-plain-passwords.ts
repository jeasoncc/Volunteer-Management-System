#!/usr/bin/env bun

/**
 * 重置明文密码
 * 将所有明文密码（如 '123456'）加密
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import { hashPassword } from '../src/lib/auth'
import { eq } from 'drizzle-orm'

async function resetPlainPasswords() {
  console.log('🔐 开始检查和重置明文密码...\n')

  // 获取所有用户
  const allUsers = await db.select().from(volunteer)

  console.log(`📊 共 ${allUsers.length} 个用户\n`)

  let resetCount = 0
  let skippedCount = 0

  for (const user of allUsers) {
    // 检查密码是否是明文（bcrypt 加密后的密码以 $2b$ 开头）
    if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2a$')) {
      console.log(`🔄 重置用户: ${user.name} (${user.lotusId})`)
      console.log(`   原密码: ${user.password}`)

      // 加密密码
      const hashedPassword = await hashPassword(user.password)

      // 更新数据库
      await db.update(volunteer).set({ password: hashedPassword }).where(eq(volunteer.id, user.id))

      console.log(`   ✅ 已加密\n`)
      resetCount++
    } else {
      skippedCount++
    }
  }

  console.log('📊 处理完成:')
  console.log(`   重置密码: ${resetCount} 个用户`)
  console.log(`   跳过: ${skippedCount} 个用户（密码已加密）`)

  if (resetCount > 0) {
    console.log('\n💡 提示:')
    console.log('   - 所有明文密码已加密')
    console.log('   - 用户可以使用原密码登录')
    console.log('   - 建议用户登录后修改密码')
  }

  process.exit(0)
}

resetPlainPasswords().catch(console.error)
