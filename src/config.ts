import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.FEEDGEN_PORT || '3000', 10),
  hostname: process.env.FEEDGEN_HOSTNAME || 'localhost',
  publisherDid: process.env.FEEDGEN_PUBLISHER_DID || '',
  serviceDid: process.env.FEEDGEN_SERVICE_DID || `did:web:${process.env.FEEDGEN_HOSTNAME || 'localhost'}`,
  sqliteLocation: process.env.FEEDGEN_SQLITE_LOCATION || './feed.db',
  subscriptionEndpoint: process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT || 'wss://bsky.network',
  subscriptionReconnectDelay: parseInt(process.env.FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY || '3000', 10),
}
