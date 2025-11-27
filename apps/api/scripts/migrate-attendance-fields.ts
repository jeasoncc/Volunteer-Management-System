#!/usr/bin/env bun
/**
 * 添加考勤相关字段迁移脚本
 * 
 * 添加字段：
 * - sync_to_attendance: 是否同步到考勤机
 * - require_full_attendance: 是否需要考勤全勤配置
 */

import { db } from '../src/db'
import { sql } from 'drizzle-orm'

async function migrate() {
  console.log('开始添加考勤相关字段...')

  try {
    // 检查字段是否已存在
    const checkSyncField = await db.execute(sql`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'volunteer' 
        AND COLUMN_NAME = 'sync_to_attendance'
    `)

    if (checkSyncField.length > 0) {
      console.log('✓ sync_to_attendance 字段已存在')
    } else {
      await db.execute(sql`
        ALTER TABLE volunteer 
        ADD COLUMN sync_to_attendance BOOLEAN DEFAULT FALSE COMMENT '是否同步到考勤机' 
        AFTER room_id
      `)
      console.log('✓ 已添加 sync_to_attendance 字段')
    }

    const checkFullAttendanceField = await db.execute(sql`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'volunteer' 
        AND COLUMN_NAME = 'require_full_attendance'
    `)

    if (checkFullAttendanceField.length > 0) {
      console.log('✓ require_full_attendance 字段已存在')
    } else {
      await db.execute(sql`
        ALTER TABLE volunteer 
        ADD COLUMN require_full_attendance BOOLEAN DEFAULT FALSE COMMENT '是否需要考勤全勤配置' 
        AFTER sync_to_attendance
      `)
      console.log('✓ 已添加 require_full_attendance 字段')
    }

    console.log('\n迁移完成！')
    console.log('\n新增字段说明：')
    console.log('- sync_to_attendance: 是否同步到考勤机（默认false）')
    console.log('- require_full_attendance: 是否需要考勤全勤配置（默认false）')

  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  }

  process.exit(0)
}

migrate()
