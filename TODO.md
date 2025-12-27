# 📋 TODO: Milestone 1 (Functional Core)

> **Status:** ~75% Complete | **Goal:** Demo-able MVP with real-time queue + host controls

---

## 📊 Progress Overview

| Phase | Status | Details |
|-------|--------|---------|
| Project Setup | ✅ 6/6 | Next.js 15, TypeScript, Tailwind, fonts, env |
| Component Development | ✅ 8/8 | All components built (IVS migration complete) |
| Page Development | ✅ 3/3 | Submit, Host, Live pages |
| API Routes | ✅ 7/7 | Queue ops + upload + IVS channel |
| Database Integration | ⚠️ 3/4 | Migration script ready, needs to run |
| Dummy Data Setup | ⚠️ 1/3 | SQL scripts ready, needs to run |
| Styling | ✅ 5/5 | Digital Workwear design system |
| State Management | ✅ 3/3 | Real-time hooks + loading states |
| Responsive Design | 🔴 0/4 | Not tested |
| Testing | 🔴 0/8 | Infrastructure ready, tests need updating |

**Total Progress: ~38/50 tasks (75%)**

---

## 🚀 Immediate Next Steps

### Step 1: Run Database Migration (5 min)

```sql
-- In Supabase SQL Editor, run contents of:
-- migrate-to-ivs.sql
```

### Step 2: Create Test Event (2 min)

```sql
-- In Supabase SQL Editor, run contents of:
-- create-test-event.sql
```

### Step 3: Test the Flow (10 min)

1. Start dev server: `cd app && npm run dev`
2. Open host dashboard: `http://localhost:3000/host/{event-id}`
3. Open submit page: `http://localhost:3000/submit/test123`
4. Upload a file, approve it, play it
5. Verify real-time updates work

---

## ✅ Completed Tasks

### Phase 1: Project Setup ✅

- [x] Initialize Next.js 15 application
- [x] Install core dependencies (Supabase, AWS SDK, dnd-kit)
- [x] Configure Tailwind with Digital Workwear tokens
- [x] Set up font loading (Satoshi)
- [x] Create environment variables template
- [x] Create project file structure

### Phase 2: Component Development ✅

- [x] Build QueueItem component
- [x] Build SortableQueueItem component (drag-drop)
- [x] Build NowPlaying component
- [x] Build FileUploader component (Supabase Storage)
- [x] Build AudioPlayer component (HTML5)
- [x] Build IVSPlayer component (HLS streaming)
- [x] Build common components (TrackInfo, ActionButton, etc.)
- [x] Build EmptyState component

### Phase 3: Page Development ✅

- [x] Build Submission Page (/submit/[token])
- [x] Build Host Dashboard (/host/[eventId])
- [x] Build Live Page (/live/[eventId])

### Phase 4: API Routes ✅

- [x] Create Upload Route (Supabase Storage)
- [x] Create Queue Approve Route
- [x] Create Queue Play Route
- [x] Create Queue Skip Route
- [x] Create Queue Reorder Route
- [x] Create IVS Channel Route
- [x] Create Log Route

### Phase 5: Database Integration ⚠️

- [x] Create Supabase Browser Client
- [x] Create Supabase Server Client
- [x] Create useRealtimeQueue Hook
- [x] Create useRealtimeNowPlaying Hook
- [ ] **Run migration in Supabase** ← NEEDS ACTION

### Phase 6: Dummy Data Setup ⚠️

- [x] Create test event SQL script
- [ ] **Run test event SQL** ← NEEDS ACTION
- [ ] **Verify data appears** ← NEEDS ACTION

### Phase 7: Styling ✅

- [x] Apply DW background colors
- [x] Apply typography classes
- [x] Enforce 1% hi-vis rule (only Play button)
- [x] Style status badges
- [x] Style form inputs

### Phase 8: State Management ✅

- [x] Wire realtime subscriptions
- [x] Handle loading states
- [x] Add error handling with user feedback

### Phase 9: Responsive Design 🔴

- [ ] Mobile-first submission page
- [ ] Responsive host dashboard
- [ ] Responsive live page
- [ ] Test landscape orientation

### Phase 10: Testing 🔴

- [ ] End-to-end submission flow
- [ ] RLS policy enforcement
- [ ] Realtime subscription cleanup
- [ ] Large file upload (500MB)
- [ ] Mobile Safari upload
- [ ] Event logs populated
- [ ] Cross-browser compatibility
- [ ] IVS player functionality

---

## 🎯 M1 Completion Criteria

**Ready to Demo When:**

- ✅ Build passes without errors
- ⚠️ Can submit track from phone → appears in host dashboard <1s (needs testing)
- ⚠️ Can approve, reorder, play, skip from host dashboard (needs testing)
- ⚠️ Live page updates in real-time when host plays next track (needs testing)
- ✅ Files available immediately (no processing delays)
- ⚠️ Event_logs has entries for all actions (needs verification)
- ✅ UI matches DW palette (90% neutral, 1% accent)
- 🔴 Mobile-responsive (not tested)
- ✅ Zero TypeScript errors

---

## 📅 Session Goals (December 22, 2025)

1. ✅ Fix build errors
2. ✅ Clean up outdated documentation
3. ⏳ Run database migration
4. ⏳ Create test event
5. ⏳ Test complete flow
6. ⏳ Verify real-time updates

---

## 🔮 Future Milestones

### M2: Opportunity Engine

- Dynamic "skip the line" pricing
- Price calculation based on queue length
- Stripe payment integration

### M3: Subscriptions

- Free/Pro/Platinum tiers
- User locker for saved files
- Armed submissions for platinum users

### M4: Invite to Stage

- AWS IVS Stage integration
- Multi-host collaboration
- Real-time audio/video for invited users

---

**Last Updated:** December 22, 2025
