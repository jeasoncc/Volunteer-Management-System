#!/usr/bin/env bun
import { db } from '../src/db'
import { sql } from 'drizzle-orm'

const result: any = await db.execute(sql`
  SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'volunteer' 
    AND COLUMN_NAME IN ('sync_to_attendance', 'require_full_attendance')
  ORDER BY ORDINAL_POSITION
`)

console.log('考勤相关字段信息：\n')
result.forEach((row: any) => {
  console.log(`字段名: ${row.COLUMN_NAME}`)
  console.log(`类型: ${row.COLUMN_TYPE}`)
  console.log(`默认值: ${row.COLUMN_DEFAULT}`)
  console.log(`注释: ${row.COLUMN_COMMENT}`)
  console.log('---')
})
process.exit(0)
