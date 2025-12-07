/**
 * 图片处理工具
 * 用于检测和压缩过大的图片
 */

import { join } from 'path'
import { existsSync, statSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { logger } from '../../lib/logger'
import { COMPRESSION_CONFIG, getCompressionStrategy } from '../../config/compression'

// 从配置文件读取
const MAX_IMAGE_SIZE = COMPRESSION_CONFIG.threshold
const TARGET_IMAGE_SIZE = COMPRESSION_CONFIG.targetSize

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
  compressionThreshold: number
}

export interface CompressionResult {
  path: string
  originalSize: number
  compressedSize: number
  wasCompressed: boolean
  compressionThreshold: number
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
      compressionThreshold: MAX_IMAGE_SIZE,
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
    compressionThreshold: MAX_IMAGE_SIZE,
  }
}

/**
 * 压缩图片（使用 sharp 库）
 * 返回压缩结果详情
 */
export async function compressImage(avatarPath: string): Promise<CompressionResult> {
  const fullPath = join(process.cwd(), 'public', avatarPath)
  const originalSize = existsSync(fullPath) ? statSync(fullPath).size : 0
  
  if (!existsSync(fullPath)) {
    logger.warn(`⚠️  图片不存在，无法压缩: ${fullPath}`)
    return {
      path: avatarPath,
      originalSize: 0,
      compressedSize: 0,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
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
      return {
        path: thumbnailUrlPath,
        originalSize,
        compressedSize: thumbStats.size,
        wasCompressed: true,
        compressionThreshold: MAX_IMAGE_SIZE,
      }
    }
  }

  try {
    // 尝试使用 sharp 进行压缩
    const sharp = await import('sharp')
    
    // 使用简化的压缩配置
    const quality = COMPRESSION_CONFIG.quality
    const maxWidth = COMPRESSION_CONFIG.maxWidth
    
    logger.info(`📋 压缩参数: 质量${quality}%, 最大宽度${maxWidth}px`)

    // 压缩图片
    await sharp.default(fullPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality, progressive: true })
      .toFile(thumbnailPath)

    const compressedSize = statSync(thumbnailPath).size
    logger.success(`✅ 图片压缩成功: ${(originalSize / 1024).toFixed(1)}KB 压缩至 ${(compressedSize / 1024).toFixed(1)}KB`)
    
    return {
      path: thumbnailUrlPath,
      originalSize,
      compressedSize,
      wasCompressed: true,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
  } catch (error: any) {
    // sharp 不可用，尝试简单的质量降低
    if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('sharp')) {
      logger.warn(`⚠️  sharp 库不可用，尝试使用备用方案`)
      return await compressImageFallback(avatarPath, originalSize)
    }
    
    logger.error(`❌ 图片压缩失败: ${error.message}`)
    return {
      path: avatarPath,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
  }
}

/**
 * 备用压缩方案（不依赖 sharp）
 * 简单地复制文件，不做实际压缩
 */
async function compressImageFallback(avatarPath: string, originalSize: number): Promise<CompressionResult> {
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
    return {
      path: thumbnailUrlPath,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
  } catch (error: any) {
    logger.error(`❌ 备用压缩方案失败: ${error.message}`)
    return {
      path: avatarPath,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
  }
}

/**
 * 处理用户头像
 * 检查大小，必要时压缩，返回详细结果
 */
export async function processUserAvatar(avatarPath: string): Promise<CompressionResult> {
  if (!avatarPath) {
    return {
      path: '',
      originalSize: 0,
      compressedSize: 0,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
  }

  const imageInfo = checkImageSize(avatarPath)
  
  if (!imageInfo.needsCompression) {
    return {
      path: avatarPath,
      originalSize: imageInfo.size,
      compressedSize: imageInfo.size,
      wasCompressed: false,
      compressionThreshold: MAX_IMAGE_SIZE,
    }
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
 * 将图片转换为Base64格式（符合设备要求）
 * 1. 压缩图片到 300KB 以下，尺寸不超过 1280x720
 * 2. 转换为 Base64 格式，加上前缀 "data:image/jpeg;base64,"
 * 3. 使用 URLEncode 进行 UTF-8 编码
 */
export async function convertImageToBase64(avatarPath: string): Promise<string> {
  const fullPath = join(process.cwd(), 'public', avatarPath)
  
  if (!existsSync(fullPath)) {
    throw new Error(`图片不存在: ${fullPath}`)
  }

  try {
    // 尝试使用 sharp 进行压缩和调整尺寸
    const sharp = await import('sharp')
    
    // 压缩图片到符合设备要求
    const buffer = await sharp.default(fullPath)
      .resize(1280, 720, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toBuffer()

    // 检查大小，如果还是太大，降低质量
    let finalBuffer = buffer
    if (buffer.length > TARGET_IMAGE_SIZE) {
      logger.info(`📦 图片仍然过大 (${(buffer.length / 1024).toFixed(1)}KB)，降低质量`)
      finalBuffer = await sharp.default(fullPath)
        .resize(1280, 720, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 70,
          progressive: true
        })
        .toBuffer()
    }

    // 转换为 Base64
    const base64 = finalBuffer.toString('base64')
    const base64WithPrefix = `data:image/jpeg;base64,${base64}`
    
    // URL 编码
    const encoded = encodeURIComponent(base64WithPrefix)
    
    logger.success(`✅ 图片转Base64成功: ${(finalBuffer.length / 1024).toFixed(1)}KB`)
    
    return encoded
  } catch (error: any) {
    // sharp 不可用，使用备用方案
    if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('sharp')) {
      logger.warn(`⚠️  sharp 库不可用，使用原图转Base64`)
      return await convertImageToBase64Fallback(avatarPath)
    }
    
    throw error
  }
}

/**
 * 备用Base64转换方案（不依赖 sharp）
 */
async function convertImageToBase64Fallback(avatarPath: string): Promise<string> {
  const fullPath = join(process.cwd(), 'public', avatarPath)
  
  // 直接读取文件并转换
  const buffer = readFileSync(fullPath)
  const base64 = buffer.toString('base64')
  const base64WithPrefix = `data:image/jpeg;base64,${base64}`
  const encoded = encodeURIComponent(base64WithPrefix)
  
  logger.warn(`⚠️  使用原图转Base64 (${(buffer.length / 1024).toFixed(1)}KB)`)
  
  return encoded
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
