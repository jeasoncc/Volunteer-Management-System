/**
 * 创建测试义工数据
 */

import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import bcrypt from 'bcrypt'

async function createTestVolunteer() {
  try {
    console.log('📝 创建测试义工数据...')
    
    // 生成密码哈希
    const passwordHash = await bcrypt.hash('123456', 10)
    
    // 创建测试义工
    const [volunteer1] = await db.insert(volunteer).values({
      account: 'volunteer1',
      password: passwordHash,
      name: '张三',
      phone: '13800138001',
      idNumber: '110101199003071234',
      gender: 'male',
      lotusId: 'LZ-VOL-001',
      lotusRole: 'volunteer',
      volunteerStatus: 'registered',
    }).returning()
    
    const [volunteer2] = await db.insert(volunteer).values({
      account: 'volunteer2',
      password: passwordHash,
      name: '李四',
      phone: '13800138002',
      idNumber: '110101199003071235',
      gender: 'female',
      lotusId: 'LZ-VOL-002',
      lotusRole: 'volunteer',
      volunteerStatus: 'registered',
    }).returning()
    
    console.log('✅ 测试义工创建成功！')
    console.log('义工1:', volunteer1.name, '-', volunteer1.lotusId)
    console.log('义工2:', volunteer2.name, '-', volunteer2.lotusId)
    
  } catch (error) {
    console.error('❌ 创建失败:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

createTestVolunteer()