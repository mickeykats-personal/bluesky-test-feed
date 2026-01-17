import { createDb, migrateToLatest } from './db'
import { config } from './config'
import { createServer } from './server'
import { FirehoseSubscription } from './subscription'

const main = async () => {
  console.log('Starting Photonics Feed Generator...')
  console.log(`Publisher DID: ${config.publisherDid}`)
  console.log(`Service DID: ${config.serviceDid}`)

  // Initialize database
  const db = createDb(config.sqliteLocation)
  await migrateToLatest(db)
  console.log('Database initialized')

  // Start firehose subscription
  const subscription = new FirehoseSubscription(db)
  await subscription.start()
  console.log('Firehose subscription started')

  // Start HTTP server
  const server = createServer(db)
  server.listen(config.port, () => {
    console.log(`Feed generator running at http://localhost:${config.port}`)
    console.log(`Feed URI: at://${config.publisherDid}/app.bsky.feed.generator/photonics`)
  })

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...')
    subscription.stop()
    await db.destroy()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
