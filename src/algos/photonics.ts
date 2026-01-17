import { Database } from '../db'

export const shortname = 'photonics'

export const handler = async (
  db: Database,
  params: { limit: number; cursor?: string }
): Promise<{ feed: { post: string }[]; cursor?: string }> => {
  const { limit, cursor } = params

  let builder = db
    .selectFrom('post')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .limit(limit)

  if (cursor) {
    const [indexedAt, cid] = cursor.split('::')
    if (indexedAt && cid) {
      builder = builder.where('indexedAt', '<', indexedAt)
    }
  }

  const posts = await builder.execute()

  const feed = posts.map((post) => ({
    post: post.uri,
  }))

  let newCursor: string | undefined
  if (posts.length > 0) {
    const lastPost = posts[posts.length - 1]
    newCursor = `${lastPost.indexedAt}::${lastPost.cid}`
  }

  return {
    feed,
    cursor: newCursor,
  }
}
