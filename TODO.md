# 📋 TODO: Milestone 1 (Functional Core)

> **Timeline:** 4-6 hours | **Goal:** Demo-able MVP with real-time queue + host controls

---

## 📊 Progress Overview

- **Project Setup:** 0/6 ☐
- **Component Development:** 0/6 ☐
- **Page Development:** 0/3 ☐
- **API Routes:** 0/8 ☐
- **Database Integration:** 0/4 ☐
- **Dummy Data Setup:** 0/3 ☐
- **Styling to Match Spec:** 0/5 ☐
- **State Management:** 0/3 ☐
- **Responsive Design:** 0/4 ☐
- **Testing Checklist:** 0/8 ☐

**Total Progress: 0/50 tasks** (0%)

---

## 🚀 Phase 1: Project Setup

### Task 1.1: Initialize Next.js Application
**What:** Create new Next.js 14 project with TypeScript, Tailwind, App Router
**Why:** Foundation for entire application
**How to Verify:** Run `npm run dev`, see Next.js welcome page at localhost:3000

```bash
npx create-next-app@latest lecturesfrom-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Acceptance Criteria:**
- ☐ Project initializes without errors
- ☐ TypeScript configuration working
- ☐ Tailwind CSS loading
- ☐ Can run `npm run dev` successfully

**Est. Time:** 10 min

---

### Task 1.2: Install Core Dependencies
**What:** Add Supabase, Mux, Uppy, dnd-kit packages
**Why:** Needed for database, uploads, drag-drop functionality
**How to Verify:** Check package.json, no install errors

```bash
npm install @supabase/supabase-js @supabase/ssr \
  @mux/mux-node @mux/mux-player-react \
  @uppy/core @uppy/tus @uppy/react @uppy/dashboard \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  clsx tailwind-merge
```

**Acceptance Criteria:**
- ☐ All packages installed (check package.json)
- ☐ No dependency conflicts
- ☐ `npm run build` completes without errors

**Est. Time:** 5 min

---

### Task 1.3: Configure Tailwind with Digital Workwear Tokens
**What:** Add DW color palette to tailwind.config.js
**Why:** Ensures all components use consistent design system
**How to Verify:** Colors available in VSCode autocomplete, build succeeds

**File:** `tailwind.config.js`
```javascript
colors: {
  dw: {
    base: '#121212',
    surface: '#1E1C1A',
    text: '#E8E5D8',
    textMuted: '#D0CDC2',
    muted: '#A8A595',
    accent: '#C8D400',
    alert: '#D86830',
    olive: '#5A6B56',
    navy: '#3A4350',
    rust: '#7B5B3A',
    success: '#4C7B47',
  }
}
```

**Acceptance Criteria:**
- ☐ DW colors defined in tailwind.config.js
- ☐ Can use `bg-dw-base` in components
- ☐ Tailwind IntelliSense shows dw.* colors

**Est. Time:** 5 min

---

### Task 1.4: Set Up Font Loading
**What:** Configure Inter (body) and Satoshi (headings) fonts
**Why:** Matches Digital Workwear design spec
**How to Verify:** Text renders with correct fonts in browser

**File:** `src/app/layout.tsx`
```typescript
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
})

// Satoshi: Download from fontshare.com or use fallback
```

**Acceptance Criteria:**
- ☐ Inter font loads from Google Fonts
- ☐ Font variables applied to html element
- ☐ Body text uses Inter, headings use Satoshi

**Est. Time:** 10 min

---

### Task 1.5: Create Environment Variables Template
**What:** Set up .env.local with placeholder values
**Why:** Prevents errors when starting development
**How to Verify:** App starts without "missing env var" errors

**File:** `.env.local` (copy from .env.example)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
MUX_TOKEN_ID=placeholder
MUX_TOKEN_SECRET=placeholder
MUX_WEBHOOK_SECRET=placeholder
MUX_LIVE_PLAYBACK_ID_DEFAULT=placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Acceptance Criteria:**
- ☐ .env.local file exists
- ☐ .gitignore includes .env.local
- ☐ App starts (even with placeholder values)

**Est. Time:** 2 min

---

### Task 1.6: Create Project File Structure
**What:** Set up all directories and empty files
**Why:** Organized structure makes development faster
**How to Verify:** All folders exist, easy to find files

```
src/
  app/
    api/
      mux/
        create-upload/route.ts
        webhook/route.ts
      submissions/route.ts
      queue/
        approve/route.ts
        play/route.ts
        skip/route.ts
        reorder/route.ts
      log/route.ts
    submit/[token]/page.tsx
    host/[eventId]/page.tsx
    live/[eventId]/page.tsx
    layout.tsx
    page.tsx
  components/
    FileUploader.tsx
    HostQueue.tsx
    LivePlayer.tsx
    NowPlaying.tsx
    ProcessingBadge.tsx
  lib/
    supabase.ts
    supabase-server.ts
    mux.ts
    hooks/
      useRealtimeQueue.ts
      useRealtimeNowPlaying.ts
```

**Acceptance Criteria:**
- ☐ All directories created
- ☐ Empty files exist (prevents import errors)
- ☐ TypeScript doesn't complain about missing files

**Est. Time:** 5 min

---

## 🧩 Phase 2: Component Development

### Task 2.1: Build ProcessingBadge Component
**What:** Badge showing "⏳ Processing" or "✓ Ready" based on playback_id
**Why:** Prevents hosts from playing unprocessed tracks
**How to Verify:** Shows pulse animation when playback_id is null, green checkmark when set

**File:** `src/components/ProcessingBadge.tsx`
```typescript
interface ProcessingBadgeProps {
  playback_id: string | null
}

export function ProcessingBadge({ playback_id }: ProcessingBadgeProps) {
  if (!playback_id) {
    return (
      <span className="text-dw-muted animate-pulse">
        ⏳ Processing
      </span>
    )
  }

  return (
    <span className="text-dw-success">
      ✓ Ready
    </span>
  )
}
```

**Acceptance Criteria:**
- ☐ Shows "Processing" with pulse when playback_id null
- ☐ Shows "Ready" with green color when playback_id exists
- ☐ Uses DW color tokens (dw-muted, dw-success)

**Est. Time:** 10 min

---

### Task 2.2: Build NowPlaying Component
**What:** Display current track (title, artist, processing status)
**Why:** Shows what's playing on both host and live pages
**How to Verify:** Renders track info, updates when now_playing changes

**File:** `src/components/NowPlaying.tsx`
```typescript
interface NowPlayingProps {
  submission: {
    track_title: string
    artist_name: string
    playback_id: string | null
  } | null
}

export function NowPlaying({ submission }: NowPlayingProps) {
  if (!submission) {
    return <div className="text-dw-muted">No track playing</div>
  }

  return (
    <div className="bg-dw-surface p-6 rounded">
      <h2 className="text-dw-h2 mb-2">{submission.track_title}</h2>
      <p className="text-dw-body">{submission.artist_name}</p>
      <ProcessingBadge playback_id={submission.playback_id} />
    </div>
  )
}
```

**Acceptance Criteria:**
- ☐ Shows track title and artist
- ☐ Includes ProcessingBadge
- ☐ Handles null state (no track playing)
- ☐ Uses DW typography classes

**Est. Time:** 15 min

---

### Task 2.3: Build FileUploader Component (Uppy + Tus)
**What:** Upload component with progress bar, handles large files
**Why:** Fans submit audio files (up to 500MB)
**How to Verify:** Can upload 50MB MP3, shows progress, completes successfully

**File:** `src/components/FileUploader.tsx`
```typescript
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/react'

interface FileUploaderProps {
  onUploadComplete: (uploadId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 500 * 1024 * 1024, // 500MB
      allowedFileTypes: ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.ogg']
    }
  })
  .use(Tus, {
    endpoint: '', // Set from /api/mux/create-upload response
    retryDelays: [0, 1000, 3000, 5000],
    chunkSize: 50 * 1024 * 1024 // 50MB chunks
  })

  uppy.on('upload-success', (file, response) => {
    const uploadId = response.uploadURL.split('/').pop()
    onUploadComplete(uploadId)
  })

  return <Dashboard uppy={uppy} theme="dark" />
}
```

**Acceptance Criteria:**
- ☐ Only accepts audio file types
- ☐ Shows progress bar during upload
- ☐ Calls onUploadComplete with uploadId
- ☐ Handles errors gracefully (shows retry button)

**Est. Time:** 30 min

---

### Task 2.4: Build LivePlayer Component (Mux Player)
**What:** Embedded Mux Player for live stream playback
**Why:** Fans watch the live event
**How to Verify:** Player loads, shows Mux stream (test with playback_id)

**File:** `src/components/LivePlayer.tsx`
```typescript
import MuxPlayer from '@mux/mux-player-react'

interface LivePlayerProps {
  playbackId: string
}

export function LivePlayer({ playbackId }: LivePlayerProps) {
  return (
    <MuxPlayer
      streamType="live"
      playbackId={playbackId}
      metadata={{
        video_title: 'Live Event',
      }}
      theme="minimal"
      accentColor="#C8D400" // dw-accent
    />
  )
}
```

**Acceptance Criteria:**
- ☐ Mux Player renders
- ☐ Uses minimal theme
- ☐ Accent color matches DW palette
- ☐ Handles invalid playback_id (shows error)

**Est. Time:** 15 min

---

### Task 2.5: Build HostQueue Component (Drag-and-Drop)
**What:** Queue list with approve/play/skip buttons, drag to reorder
**Why:** Host manages submission queue
**How to Verify:** Can drag items, buttons trigger correct actions

**File:** `src/components/HostQueue.tsx`
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'

interface HostQueueProps {
  submissions: Submission[]
  onApprove: (id: string) => void
  onPlay: (id: string) => void
  onSkip: (id: string) => void
  onReorder: (ids: string[]) => void
}

export function HostQueue({ submissions, onApprove, onPlay, onSkip, onReorder }: HostQueueProps) {
  // Implement drag-and-drop with @dnd-kit
  // Show different sections: Pending, Approved, Playing/Done
  // Buttons styled per DW spec
}
```

**Acceptance Criteria:**
- ☐ Pending section shows unapproved submissions
- ☐ Approved section shows draggable queue
- ☐ Approve button moves item to approved
- ☐ Play button updates now_playing
- ☐ Skip button marks as skipped
- ☐ Drag handles work on mobile (48px tap target)

**Est. Time:** 45 min

---

### Task 2.6: Build Empty State Component
**What:** "No submissions yet" message with share link
**Why:** Guides hosts when queue is empty
**How to Verify:** Shows when submissions array is empty

**File:** `src/components/EmptyState.tsx`
```typescript
interface EmptyStateProps {
  token: string
}

export function EmptyState({ token }: EmptyStateProps) {
  const submitUrl = `${process.env.NEXT_PUBLIC_APP_URL}/submit/${token}`

  return (
    <div className="bg-dw-surface p-8 rounded text-center">
      <p className="text-dw-muted mb-4">No submissions yet</p>
      <p className="text-dw-body mb-4">Share this link to collect tracks:</p>
      <code className="bg-dw-base px-4 py-2 rounded text-dw-accent">
        {submitUrl}
      </code>
    </div>
  )
}
```

**Acceptance Criteria:**
- ☐ Shows submission URL
- ☐ URL is copyable (click to select)
- ☐ Uses DW colors (90% neutral)

**Est. Time:** 10 min

---

## 📄 Phase 3: Page Development

### Task 3.1: Build Submission Page (/submit/[token])
**What:** Public form for fans to submit tracks
**Why:** Entry point for fan submissions
**How to Verify:** Can access /submit/demo123, upload file, submit metadata

**File:** `src/app/submit/[token]/page.tsx`
```typescript
export default async function SubmitPage({ params }: { params: { token: string } }) {
  // 1. Fetch event by token (validate it exists)
  // 2. Show FileUploader component
  // 3. Show form: Artist Name, Track Title
  // 4. On upload complete, POST to /api/submissions
  // 5. Show success message
}
```

**Acceptance Criteria:**
- ☐ Validates token (shows error if invalid)
- ☐ FileUploader works (shows progress)
- ☐ Form submits to /api/submissions
- ☐ Shows success state ("Submitted! We'll notify you...")
- ☐ Mobile-friendly (works on 375px screen)

**Est. Time:** 30 min

---

### Task 3.2: Build Host Dashboard (/host/[eventId])
**What:** Queue management interface for hosts
**Why:** Core host workflow (approve, reorder, play, skip)
**How to Verify:** Can manage queue, real-time updates work

**File:** `src/app/host/[eventId]/page.tsx`
```typescript
export default function HostDashboard({ params }: { params: { eventId: string } }) {
  // 1. Fetch event (verify user is host)
  // 2. Subscribe to realtime queue updates
  // 3. Subscribe to realtime now_playing updates
  // 4. Show NowPlaying component
  // 5. Show HostQueue component
  // 6. Wire up approve/play/skip/reorder actions
}
```

**Acceptance Criteria:**
- ☐ Auth check (only event host can access)
- ☐ Real-time updates work (<1s latency)
- ☐ Now Playing panel shows current track
- ☐ Queue shows pending + approved submissions
- ☐ All buttons work (approve, play, skip, reorder)

**Est. Time:** 45 min

---

### Task 3.3: Build Live Page (/live/[eventId])
**What:** Public view of live event (player + queue)
**Why:** Fans watch live stream and see queue progress
**How to Verify:** Shows Mux player, updates when host plays next track

**File:** `src/app/live/[eventId]/page.tsx`
```typescript
export default function LivePage({ params }: { params: { eventId: string } }) {
  // 1. Fetch event details
  // 2. Subscribe to realtime now_playing
  // 3. Subscribe to realtime queue (approved items only)
  // 4. Show LivePlayer with mux_live_playback_id
  // 5. Show NowPlaying component
  // 6. Show upcoming queue (read-only)
}
```

**Acceptance Criteria:**
- ☐ Mux Player loads and plays stream
- ☐ Now Playing updates in <1s when host changes
- ☐ Queue shows next 5 tracks
- ☐ Works on mobile (responsive player)
- ☐ No host controls visible (read-only for fans)

**Est. Time:** 30 min

---

## 🔌 Phase 4: API Routes

### Task 4.1: Create Mux Upload Route
**What:** Returns Mux Direct Upload URL for client
**Why:** Fans upload files directly to Mux (not our server)
**How to Verify:** POST request returns upload URL, can upload to it

**File:** `src/app/api/mux/create-upload/route.ts`
```typescript
import Mux from '@mux/mux-node'

export async function POST(req: Request) {
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  })

  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL,
    new_asset_settings: {
      playback_policy: ['public'],
    },
  })

  return Response.json({ uploadUrl: upload.url, uploadId: upload.id })
}
```

**Acceptance Criteria:**
- ☐ Returns uploadUrl and uploadId
- ☐ CORS configured correctly
- ☐ Can upload file to returned URL
- ☐ Logs errors properly

**Est. Time:** 20 min

---

### Task 4.2: Create Mux Webhook Handler
**What:** Receives asset.ready webhook, updates playback_id
**Why:** Knows when uploaded file is ready to play
**How to Verify:** Webhook fires after upload, playback_id gets set

**File:** `src/app/api/mux/webhook/route.ts`
```typescript
import Mux from '@mux/mux-node'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('mux-signature')

  // Verify webhook signature
  const isValid = Mux.Webhooks.verifyHeader(
    body,
    signature,
    process.env.MUX_WEBHOOK_SECRET
  )

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.type === 'video.asset.ready') {
    const { upload_id, playback_ids } = event.data

    const supabase = createClient()
    await supabase
      .from('submissions')
      .update({ playback_id: playback_ids[0].id })
      .eq('upload_id', upload_id)
  }

  return new Response('OK', { status: 200 })
}
```

**Acceptance Criteria:**
- ☐ Verifies webhook signature (security)
- ☐ Updates playback_id in database
- ☐ Handles errors (logs, doesn't crash)
- ☐ Returns 200 OK (Mux retries on failure)

**Est. Time:** 25 min

---

### Task 4.3: Create Submissions Route
**What:** Create submission record in database
**Why:** Links upload to event + metadata
**How to Verify:** POST creates row in submissions table

**File:** `src/app/api/submissions/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { event_id, artist_name, track_title, upload_id } = await req.json()

  const supabase = createClient()

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      event_id,
      artist_name,
      track_title,
      upload_id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  // Log event
  await supabase.from('event_logs').insert({
    event_id,
    action: 'submit',
    payload: { submission_id: data.id, artist_name, track_title },
  })

  return Response.json(data)
}
```

**Acceptance Criteria:**
- ☐ Creates submission with status='pending'
- ☐ Logs submit event to event_logs
- ☐ Returns created submission
- ☐ Handles errors (duplicate, missing fields)

**Est. Time:** 20 min

---

### Task 4.4: Create Queue Approve Route
**What:** Set submission status to 'approved', assign queue_position
**Why:** Host approves track for queue
**How to Verify:** POST updates status, assigns position

**File:** `src/app/api/queue/approve/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { submission_id } = await req.json()

  const supabase = createClient()

  // Get max queue_position for approved items
  const { data: maxPos } = await supabase
    .from('submissions')
    .select('queue_position')
    .eq('status', 'approved')
    .order('queue_position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (maxPos?.queue_position || 0) + 1

  const { data, error } = await supabase
    .from('submissions')
    .update({ status: 'approved', queue_position: nextPosition })
    .eq('id', submission_id)
    .select()
    .single()

  // Log event
  await supabase.from('event_logs').insert({
    event_id: data.event_id,
    action: 'approve',
    payload: { submission_id, queue_position: nextPosition },
  })

  return Response.json(data)
}
```

**Acceptance Criteria:**
- ☐ Updates status to 'approved'
- ☐ Assigns next queue_position
- ☐ Logs approve event
- ☐ Only host can approve (RLS enforces)

**Est. Time:** 20 min

---

### Task 4.5: Create Queue Play Route
**What:** Set status to 'playing', update now_playing table
**Why:** Host clicks "Play" on track
**How to Verify:** POST updates now_playing, live page reflects change

**File:** `src/app/api/queue/play/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { submission_id, event_id } = await req.json()

  const supabase = createClient()

  // Update submission status
  await supabase
    .from('submissions')
    .update({ status: 'playing' })
    .eq('id', submission_id)

  // Update now_playing
  await supabase
    .from('now_playing')
    .upsert({
      event_id,
      submission_id,
      updated_at: new Date().toISOString(),
    })

  // Log event
  await supabase.from('event_logs').insert({
    event_id,
    action: 'play',
    payload: { submission_id },
  })

  return Response.json({ success: true })
}
```

**Acceptance Criteria:**
- ☐ Updates submission.status to 'playing'
- ☐ Updates now_playing.submission_id
- ☐ Logs play event
- ☐ Triggers realtime update (live page sees change)

**Est. Time:** 20 min

---

### Task 4.6: Create Queue Skip Route
**What:** Set status to 'skipped', advance to next track
**Why:** Host skips inappropriate/bad submissions
**How to Verify:** POST updates status, doesn't advance now_playing

**File:** `src/app/api/queue/skip/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { submission_id, event_id } = await req.json()

  const supabase = createClient()

  await supabase
    .from('submissions')
    .update({ status: 'skipped' })
    .eq('id', submission_id)

  // Log event
  await supabase.from('event_logs').insert({
    event_id,
    action: 'skip',
    payload: { submission_id, reason: 'manual' },
  })

  return Response.json({ success: true })
}
```

**Acceptance Criteria:**
- ☐ Updates status to 'skipped'
- ☐ Logs skip event with reason
- ☐ Does NOT change now_playing

**Est. Time:** 15 min

---

### Task 4.7: Create Queue Reorder Route
**What:** Update queue_position for multiple submissions
**Why:** Host drags to reorder approved queue
**How to Verify:** POST updates positions based on array order

**File:** `src/app/api/queue/reorder/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { submission_ids } = await req.json() // Array of IDs in new order

  const supabase = createClient()

  // Update each submission's queue_position
  const updates = submission_ids.map((id: string, index: number) =>
    supabase
      .from('submissions')
      .update({ queue_position: index + 1 })
      .eq('id', id)
  )

  await Promise.all(updates)

  return Response.json({ success: true })
}
```

**Acceptance Criteria:**
- ☐ Accepts array of submission IDs
- ☐ Updates queue_position to match array order
- ☐ Works with drag-and-drop in HostQueue

**Est. Time:** 15 min

---

### Task 4.8: Create Log Route
**What:** Generic event logging endpoint
**Why:** Track analytics (submit, approve, play, skip)
**How to Verify:** POST creates event_logs row

**File:** `src/app/api/log/route.ts`
```typescript
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { event_id, profile_id, action, payload } = await req.json()

  const supabase = createClient()

  const { data, error } = await supabase
    .from('event_logs')
    .insert({ event_id, profile_id, action, payload })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json(data)
}
```

**Acceptance Criteria:**
- ☐ Inserts row into event_logs
- ☐ Accepts flexible payload (jsonb)
- ☐ Returns created log entry

**Est. Time:** 10 min

---

## 💾 Phase 5: Database Integration

### Task 5.1: Create Supabase Browser Client
**What:** Client-side Supabase connection (uses anon key)
**Why:** Pages and components query database
**How to Verify:** Can query from browser, RLS policies enforced

**File:** `src/lib/supabase.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Acceptance Criteria:**
- ☐ Returns configured Supabase client
- ☐ Uses anon key (safe for browser)
- ☐ RLS policies protect data

**Est. Time:** 5 min

---

### Task 5.2: Create Supabase Server Client
**What:** Server-side Supabase connection (uses service role key)
**Why:** API routes need elevated permissions (bypasses RLS)
**How to Verify:** Can update from API routes

**File:** `src/lib/supabase-server.ts`
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

**Acceptance Criteria:**
- ☐ Uses service role key (bypasses RLS)
- ☐ Only used in API routes (never browser)
- ☐ No session persistence (stateless)

**Est. Time:** 5 min

---

### Task 5.3: Create useRealtimeQueue Hook
**What:** Subscribe to submissions table changes for an event
**Why:** Host dashboard and live page update in real-time
**How to Verify:** Changes appear without refresh

**File:** `src/lib/hooks/useRealtimeQueue.ts`
```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useRealtimeQueue(eventId: string) {
  const [submissions, setSubmissions] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('submissions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at')
      .then(({ data }) => setSubmissions(data || []))

    // Subscribe to changes
    const channel = supabase
      .channel(`queue:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions',
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSubmissions(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setSubmissions(prev => prev.map(s =>
            s.id === payload.new.id ? payload.new : s
          ))
        }
      })
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return submissions
}
```

**Acceptance Criteria:**
- ☐ Returns submissions array
- ☐ Updates on INSERT (new submission)
- ☐ Updates on UPDATE (status change)
- ☐ Cleans up subscription on unmount
- ☐ No duplicate subscriptions (check DevTools)

**Est. Time:** 25 min

---

### Task 5.4: Create useRealtimeNowPlaying Hook
**What:** Subscribe to now_playing table changes
**Why:** Live page shows current track instantly
**How to Verify:** Updates <1s when host clicks play

**File:** `src/lib/hooks/useRealtimeNowPlaying.ts`
```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useRealtimeNowPlaying(eventId: string) {
  const [nowPlaying, setNowPlaying] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('now_playing')
      .select('*, submission:submissions(*)')
      .eq('event_id', eventId)
      .single()
      .then(({ data }) => setNowPlaying(data?.submission || null))

    // Subscribe to changes
    const channel = supabase
      .channel(`live:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'now_playing',
        filter: `event_id=eq.${eventId}`,
      }, async (payload) => {
        // Fetch full submission data
        const { data } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', payload.new.submission_id)
          .single()

        setNowPlaying(data)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return nowPlaying
}
```

**Acceptance Criteria:**
- ☐ Returns current submission or null
- ☐ Updates when now_playing changes
- ☐ Fetches full submission data (joins)
- ☐ Cleans up subscription

**Est. Time:** 25 min

---

## 🧪 Phase 6: Dummy Data Setup

### Task 6.1: Create Seed Script for Test Event
**What:** Insert sample event into database
**Why:** Can test without setting up real event
**How to Verify:** Event exists at /host/[test-event-id]

**File:** `scripts/seed.sql`
```sql
-- Insert test event
INSERT INTO events (id, name, token, is_live, mux_live_playback_id)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Test Listening Party',
  'demo123',
  true,
  'placeholder-playback-id'
)
ON CONFLICT DO NOTHING;

-- Insert test profile (update with your Supabase user ID)
-- INSERT INTO profiles (id, display_name, role)
-- VALUES ('your-user-id', 'Test Host', 'host')
-- ON CONFLICT DO NOTHING;
```

**Acceptance Criteria:**
- ☐ Event accessible at /submit/demo123
- ☐ Event accessible at /host/[event-id]
- ☐ Event accessible at /live/[event-id]

**Est. Time:** 10 min

---

### Task 6.2: Create Fake Submissions
**What:** Insert 5 submissions in various states
**Why:** See how queue looks with data
**How to Verify:** Host dashboard shows submissions

**File:** `scripts/seed.sql` (append)
```sql
INSERT INTO submissions (event_id, artist_name, track_title, status, queue_position)
VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Test Artist 1', 'Pending Track', 'pending', null),
  ('123e4567-e89b-12d3-a456-426614174000', 'Test Artist 2', 'Approved Track', 'approved', 1),
  ('123e4567-e89b-12d3-a456-426614174000', 'Test Artist 3', 'Playing Track', 'playing', 2),
  ('123e4567-e89b-12d3-a456-426614174000', 'Test Artist 4', 'Skipped Track', 'skipped', null),
  ('123e4567-e89b-12d3-a456-426614174000', 'Test Artist 5', 'Another Approved', 'approved', 3);
```

**Acceptance Criteria:**
- ☐ 5 submissions visible in host dashboard
- ☐ Different states render correctly
- ☐ Queue shows approved items in order

**Est. Time:** 5 min

---

### Task 6.3: Set Now Playing
**What:** Insert now_playing record
**Why:** Test NowPlaying component
**How to Verify:** Live page shows current track

**File:** `scripts/seed.sql` (append)
```sql
INSERT INTO now_playing (event_id, submission_id)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  (SELECT id FROM submissions WHERE track_title = 'Playing Track')
)
ON CONFLICT (event_id) DO UPDATE SET
  submission_id = EXCLUDED.submission_id,
  updated_at = NOW();
```

**Acceptance Criteria:**
- ☐ Live page shows "Playing Track" by "Test Artist 3"
- ☐ Host dashboard shows same track in Now Playing panel

**Est. Time:** 5 min

---

## 🎨 Phase 7: Styling to Match Spec

### Task 7.1: Apply DW Background Colors
**What:** Set bg-dw-base on body, bg-dw-surface on cards
**Why:** Matches Digital Workwear spec (dark matte)
**How to Verify:** All pages have dark background

**File:** `src/app/globals.css`
```css
body {
  @apply bg-dw-base text-dw-text;
}
```

**Acceptance Criteria:**
- ☐ Body background is #121212
- ☐ Cards/panels use #1E1C1A
- ☐ Text is off-white #E8E5D8

**Est. Time:** 10 min

---

### Task 7.2: Apply Typography Classes
**What:** Use Satoshi for headings, Inter for body
**Why:** Matches DW spec
**How to Verify:** Inspect fonts in DevTools

**Acceptance Criteria:**
- ☐ H1/H2 use Satoshi 800
- ☐ Body text uses Inter 400/600
- ☐ Labels use uppercase + letter-spacing

**Est. Time:** 10 min

---

### Task 7.3: Enforce 1% Hi-Vis Rule
**What:** Only "Play" button and live indicator use dw-accent
**Why:** Core DW principle (minimal accent color)
**How to Verify:** Count elements with dw-accent class

**Acceptance Criteria:**
- ☐ Play button uses bg-dw-accent
- ☐ Live badge uses text-dw-accent
- ☐ All other buttons use neutral colors
- ☐ <1% of DOM nodes use accent color

**Est. Time:** 15 min

---

### Task 7.4: Style Processing Badge States
**What:** Correct colors for pending vs. ready
**Why:** Matches spec (muted pulse → green check)
**How to Verify:** See badge change color when playback_id set

**Acceptance Criteria:**
- ☐ Pending: text-dw-muted with animate-pulse
- ☐ Ready: text-dw-success
- ☐ Uses correct emoji icons (⏳ vs ✓)

**Est. Time:** 5 min

---

### Task 7.5: Style Form Inputs
**What:** Dark inputs with DW borders
**Why:** Consistent with DW theme
**How to Verify:** Submission form inputs match palette

**Acceptance Criteria:**
- ☐ Inputs use bg-dw-surface
- ☐ Borders use border-dw-muted
- ☐ Focus state uses border-dw-accent
- ☐ Placeholder text uses text-dw-muted

**Est. Time:** 10 min

---

## 🔄 Phase 8: State Management

### Task 8.1: Wire Realtime Subscriptions
**What:** Call useRealtimeQueue in host dashboard
**Why:** Queue updates automatically
**How to Verify:** Approve track in one tab, see update in another

**Acceptance Criteria:**
- ☐ useRealtimeQueue called with eventId
- ☐ Component re-renders on updates
- ☐ No duplicate subscriptions
- ☐ Cleanup on unmount

**Est. Time:** 15 min

---

### Task 8.2: Handle Optimistic Updates
**What:** Update local state before API response
**Why:** UI feels instant (don't wait for server)
**How to Verify:** Button clicks feel snappy

**Example:**
```typescript
async function handleApprove(id: string) {
  // Optimistic update
  setSubmissions(prev => prev.map(s =>
    s.id === id ? { ...s, status: 'approved' } : s
  ))

  // API call
  await fetch('/api/queue/approve', {
    method: 'POST',
    body: JSON.stringify({ submission_id: id }),
  })

  // Realtime will sync actual state
}
```

**Acceptance Criteria:**
- ☐ UI updates immediately on button click
- ☐ Realtime sync corrects if API fails
- ☐ No flickering (optimistic → real state)

**Est. Time:** 20 min

---

### Task 8.3: Add Loading States
**What:** Show spinners while API calls in flight
**Why:** User feedback (is something happening?)
**How to Verify:** See spinner when clicking buttons

**Acceptance Criteria:**
- ☐ Buttons show loading spinner during API call
- ☐ Buttons disabled while loading
- ☐ Spinner matches DW colors (text-dw-muted)

**Est. Time:** 15 min

---

## 📱 Phase 9: Responsive Design

### Task 9.1: Mobile-First Submission Page
**What:** Test on 375px viewport (iPhone SE)
**Why:** Most fans submit from phones
**How to Verify:** Form usable on small screen

**Acceptance Criteria:**
- ☐ Form fields stack vertically on mobile
- ☐ Upload button is full-width
- ☐ Text is readable (16px minimum)
- ☐ Touch targets ≥44px

**Est. Time:** 15 min

---

### Task 9.2: Responsive Host Dashboard
**What:** Queue works on tablet (768px)
**Why:** Hosts might use iPad
**How to Verify:** Dashboard usable on medium screens

**Acceptance Criteria:**
- ☐ Queue items don't overflow
- ☐ Buttons remain visible
- ☐ Drag handles work on touch
- ☐ Now Playing panel doesn't collapse

**Est. Time:** 20 min

---

### Task 9.3: Responsive Live Page
**What:** Player scales correctly on all devices
**Why:** Fans watch on phones, tablets, desktops
**How to Verify:** Test on 375px, 768px, 1440px

**Acceptance Criteria:**
- ☐ Mux Player maintains aspect ratio
- ☐ Queue list doesn't overflow
- ☐ Text is readable at all sizes

**Est. Time:** 15 min

---

### Task 9.4: Test Landscape Orientation
**What:** Ensure mobile landscape works
**Why:** Users might rotate phone for video
**How to Verify:** Test on real device or DevTools

**Acceptance Criteria:**
- ☐ Player fills available space
- ☐ Queue scrolls if needed
- ☐ No horizontal overflow

**Est. Time:** 10 min

---

## ✅ Phase 10: Testing Checklist

### Test 10.1: End-to-End Submission Flow
**What:** Complete flow from submission to playback
**Why:** Validates entire user journey
**How to Test:**

1. ☐ Open /submit/demo123 on phone
2. ☐ Upload 50MB MP3 file
3. ☐ Fill in artist name and track title
4. ☐ Submit form
5. ☐ See success message
6. ☐ Check host dashboard (new tab on laptop)
7. ☐ See submission appear with "Processing" badge
8. ☐ Wait 30 seconds (Mux transcodes)
9. ☐ See badge change to "Ready"
10. ☐ Click "Approve" button
11. ☐ See submission move to approved queue
12. ☐ Drag to reorder (if multiple approved)
13. ☐ Click "Play" button
14. ☐ Check live page (new tab)
15. ☐ See "Now Playing" update within 1 second
16. ☐ Click "Skip" on host dashboard
17. ☐ See status change to "skipped"

**Success:** All steps complete without errors

**Est. Time:** 20 min

---

### Test 10.2: RLS Policy Enforcement
**What:** Verify security rules work
**Why:** Prevents unauthorized access
**How to Test:**

1. ☐ Try accessing /host/[eventId] without auth → should redirect
2. ☐ Try updating submission via API without auth → should fail (403)
3. ☐ Try accessing another host's event → should fail
4. ☐ Verify anon users can submit (public submission works)
5. ☐ Verify anon users can view live page (public read works)

**Success:** Unauthorized actions are blocked

**Est. Time:** 15 min

---

### Test 10.3: Webhook Signature Verification
**What:** Test Mux webhook security
**Why:** Prevents spoofed webhooks
**How to Test:**

1. ☐ Send webhook with invalid signature → should return 401
2. ☐ Send webhook with valid signature → should return 200
3. ☐ Check logs for signature verification errors
4. ☐ Verify playback_id only updates on valid webhooks

**Success:** Invalid signatures are rejected

**Est. Time:** 10 min

---

### Test 10.4: Realtime Subscription Cleanup
**What:** Check for memory leaks
**Why:** Prevents duplicate subscriptions
**How to Test:**

1. ☐ Open host dashboard
2. ☐ Navigate to home page
3. ☐ Navigate back to host dashboard
4. ☐ Repeat 5 times
5. ☐ Open Chrome DevTools → Memory profiler
6. ☐ Check Supabase subscriptions count (should be 2, not 12)
7. ☐ Verify useEffect cleanup runs (add console.log)

**Success:** Subscriptions drop to 0 when navigating away

**Est. Time:** 10 min

---

### Test 10.5: Large File Upload
**What:** Upload 500MB FLAC file
**Why:** Validates Mux upload limits
**How to Test:**

1. ☐ Prepare 500MB FLAC test file
2. ☐ Upload via submission form
3. ☐ Watch progress bar (should show 0-100%)
4. ☐ Verify upload completes (get upload_id)
5. ☐ Check Mux dashboard (asset should appear)
6. ☐ Wait for webhook (playback_id should be set)

**Success:** Large file uploads without errors

**Est. Time:** 15 min

---

### Test 10.6: Mobile Safari Upload
**What:** Test on real iPhone
**Why:** iOS has unique upload quirks
**How to Test:**

1. ☐ Deploy to Vercel (local dev won't work on phone)
2. ☐ Open /submit/demo123 on iPhone Safari
3. ☐ Upload audio file from Files app
4. ☐ Verify progress bar shows
5. ☐ Verify upload completes
6. ☐ Check submission appears in database

**Success:** Upload works on iOS Safari

**Est. Time:** 15 min

---

### Test 10.7: Event Logs Populated
**What:** Verify analytics tracking
**Why:** Need data for future insights
**How to Test:**

1. ☐ Run full submission flow
2. ☐ Query event_logs table in Supabase
3. ☐ Verify entries for: submit, approve, play, skip
4. ☐ Check payload structure matches spec
5. ☐ Verify timestamps are accurate

**Success:** All actions logged correctly

**Est. Time:** 10 min

---

### Test 10.8: Cross-Browser Compatibility
**What:** Test on Chrome, Safari, Firefox
**Why:** Ensure wide compatibility
**How to Test:**

1. ☐ Chrome (desktop): Full flow works
2. ☐ Safari (desktop): Full flow works
3. ☐ Firefox (desktop): Full flow works
4. ☐ Chrome (mobile): Submission works
5. ☐ Safari (iOS): Submission works

**Success:** Works on all browsers

**Est. Time:** 20 min

---

## 🎉 M1 Completion Criteria

**Ready to Demo When:**

✅ All 50 tasks completed
✅ Can submit track from phone → appears in host dashboard <1s
✅ Can approve, reorder, play, skip from host dashboard
✅ Live page updates in real-time when host plays next track
✅ Processing badge prevents playing unready tracks
✅ Event_logs has entries for all actions
✅ UI matches DW palette (90% neutral, 1% accent)
✅ Mobile-responsive (tested on real device)
✅ Zero TypeScript errors, zero console errors

**Next Steps After M1:**
1. Run test event with 5 friends (collect UX feedback)
2. Document bugs/improvements for M2
3. Begin M2 tasks (reliability + polish)

---

**Last Updated:** 2025-10-04
**Estimated Total Time:** 4-6 hours
**Current Progress:** 0/50 tasks (0%)
