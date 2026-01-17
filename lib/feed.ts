import { AtpAgent } from '@atproto/api'

const agent = new AtpAgent({ service: 'https://public.api.bsky.app' })

export async function searchPosts(
  query: string,
  limit: number = 30,
  cursor?: string
): Promise<{ posts: { uri: string }[]; cursor?: string }> {
  try {
    const response = await agent.app.bsky.feed.searchPosts({
      q: query,
      limit,
      cursor,
      sort: 'latest',
    })

    const posts = response.data.posts.map((post) => ({
      uri: post.uri,
    }))

    return {
      posts,
      cursor: response.data.cursor,
    }
  } catch (error) {
    console.error('Error searching posts:', error)
    return { posts: [] }
  }
}
