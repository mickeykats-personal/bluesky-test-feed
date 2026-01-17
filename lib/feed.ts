import { AtpAgent } from '@atproto/api'

const agent = new AtpAgent({ service: 'https://bsky.social' })

let isLoggedIn = false

async function ensureLoggedIn() {
  if (isLoggedIn) return

  const handle = process.env.BLUESKY_HANDLE
  const password = process.env.BLUESKY_APP_PASSWORD

  if (handle && password) {
    try {
      await agent.login({ identifier: handle, password })
      isLoggedIn = true
    } catch (error) {
      console.error('Failed to login:', error)
    }
  }
}

export async function searchPosts(
  query: string,
  limit: number = 30,
  cursor?: string
): Promise<{ posts: { uri: string }[]; cursor?: string }> {
  try {
    await ensureLoggedIn()

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
