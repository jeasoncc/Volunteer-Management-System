import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { volunteer, admin } from '../db/schema'

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// 密码验证
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 用户注册
export async function registerUser(data: {
  account:  string
  password: string
  name:     string
  phone:    string
  gender:   'male' | 'female' | 'other'
  idNumber: string
  email?:   string
}) {
  // 检查账号是否已存在
  const existingUser = await db.query.volunteer.findFirst({
    where: eq(volunteer.account, data.account),
  })

  if (existingUser) {
    throw new Error('账号已存在')
  }

  // 检查身份证号是否已存在
  const existingIdNumber = await db.query.volunteer.findFirst({
    where: eq(volunteer.idNumber, data.idNumber),
  })

  if (existingIdNumber) {
    throw new Error('身份证号已被注册')
  }

  // 加密密码
  const hashedPassword = await hashPassword(data.password)

  // 创建用户
  const [newUser] = await db.insert(volunteer).values({
    account:   data.account,
    password:  hashedPassword,
    name:      data.name,
    phone:     data.phone,
    gender:    data.gender,
    idNumber:  data.idNumber,
    email:     data.email,
    lotusRole: 'volunteer',
  })

  return {
    id:      newUser.insertId,
    account: data.account,
    name:    data.name,
  }
}

// 用户登录
export async function loginUser(account: string, password: string) {
  // 查找用户
  const user = await db.query.volunteer.findFirst({
    where:   eq(volunteer.account, account),
    columns: {
      id:        true,
      account:   true,
      name:      true,
      password:  true,
      lotusRole: true,
      avatar:    true,
      email:     true,
    },
  })

  if (!user) {
    throw new Error('账号或密码错误')
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new Error('账号或密码错误')
  }

  // 如果是管理员，获取管理员信息
  let adminInfo = null
  if (user.lotusRole === 'admin') {
    adminInfo = await db.query.admin.findFirst({
      where: eq(admin.id, user.id),
    })
  }

  return {
    id:        user.id,
    account:   user.account,
    name:      user.name,
    role:      user.lotusRole,
    avatar:    user.avatar,
    email:     user.email,
    adminInfo: adminInfo
      ? {
          role:        adminInfo.role,
          permissions: adminInfo.permissions,
          department:  adminInfo.department,
        }
      : null,
  }
}
