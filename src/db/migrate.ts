/**
 * Runs all pending Drizzle migrations from the ./drizzle folder.
 * Usage: npm run db:migrate
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle }  from 'drizzle-orm/node-postgres'
import { migrate }  from 'drizzle-orm/node-postgres/migrator'
import { Pool }     from 'pg'

async function runMigrations() {
  console.log('\n🗄  Running database migrations…\n')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db   = drizzle({ client: pool })

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log('✅  Migrations complete!\n')
  await pool.end()
}

runMigrations().catch(err => {
  console.error('❌  Migration failed:', err)
  process.exit(1)
})
