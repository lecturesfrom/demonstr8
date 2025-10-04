# 🎵 LecturesFrom — Live Listening Platform

> **Start here.** This file is the single source of truth for the entire project. Read this first in every new conversation.

---

## 📊 Project Status Dashboard

| Milestone | Status | Timeline | Customer Value |
|-----------|--------|----------|----------------|
| **M1: Functional Core** | 🟡 Ready to Build | Tonight (4-6h) | Real-time queue + host controls (MVP demo-able) |
| **M2: Reliability** | ⚪ Planned | Week 1 | Production-ready UX, auth gating |
| **M3: Monetization** | ⚪ Planned | Week 2 | Stripe tips + replay unlocks (revenue-ready) |

**Current Phase:** Pre-development (documentation complete, ready to initialize Next.js app)

---

## 🎯 What We're Building (In Plain English)

### The Problem
Artists and DJs want to run **live listening parties** where fans can submit tracks, but there's no good tool for it. Current options:
- **Twitch/Discord:** Fans can't submit audio files, only chat requests
- **Mixcloud Live:** No submission queue, no monetization
- **Email + Dropbox:** Clunky, no real-time updates, manual process

### Our Solution
A **real-time live listening platform** where:
1. **Fans** submit audio files (MP3, WAV, FLAC) via a simple link → `/submit/abc123`
2. **Hosts** see submissions in a queue, approve/skip/reorder tracks in real-time
3. **Everyone** watches a live page that shows "Now Playing" + upcoming queue (updates instantly)
4. **Hosts** stream their audio (with commentary) via OBS
5. **Replays** can be sold to fans who missed the live event (M3)

### Why This Wins
- **Only platform** that combines: submission → curation → live stream → replay monetization
- **Real-time updates** (like Google Docs) = fans see their track move through the queue
- **Built-in revenue** from day 1 (tips on submission, replay unlocks)
- **Low friction** for fans (no signup required to submit a track)

---

## 👥 Target Users

### Primary: Independent Artists/DJs
- Running album listening parties (debut drops)
- Mixtape previews with fan submissions
- Weekly radio shows with call-ins (audio version)

### Secondary: Record Labels (A&R Sessions)
- Fans submit demos, label staff curate live
- Community voting/feedback sessions

### Tertiary: Community Organizers
- College radio stations
- Local music scenes (monthly showcases)

---

## 🏗️ How It Works (Business Flow)

```
1. HOST creates event → gets unique link: /submit/abc123
   ↓
2. HOST shares link on Twitter/IG: "Submit your track for tonight's show"
   ↓
3. FANS click link → upload audio + add artist/title → submit
   ↓
4. HOST sees submissions appear in queue (real-time)
   ↓
5. HOST approves good tracks, skips bad ones, reorders queue
   ↓
6. HOST clicks "Play" → track moves to "Now Playing"
   ↓
7. PUBLIC LIVE PAGE updates instantly (shows current track + next up)
   ↓
8. HOST streams their audio (music + commentary) via OBS to Mux
   ↓
9. FANS watch live stream + see queue progress in real-time
   ↓
10. SESSION ENDS → recording saved, available for purchase (M3)
```

---

## 🧩 Technical Architecture (Explained Simply)

### Why We Chose These Tools

| Service | What It Does | Why We Chose It | Business Benefit |
|---------|-------------|-----------------|------------------|
| **Supabase** | Database + user accounts + real-time sync | Like Firebase but cheaper, open-source, better for our data model | $0/month until we hit scale, avoids vendor lock-in |
| **Mux** | Video/audio streaming backend | Like YouTube's infrastructure as a service, handles uploads + transcoding + live streaming | Fans can upload any audio format (WAV/FLAC/MP3), we don't write encoding code |
| **Next.js** | Website framework | Modern, fast, SEO-friendly (good for landing pages) | Google indexes our event pages, faster load = more conversions |
| **Vercel** | Website hosting | Auto-deploys when we push code to GitHub, built by Next.js creators | Zero DevOps time, we focus on features not servers |
| **Stripe** | Payments (M3) | Industry standard, lowest fraud rate | Fans trust it, we get payouts in 2 days |

### The Data Flow (Non-Technical)

**When a fan submits a track:**
1. Fan's browser uploads audio **directly to Mux** (not our server = faster, handles big files)
2. Mux gives us an `upload_id` (like a receipt)
3. We save to Supabase: "Event ABC has new submission: Track Title by Artist Name, upload receipt #123"
4. Mux processes the audio in background (converts to web-friendly format)
5. Mux calls our webhook: "Hey, upload #123 is ready, here's the playback link"
6. We update Supabase: "Submission is now playable"

**When a host clicks "Play":**
1. Our website calls API: `POST /api/queue/play` with submission ID
2. API updates database: `now_playing = this track`, `status = playing`
3. Supabase broadcasts update to **all connected browsers** (real-time magic)
4. Host dashboard sees "Now Playing" update
5. Public live page sees "Now Playing" update (within 1 second)

**Why real-time matters:**
- **Without it:** Fans refresh page every 10 seconds to see if their track moved
- **With it:** Feels like a shared experience (think Twitch chat, but for queue position)

---

## 📁 Project Files (What Everything Does)

### Core Documentation
- **`@CLAUDE.md`** ← YOU ARE HERE: Master project context, read this first every session
- **`spec.md`** → Product requirements (what we're building, design system, milestones)
- **`tech-stack.md`** → Tools we're using (setup guides, costs, dependencies)
- **`TODO.md`** → Step-by-step tasks for M1 (checkboxes = visual progress)
- **`.claude/preferences.md`** → How to communicate with Keegan (GTM mindset, explain WHY before HOW)

### Database & Config
- **`migration.sql`** → Database setup script (creates tables for events, submissions, users, etc.)
- **`.env.example`** → Template for secret keys (Supabase, Mux, Stripe credentials)
- **`.gitignore`** → Files we never commit (secrets, build artifacts)

### Application Code (Will be created in M1)
- **`/app`** → Next.js pages and API routes
  - `/submit/[token]/page.tsx` → Public submission form
  - `/host/[eventId]/page.tsx` → Host dashboard (queue management)
  - `/live/[eventId]/page.tsx` → Public live page (player + queue)
  - `/api/mux/*` → Mux upload + webhook handlers
  - `/api/queue/*` → Queue management (approve, play, skip, reorder)
  - `/api/submissions` → Create submission record
  - `/api/log` → Analytics logging

- **`/components`** → Reusable UI pieces
  - `FileUploader.tsx` → Upload component (handles big files)
  - `HostQueue.tsx` → Drag-and-drop queue list
  - `LivePlayer.tsx` → Video player embed
  - `NowPlaying.tsx` → Current track display
  - `ProcessingBadge.tsx` → Shows "Processing" or "Ready" status

- **`/lib`** → Utility code
  - `supabase.ts` → Database connection (browser-side)
  - `supabase-server.ts` → Database connection (server-side, more permissions)
  - `mux.ts` → Mux API helpers
  - `hooks/useRealtimeQueue.ts` → Real-time subscription for queue updates
  - `hooks/useRealtimeNowPlaying.ts` → Real-time subscription for current track

---

## 🎨 Design System: "Digital Workwear"

**Philosophy:** Industrial, utilitarian, minimal hi-vis accents (like a construction site, but digital)

### Visual Rules
- **90% neutral** (blacks, grays, off-whites) — base: #121212, surface: #1E1C1A, text: #E8E5D8
- **9% support colors** (olive, navy, rust) — subtle differentiation
- **1% hi-vis accent** (neon yellow-green: #C8D400) — only for live/primary CTA

**What This Looks Like:**
- Background: Dark matte black (not pure black, easier on eyes)
- Cards/panels: Slightly lighter gray
- Text: Off-white (high contrast but not harsh)
- Buttons: Mostly neutral, only "Play" button gets neon accent
- Processing states: Muted yellow pulse → green checkmark when ready

**Why This Matters for GTM:**
- **Differentiation:** Most music apps are bright/colorful (Spotify green, SoundCloud orange) — we look serious, pro-tool
- **Target audience:** DJs/artists want "pro gear" aesthetic, not consumer toy
- **Brand coherence:** Matches "LecturesFrom" name (industrial, educational vibe)

### Typography
- **Headlines:** Satoshi (bold, geometric, industrial feel)
- **Body:** Inter (clean, readable, web-standard)
- **Labels:** All-caps with letter-spacing (like stenciled text on crates)

---

## 📋 Milestones Explained (Customer Value Lens)

### M1: Functional Core (Tonight, 4-6 hours)
**Customer Value:** Demo-able MVP, validates core flow

**What Gets Built:**
- ✅ Submission page (fans can upload tracks)
- ✅ Host dashboard (approve/skip/reorder queue)
- ✅ Live page (shows current track + queue)
- ✅ Real-time sync (updates appear instantly)
- ✅ Event logging (analytics foundation)

**What You Can Do After M1:**
- Run a real listening party with 5-10 friends
- Show investors/early adopters a working product
- Get feedback on UX (is queue management intuitive?)
- Validate demand (do people actually submit tracks?)

**What's NOT Ready:**
- No payments yet (can't charge for tips or replays)
- No auth (anyone with link can access host dashboard)
- Uploads might fail on slow connections (no retry logic)

---

### M2: Reliability + UX Polish (Week 1)
**Customer Value:** Production-ready, can run public beta

**What Gets Built:**
- ✅ Upload retry/resume (works on bad WiFi)
- ✅ Host auth (only event creator can manage queue)
- ✅ Empty states ("No submissions yet, share this link...")
- ✅ Error handling (upload failed, try again)
- ✅ Mobile optimization (most fans will submit from phone)
- ✅ Accessibility (keyboard nav, screen readers)

**What You Can Do After M2:**
- Launch public beta (tweet "try my new platform")
- Onboard first 10 paying hosts (even without Stripe, can Venmo)
- Run 5-10 events per week without babysitting bugs
- Collect testimonials for landing page

**What's NOT Ready:**
- Still no automated payments (manual invoicing)
- No replay monetization (recording exists, but no paywall)

---

### M3: Monetization (Week 2)
**Customer Value:** Revenue-ready, can charge fans

**What Gets Built:**
- ✅ Stripe integration (tips on submission, replay unlocks)
- ✅ Replay page with paywall ($5-10 to unlock past events)
- ✅ Host dashboard shows revenue stats
- ✅ Webhook handlers for payment confirmation

**What You Can Do After M3:**
- Charge $1-5 tips on submissions (test price elasticity)
- Sell replays of popular events (recurring revenue)
- Show revenue metrics to investors (traction proof)
- Run first cohort of 20-50 events with monetization live

**What's NOT Ready:**
- No host payouts (Stripe Connect comes later)
- No advanced analytics dashboard
- No clip generator (short shareable clips from replay)

---

## 🔑 Key Decisions Made (And Why)

### 1. Why Mux Direct Upload (Not Upload to Our Server)?
**Technical:** Files go straight from user's browser to Mux servers
**Business:** We can handle 500MB FLAC files without paying for server bandwidth
**User Impact:** Fans on slow connections see progress bar, can resume if it fails

### 2. Why Supabase Realtime (Not Polling Every 3 Seconds)?
**Technical:** Database broadcasts changes to all connected browsers
**Business:** $0 cost (vs. paying for compute on every poll request)
**User Impact:** Updates appear in <1 second (feels magical, like Google Docs)

### 3. Why Next.js App Router (Not Pages Router)?
**Technical:** Newer architecture, better performance, native streaming
**Business:** SEO-friendly (event pages can rank on Google)
**User Impact:** Faster page loads = more fans complete submission

### 4. Why Single Shared Mux Live Stream for M1 (Not Unique Per Event)?
**Technical:** Creating a Mux stream via API adds complexity
**Business:** Saves 2 hours of dev time, $0 cost difference
**User Impact:** None (fans don't know the difference), we add unique streams in M2

### 5. Why Digital Workwear Design (Not Bright/Colorful)?
**Technical:** Neutral palette is easier to maintain (fewer color decisions)
**Business:** Differentiates from Spotify/SoundCloud (targets pro users)
**User Impact:** Artists feel like it's a pro tool, not a toy

---

## 🗣️ Communication Patterns (How to Explain Changes)

### ✅ GOOD: "Why Before How" Pattern
```
What Changed: Added ProcessingBadge component
Why It Matters: Prevents host from clicking "Play" on tracks that aren't ready yet
How It Helps Users: Host doesn't see errors, fans' tracks play smoothly
Technical Detail: Checks if playback_id field is null in database
```

### ❌ BAD: Technical-First Pattern
```
Added a React component that checks the playback_id field in the submissions table
and conditionally renders a badge with animate-pulse Tailwind class using the
dw-muted color token from our theme configuration.
```

### When Making Changes, Always Include:
1. **What changed** (one sentence, no jargon)
2. **Why it matters** (business impact or user experience)
3. **How to verify** (what to look for when testing)
4. **Optional:** Technical details (for future developers)

---

## 🧪 Testing Philosophy

### For Each Feature, Test 3 Perspectives:

**1. Fan Perspective (Submission Flow)**
- Can I upload a 50MB MP3 from my iPhone on 4G?
- Do I see confirmation after submitting?
- Can I watch live page and see my track appear?

**2. Host Perspective (Queue Management)**
- Can I approve 10 submissions in <30 seconds?
- Can I reorder tracks by dragging?
- Do I see "Processing" badge on fresh uploads?

**3. Public Perspective (Live Page)**
- Does "Now Playing" update when host clicks Play?
- Can I see upcoming queue (next 3-5 tracks)?
- Does it work on mobile Safari (iPhone users)?

---

## 🚀 GTM Roadmap (Milestones → Customer Features)

### Week 1: M1 Complete
**Can Do:**
- Run private beta with 5 friends (validate core UX)
- Record demo video for Twitter/LinkedIn
- Show working product to 3-5 potential early adopters

**Cannot Do:**
- Public launch (auth not ready, might get spammed)
- Charge money (no Stripe yet)

### Week 2: M2 Complete
**Can Do:**
- Launch on Product Hunt / Hacker News
- Onboard first 10-20 hosts (DM outreach)
- Run 20-30 events total (stress test)

**Cannot Do:**
- Charge automatically (manual invoicing only)
- Scale beyond 50 events/month (need monitoring)

### Week 3: M3 Complete
**Can Do:**
- Charge $1-5 tips on submissions (test pricing)
- Sell replays at $5-10 (recurring revenue)
- Show revenue metrics to investors

**Cannot Do:**
- Pay hosts yet (Stripe Connect later)
- Handle 1000+ events/month (need infra upgrade)

---

## 📊 Success Metrics (What to Track)

### M1 (Validation Metrics)
- ✅ Submission success rate >80% (how many uploads complete?)
- ✅ Average queue approval time <2 min (is host UX fast?)
- ✅ Live page updates <2 seconds (is realtime working?)

### M2 (Engagement Metrics)
- ✅ Host retention: 3+ events per host (do they come back?)
- ✅ Fan submission rate: 5+ submissions per event (is it popular?)
- ✅ Mobile usage: >60% of submissions from phone (validates mobile-first)

### M3 (Revenue Metrics)
- ✅ Tip attach rate: >10% of submissions include tip
- ✅ Replay unlock rate: >15% of event attendees buy replay
- ✅ Average event revenue: >$50 (validates monetization)

---

## 🔄 How to Use This File

### Starting a New Conversation
1. Claude reads this file first (`@CLAUDE.md`)
2. Claude reads your preferences (`.claude/preferences.md`)
3. Claude checks current status (`TODO.md` for what's done)
4. Claude asks: "Where were we? What's next?"

### Making Changes
1. Update `TODO.md` (check off completed tasks)
2. Update this file (`@CLAUDE.md`) if architecture changes
3. Update `spec.md` if requirements change
4. Commit all 3 together (keeps docs in sync)

### Onboarding Future Team Members
1. Give them this file (`@CLAUDE.md`)
2. Point them to `spec.md` (product details)
3. Show them `TODO.md` (current progress)
4. They're 80% ramped in <30 minutes

---

## 🎯 Current Next Steps

**Immediate (Tonight):**
1. ✅ Review this file (confirm it makes sense)
2. ✅ Skim `TODO.md` (see the task breakdown)
3. 🟡 Initialize Next.js app (first task in TODO.md)
4. ⚪ Build submission page
5. ⚪ Build host dashboard
6. ⚪ Build live page
7. ⚪ Test end-to-end

**This Week:**
- Complete M1 (functional core)
- Run first test event with friends
- Collect UX feedback

**Next Week:**
- Complete M2 (reliability)
- Launch public beta
- Onboard first 10 hosts

---

## 📝 Notes for Claude

### When You Start a New Session:
1. Read this file (`@CLAUDE.md`)
2. Read `.claude/preferences.md` (communication style)
3. Check `TODO.md` (what's done, what's next)
4. Ask Keegan: "I see we're on [current task]. Ready to continue?"

### When Keegan Asks "What's the status?":
1. Check `TODO.md` for completed tasks
2. Summarize in 3 bullets: Done, In Progress, Next
3. Highlight any blockers (waiting on Supabase keys, etc.)

### When Explaining Technical Changes:
1. Start with "Why it matters" (business impact)
2. Then "What changed" (one sentence)
3. Then "How to test" (verification steps)
4. Optional: Technical details (for context)

---

**Last Updated:** 2025-10-04
**Project Start Date:** 2025-10-04
**Current Milestone:** M1 (Functional Core)
**Next Review:** After M1 completion (update with learnings)
