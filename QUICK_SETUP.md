# 🚀 demonstr8 Quick Setup (10 Minutes)

## Current Status
✅ **App:** Next.js 15 with TypeScript, Tailwind CSS
✅ **Database:** Supabase PostgreSQL with Realtime
✅ **Storage:** Supabase Storage for audio files
✅ **Streaming:** AWS IVS (Interactive Video Service)
⏳ **Database:** Needs migration (if not already run)
⏳ **AWS IVS:** Needs channel creation (optional for testing)

## Next Steps (Do These Now)

### 1. Database Setup (3 min)
Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new

**Run Migration:**
- Copy entire contents of `migrate-to-ivs.sql`
- Paste in SQL editor
- Click "Run"

**Run Cleanup (if needed):**
- Copy entire contents of `cleanup-migration.sql`
- Paste in SQL editor
- Click "Run"

**Create Test Event:**
```sql
-- Use create-test-event.sql or run:
INSERT INTO events (id, host_id, name, token, is_live)
VALUES (
  '8bbadfb8-fbc5-497b-9add-29f336fc5f2c'::uuid,
  gen_random_uuid(),
  'Test Live Session',
  'test123',
  true
);
```

### 2. Enable Realtime (1 min)
Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/database/replication

Enable for:
- `submissions`
- `now_playing`

### 3. Environment Variables (2 min)
Create `.env.local` in `app/` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AWS IVS (optional for testing, required for live streaming)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test Everything (2 min)
1. Start dev server: `cd app && npm run dev`
2. Visit: `http://localhost:3000/submit/test123`
3. Upload a small audio file (MP3, WAV, etc.)
4. Check database: Submissions table should have your upload with `file_url`
5. Visit host dashboard: `http://localhost:3000/host/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
6. Approve and play the submission
7. Visit live page: `http://localhost:3000/live/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
8. Verify real-time updates work

## Architecture Overview

✅ **File Upload Flow:**
- Files uploaded directly to Supabase Storage
- Immediate availability (no processing delays)
- Public URLs for playback

✅ **Real-time Updates:**
- Supabase Realtime for instant sync
- All connected clients see changes <1s
- No polling needed

✅ **Streaming (Optional):**
- AWS IVS for live video streaming
- HLS playback via IVSPlayer component
- Low-latency streaming support

## What's Next After Setup?

1. **Set up AWS IVS for live streaming:**
   - Create AWS account and IAM user
   - Add credentials to `.env.local`
   - Create IVS channel via `/api/ivs/create-channel`
   - Configure OBS to stream to IVS RTMP endpoint

2. **Add authentication:**
   - Enable Supabase Auth
   - Protect host routes
   - Track user submissions

3. **Deploy to production:**
   - Vercel for hosting
   - Production database
   - Real domain name

---

**Remember:** The foundation is solid. Files are immediately available after upload, and real-time sync works out of the box. Focus on testing the complete flow first, then add streaming capabilities.
