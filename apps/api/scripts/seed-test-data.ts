#!/usr/bin/env bun
/**
 * 测试数据生成脚本
 * 用于在数据库中插入测试用的义工和管理员数据
 */

import { db } from '../src/db'
import { volunteer, admin } from '../src/db/schema'
import { hashPassword } from '../src/lib/auth'
import { eq } from 'drizzle-orm'

const testVolunteers = [
  {
    lotusId: 'LH001',
    volunteerId: 'V001',
    idNumber: '440300199001011234',
    account: '13800001001',
    password: '123456',
    name: '张三',
    gender: 'male' as const,
    birthDate: '1990-01-01',
    phone: '13800001001',
    wechat: 'zhangsan_wx',
    email: 'zhangsan@example.com',
    address: '广东省深圳市南山区',
    dharmaName: '慧明',
    hasBuddhismFaith: true,
    refugeStatus: 'took_refuge' as const,
    education: 'bachelor' as const,
    healthConditions: 'healthy' as const,
    religiousBackground: 'upasaka' as const,
    joinReason: '希望能够为社会做出贡献，帮助他人',
    hobbies: '阅读、书法、禅修',
    availableTimes: '周末全天',
    emergencyContact: '李四 13800002001',
    familyConsent: 'approved' as const,
    volunteerStatus: 'registered' as const,
    severPosition: 'reception' as const,
    status: 'active' as const,
  },
  {
    lotusId: 'LH002',
    volunteerId: 'V002',
    idNumber: '440300199102025678',
    account: '13800001002',
    password: '123456',
    name: '李梅',
    gender: 'female' as const,
    birthDate: '1991-02-02',
    phone: '13800001002',
    wechat: 'limei_wx',
    email: 'limei@example.com',
    address: '广东省深圳市福田区',
    dharmaName: '慧莲',
    hasBuddhismFaith: true,
    refugeStatus: 'five_precepts' as const,
    education: 'master' as const,
    healthConditions: 'healthy' as const,
    religiousBackground: 'upasika' as const,
    joinReason: '学佛多年，希望能够实践佛法，利益众生',
    hobbies: '绘画、茶道、念佛',
    availableTimes: '周三下午、周末',
    emergencyContact: '王五 13800002002',
    familyConsent: 'approved' as const,
    volunteerStatus: 'registered' as const,
    severPosition: 'chanting' as const,
    status: 'active' as const,
  },
  {
    lotusId: 'LH003',
    volunteerId: 'V003',
    idNumber: '440300199203039012',
    account: '13800001003',
    password: '123456',
    name: '王强',
    gender: 'male' as const,
    birthDate: '1992-03-03',
    phone: '13800001003',
    wechat: 'wangqiang_wx',
    email: 'wangqiang@example.com',
    address: '广东省深圳市龙岗区',
    dharmaName: '慧达',
    hasBuddhismFaith: true,
    refugeStatus: 'bodhisattva' as const,
    education: 'bachelor' as const,
    healthConditions: 'healthy' as const,
    religiousBackground: 'upasaka' as const,
    joinReason: '希望通过义工服务积累福德资粮',
    hobbies: '运动、音乐、禅修',
    availableTimes: '周五晚上、周末',
    emergencyContact: '赵六 13800002003',
    familyConsent: 'approved' as const,
    volunteerStatus: 'registered' as const,
    severPosition: 'kitchen' as const,
    status: 'active' as const,
  },
  {
    lotusId: 'LH004',
    volunteerId: 'V004',
    idNumber: '440300199304043456',
    account: '13800001004',
    password: '123456',
    name: '陈静',
    gender: 'female' as const,
    birthDate: '1993-04-04',
    phone: '13800001004',
    wechat: 'chenjing_wx',
    email: 'chenjing@example.com',
    address: '广东省深圳市宝安区',
    dharmaName: '慧慈',
    hasBuddhismFaith: true,
    refugeStatus: 'took_refuge' as const,
    education: 'high_school' as const,
    healthConditions: 'healthy' as const,
    religiousBackground: 'upasika' as const,
    joinReason: '想要学习佛法，帮助他人',
    hobbies: '瑜伽、烹饪、读经',
    availableTimes: '周一至周五上午',
    emergencyContact: '孙七 13800002004',
    familyConsent: 'approved' as const,
    volunteerStatus: 'trainee' as const,
    severPosition: 'cleaning' as const,
    status: 'active' as const,
  },
  {
    lotusId: 'LH005',
    volunteerId: 'V005',
    idNumber: '440300199405057890',
    account: '13800001005',
    password: '123456',
    name: '刘洋',
    gender: 'male' as const,
    birthDate: '1994-05-05',
    phone: '13800001005',
    wechat: 'liuyang_wx',
    email: 'liuyang@example.com',
    address: '广东省深圳市罗湖区',
    dharmaName: '慧海',
    hasBuddhismFaith: false,
    refugeStatus: 'none' as const,
    education: 'bachelor' as const,
    healthConditions: 'healthy' as const,
    religiousBackground: 'buddhist_visitor' as const,
    joinReason: '想了解佛教文化，参与公益活动',
    hobbies: '摄影、旅行、写作',
    availableTimes: '周末全天',
    emergencyContact: '周八 13800002005',
    familyConsent: 'self_decided' as const,
    volunteerStatus: 'applicant' as const,
    severPosition: 'office' as const,
    status: 'active' as const,
  },
]

async function seedTestData() {
  console.error('🌱 开始插入测试数据...\n')
  console.error('📊 数据库连接信息:', process.env.CURR_DATABASE_URL)

  try {
    // 先检查是否已有数据
    const existingUsers = await db.query.volunteer.findMany({
      columns: { id: true, account: true, name: true },
    })
    
    if (existingUsers.length > 0) {
      console.log(`⚠️  数据库中已有 ${existingUsers.length} 个用户，跳过插入`)
      console.log('现有用户:', existingUsers.map(u => `${u.name} (${u.account})`).join(', '))
      console.log('\n如需重新插入，请先清空数据库\n')
      return
    }

    // 1. 插入义工数据
    console.log('📝 插入义工数据...')
    const insertedVolunteers: number[] = []

    for (const v of testVolunteers) {
      const hashedPassword = await hashPassword(v.password)
      const { password, birthDate, ...volunteerData } = v
      const [result] = await db.insert(volunteer).values({
        ...volunteerData,
        password: hashedPassword,
        birthDate: new Date(birthDate),
      })

      const insertedId = Number(result.insertId)
      insertedVolunteers.push(insertedId)
      console.log(`  ✓ ${v.name} (${v.lotusId}) - ID: ${insertedId}`)
    }

    // 2. 将前3个义工升级为管理员
    console.log('\n👑 创建管理员数据...')
    
    // 首先更新这些用户的 lotus_role 为 admin
    const adminUserIds = [insertedVolunteers[0], insertedVolunteers[1], insertedVolunteers[2]]
    
    for (let i = 0; i < adminUserIds.length; i++) {
      await db.update(volunteer)
        .set({ lotusRole: 'admin' })
        .where(eq(volunteer.id, adminUserIds[i]))
      console.log(`  ✓ 更新 ${testVolunteers[i].name} 的角色为 admin`)
    }
    
    const adminData = [
      {
        id: insertedVolunteers[0],
        role: 'super' as const,
        department: '总务部',
        permissions: JSON.stringify(['all']),
        isActive: true,
      },
      {
        id: insertedVolunteers[1],
        role: 'admin' as const,
        department: '活动部',
        permissions: JSON.stringify(['volunteer:read', 'volunteer:write', 'checkin:read']),
        isActive: true,
      },
      {
        id: insertedVolunteers[2],
        role: 'operator' as const,
        department: '后勤部',
        permissions: JSON.stringify(['checkin:read', 'checkin:write']),
        isActive: true,
      },
    ]

    for (let i = 0; i < adminData.length; i++) {
      await db.insert(admin).values(adminData[i])
      console.log(`  ✓ ${testVolunteers[i].name} - ${adminData[i].role} (${adminData[i].department})`)
    }

    console.log('\n✅ 测试数据插入成功！\n')
    console.log('📊 数据摘要:')
    console.log(`  - 义工总数: ${testVolunteers.length}`)
    console.log(`  - 管理员总数: ${adminData.length}`)
    console.log('\n🔑 登录信息:')
    console.log(`  - 超级管理员: ${testVolunteers[0].account} / 123456`)
    console.log(`  - 普通管理员: ${testVolunteers[1].account} / 123456`)
    console.log(`  - 操作员: ${testVolunteers[2].account} / 123456`)
    console.log(`  - 义工: ${testVolunteers[3].account} / 123456`)
    console.log(`  - 申请者: ${testVolunteers[4].account} / 123456\n`)

  } catch (error) {
    console.error('❌ 插入数据失败:', error)
    throw error
  }
}

// 运行脚本
seedTestData()
  .then(() => {
    console.error('✨ 脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error)
    process.exit(1)
  })
