import type { VercelRequest, VercelResponse } from '@vercel/node'
import { config, feedConfig } from '../../lib/config'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    encoding: 'application/json',
    body: {
      did: config.serviceDid,
      feeds: [
        {
          uri: `at://${config.publisherDid}/app.bsky.feed.generator/${feedConfig.shortname}`,
        },
      ],
    },
  })
}
