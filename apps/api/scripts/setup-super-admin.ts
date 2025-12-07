/**
 * 设置超级管理员脚本
 * 用于将陈璋账号升级为超级管理员，并清理测试管理员
 */

import { db } from '../src/db'
import { volunteer, admin } from '../src/db/schema'
import { eq, and, ne } from 'drizzle-orm'

async function setupSuperAdmin() {
  try {
    console.log('🔍 查找陈璋账号...')
    
    // 查找陈璋的账号
    const chenzhang = await db
      .select()
      .from(volunteer)
      .where(eq(volunteer.name, '陈璋'))
      .limit(1)

    if (!chenzhang || chenzhang.length === 0) {
      console.error('❌ 未找到陈璋账号')
      process.exit(1)
    }

    const user = chenzhang[0]
    console.log(`✅ 找到账号: ${user.name} (ID: ${user.id}, Account: ${user.account})`)

    // 更新 volunteer 表，设置为 admin 角色
    console.log('📝 更新 volunteer 表角色为 admin...')
    await db
      .update(volunteer)
      .set({ lotusRole: 'admin' })
      .where(eq(volunteer.id, user.id))

    // 检查 admin 表是否已有记录
    const existingAdmin = await db
      .select()
      .from(admin)
      .where(eq(admin.id, user.id))
      .limit(1)

    if (existingAdmin && existingAdmin.length > 0) {
      // 更新为超级管理员
      console.log('📝 更新 admin 表角色为 super...')
      await db
        .update(admin)
        .set({ 
          role: 'super',
          isActive: true,
        })
        .where(eq(admin.id, user.id))
    } else {
      // 创建超级管理员记录
      console.log('📝 创建 admin 表记录，角色为 super...')
      await db.insert(admin).values({
        id: user.id,
        role: 'super',
        permissions: null,
        isActive: true,
      })
    }

    console.log('✅ 陈璋账号已升级为超级管理员')

    // 查找并删除其他测试管理员
    console.log('\n🔍 查找其他管理员账号...')
    const allAdmins = await db
      .select({
        id: volunteer.id,
        name: volunteer.name,
        account: volunteer.account,
        lotusRole: volunteer.lotusRole,
        adminRole: admin.role,
      })
      .from(volunteer)
      .leftJoin(admin, eq(volunteer.id, admin.id))
      .where(eq(volunteer.lotusRole, 'admin'))

    console.log('📋 当前所有管理员:')
    allAdmins.forEach(a => {
      console.log(`  - ${a.name} (${a.account}) - ${a.adminRole || 'no admin record'}`)
    })

    // 删除其他管理员（保留陈璋）
    const otherAdmins = allAdmins.filter(a => a.id !== user.id)
    
    if (otherAdmins.length > 0) {
      console.log(`\n🗑️  删除 ${otherAdmins.length} 个测试管理员...`)
      
      for (const testAdmin of otherAdmins) {
        console.log(`  删除: ${testAdmin.name} (${testAdmin.account})`)
        
        // 先删除 admin 表记录
        await db.delete(admin).where(eq(admin.id, testAdmin.id))
        
        // 将 volunteer 表角色改回 volunteer
        await db
          .update(volunteer)
          .set({ lotusRole: 'volunteer' })
          .where(eq(volunteer.id, testAdmin.id))
      }
      
      console.log('✅ 测试管理员已清理')
    } else {
      console.log('ℹ️  没有其他管理员需要清理')
    }

    console.log('\n✅ 所有操作完成！')
    console.log(`\n超级管理员信息:`)
    console.log(`  姓名: ${user.name}`)
    console.log(`  账号: ${user.account}`)
    console.log(`  角色: super admin`)

  } catch (error) {
    console.error('❌ 操作失败:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

setupSuperAdmin()







