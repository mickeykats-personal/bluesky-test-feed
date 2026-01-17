import SqliteDb from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import { DatabaseSchema } from './schema'
import { config } from '../config'

export const createDb = (location: string): Database => {
  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(location),
    }),
  })
}

export const migrateToLatest = async (db: Database) => {
  const sqliteDb = new SqliteDb(config.sqliteLocation)

  // Create posts table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS post (
      uri TEXT PRIMARY KEY,
      cid TEXT NOT NULL,
      indexedAt TEXT NOT NULL
    )
  `)

  // Create index for efficient querying
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS idx_post_indexedAt ON post(indexedAt DESC)
  `)

  // Create subscription state table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS sub_state (
      service TEXT PRIMARY KEY,
      cursor INTEGER NOT NULL
    )
  `)

  sqliteDb.close()
}

export type Database = Kysely<DatabaseSchema>
