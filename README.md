# Photonics Feed for Bluesky

A custom Bluesky feed generator that shows posts containing the word "photonics".

## How It Works

This feed generator:
1. Connects to the Bluesky firehose to listen for all new posts
2. Filters posts that contain the word "photonics" (case-insensitive)
3. Stores matching posts in a SQLite database
4. Serves the feed via an HTTP API that Bluesky can query

## Setup

### Prerequisites

- Node.js 18+
- A domain/hostname where you'll host the feed
- A Bluesky account

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `FEEDGEN_HOSTNAME` - Your domain (e.g., `feeds.example.com`)
- `FEEDGEN_PUBLISHER_DID` - Your Bluesky DID (find it in your profile settings)
- `FEEDGEN_PORT` - Port to run the server on (default: 3000)

### Running

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

### Publishing the Feed

To register your feed on Bluesky, add these to your `.env`:
- `BLUESKY_HANDLE` - Your Bluesky handle
- `BLUESKY_APP_PASSWORD` - An app password from Bluesky settings

Then run:
```bash
npx ts-node scripts/publishFeed.ts
```

## API Endpoints

- `GET /` - Health check
- `GET /.well-known/did.json` - DID document for the feed generator
- `GET /xrpc/app.bsky.feed.describeFeedGenerator` - Feed generator description
- `GET /xrpc/app.bsky.feed.getFeedSkeleton` - The feed skeleton (list of posts)

## Deployment

The feed generator needs to be accessible via HTTPS at your configured hostname. You can use services like:
- Railway
- Fly.io
- DigitalOcean
- Any VPS with a reverse proxy (nginx, Caddy)

Make sure to set up SSL and point your domain to your server.
