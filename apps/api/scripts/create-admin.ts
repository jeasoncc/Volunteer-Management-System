/**
 * 创建管理员账号脚本
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'

async function createAdmin() {
  try {
    console.log('🔍 检查是否已存在 admin 账号...')
    
    // 检查是否已存在
    const existing = await db.query.volunteer.findFirst({
      where: eq(volunteer.account, 'admin')
    })

    if (existing) {
      console.log('✅ admin 账号已存在')
      console.log('账号:', existing.account)
      console.log('姓名:', existing.name)
      console.log('莲花斋ID:', existing.lotusId)
      return
    }

    console.log('📝 创建 admin 账号...')

    // 生成密码哈希
    const passwordHash = await bcrypt.hash('admin123', 10)

    // 创建管理员账号
    const [admin] = await db.insert(volunteer).values({
      account: 'admin',
      password: passwordHash,
      name: '系统管理员',
      phone: '13800138000',
      idNumber: '000000000000000000',
      gender: 'male',
      lotusId: 'LZ-ADMIN-001',
      lotusRole: 'admin',
      volunteerStatus: 'registered',
    })

    console.log('✅ 管理员账号创建成功！')
    console.log('账号: admin')
    console.log('密码: admin123')
    console.log('莲花斋ID: LZ-ADMIN-001')
    
  } catch (error) {
    console.error('❌ 创建失败:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

createAdmin()
