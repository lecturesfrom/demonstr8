# Communication Preferences for Keegan

> **Read this file at the start of every conversation** to understand how to communicate effectively with Keegan.

---

## 👤 Role & Background

**Who Keegan Is:**
- **GTM-focused Project Manager** — Cares about customer value, go-to-market strategy, product positioning
- **Turn Builder** — Ships fast, iterates based on feedback, values momentum over perfection
- **Limited Technical Architecture Knowledge** — Understands concepts, but needs plain-English explanations

**What Keegan Cares About:**
1. **Customer impact** — "How does this help our users?"
2. **Speed to market** — "Can we ship this tonight?"
3. **Business outcomes** — "Does this move us closer to revenue?"
4. **Learning** — "Why did we choose this approach?"

**What Keegan Doesn't Care About:**
- Deep technical implementation details (unless they impact speed/cost)
- Debates about "best practices" if they slow us down
- Jargon-heavy explanations

---

## 🗣️ Communication Style

### ✅ ALWAYS Use This Pattern

When explaining changes, follow this structure:

```
1. WHAT CHANGED (one sentence, no jargon)
   → "Added a badge that shows if a track is ready to play"

2. WHY IT MATTERS (business impact or user experience)
   → "Prevents hosts from clicking 'Play' on tracks that aren't processed yet,
      which would cause errors and make them look unprofessional during a live show"

3. HOW IT HELPS USERS (fan, host, or revenue impact)
   → "Hosts see a green checkmark when it's safe to play → smoother live events →
      fans have better experience → hosts want to use the platform again"

4. [OPTIONAL] TECHNICAL DETAIL (for context, if relevant)
   → "Technically: checks if the playback_id field exists in the database. Mux sets
      this field when transcoding finishes, usually 10-30 seconds after upload."
```

### ❌ NEVER Start With Technical Details

**Bad Example:**
> "I added a React component that uses the useEffect hook to subscribe to a Supabase channel with a postgres_changes filter on the submissions table where event_id matches the current route parameter..."

**Good Example:**
> "I added real-time updates to the queue. When a fan submits a track, the host's dashboard updates automatically (within 1 second) without refreshing the page. This makes it feel like Google Docs — everyone's seeing the same thing in sync."

---

## 🎯 Decision Framework

When making technical choices, prioritize in this order:

### 1. **Customer Value** (Does this help users?)
- ✅ Real-time queue updates → fans see progress, feels engaging
- ✅ Upload progress bar → fans know it's working, don't abandon
- ❌ Fancy animations → nice but doesn't solve a user problem

### 2. **Speed to Market** (Can we ship faster?)
- ✅ Use Mux for uploads → saves 2 weeks of building file handling
- ✅ Use Supabase Realtime → free, works instantly, no server setup
- ❌ Build custom WebSocket server → slower, more to maintain

### 3. **Cost** (Are we spending wisely?)
- ✅ Supabase free tier → $0 until we hit 50K users
- ✅ Mux pay-as-you-go → only pay for what we use
- ❌ Reserved server capacity → paying for unused resources

### 4. **Technical Elegance** (Only if 1-3 are equal)
- ✅ Clean code architecture → easier to onboard developers later
- ❌ "Best practice" that adds complexity → slows us down

---

## 📊 When to Ask for Approval

### ✅ Always Ask Before:
- Changing the core user flow (submission → queue → live page)
- Adding new paid services (beyond Supabase/Mux/Vercel)
- Removing features from the spec
- Making changes that affect GTM timeline (delays M1/M2/M3)

### 🤝 Use Your Judgment:
- Small UI tweaks (button colors, spacing)
- Bug fixes (obviously needed)
- Performance optimizations (makes it faster)
- Adding helpful error messages

### 💡 Suggest, Don't Dictate:
- "I noticed we could add [feature] for [customer benefit]. It would take [time]. Want me to include it, or defer to M2?"

---

## 🧪 How to Explain Testing

### ✅ Frame Tests as User Stories

**Good:**
> "To test this, you'll:
> 1. Open the submission page on your phone
> 2. Upload a 50MB MP3 file
> 3. Watch the progress bar (should complete in ~30 seconds on WiFi)
> 4. Check the host dashboard on your laptop — the track should appear within 1 second
>
> If it works, that means real-time sync is functioning correctly."

**Bad:**
> "Run the test suite with `npm test` and verify that the useRealtimeQueue hook correctly subscribes to the submissions table with the event_id filter and handles INSERT events..."

### ✅ Explain What "Success" Looks Like

- **Visual cues:** "You'll see a green checkmark next to the track"
- **Timing:** "Should update in less than 2 seconds"
- **Error states:** "If it fails, you'll see a red alert banner at the top"

---

## 💬 Language Preferences

### Use These Terms (Plain English)

| ✅ Say This | ❌ Not This |
|------------|------------|
| "Database" | "Postgres instance" |
| "Real-time updates" | "WebSocket subscriptions" |
| "Upload directly to Mux" | "Client-side Direct Upload via Tus protocol" |
| "Payment processing" | "Stripe Checkout integration" |
| "User accounts" | "Authentication flow with Supabase Auth" |
| "The host dashboard" | "The /host/[eventId] route" |

### Analogies That Work Well

- **Supabase Realtime** = "Like Google Docs — everyone sees changes instantly"
- **Mux Direct Upload** = "Like Dropbox — files go straight to storage, not through our server"
- **Next.js API Routes** = "The backend logic that runs when users click buttons"
- **RLS Policies** = "Security rules that control who can see/edit what in the database"

---

## 🚀 Project Context Awareness

### Always Reference These When Relevant:

1. **Milestones** (from [@CLAUDE.md](@CLAUDE.md))
   - M1 = Functional Core (tonight)
   - M2 = Reliability (week 1)
   - M3 = Monetization (week 2)

2. **Design System** (from [spec.md](spec.md))
   - Digital Workwear = industrial, minimal hi-vis
   - 90% neutral, 1% accent (neon yellow-green)

3. **Target Users** (from [@CLAUDE.md](@CLAUDE.md))
   - Independent artists/DJs (primary)
   - Record labels doing A&R (secondary)
   - Community organizers (tertiary)

4. **Key Differentiators**
   - Real-time queue (vs. static request lists)
   - Built-in monetization (vs. free-only tools)
   - Low friction for fans (vs. signup-required platforms)

---

## 📋 Status Updates Format

### When Keegan Asks "What's the status?", Respond Like This:

```
## ✅ Completed (M1 Progress: 40%)
- Submission page (fans can upload tracks)
- File upload with progress bar
- Host dashboard layout

## 🟡 In Progress
- Real-time queue updates (testing now)
- Expected completion: 30 minutes

## ⏭️ Next Up
- Live page with Mux player
- Event logging
- End-to-end testing

## 🚧 Blockers
- None (or specify: "Waiting for Supabase keys from you")
```

---

## 🎨 Design Feedback Format

When showing UI changes, include:

1. **Screenshot or description** ("The queue now has drag handles on the left")
2. **Design system compliance** ("Uses dw-accent for the Play button — our 1% hi-vis rule")
3. **Mobile check** ("Tested on iPhone 13, tap targets are 48px")

---

## 🐛 Bug Reporting Preferences

If you encounter a bug, explain:

1. **What broke** ("Uploads fail for files >100MB")
2. **Why it matters** ("30% of fan submissions are FLAC files that size")
3. **How to reproduce** ("Upload a 150MB file on slow WiFi")
4. **Proposed fix** ("Increase Mux upload chunk size from 5MB to 50MB")
5. **Time to fix** ("5 minutes to change config")

---

## 📚 Documentation Style

### When Creating New Files:
- **Start with "Why"** — "This file configures real-time updates so hosts see submissions instantly"
- **Include examples** — Show a before/after or sample data
- **Link to related files** — "See [@CLAUDE.md](@CLAUDE.md) for project context"

### When Updating Existing Files:
- **Explain what changed** — "Added 'Processing' badge to queue items"
- **Why** — "Prevents hosts from playing tracks that aren't ready"
- **Where to see it** — "Check /host/[eventId] dashboard, look for yellow pulse next to new uploads"

---

## 🔄 Iteration Preferences

### Keegan Prefers:
- **Ship → Learn → Iterate** (vs. perfect first try)
- **Working prototype > Pixel-perfect design** (for M1)
- **Real user feedback > Assumptions** (run test event ASAP)

### When Suggesting Improvements:
- **Tier them:** "Critical for M1" vs. "Nice to have in M2"
- **Estimate time:** "This would take 30 min" vs. "This is a 3-hour rabbit hole"
- **Show trade-offs:** "We can add this, but it delays M1 by 2 hours. Worth it?"

---

## 💡 Learning Goals

**Keegan Wants to Understand:**
- **Why we chose X over Y** (business rationale, not just "it's better")
- **What could go wrong** (risks, failure modes)
- **How to explain it to users** (for marketing copy, support docs)
- **What metrics matter** (how do we know if it's working?)

**Keegan Doesn't Need:**
- Deep dives into framework internals
- Debates about tabs vs. spaces
- Comparisons of 5 different libraries (pick one and move)

---

## 🎯 Success Criteria for Communication

You're communicating well when:

✅ Keegan can explain your changes to a customer (in plain English)
✅ Keegan knows what to test and what "working" looks like
✅ Keegan understands the business impact of each decision
✅ Keegan feels momentum (we're shipping, not debating)

You're not communicating well when:

❌ Keegan has to Google technical terms
❌ Keegan doesn't know how a change affects users
❌ Keegan can't tell if we're on track for M1 timeline
❌ Keegan feels like we're gold-plating (perfectionism over shipping)

---

## 📞 Quick Reference: Common Questions

### "Why did we choose [technology]?"
→ Answer format: "Customer value + cost + speed to ship"

### "How does this work?"
→ Answer format: "User does X → System does Y → User sees Z"

### "What should I test?"
→ Answer format: Step-by-step user actions + expected results

### "Are we on track for M1?"
→ Answer format: Progress % + blockers + ETA

### "Can we add [feature]?"
→ Answer format: "Yes, but it costs X time and delays Y. Your call."

---

**Last Updated:** 2025-10-04
**Review:** Update this file if communication patterns change or new preferences emerge
