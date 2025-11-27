/**
 * 检查义工同步状态
 * 用于验证数据库中的 syncToAttendance 字段
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import { eq } from 'drizzle-orm'

async function checkSyncStatus() {
  console.log('🔍 检查义工同步状态...\n')

  // 查询所有激活的义工
  const users = await db
    .select()
    .from(volunteer)
    .where(eq(volunteer.status, 'active'))

  console.log(`📊 共 ${users.length} 个激活义工\n`)

  // 统计
  const synced = users.filter(u => u.syncToAttendance)
  const unsynced = users.filter(u => !u.syncToAttendance)

  console.log(`✅ 已同步: ${synced.length}`)
  console.log(`❌ 未同步: ${unsynced.length}\n`)

  // 显示已同步的义工
  if (synced.length > 0) {
    console.log('已同步的义工:')
    synced.forEach(u => {
      console.log(`  ✅ ${u.name} (${u.lotusId})`)
    })
    console.log()
  }

  // 显示未同步的义工（前10个）
  if (unsynced.length > 0) {
    console.log('未同步的义工（前10个）:')
    unsynced.slice(0, 10).forEach(u => {
      console.log(`  ❌ ${u.name} (${u.lotusId})`)
    })
    if (unsynced.length > 10) {
      console.log(`  ... 还有 ${unsynced.length - 10} 个`)
    }
    console.log()
  }

  // 检查特定用户（如果提供了参数）
  const lotusId = process.argv[2]
  if (lotusId) {
    console.log(`\n🔍 检查特定用户: ${lotusId}`)
    const [user] = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.lotusId, lotusId))

    if (user) {
      console.log(`  姓名: ${user.name}`)
      console.log(`  状态: ${user.status}`)
      console.log(`  同步状态: ${user.syncToAttendance ? '✅ 已同步' : '❌ 未同步'}`)
      console.log(`  头像: ${user.avatar || '(无)'}`)
      console.log(`  更新时间: ${user.updatedAt}`)
    } else {
      console.log(`  ❌ 未找到该用户`)
    }
  }

  console.log('\n💡 使用方法:')
  console.log('  查看所有: bun run scripts/check-sync-status.ts')
  console.log('  查看特定用户: bun run scripts/check-sync-status.ts LZ-V-001')
}

checkSyncStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 检查失败:', error)
    process.exit(1)
  })
