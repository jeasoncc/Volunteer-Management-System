#!/usr/bin/env bun
import { db } from '../src/db'
import { volunteer } from '../src/db/schema'
import { count } from 'drizzle-orm'

const result = await db.select({ count: count() }).from(volunteer)
console.log('义工总数:', result[0]?.count || 0)

const sample = await db.select().from(volunteer).limit(5)
console.log('\n前5条数据:')
sample.forEach(v => {
  console.log(`- ${v.name} (${v.lotusId}) - status: ${v.status}, syncToAttendance: ${v.syncToAttendance}`)
})

process.exit(0)
