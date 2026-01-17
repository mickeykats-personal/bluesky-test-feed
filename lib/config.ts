export const config = {
  hostname: process.env.FEEDGEN_HOSTNAME || 'localhost',
  publisherDid: process.env.FEEDGEN_PUBLISHER_DID || '',
  serviceDid: process.env.FEEDGEN_SERVICE_DID || `did:web:${process.env.FEEDGEN_HOSTNAME || 'localhost'}`,
}

export const feedConfig = {
  shortname: 'photonics',
  displayName: 'Photonics',
  description: 'Posts about photonics',
  searchQuery: 'photonics',
}
