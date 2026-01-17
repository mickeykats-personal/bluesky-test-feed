# Photonics Feed for Bluesky

A custom Bluesky feed generator that shows posts containing the word "photonics". Designed to run on Vercel.

## How It Works

This feed generator uses Bluesky's search API to find posts containing "photonics". When someone views your feed, Vercel's serverless functions query Bluesky for matching posts and return them.

**Architecture:**
- No database needed - searches are done on-demand
- Runs on Vercel's free tier
- Uses Bluesky's public search API

## Deployment

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bluesky-test-feed)

Or manually:
1. Fork/clone this repo
2. Go to [vercel.com](https://vercel.com) and import the project
3. Add environment variables (see below)
4. Deploy

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FEEDGEN_HOSTNAME` | Your Vercel domain | `your-feed.vercel.app` |
| `FEEDGEN_PUBLISHER_DID` | Your Bluesky DID | `did:plc:abc123...` |

**Finding your DID:** Go to your Bluesky profile → Settings → Advanced → Copy your DID

### 3. Publish the Feed to Bluesky

After deploying, you need to register the feed with your Bluesky account:

```bash
# Clone the repo locally
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env and fill in your values

# Publish the feed
npm run publish-feed
```

Your feed will then be available at:
`https://bsky.app/profile/YOUR_HANDLE/feed/photonics`

## API Endpoints

- `GET /` - Health check
- `GET /.well-known/did.json` - DID document
- `GET /xrpc/app.bsky.feed.describeFeedGenerator` - Feed description
- `GET /xrpc/app.bsky.feed.getFeedSkeleton` - Feed content

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## Customizing

To search for different terms, edit `lib/config.ts`:

```typescript
export const feedConfig = {
  shortname: 'photonics',
  displayName: 'Photonics',
  description: 'Posts about photonics',
  searchQuery: 'photonics',  // Change this to search for different terms
}
```
