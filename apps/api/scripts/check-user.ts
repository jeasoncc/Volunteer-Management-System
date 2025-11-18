#!/usr/bin/env bun
import { db } from '../src/db'
import { volunteer, admin } from '../src/db/schema'
import { eq } from 'drizzle-orm'

async function checkUser() {
  console.log('🔍 检查用户: 13800001001\n')

  try {
    // 查询义工信息
    const user = await db.query.volunteer.findFirst({
      where: eq(volunteer.account, '13800001001'),
      columns: {
        id: true,
        account: true,
        name: true,
        lotusRole: true,
        lotusId: true,
      },
    })

    if (!user) {
      console.log('❌ 未找到该用户\n')
      return
    }

    console.log('📋 用户信息:')
    console.log(`  ID: ${user.id}`)
    console.log(`  账号: ${user.account}`)
    console.log(`  姓名: ${user.name}`)
    console.log(`  莲花斋ID: ${user.lotusId}`)
    console.log(`  角色 (lotus_role): ${user.lotusRole}\n`)

    // 查询管理员信息
    const adminInfo = await db.query.admin.findFirst({
      where: eq(admin.id, user.id),
    })

    if (adminInfo) {
      console.log('👑 管理员信息:')
      console.log(`  管理员角色: ${adminInfo.role}`)
      console.log(`  部门: ${adminInfo.department}`)
      console.log(`  权限: ${JSON.stringify(adminInfo.permissions)}`)
      console.log(`  状态: ${adminInfo.isActive ? '激活' : '未激活'}\n`)
    } else {
      console.log('⚠️  该用户不是管理员\n')
    }

    // 问题诊断
    console.log('🔧 诊断结果:')
    if (user.lotusRole !== 'admin') {
      console.log(`  ❌ 问题: lotus_role 字段值为 "${user.lotusRole}"，应该为 "admin"`)
      console.log('  💡 解决方案: 需要将 lotus_role 字段更新为 "admin"\n')
    } else {
      console.log('  ✅ lotus_role 字段正确\n')
    }

    if (!adminInfo) {
      console.log('  ❌ 问题: admin 表中没有该用户的记录')
      console.log('  💡 解决方案: 需要在 admin 表中添加该用户的管理员信息\n')
    } else if (!adminInfo.isActive) {
      console.log('  ❌ 问题: 管理员账户未激活')
      console.log('  💡 解决方案: 需要将 is_active 字段设置为 true\n')
    }

  } catch (error) {
    console.error('💥 查询失败:', error)
  }
}

checkUser()
  .then(() => {
    console.log('✨ 检查完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error)
    process.exit(1)
  })
