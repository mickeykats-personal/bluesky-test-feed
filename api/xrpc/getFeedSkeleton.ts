import type { VercelRequest, VercelResponse } from '@vercel/node'
import { config, feedConfig } from '../../lib/config'
import { searchPosts } from '../../lib/feed'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { feed, limit, cursor } = req.query

  // Validate feed parameter
  const expectedFeed = `at://${config.publisherDid}/app.bsky.feed.generator/${feedConfig.shortname}`
  if (feed !== expectedFeed) {
    return res.status(400).json({
      error: 'UnknownFeed',
      message: 'Unknown feed requested',
    })
  }

  // Parse limit (default 30, max 100)
  const parsedLimit = Math.min(Math.max(parseInt(String(limit)) || 30, 1), 100)

  // Search for posts containing "photonics"
  const result = await searchPosts(
    feedConfig.searchQuery,
    parsedLimit,
    cursor ? String(cursor) : undefined
  )

  res.status(200).json({
    feed: result.posts.map((post) => ({ post: post.uri })),
    cursor: result.cursor,
  })
}
