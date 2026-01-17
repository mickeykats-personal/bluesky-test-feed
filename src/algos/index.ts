import { Database } from '../db'
import * as photonics from './photonics'

type AlgoHandler = (
  db: Database,
  params: { limit: number; cursor?: string }
) => Promise<{ feed: { post: string }[]; cursor?: string }>

export const algos: Record<string, AlgoHandler> = {
  [photonics.shortname]: photonics.handler,
}
