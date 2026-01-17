import { createDb, migrateToLatest } from './index'
import { config } from '../config'

const run = async () => {
  console.log('Running database migrations...')
  const db = createDb(config.sqliteLocation)
  await migrateToLatest(db)
  console.log('Migrations complete!')
  await db.destroy()
}

run().catch(console.error)
