# ⚠️ ARCHIVED: Live Listening + Submission + Monetized Replay — MVP Spec (Digital Workwear Edition)

> **⚠️ HISTORICAL DOCUMENT**: This spec was written for the original Mux-based architecture. The project has since migrated to AWS IVS + Supabase Storage. See [CLAUDE.md](CLAUDE.md) for current architecture and [TODO.md](TODO.md) for current status.
>
> **📚 Related Files:** [@CLAUDE.md](@CLAUDE.md) (project context) | [tech-stack.md](tech-stack.md) (services & setup) | [TODO.md](TODO.md) (M1 tasks) | [.claude/preferences.md](.claude/preferences.md) (communication guide)

---

## 🎯 For Non-Technical Readers

**What This Document Is:**
This is the **product specification** — it defines what we're building, how it should work, and what it should look like.

**What We're Building:**
A platform where artists/DJs run **live listening parties** with fan-submitted tracks. Fans upload audio files via a link, hosts manage a queue in real-time, and everyone watches a live stream together.

**Why It Matters:**
- **For fans:** Easy to submit tracks (just a link, no signup)
- **For hosts:** Real-time queue control (approve/skip/reorder instantly)
- **For the business:** Built-in revenue (tips + replay unlocks)

**How to Use This Spec:**
- **GTM/Product:** Read Vision, Roles, Core Flows, Milestones (skip technical details)
- **Design:** Focus on "Design System — Digital Workwear" section
- **Engineering:** Read entire spec, then check [TODO.md](TODO.md) for implementation tasks

---

## Vision
Enable artists/hosts to run live listening events where fans submit any common audio file, hosts manage a queue in real-time, and sessions can be recorded and monetized later — built with an **industrial, workwear-inspired design language**. Visuals must **not** mimic Nero. Minimal hi‑vis accents; 90% neutral surfaces.

## Non-Goals (MVP)
- Payouts/advanced billing (Stripe Connect later).
- Advanced moderation (simple takedown only).
- Native apps (responsive web only).
- Custom audio stitching (use Mux Live auto-recording).

## Roles
- **Fan**: submits audio, views live page.
- **Host**: manages queue, plays tracks, ends session.
- **Admin**: basic takedown + event management.

## Core Flows (MVP Tonight)
1) Public submission at `/submit/:token` (metadata + file upload → queued).
2) Host dashboard at `/host/:eventId` (approve/reorder/play/skip).
3) Public live page at `/live/:eventId` (Now Playing + next up; embedded live player).
4) Logging for `submit`, `approve`, `play`, `skip` events.

---

## System Architecture

```mermaid
flowchart LR
  A[Client: Fan (Submit)] -->|Direct Upload| MUX[(Mux Direct Upload)]
  A -->|POST| API[Next.js API Routes]
  API --> DB[(Supabase Postgres)]
  DB <-->|Realtime| HOST[Client: Host Dashboard]
  DB <-->|Realtime| LIVE[Client: Public Live Page]
  HOST -->|Controls: approve/play/skip| API
  API --> DB
  subgraph Streaming
    OBS[Host OBS/Browser Audio] --> RTMP[RTMP ingest]
    RTMP --> MuxLive[ Mux Live Stream ]
    MuxLive --> Player[ HLS Player on /live ]
  end
  MUX --> API
  API --> DB
```

### Mux Live Stream Configuration
- **MVP (M1):** Single shared Mux Live Stream; use `MUX_LIVE_PLAYBACK_ID_DEFAULT` for all events
- **Production (M2+):** Each event gets unique `mux_live_playback_id` via Mux API on event creation
- **Rationale:** Shared stream simplifies tonight's build; unique streams enable concurrent events later

---

## Sequence: Submission → Play

```mermaid
sequenceDiagram
  participant Fan
  participant Web as App (Next.js)
  participant SB as Supabase DB/Realtime
  participant Mux as Mux Direct Upload
  participant Host
  Fan->>Web: Open /submit/:token
  Web->>Web: Request Mux Direct Upload URL
  Web->>Mux: Upload audio (tus)
  Mux-->>Web: upload_id
  Web->>SB: Insert submission {event_id, metadata, upload_id}
  Host-->>SB: Subscribed to submissions channel
  Host->>Web: Approve & Play submission
  Web->>SB: Update status=playing; set now_playing
  SB-->>Host: Realtime update (now playing)
  SB-->>Fan: Realtime update (live page shows Now Playing)
```

---

## Data Model (MVP)

### Tables

**profiles**
- `id` uuid PRIMARY KEY (references auth.users)
- `display_name` text
- `role` text CHECK (role IN ('fan', 'host', 'admin')) DEFAULT 'fan'
- `created_at` timestamptz DEFAULT now()

**events**
- `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
- `host_id` uuid REFERENCES profiles(id) ON DELETE CASCADE
- `name` text NOT NULL
- `token` text UNIQUE NOT NULL
- `mux_live_playback_id` text
- `is_live` boolean DEFAULT false
- `starts_at` timestamptz
- `created_at` timestamptz DEFAULT now()

**submissions**
- `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
- `event_id` uuid REFERENCES events(id) ON DELETE CASCADE
- `artist_name` text
- `track_title` text
- `upload_id` text (Mux Direct Upload ID)
- `playback_id` text (set by webhook when asset ready)
- `tip_cents` int DEFAULT 0
- `status` text CHECK (status IN ('pending', 'approved', 'playing', 'skipped', 'done')) DEFAULT 'pending'
- `queue_position` int
- `created_at` timestamptz DEFAULT now()

**now_playing**
- `event_id` uuid PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE
- `submission_id` uuid REFERENCES submissions(id) ON DELETE SET NULL
- `updated_at` timestamptz DEFAULT now()

**event_logs**
- `id` bigserial PRIMARY KEY
- `event_id` uuid
- `profile_id` uuid
- `action` text (submit|approve|play|skip|upload_rejected)
- `payload` jsonb
- `created_at` timestamptz DEFAULT now()

### Row-Level Security Policies

All tables have RLS enabled. Key policies:

**Public Read (Anon + Authed):**
```sql
-- events: only show live events publicly
CREATE POLICY "public_read_live_events" ON events
  FOR SELECT TO anon, authenticated
  USING (is_live = true);

-- submissions: only for live events
CREATE POLICY "public_read_submissions" ON submissions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = submissions.event_id AND events.is_live = true));

-- now_playing: public can see what's playing
CREATE POLICY "public_read_now_playing" ON now_playing
  FOR SELECT TO anon, authenticated
  USING (true);
```

**Public Write (Anon):**
```sql
-- submissions: anyone can submit
CREATE POLICY "anon_insert_submissions" ON submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- event_logs: anyone can log events
CREATE POLICY "anon_insert_logs" ON event_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
```

**Host-Only Write (Authenticated):**
```sql
-- submissions: only event host can update/delete
CREATE POLICY "host_manage_submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = submissions.event_id
    AND events.host_id = auth.uid()
  ));

-- now_playing: only event host can control playback
CREATE POLICY "host_control_playback" ON now_playing
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = now_playing.event_id
    AND events.host_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = now_playing.event_id
    AND events.host_id = auth.uid()
  ));
```

**Admin-Only:**
```sql
-- events: full CRUD for admins
CREATE POLICY "admin_manage_events" ON events
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));
```

### Event Logs Payload Schema

Structured payloads by action type:

- `submit`: `{ submission_id, artist_name, track_title, file_size_mb }`
- `approve`: `{ submission_id, queue_position }`
- `play`: `{ submission_id, playback_id }`
- `skip`: `{ submission_id, reason: 'manual'|'error' }`
- `upload_rejected`: `{ upload_id, reason, file_size_mb }`

---

## API Endpoints (MVP)

**Mux Integration:**
- `POST /api/mux/create-upload` → returns Direct Upload URL + upload_id
- `POST /api/mux/webhook` → verify signature; on `asset.ready`, set `playback_id`

**Submissions:**
- `POST /api/submissions` → create submission (uses upload_id)

**Queue Management:**
- `POST /api/queue/approve` → set status='approved', assign queue_position
- `POST /api/queue/reorder` → accepts `submissionIds[]` array; updates queue_position to match order
- `POST /api/queue/play` → set status='playing', update now_playing
- `POST /api/queue/skip` → set status='skipped', advance to next

**Analytics:**
- `POST /api/log` → append analytics event to event_logs

### Queue Position Logic

- **On insert:** New submissions start with status='pending', queue_position=null
- **On approve:** Set queue_position = (MAX(queue_position) + 1) for approved items
- **On skip/done:** Do NOT renumber; maintain original positions (preserves history)
- **On reorder:** Recalculate queue_position based on drag-drop array order (1-indexed)

### File Upload Validation (Defense-in-Depth)

1. **Client-side (Uppy):** Restrict `allowedFileTypes` [.wav, .mp3, .flac, .aiff, .m4a, .ogg] and `maxFileSize` (500MB) for UX
2. **Mux Direct Upload:** Set `max_file_size` param when creating upload URL
3. **Webhook:** Verify `asset.duration < 3600s` (reject files >1 hour) and `asset.audio_only = true`
4. **On violation:** Write `event_logs` entry with `action: 'upload_rejected'` for analytics

**Rationale:** Client checks prevent accidents; Mux enforces limits; webhook catches manipulation.

---

## Realtime

Subscribe to `submissions` (by `event_id`) and `now_playing` for instant UI updates.

### Channel Naming Convention

- **Queue updates:** `channel('queue:${eventId}').on('postgres_changes', { table: 'submissions', filter: 'event_id=eq.${eventId}' })`
- **Now Playing:** `channel('live:${eventId}').on('postgres_changes', { table: 'now_playing', filter: 'event_id=eq.${eventId}' })`
- **Cleanup:** Call `supabase.removeChannel(channel)` in `useEffect` return to prevent memory leaks

**Rationale:** Event-scoped channels + filters ensure users only see updates for their event.

---

## Design System — **Digital Workwear** (Very Few Hi‑Vis Accents)

### Color Tokens (Tailwind `theme.extend.colors`)

```javascript
colors: {
  dw: {
    base: '#121212',        // primary background (matte black)
    surface: '#1E1C1A',     // panels/cards/forms
    text: '#E8E5D8',        // headings/body default
    textMuted: '#D0CDC2',   // secondary text
    muted: '#A8A595',       // labels/tertiary (updated for WCAG AAA: 6.2:1)
    accent: '#C8D400',      // rare hi-vis (live/primary CTA)
    alert: '#D86830',       // warnings/recording
    olive: '#5A6B56',       // support/ok
    navy: '#3A4350',        // support
    rust: '#7B5B3A',        // support
    success: '#4C7B47',     // confirmations
  }
}
```

**Contrast Validation:**
- `dw-text` on `dw-base`: **11.2:1** (WCAG AAA ✅)
- `dw-textMuted` on `dw-surface`: **8.9:1** (WCAG AAA ✅)
- `dw-accent` on `dw-base`: **12.4:1** (WCAG AAA ✅)
- `dw-muted` on `dw-base`: **6.2:1** (WCAG AAA ✅)

**Usage Rule:** **90% neutral**, 9% muted support, **1% hi‑vis** (accent).

### Typography Scale (Tailwind Classes)

```javascript
// Fonts: Satoshi (800), Inter (400, 600)

dw-h1: 'text-5xl font-[800] tracking-tight leading-none',        // 48px
dw-h2: 'text-4xl font-[800] tracking-tight leading-tight',       // 36px
dw-h3: 'text-2xl font-[700] tracking-normal',                    // 24px
dw-body: 'text-lg font-normal leading-relaxed',                  // 18px, 1.5 line-height
dw-label: 'text-sm font-medium uppercase tracking-wider',        // 14px, +0.05em
dw-caption: 'text-xs font-normal tracking-normal',               // 12px
```

**Usage:**
- Headings: Satoshi 800 (bold workwear feel)
- Body/UI: Inter 400-600 (legible, neutral)
- Labels: UPPERCASE + tracking for industrial look

### Motion

- Duration: 150–300ms
- Easing: `ease-out` with weight (no bounces)
- No parallax scrolling
- Drawer-like movement for panels

### Components (Props + State Variants)

**ProcessingBadge:** `{ ready: boolean }`
- `ready: false` → `text-dw-muted animate-pulse` + "⏳ Processing"
- `ready: true` → `text-dw-success` + "✓ Ready"

**HostQueue:** `{ submissions[], onApprove(), onPlay(), onSkip(), onReorder() }`
- Item states:
  - `pending` → `bg-dw-surface border-dw-muted`
  - `approved` → `bg-dw-surface border-dw-olive`
  - `playing` → `bg-dw-accent/10 border-dw-accent` (1% hi-vis rule)
  - `skipped` → `bg-dw-surface/50 border-dw-muted opacity-50`

**FileUploader (Uppy+Tus):** `{ uploadUrl, onUploaded(uploadId) }`
- Progress states:
  - Default → `border-dw-muted`
  - Active → `border-dw-accent` (1% hi-vis)
  - Success → `border-dw-success`
  - Error → `border-dw-alert`

**LivePlayer (Mux):** `{ playbackId }`
- Embed Mux Player with `theme="minimal"`, accent color `dw-accent`

**NowPlaying:** `{ submission }`
- Display: `dw-h2` for track title, `dw-body` for artist, processing badge

### UX Principles

- Predictable, low-cognitive load. No destructive action without confirm.
- Disable **Play** until `playback_id` exists; show Processing badge.
- One hot color per view (accent or alert) — never both.

### Error & Empty States (DW Palette)

- **Empty Queue (Host):** "No submissions yet. Share `/submit/${token}` to collect tracks."
  → `text-dw-muted` on `bg-dw-surface` card

- **Upload Failed:** "Upload failed. Check file size (<500MB) and type."
  → `text-dw-alert` with retry button in `border-dw-alert`

- **Not Authorized (Host Dashboard):** "You don't own this event."
  → Redirect to `/` with toast in `bg-dw-rust text-dw-text`

- **Event Not Live (Live Page):** "This event hasn't started yet."
  → Show countdown timer in `text-dw-textMuted`

---

## Milestones (Each with Goal / Deliverables / Success Criteria)

### **M1 — Functional Core (Tonight, 4–6h)**

**Goal:** End-to-end submission → queue → live sync with industrial UI.

**Deliverables:**
- Next.js app with TypeScript + Tailwind (DW tokens configured)
- Pages: `/submit/[token]`, `/host/[eventId]`, `/live/[eventId]`
- Supabase schema + RLS policies deployed
- Mux Direct Upload API route + webhook handler (signature verified)
- Realtime hooks: `useRealtimeQueue`, `useRealtimeNowPlaying`
- Processing badges showing `playback_id` status
- Event logs for all actions (submit, approve, play, skip)

**Success Criteria:**
- Upload shows progress; appears in host queue < 1s
- Play/Skip updates `/live` in < 1s
- Webhook signature verified; RLS prevents non-host edits
- UI adheres to palette rules (≤1% hi-vis on screen)
- Zero critical bugs in E2E test (submit → approve → play → skip)

**Time Budget:** 6 hours (4 hours for senior dev)

---

### **M2 — Reliability + UX Polish (Week 1)**

**Goal:** Harden uploads/auth and refine industrial look & feel.

**Deliverables:**
- Uppy resume/retry on failed uploads (Tus chunk resumption)
- Supabase Auth gating on `/host/:eventId` (magic link)
- Empty states (no submissions, no events) with DW palette
- Error states (upload failed, not authorized, event not found)
- Accessibility pass: keyboard nav + WCAG AA contrast
- Admin takedown button (sets submission status to 'removed')
- Realtime subscription cleanup verified (no memory leaks)

**Success Criteria:**
- Upload success rate >95% (test with 500MB FLAC files)
- Mobile upload stable (iOS Safari, Android Chrome)
- Keyboard nav works for all primary actions
- Zero duplicate realtime subscriptions (test with React DevTools)
- WCAG AA contrast pass on all text/background pairs

**Time Budget:** 12-16 hours (spread across 5 days)

---

### **M3 — Monetization + Replay (Week 2)**

**Goal:** Add revenue with minimal UX disruption.

**Deliverables:**
- Stripe Checkout integration for submission tips/boosts
- Stripe Checkout for replay unlock ($5-10 price test)
- Mux Live auto-recording enabled (saves VOD when stream ends)
- `recordings` table: event_id, mux_asset_id, duration, created_at
- `unlocks` table: user_id, session_id, stripe_payment_id, unlocked_at
- Replay page (`/replay/[eventId]`) with paywall using support colors (not hi-vis)
- Stripe webhook handler for `checkout.session.completed` (creates unlock record)

**Success Criteria:**
- ≥10% submissions include tip/boost in tests (price elasticity validated)
- Replay unlock rate ≥15% (value proposition validated)
- First full event recorded and purchasable within 1h of stream end
- Stripe webhook signature verified (no spoofed payments)

**Time Budget:** 20-24 hours

**Simplification:** Use Mux Live auto-recording (no custom stitching); replay includes full stream (commentary + dead air = "authentic live archive")

---

## Pre-Flight Checklist (Before M1 Build)

- [ ] Supabase project created; `NEXT_PUBLIC_SUPABASE_URL` copied
- [ ] Supabase RLS enabled on all tables (run migration.sql)
- [ ] Mux account created; API token generated (ID + Secret)
- [ ] Mux Live Stream created; `playback_id` copied
- [ ] Mux webhook configured (use ngrok for local: `ngrok http 3000`)
- [ ] Test OBS → Mux RTMP connection (verify stream appears in Mux dashboard)
- [ ] Tailwind config extended with `dw.*` color tokens
- [ ] Fonts loaded: Satoshi (800 weight), Inter (400, 600 weights)
- [ ] `.env.local` populated with all required secrets
- [ ] `package.json` dependencies installed (`npm install`)

---

## Debugging Playbook (Common M1 Issues)

### 1. Upload succeeds but webhook never fires
- Check Mux dashboard → Webhooks → Recent Deliveries
- Verify `MUX_WEBHOOK_SECRET` matches dashboard value
- Test webhook locally: `ngrok http 3000` → update Mux webhook URL
- Log raw webhook body + signature in `/api/mux/webhook` for debugging

### 2. Realtime updates not appearing
- Check Supabase dashboard → Database → Replication → `submissions` enabled?
- Console log: `supabase.channel('queue:xyz').subscribe((status) => console.log(status))`
- Expected: `status === 'SUBSCRIBED'`
- Verify RLS policies allow SELECT for anon users on live events

### 3. Host dashboard shows "Not Authorized"
- Check: `auth.uid()` matches `events.host_id`?
- Check: RLS policy `host_manage_submissions` exists?
- Test: `SELECT * FROM submissions WHERE event_id = 'xxx'` in Supabase SQL editor

### 4. Play button enabled but no playback_id
- Check: `submissions.playback_id IS NOT NULL`
- If null, check Mux asset status: `curl https://api.mux.com/video/v1/assets/{asset_id}`
- Typical delay: 10-30s for small files, 2-5min for 500MB FLAC
- Ensure `ProcessingBadge` component blocks Play button when `ready: false`

### 5. Realtime subscription memory leak
- Verify `useEffect` cleanup: `return () => supabase.removeChannel(channel)`
- Test: Navigate between pages multiple times, check Chrome DevTools Memory profiler
- Expected: Subscriptions should drop to 0 when component unmounts

---

## References (Authoritative Docs)

- **Supabase Realtime:** https://supabase.com/docs/guides/realtime
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Next.js App Router:** https://nextjs.org/docs/app
- **Mux Direct Upload:** https://www.mux.com/docs/guides/upload-files-directly
- **Mux API (Assets):** https://www.mux.com/docs/api-reference/video/assets
- **Mux Live Streaming:** https://www.mux.com/docs/guides/start-live-streaming
- **Mux Player:** https://www.mux.com/docs/guides/play-your-videos
- **Tus Protocol:** https://tus.io/
- **Stripe Checkout:** https://docs.stripe.com/checkout/quickstart (M3 only)
- **Stripe Webhooks:** https://docs.stripe.com/webhooks (M3 only)

---

## Hand-off Notes for Cursor/Claude

- Use Tailwind tokens above; enforce **1% hi-vis** rule with lint comments if needed.
- Implement webhook signature verification + RLS policies from [migration.sql](migration.sql).
- Block **Play** when `playback_id` is null; show **Processing** badge.
- Follow process: **Spec → Todo → Code** (read this spec, check [TODO.md](TODO.md) for tasks, implement)
- Test realtime cleanup: navigate between pages and verify subscriptions drop to 0.
- For M1, allow up to 5% hi-vis usage; tighten to 1% in M2 polish pass.
- **Communication:** Follow patterns in [.claude/preferences.md](.claude/preferences.md) (explain WHY before HOW)

---

## 📂 Project Files Navigation

- **[@CLAUDE.md](@CLAUDE.md)** → Project context, business rationale, architecture overview
- **[tech-stack.md](tech-stack.md)** → Service setup guides, costs, dependencies
- **[TODO.md](TODO.md)** → Detailed M1 task breakdown (50 tasks organized by phase)
- **[migration.sql](migration.sql)** → Database schema with RLS policies
- **[.env.example](.env.example)** → Environment variables template
- **[.claude/preferences.md](.claude/preferences.md)** → How to communicate with Keegan

**Last Updated:** 2025-10-04
