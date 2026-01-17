import { AtpAgent, BlobRef } from '@atproto/api'
import dotenv from 'dotenv'

dotenv.config()

const run = async () => {
  const handle = process.env.BLUESKY_HANDLE
  const password = process.env.BLUESKY_APP_PASSWORD
  const hostname = process.env.FEEDGEN_HOSTNAME

  if (!handle || !password || !hostname) {
    console.error('Missing required environment variables:')
    console.error('  BLUESKY_HANDLE - Your Bluesky handle')
    console.error('  BLUESKY_APP_PASSWORD - An app password from Bluesky settings')
    console.error('  FEEDGEN_HOSTNAME - Your feed generator hostname')
    process.exit(1)
  }

  const agent = new AtpAgent({ service: 'https://bsky.social' })

  await agent.login({ identifier: handle, password })
  console.log(`Logged in as ${handle}`)

  const feedGenDid = `did:web:${hostname}`

  // Create the feed record
  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session!.did,
    collection: 'app.bsky.feed.generator',
    rkey: 'photonics',
    record: {
      did: feedGenDid,
      displayName: 'Photonics',
      description: 'Posts about photonics - the science and technology of light',
      createdAt: new Date().toISOString(),
    },
  })

  console.log('Feed published successfully!')
  console.log(`Feed URI: at://${agent.session!.did}/app.bsky.feed.generator/photonics`)
  console.log('')
  console.log('To use this feed:')
  console.log('1. Make sure your feed generator is running and accessible at your hostname')
  console.log('2. Users can find and subscribe to your feed in Bluesky')
}

run().catch((err) => {
  console.error('Error publishing feed:', err)
  process.exit(1)
})
