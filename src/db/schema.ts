export interface Post {
  uri: string
  cid: string
  indexedAt: string
}

export interface SubState {
  service: string
  cursor: number
}

export interface DatabaseSchema {
  post: Post
  sub_state: SubState
}
