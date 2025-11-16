import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { admin, volunteer, volunteerCheckIn, volunteerCheckInSummary } from './schema'
import type { MySql2Database } from 'drizzle-orm/mysql2'
type DatabaseSchema = {
  volunteer:               typeof volunteer
  admin:                   typeof admin
  volunteerCheckIn:        typeof volunteerCheckIn
  volunteerCheckInSummary: typeof volunteerCheckInSummary
}

const pool = mysql.createPool({
  uri:                process.env.CURR_DATABASE_URL!,
  // uri: process.env.TEST_DATABASE_URL!,
  waitForConnections: true,
  connectionLimit:    10,
})

export const db: MySql2Database<DatabaseSchema> = drizzle(pool, {
  schema: { admin, volunteer, volunteerCheckIn, volunteerCheckInSummary },
  mode:   'default',
})
