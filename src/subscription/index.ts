import WebSocket from 'ws'
import { Database } from '../db'
import { config } from '../config'

interface CommitOperation {
  action: 'create' | 'update' | 'delete'
  path: string
  cid?: { toString(): string }
  record?: {
    $type?: string
    text?: string
    [key: string]: unknown
  }
}

interface CommitEvent {
  repo: string
  ops: CommitOperation[]
}

// Check if a post contains "photonics" (case-insensitive)
const matchesPhotonicsFeed = (text: string): boolean => {
  return text.toLowerCase().includes('photonics')
}

export class FirehoseSubscription {
  private ws: WebSocket | null = null
  private db: Database
  private cursor: number | null = null

  constructor(db: Database) {
    this.db = db
  }

  async start() {
    // Load saved cursor
    const state = await this.db
      .selectFrom('sub_state')
      .selectAll()
      .where('service', '=', config.subscriptionEndpoint)
      .executeTakeFirst()

    this.cursor = state?.cursor ?? null

    this.connect()
  }

  private connect() {
    const url = this.cursor
      ? `${config.subscriptionEndpoint}/xrpc/com.atproto.sync.subscribeRepos?cursor=${this.cursor}`
      : `${config.subscriptionEndpoint}/xrpc/com.atproto.sync.subscribeRepos`

    console.log(`Connecting to firehose: ${url}`)

    this.ws = new WebSocket(url)

    this.ws.on('open', () => {
      console.log('Connected to Bluesky firehose')
    })

    this.ws.on('message', async (data: Buffer) => {
      try {
        await this.handleMessage(data)
      } catch (err) {
        console.error('Error handling message:', err)
      }
    })

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    this.ws.on('close', () => {
      console.log('Disconnected from firehose, reconnecting...')
      setTimeout(() => this.connect(), config.subscriptionReconnectDelay)
    })
  }

  private async handleMessage(data: Buffer) {
    // The firehose sends CBOR-encoded data with a header and body
    // For simplicity, we'll use a basic parsing approach
    // In production, you'd want to use proper CBOR decoding

    try {
      // Try to extract JSON-like content for posts
      const str = data.toString('utf8')

      // Look for app.bsky.feed.post records
      if (str.includes('app.bsky.feed.post')) {
        // Extract text content using regex (simplified approach)
        const textMatch = str.match(/"text"\s*:\s*"([^"]+)"/i)
        if (textMatch && textMatch[1]) {
          const text = textMatch[1]

          if (matchesPhotonicsFeed(text)) {
            // Extract URI and CID
            const uriMatch = str.match(/at:\/\/[^"]+/)
            const cidMatch = str.match(/"cid"\s*:\s*"([^"]+)"/)

            if (uriMatch) {
              const uri = uriMatch[0]
              const cid = cidMatch ? cidMatch[1] : ''

              console.log(`Found photonics post: ${text.substring(0, 50)}...`)

              await this.db
                .insertInto('post')
                .values({
                  uri,
                  cid,
                  indexedAt: new Date().toISOString(),
                })
                .onConflict((oc) => oc.doNothing())
                .execute()
            }
          }
        }
      }

      // Update cursor from seq
      const seqMatch = str.match(/"seq"\s*:\s*(\d+)/)
      if (seqMatch) {
        const seq = parseInt(seqMatch[1], 10)
        if (!isNaN(seq)) {
          this.cursor = seq
          // Save cursor periodically (every 1000 events)
          if (seq % 1000 === 0) {
            await this.saveCursor(seq)
          }
        }
      }
    } catch {
      // Skip unparseable messages
    }
  }

  private async saveCursor(cursor: number) {
    await this.db
      .insertInto('sub_state')
      .values({
        service: config.subscriptionEndpoint,
        cursor,
      })
      .onConflict((oc) =>
        oc.column('service').doUpdateSet({ cursor })
      )
      .execute()
  }

  stop() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
