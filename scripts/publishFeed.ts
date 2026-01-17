import { AtpAgent, BlobRef } from '@atproto/api'
import * as dotenv from 'dotenv'

dotenv.config()

const run = async () => {
  const handle = process.env.BLUESKY_HANDLE
  const password = process.env.BLUESKY_APP_PASSWORD
  const hostname = process.env.FEEDGEN_HOSTNAME
  const publisherDid = process.env.FEEDGEN_PUBLISHER_DID

  if (!handle || !password || !hostname || !publisherDid) {
    console.error('Missing required environment variables.')
    console.error('Required: BLUESKY_HANDLE, BLUESKY_APP_PASSWORD, FEEDGEN_HOSTNAME, FEEDGEN_PUBLISHER_DID')
    process.exit(1)
  }

  const feedConfig = {
    recordName: 'photonics',
    displayName: 'Photonics',
    description: 'Posts about photonics - the science of light generation, detection, and manipulation.',
  }

  const agent = new AtpAgent({ service: 'https://bsky.social' })

  console.log(`Logging in as ${handle}...`)
  await agent.login({ identifier: handle, password })
  console.log('Logged in successfully!')

  const feedUri = `at://${publisherDid}/app.bsky.feed.generator/${feedConfig.recordName}`
  console.log(`Publishing feed: ${feedUri}`)

  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session!.did,
    collection: 'app.bsky.feed.generator',
    rkey: feedConfig.recordName,
    record: {
      did: `did:web:${hostname}`,
      displayName: feedConfig.displayName,
      description: feedConfig.description,
      createdAt: new Date().toISOString(),
    },
  })

  console.log('Feed published successfully!')
  console.log(`Feed URI: ${feedUri}`)
  console.log(`\nYour feed should now be available at:`)
  console.log(`https://bsky.app/profile/${handle}/feed/${feedConfig.recordName}`)
}

run().catch((err) => {
  console.error('Error publishing feed:', err)
  process.exit(1)
})
