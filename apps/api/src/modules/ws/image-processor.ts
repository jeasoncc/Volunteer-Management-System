/**
 * 图片处理工具
 * 用于检测和压缩过大的图片
 */

import { join } from 'path'
import { existsSync, statSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { logger } from '../../lib/logger'

// 图片大小限制（字节）
const MAX_IMAGE_SIZE = 500 * 1024 // 500KB
const TARGET_IMAGE_SIZE = 300 * 1024 // 压缩目标 300KB

// 缩略图目录
const THUMBNAIL_DIR = join(process.cwd(), 'public/upload/avatar/thumbnails')

// 确保缩略图目录存在
if (!existsSync(THUMBNAIL_DIR)) {
  mkdirSync(THUMBNAIL_DIR, { recursive: true })
}

export interface ImageInfo {
  path: string
  size: number
  needsCompression: boolean
  thumbnailPath?: string
}

/**
 * 检查图片大小
 */
export function checkImageSize(avatarPath: string): ImageInfo {
  // avatarPath 格式: /upload/avatar/xxx.jpg
  const fullPath = join(process.cwd(), 'public', avatarPath)
  
  if (!existsSync(fullPath)) {
    logger.warn(`⚠️  图片不存在: ${fullPath}`)
    return {
      path: avatarPath,
      size: 0,
      needsCompression: false,
    }
  }

  const stats = statSync(fullPath)
  const size = stats.size
  const needsCompression = size > MAX_IMAGE_SIZE

  if (needsCompression) {
    logger.info(`📏 图片过大: ${avatarPath} (${(size / 1024).toFixed(1)}KB > ${MAX_IMAGE_SIZE / 1024}KB)`)
  }

  return {
    path: avatarPath,
    size,
    needsCompression,
  }
}

/**
 * 压缩图片（使用 sharp 库）
 * 如果 sharp 不可用，返回原图路径
 */
export async function compressImage(avatarPath: string): Promise<string> {
  const fullPath = join(process.cwd(), 'public', avatarPath)
  
  if (!existsSync(fullPath)) {
    logger.warn(`⚠️  图片不存在，无法压缩: ${fullPath}`)
    return avatarPath
  }

  // 生成缩略图文件名
  const fileName = avatarPath.split('/').pop()!
  const thumbnailFileName = `thumb_${fileName}`
  const thumbnailPath = join(THUMBNAIL_DIR, thumbnailFileName)
  const thumbnailUrlPath = `/upload/avatar/thumbnails/${thumbnailFileName}`

  // 如果缩略图已存在且较新，直接返回
  if (existsSync(thumbnailPath)) {
    const originalStats = statSync(fullPath)
    const thumbStats = statSync(thumbnailPath)
    
    if (thumbStats.mtime >= originalStats.mtime) {
      logger.info(`📦 使用已有缩略图: ${thumbnailUrlPath}`)
      return thumbnailUrlPath
    }
  }

  try {
    // 尝试使用 sharp 进行压缩
    const sharp = await import('sharp')
    
    const imageInfo = await sharp.default(fullPath).metadata()
    
    // 计算压缩参数
    let quality = 80
    let width = imageInfo.width || 800
    
    // 如果图片太大，逐步降低质量和尺寸
    const originalSize = statSync(fullPath).size
    if (originalSize > MAX_IMAGE_SIZE * 2) {
      quality = 60
      width = Math.min(width, 600)
    } else if (originalSize > MAX_IMAGE_SIZE) {
      quality = 70
      width = Math.min(width, 800)
    }

    // 压缩图片
    await sharp.default(fullPath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality, progressive: true })
      .toFile(thumbnailPath)

    const newSize = statSync(thumbnailPath).size
    logger.success(`✅ 图片压缩成功: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB`)
    
    return thumbnailUrlPath
  } catch (error: any) {
    // sharp 不可用，尝试简单的质量降低
    if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('sharp')) {
      logger.warn(`⚠️  sharp 库不可用，尝试使用备用方案`)
      return await compressImageFallback(avatarPath)
    }
    
    logger.error(`❌ 图片压缩失败: ${error.message}`)
    return avatarPath
  }
}

/**
 * 备用压缩方案（不依赖 sharp）
 * 简单地复制文件，不做实际压缩
 */
async function compressImageFallback(avatarPath: string): Promise<string> {
  const fullPath = join(process.cwd(), 'public', avatarPath)
  const fileName = avatarPath.split('/').pop()!
  const thumbnailFileName = `thumb_${fileName}`
  const thumbnailPath = join(THUMBNAIL_DIR, thumbnailFileName)
  const thumbnailUrlPath = `/upload/avatar/thumbnails/${thumbnailFileName}`

  try {
    // 简单复制文件（不做压缩）
    const data = readFileSync(fullPath)
    writeFileSync(thumbnailPath, data)
    
    logger.warn(`⚠️  使用备用方案（未压缩）: ${thumbnailUrlPath}`)
    return thumbnailUrlPath
  } catch (error: any) {
    logger.error(`❌ 备用压缩方案失败: ${error.message}`)
    return avatarPath
  }
}

/**
 * 处理用户头像
 * 检查大小，必要时压缩
 */
export async function processUserAvatar(avatarPath: string): Promise<string> {
  if (!avatarPath) {
    return ''
  }

  const imageInfo = checkImageSize(avatarPath)
  
  if (!imageInfo.needsCompression) {
    return avatarPath
  }

  // 需要压缩
  return await compressImage(avatarPath)
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 同步配置
 */
export const SYNC_CONFIG = {
  // 每个用户之间的延迟（毫秒）
  DELAY_BETWEEN_USERS: 200,
  
  // 批量同步时的批次大小
  BATCH_SIZE: 10,
  
  // 批次之间的延迟（毫秒）
  DELAY_BETWEEN_BATCHES: 1000,
  
  // 图片大小限制（字节）
  MAX_IMAGE_SIZE,
  
  // 压缩目标大小（字节）
  TARGET_IMAGE_SIZE,
}
