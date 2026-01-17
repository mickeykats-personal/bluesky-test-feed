import type { VercelRequest, VercelResponse } from '@vercel/node'
import { config } from '../../lib/config'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: config.serviceDid,
    service: [
      {
        id: '#bsky_fg',
        type: 'BskyFeedGenerator',
        serviceEndpoint: `https://${config.hostname}`,
      },
    ],
  })
}
