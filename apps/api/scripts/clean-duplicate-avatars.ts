#!/usr/bin/env bun

/**
 * 清理重复的头像文件
 * 保留每个用户最新的头像，删除旧的重复文件
 */

import { readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'

const AVATAR_DIR = join(process.cwd(), 'public/upload/avatar')

interface AvatarFile {
  fileName:  string
  lotusId:   string
  timestamp: Date
  fullPath:  string
}

async function cleanDuplicateAvatars() {
  console.log('🧹 开始清理重复头像...\n')

  // 读取所有头像文件
  const files = readdirSync(AVATAR_DIR)
  console.log(`📁 找到 ${files.length} 个文件\n`)

  // 解析文件信息
  const avatarFiles: AvatarFile[] = []
  for (const fileName of files) {
    // 文件名格式: LZ-V-2705044-0c789632.jpg
    const match = fileName.match(/^(LZ-V-\d+)-[a-f0-9]+\.jpg$/)
    if (match) {
      const lotusId = match[1]
      const fullPath = join(AVATAR_DIR, fileName)
      const stats = statSync(fullPath)

      avatarFiles.push({
        fileName,
        lotusId,
        timestamp: stats.mtime,
        fullPath,
      })
    }
  }

  // 按 lotusId 分组
  const groupedByUser = new Map<string, AvatarFile[]>()
  for (const file of avatarFiles) {
    if (!groupedByUser.has(file.lotusId)) {
      groupedByUser.set(file.lotusId, [])
    }
    groupedByUser.get(file.lotusId)!.push(file)
  }

  console.log(`👥 共 ${groupedByUser.size} 个用户\n`)

  // 清理重复文件
  let deletedCount = 0
  let keptCount = 0

  for (const [lotusId, files] of groupedByUser.entries()) {
    if (files.length > 1) {
      // 按时间排序，保留最新的
      files.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      const keepFile = files[0]
      const deleteFiles = files.slice(1)

      console.log(`🔍 用户 ${lotusId} 有 ${files.length} 个头像:`)
      console.log(`   ✅ 保留: ${keepFile.fileName} (${keepFile.timestamp.toLocaleString()})`)

      for (const file of deleteFiles) {
        console.log(`   ❌ 删除: ${file.fileName} (${file.timestamp.toLocaleString()})`)
        unlinkSync(file.fullPath)
        deletedCount++
      }

      keptCount++
      console.log('')
    } else {
      keptCount++
    }
  }

  console.log('\n📊 清理完成:')
  console.log(`   保留文件: ${keptCount}`)
  console.log(`   删除文件: ${deletedCount}`)
  console.log(`   节省空间: ${(deletedCount * 364).toFixed(0)} KB (估算)`)
}

// 运行清理
cleanDuplicateAvatars().catch(console.error)
