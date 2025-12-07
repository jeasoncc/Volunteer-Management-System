/**
 * 检查数据库中的照片路径
 */

import { db } from './src/db'
import { volunteer } from './src/db/schema'
import { isNotNull } from 'drizzle-orm'
import { getBackendUrl } from './src/config/network'

const BASE_URL = getBackendUrl()

console.log('📊 数据库照片路径检查')
console.log('='.repeat(80))
console.log(`🌐 服务器地址: ${BASE_URL}`)
console.log('='.repeat(80))

// 查询所有有照片的义工
const volunteers = await db
  .select({
    lotusId: volunteer.lotusId,
    name: volunteer.name,
    avatar: volunteer.avatar,
  })
  .from(volunteer)
  .where(isNotNull(volunteer.avatar))
  .limit(20)

console.log(`\n📸 找到 ${volunteers.length} 个有照片的义工:\n`)

volunteers.forEach((v, index) => {
  const avatarPath = v.avatar || ''
  const isFullUrl = avatarPath.startsWith('http://') || avatarPath.startsWith('https://')
  const fullUrl = isFullUrl ? avatarPath : `${BASE_URL}${avatarPath}`
  
  console.log(`${index + 1}. ${v.name} (${v.lotusId})`)
  console.log(`   数据库路径: ${avatarPath}`)
  console.log(`   完整URL: ${fullUrl}`)
  console.log(`   路径类型: ${isFullUrl ? '完整URL' : '相对路径'}`)
  console.log()
})

console.log('='.repeat(80))
console.log('\n💡 诊断结果:')

// 检查路径格式
const hasFullUrls = volunteers.some(v => v.avatar?.startsWith('http'))
const hasRelativePaths = volunteers.some(v => v.avatar && !v.avatar.startsWith('http'))

if (hasFullUrls && hasRelativePaths) {
  console.log('⚠️  数据库中同时存在完整URL和相对路径，建议统一格式')
}

if (hasFullUrls) {
  console.log('✅ 数据库中存储的是完整URL')
  const wrongBaseUrl = volunteers.find(v => 
    v.avatar?.startsWith('http') && !v.avatar.includes(BASE_URL)
  )
  if (wrongBaseUrl) {
    console.log(`⚠️  发现使用了不同的服务器地址: ${wrongBaseUrl.avatar}`)
    console.log(`   当前配置的服务器地址: ${BASE_URL}`)
  }
}

if (hasRelativePaths) {
  console.log('✅ 数据库中存储的是相对路径')
  console.log(`   前端需要拼接服务器地址: ${BASE_URL}`)
}

// 检查文件扩展名
const jpegFiles = volunteers.filter(v => v.avatar?.endsWith('.jpeg'))
const jpgFiles = volunteers.filter(v => v.avatar?.endsWith('.jpg'))
const pngFiles = volunteers.filter(v => v.avatar?.endsWith('.png'))

console.log(`\n📊 文件格式统计:`)
console.log(`   JPG: ${jpgFiles.length}`)
console.log(`   JPEG: ${jpegFiles.length}`)
console.log(`   PNG: ${pngFiles.length}`)

if (jpegFiles.length > 0) {
  console.log(`\n⚠️  发现 ${jpegFiles.length} 个 .jpeg 格式的照片`)
  console.log('   考勤机可能不支持 .jpeg 格式，建议转换为 .jpg')
  console.log('\n   受影响的义工:')
  jpegFiles.slice(0, 5).forEach(v => {
    console.log(`   - ${v.name} (${v.lotusId}): ${v.avatar}`)
  })
  if (jpegFiles.length > 5) {
    console.log(`   ... 还有 ${jpegFiles.length - 5} 个`)
  }
}

console.log('\n='.repeat(80))

process.exit(0)
