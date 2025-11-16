import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

export default defineConfig({
  out:           './drizzle',
  schema:        './src/db/schema.ts',
  dialect:       'mysql',
  dbCredentials: {
    url: process.env.CURR_DATABASE_URL!,
  },
})
