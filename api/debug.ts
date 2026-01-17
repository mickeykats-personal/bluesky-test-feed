import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AtpAgent } from '@atproto/api'
import { feedConfig } from '../lib/config'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const agent = new AtpAgent({ service: 'https://public.api.bsky.app' })

  try {
    const response = await agent.app.bsky.feed.searchPosts({
      q: feedConfig.searchQuery,
      limit: 5,
      sort: 'latest',
    })

    res.status(200).json({
      searchQuery: feedConfig.searchQuery,
      postCount: response.data.posts.length,
      posts: response.data.posts.map(p => ({
        uri: p.uri,
        text: p.record && typeof p.record === 'object' && 'text' in p.record
          ? (p.record as { text: string }).text.substring(0, 100)
          : 'no text',
      })),
    })
  } catch (error) {
    res.status(500).json({
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
