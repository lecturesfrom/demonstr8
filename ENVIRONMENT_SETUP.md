# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the `app/` directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AWS IVS (required for live streaming, optional for testing)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get These Values

### Supabase Configuration
1. **NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Go to your Supabase dashboard → Settings → API
   - Copy the Project URL and anon/public key

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - In the same API settings page
   - Copy the service_role key (keep this secret! Server-side only)

### AWS IVS Configuration
1. **Create AWS Account** (if you don't have one):
   - Go to https://aws.amazon.com/
   - Sign up for an account

2. **Create IAM User for IVS**:
   - Go to AWS Console → IAM → Users
   - Create new user with programmatic access
   - Attach policy: `AmazonIVSFullAccess` (or create custom policy with IVS permissions)
   - Copy Access Key ID and Secret Access Key

3. **AWS_REGION**:
   - Choose your preferred AWS region (e.g., `us-east-1`, `us-west-2`, `eu-west-1`)
   - IVS is available in multiple regions

### Application Configuration
1. **NEXT_PUBLIC_APP_URL**:
   - Development: `http://localhost:3000`
   - Production: Your actual domain (e.g., `https://yourdomain.com`)

## Hosting Provider Setup

### Vercel
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add all the variables listed above
4. Make sure to set them for Production, Preview, and Development environments

### Netlify
1. Go to your Netlify site dashboard
2. Site settings → Environment variables
3. Add all the variables listed above

## Supabase Realtime Setup

1. Go to your Supabase dashboard
2. Database → Replication
3. Enable realtime for these tables:
   - `submissions`
   - `now_playing`

## Supabase Storage Setup

The migration script (`migrate-to-ivs.sql`) automatically creates the `audio-submissions` bucket. Verify it exists:

1. Go to your Supabase dashboard
2. Storage → Buckets
3. Verify `audio-submissions` bucket exists and is public

## AWS IVS Setup (Optional for Testing)

For live streaming functionality:

1. **Create IVS Channel**:
   - Use the API route: `POST /api/ivs/create-channel`
   - Or create manually in AWS Console → IVS → Channels
   - Copy the channel ARN, stream key, and playback URL

2. **Update Event with IVS Info**:
   - Update the `events` table with `ivs_channel_arn`, `ivs_stream_key`, and `ivs_playback_url`
   - Or use the API route to create a channel and update the event

3. **Configure OBS for Streaming**:
   - Open OBS
   - Settings → Stream
   - Service: Custom
   - Server: Use the ingest endpoint from IVS channel
   - Stream Key: Use `ivs_stream_key` from the event

## Testing Checklist

After setting up all environment variables:

1. **Upload Test**:
   - Go to `/submit/[token]` for a live event
   - Upload a small audio file (MP3, WAV, FLAC, etc.)
   - Check that submission appears in Supabase `submissions` table with `file_url`
   - File should be immediately available (no processing delay)

2. **Host Dashboard Test**:
   - Go to `/host/[eventId]`
   - Approve a submission
   - Play a submission
   - Verify real-time updates work across multiple browser tabs

3. **Live Page Test**:
   - Go to `/live/[eventId]`
   - Verify "Now Playing" updates in real-time when host plays tracks
   - If IVS channel is configured, verify IVS player loads

4. **Real-time Sync Test**:
   - Open host dashboard in one browser
   - Open live page in another browser
   - Approve/play from host dashboard
   - Verify live page updates instantly (<1 second)

## Troubleshooting

- **No real-time updates**: Verify Supabase realtime is enabled for `submissions` and `now_playing` tables
- **Upload fails**: Check Supabase Storage bucket exists and has correct policies
- **IVS player not loading**: Verify `ivs_playback_url` is set in events table and is a valid IVS HLS URL
- **CORS errors**: Ensure `NEXT_PUBLIC_APP_URL` matches your actual domain
- **Database errors**: Check Supabase logs in dashboard

## Security Notes

- **Never commit `.env.local`** to version control
- **SUPABASE_SERVICE_ROLE_KEY** should only be used server-side (API routes)
- **AWS credentials** should be kept secret and rotated regularly
- Use environment variables in production, never hardcode secrets
