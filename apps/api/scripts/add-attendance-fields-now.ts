#!/usr/bin/env bun
import { db } from '../src/db'
import { sql } from 'drizzle-orm'

console.log('开始添加考勤相关字段...')

try {
  // 添加 sync_to_attendance 字段
  await db.execute(sql`
    ALTER TABLE volunteer 
    ADD COLUMN sync_to_attendance BOOLEAN DEFAULT FALSE COMMENT '是否同步到考勤机' 
    AFTER room_id
  `)
  console.log('✓ 已添加 sync_to_attendance 字段')
} catch (error: any) {
  if (error.message?.includes('Duplicate column name')) {
    console.log('✓ sync_to_attendance 字段已存在')
  } else {
    console.error('添加 sync_to_attendance 失败:', error.message)
  }
}

try {
  // 添加 require_full_attendance 字段
  await db.execute(sql`
    ALTER TABLE volunteer 
    ADD COLUMN require_full_attendance BOOLEAN DEFAULT FALSE COMMENT '是否需要考勤全勤配置' 
    AFTER sync_to_attendance
  `)
  console.log('✓ 已添加 require_full_attendance 字段')
} catch (error: any) {
  if (error.message?.includes('Duplicate column name')) {
    console.log('✓ require_full_attendance 字段已存在')
  } else {
    console.error('添加 require_full_attendance 失败:', error.message)
  }
}

console.log('\n迁移完成！')
process.exit(0)
