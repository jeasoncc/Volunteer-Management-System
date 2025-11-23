/**
 * 设置管理员权限
 * - 陈璋 → 超级管理员 (super)
 * - 刘银萍 → 普通管理员 (admin)
 */

import { db } from '../src/db'
import { volunteer, admin } from '../src/db/schema'
import { eq } from 'drizzle-orm'

async function setupAdmins() {
  try {
    console.log('🔧 开始设置管理员权限\n')

    // 1. 处理陈璋 - 超级管理员
    console.log('1️⃣  处理陈璋账号 → 超级管理员')
    const [chenzhang] = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.name, '陈璋'))
      .limit(1)

    if (!chenzhang) {
      console.error('   ❌ 未找到陈璋账号')
    } else {
      console.log(`   ✅ 找到账号: ${chenzhang.name} (ID: ${chenzhang.id}, Account: ${chenzhang.account})`)

      // 更新 volunteer 表角色
      await db
        .update(volunteer)
        .set({ lotusRole: 'admin' })
        .where(eq(volunteer.id, chenzhang.id))

      // 检查 admin 表是否已有记录
      const [existingAdmin] = await db
        .select()
        .from(admin)
        .where(eq(admin.id, chenzhang.id))

      if (existingAdmin) {
        // 更新为超级管理员
        await db
          .update(admin)
          .set({ 
            role: 'super',
            isActive: true,
          })
          .where(eq(admin.id, chenzhang.id))
        console.log('   📝 已更新为超级管理员 (super)')
      } else {
        // 创建超级管理员记录
        await db.insert(admin).values({
          id: chenzhang.id,
          role: 'super',
          permissions: null,
          isActive: true,
        })
        console.log('   📝 已创建超级管理员记录 (super)')
      }
    }

    // 2. 处理刘银萍 - 普通管理员
    console.log('\n2️⃣  处理刘银萍账号 → 普通管理员')
    const [liuyinping] = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.name, '刘银萍'))
      .limit(1)

    if (!liuyinping) {
      console.error('   ❌ 未找到刘银萍账号')
    } else {
      console.log(`   ✅ 找到账号: ${liuyinping.name} (ID: ${liuyinping.id}, Account: ${liuyinping.account})`)

      // 更新 volunteer 表角色
      await db
        .update(volunteer)
        .set({ lotusRole: 'admin' })
        .where(eq(volunteer.id, liuyinping.id))

      // 检查 admin 表是否已有记录
      const [existingAdmin] = await db
        .select()
        .from(admin)
        .where(eq(admin.id, liuyinping.id))

      if (existingAdmin) {
        // 更新为普通管理员
        await db
          .update(admin)
          .set({ 
            role: 'admin',
            isActive: true,
          })
          .where(eq(admin.id, liuyinping.id))
        console.log('   📝 已更新为普通管理员 (admin)')
      } else {
        // 创建普通管理员记录
        await db.insert(admin).values({
          id: liuyinping.id,
          role: 'admin',
          permissions: null,
          isActive: true,
        })
        console.log('   📝 已创建普通管理员记录 (admin)')
      }
    }

    // 3. 显示当前所有管理员
    console.log('\n3️⃣  当前所有管理员列表')
    const allAdmins = await db
      .select({
        id: volunteer.id,
        name: volunteer.name,
        account: volunteer.account,
        lotusRole: volunteer.lotusRole,
        adminRole: admin.role,
        isActive: admin.isActive,
      })
      .from(volunteer)
      .leftJoin(admin, eq(volunteer.id, admin.id))
      .where(eq(volunteer.lotusRole, 'admin'))

    console.log('   📋 管理员列表:')
    allAdmins.forEach(a => {
      const roleText = a.adminRole === 'super' ? '超级管理员' : a.adminRole === 'admin' ? '普通管理员' : '操作员'
      const statusText = a.isActive ? '✅ 激活' : '❌ 未激活'
      console.log(`      - ${a.name} (${a.account}) - ${roleText} ${statusText}`)
    })

    console.log('\n✅ 所有操作完成！')

  } catch (error) {
    console.error('❌ 操作失败:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

setupAdmins()


