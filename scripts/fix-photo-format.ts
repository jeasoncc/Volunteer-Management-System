/**
 * 照片格式修复脚本
 * 将所有 .jpeg 照片重命名为 .jpg，并更新数据库
 */

import { readdirSync, renameSync, existsSync } from 'fs'
import { join } from 'path'
import { db } from '../apps/api/src/db'
import { volunteer } from '../apps/api/src/db/schema'
import { sql } from 'drizzle-orm'

const avatarDir = join(process.cwd(), 'apps/api/public/upload/avatar')

async function fixPhotoFormat() {
  console.log('🔧 开始修复照片格式...')
  console.log(`📁 照片目录: ${avatarDir}`)
  
  if (!existsSync(avatarDir)) {
    console.error('❌ 照片目录不存在！')
    return
  }

  // 1. 重命名文件
  console.log('\n📝 步骤1: 重命名照片文件')
  const files = readdirSync(avatarDir)
  let renamedCount = 0
  
  for (const file of files) {
    if (file.endsWith('.jpeg')) {
      const oldPath = join(avatarDir, file)
      const newPath = join(avatarDir, file.replace('.jpeg', '.jpg'))
      
      try {
        renameSync(oldPath, newPath)
        console.log(`✅ ${file} -> ${file.replace('.jpeg', '.jpg')}`)
        renamedCount++
      } catch (error) {
        console.error(`❌ 重命名失败: ${file}`, error)
      }
    }
  }
  
  console.log(`\n📊 重命名了 ${renamedCount} 个文件`)

  // 2. 更新数据库
  console.log('\n📝 步骤2: 更新数据库中的照片路径')
  
  try {
    const result = await db
      .update(volunteer)
      .set({
        avatar: sql`REPLACE(avatar, '.jpeg', '.jpg')`
      })
      .where(sql`avatar LIKE '%.jpeg'`)
    
    console.log(`✅ 更新了数据库记录`)
    
    // 查询更新后的记录
    const updatedRecords = await db
      .select({
        lotusId: volunteer.lotusId,
        name: volunteer.name,
        avatar: volunteer.avatar,
      })
      .from(volunteer)
      .where(sql`avatar LIKE '%.jpg'`)
    
    console.log(`\n📊 数据库中有 ${updatedRecords.length} 条记录使用 .jpg 格式`)
    
    // 显示前5条
    console.log('\n📋 示例记录:')
    updatedRecords.slice(0, 5).forEach((record, index) => {
      console.log(`${index + 1}. ${record.name}(${record.lotusId}): ${record.avatar}`)
    })
    
  } catch (error) {
    console.error('❌ 更新数据库失败:', error)
  }

  console.log('\n✅ 修复完成！')
  console.log('💡 现在可以重新同步到考勤机了')
  
  process.exit(0)
}

// 运行修复
fixPhotoFormat().catch(error => {
  console.error('❌ 修复失败:', error)
  process.exit(1)
})
