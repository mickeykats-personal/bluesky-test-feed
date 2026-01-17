import express from 'express'
import { Database } from './db'
import { config } from './config'
import { algos } from './algos'

export const createServer = (db: Database) => {
  const app = express()

  // Health check
  app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'photonics-feed' })
  })

  // Well-known DID document
  app.get('/.well-known/did.json', (req, res) => {
    res.json({
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: config.serviceDid,
      service: [
        {
          id: '#bsky_fg',
          type: 'BskyFeedGenerator',
          serviceEndpoint: `https://${config.hostname}`,
        },
      ],
    })
  })

  // Feed generator description
  app.get('/xrpc/app.bsky.feed.describeFeedGenerator', (req, res) => {
    const feeds = Object.keys(algos).map((shortname) => ({
      uri: `at://${config.publisherDid}/app.bsky.feed.generator/${shortname}`,
    }))

    res.json({
      did: config.serviceDid,
      feeds,
    })
  })

  // Get feed skeleton
  app.get('/xrpc/app.bsky.feed.getFeedSkeleton', async (req, res) => {
    try {
      const feed = req.query.feed as string
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
      const cursor = req.query.cursor as string | undefined

      if (!feed) {
        return res.status(400).json({ error: 'Missing feed parameter' })
      }

      // Parse feed URI to get shortname
      // Format: at://did:plc:xxx/app.bsky.feed.generator/shortname
      const feedUri = feed
      const parts = feedUri.split('/')
      const shortname = parts[parts.length - 1]

      const handler = algos[shortname]
      if (!handler) {
        return res.status(404).json({ error: 'Unknown feed' })
      }

      const result = await handler(db, { limit, cursor })

      res.json(result)
    } catch (error) {
      console.error('Error getting feed skeleton:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  return app
}
