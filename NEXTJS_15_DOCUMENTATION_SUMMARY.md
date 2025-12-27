# Next.js 15 Documentation Summary for demonstr8

This document summarizes key Next.js 15 patterns and how they're implemented in the demonstr8 codebase, based on official Next.js 15 documentation.

## Table of Contents

1. [Route Handlers (API Routes)](#route-handlers-api-routes)
2. [Server Components vs Client Components](#server-components-vs-client-components)
3. [Data Fetching Patterns](#data-fetching-patterns)
4. [Linting Best Practices](#linting-best-practices)
5. [Current Implementation Analysis](#current-implementation-analysis)
6. [Recommendations](#recommendations)

---

## Route Handlers (API Routes)

### Documentation Summary

**Route Handlers** in Next.js 15 are the App Router equivalent of API Routes. They:

- Are defined in `route.js|ts` files inside the `app` directory
- Support HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
- Use Web `Request` and `Response` APIs (or extended `NextRequest`/`NextResponse`)
- Are **not cached by default** (except `GET` with explicit caching config)
- Cannot coexist with `page.js` at the same route segment level

### Current Implementation in demonstr8

Your codebase correctly implements Route Handlers for all API endpoints:

**Pattern Used:**

```typescript
// app/src/app/api/queue/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // ... validation and business logic
    const supabase = createClient() // Server-side client with service role
    // ... database operations
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**All API Routes Follow This Pattern:**

- ✅ `/api/queue/approve` - Approves submissions
- ✅ `/api/queue/play` - Marks submission as playing
- ✅ `/api/queue/skip` - Skips a submission
- ✅ `/api/queue/reorder` - Reorders queue via drag-and-drop
- ✅ `/api/upload/create` - Creates signed upload URLs
- ✅ `/api/log` - Logs events to audit trail

**Best Practices Observed:**

1. ✅ Using `NextRequest`/`NextResponse` for type safety
2. ✅ Proper error handling with try/catch
3. ✅ Server-side Supabase client (bypasses RLS when needed)
4. ✅ Consistent response format (`NextResponse.json()`)
5. ✅ Input validation before processing

---

## Server Components vs Client Components

### Documentation Summary

**Server Components** (default):

- Fetch data from databases/APIs close to the source
- Use API keys, tokens, and secrets without exposing to client
- Reduce JavaScript sent to browser
- Improve First Contentful Paint (FCP)
- Cannot use hooks, state, or browser APIs

**Client Components** (with `'use client'` directive):

- Handle interactivity (state, event handlers, `useEffect`)
- Access browser APIs (`localStorage`, `window`, etc.)
- Use custom hooks
- Required for React Context providers

### Current Implementation in demonstr8

**Server Components Used For:**

1. **Page Components with Data Fetching:**

```typescript
// app/src/app/host/[eventId]/page.tsx
export default async function HostDashboard({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const event = await requireHost(eventId) // Auth check + data fetch
  return <HostDashboardClient eventId={eventId} eventName={event.name} />
}
```

2. **Authentication & Authorization:**

```typescript
// app/src/lib/auth.ts
export async function requireHost(eventId: string) {
  const supabase = createClient() // Server-side only
  // ... fetch and validate event
  return event
}
```

3. **Initial Data Loading:**

```typescript
// app/src/app/live/[eventId]/page.tsx
export default async function LivePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const supabase = createClient()
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  return <LivePageClient eventId={eventId} eventName={event.name} ivsPlaybackUrl={event.ivs_playback_url} />
}
```

**Client Components Used For:**

1. **Real-time Subscriptions:**

```typescript
// app/src/lib/hooks/useRealtimeQueue.ts
'use client'
export function useRealtimeQueue(eventId: string) {
  // Uses useEffect, useState, Supabase Realtime
  // Subscribes to postgres_changes
}
```

2. **Interactive Dashboards:**

```typescript
// app/src/app/host/[eventId]/HostDashboardClient.tsx
'use client'
export default function HostDashboardClient({ eventId, eventName }: HostDashboardClientProps) {
  const { submissions } = useRealtimeQueue(eventId) // Real-time hook
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  // ... event handlers, drag-and-drop, etc.
}
```

3. **Forms with State:**

```typescript
// app/src/components/SubmissionForm.tsx
'use client'
export function SubmissionForm({ eventId }: SubmissionFormProps) {
  const [artistName, setArtistName] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  // ... form handling
}
```

**Architecture Pattern:**

```
Server Component (Page)
  ↓ (fetches initial data, handles auth)
Client Component (Interactive UI)
  ↓ (uses hooks, state, real-time subscriptions)
```

This is the **recommended Next.js 15 pattern** - Server Components fetch data, Client Components handle interactivity.

---

## Data Fetching Patterns

### Documentation Summary

**Server Components:**

- Use `async/await` with `fetch` API or database clients directly
- `fetch` responses are not cached by default in Next.js 15
- Can opt into dynamic rendering with `{ cache: 'no-store' }`
- Data fetching happens on the server before rendering

**Client Components:**

- Use hooks (`useEffect`, custom hooks) for data fetching
- Can use libraries like SWR or React Query
- Real-time subscriptions (like Supabase Realtime) require Client Components

### Current Implementation in demonstr8

**Server-Side Data Fetching:**

```typescript
// ✅ Correct: Server Component fetching data
export default async function LivePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const supabase = createClient() // Server-side client
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  // ... render with data
}
```

**Client-Side Real-time Data:**

```typescript
// ✅ Correct: Client Component with real-time subscription
'use client'
export function useRealtimeQueue(eventId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  
  useEffect(() => {
    const supabase = createClient() // Client-side client
    // Initial fetch
    supabase.from('submissions').select('*').eq('event_id', eventId)
      .then(({ data }) => setSubmissions(data || []))
    
    // Real-time subscription
    const channel = supabase
      .channel(`queue:${eventId}`)
      .on('postgres_changes', { /* ... */ }, (payload) => {
        // Update state based on changes
      })
      .subscribe()
    
    return () => supabase.removeChannel(channel) // Cleanup
  }, [eventId])
  
  return { submissions, loading }
}
```

**Hybrid Approach (Current Pattern):**

1. Server Component fetches initial/static data (event details, auth checks)
2. Client Component subscribes to real-time updates (queue changes, now playing)
3. This provides fast initial render + live updates

---

## Linting Best Practices

This section covers linting rules from Ultracite (a Next.js and React linting preset) and how they apply to the demonstr8 codebase. These rules help enforce Next.js 15 and React best practices.

### Next.js-Specific Rules

#### `noNextAsyncClientComponent` ⚠️ Critical

**Rule:** Prevents async client components in Next.js. Client components should be synchronous; use server components for async operations.

**Why it matters:** In Next.js 15, only Server Components can be async. Client Components must be synchronous because they run in the browser where async component functions aren't supported.

**Current Implementation:**

```typescript
// ✅ Correct: Server Component (can be async)
export default async function HostDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const event = await requireHost(eventId)
  return <HostDashboardClient eventId={eventId} eventName={event.name} />
}

// ✅ Correct: Client Component (synchronous)
'use client'
export default function HostDashboardClient({ eventId, eventName }: HostDashboardClientProps) {
  // Synchronous - uses hooks, state, etc.
}
```

**Analysis:** ✅ **Compliant** - All Client Components in the codebase are synchronous. No async client components found.

#### `noImgElement` 📸 Image Optimization

**Rule:** Disallow use of `<img>` HTML element. Use Next.js `<Image>` component instead for automatic image optimization.

**Why it matters:** Next.js Image component provides automatic optimization, lazy loading, and responsive images, improving performance and Core Web Vitals.

**Current Implementation:**

- The codebase doesn't currently use images, but if images are added, use:

  ```typescript
  import Image from 'next/image'
  
  <Image src="/path/to/image.jpg" alt="Description" width={500} height={300} />
  ```

**Recommendation:** When adding images (e.g., artist avatars, event thumbnails), use Next.js `Image` component.

#### `noHeadElement` 🏷️ Metadata API

**Rule:** Disallow use of `<head>` HTML element. Use Next.js `next/head` or App Router metadata API instead.

**Why it matters:** The App Router uses the Metadata API for better SEO and performance. Direct `<head>` manipulation can cause hydration issues.

**Current Implementation:**

```typescript
// ✅ Correct: Using Metadata API in layout.tsx
export const metadata: Metadata = {
  title: "LecturesFrom",
  description: "Live listening platform - fan submissions, host curation, synchronized streaming",
}
```

**Analysis:** ✅ **Compliant** - Using App Router Metadata API correctly.

#### App Router Async Patterns

**Special Handling:** App Router `page.tsx` and `layout.tsx` files are allowed to be async without requiring `await` in all cases, as Next.js handles these specially for server-side rendering.

**Current Implementation:**

```typescript
// ✅ Correct: Async page component
export default async function LivePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params // Properly awaited
  // ... data fetching
}
```

**Analysis:** ✅ **Compliant** - All async pages properly await params and data fetching.

### React-Specific Rules

#### `useExhaustiveDependencies` 🎣 Critical for Hooks

**Rule:** Enforce all dependencies are correctly specified in React hooks (`useEffect`, `useCallback`, `useMemo`).

**Why it matters:** Missing dependencies can cause stale closures, infinite loops, or bugs where effects don't run when they should. This is especially critical for real-time subscriptions.

**Current Implementation Analysis:**

**useRealtimeQueue.ts:**

```typescript
useEffect(() => {
  const supabase = createClient()
  // ... subscription setup
  return () => {
    supabase.removeChannel(channel)
  }
}, [eventId]) // ✅ eventId is in dependencies
```

**useRealtimeNowPlaying.ts:**

```typescript
useEffect(() => {
  const supabase = createClient()
  // ... subscription setup
  return () => {
    supabase.removeChannel(channel)
  }
}, [eventId]) // ✅ eventId is in dependencies
```

**Analysis:** ✅ **Compliant** - Both real-time hooks correctly include `eventId` in their dependency arrays. The `supabase` client is created inside the effect (which is correct - it's a new instance each time), and cleanup functions are properly returned.

**Note:** The `supabase` client doesn't need to be in dependencies because `createClient()` returns a new instance each time. Including it would cause unnecessary re-subscriptions.

#### `useHookAtTopLevel` ⚛️ Hook Rules

**Rule:** Enforce that all React hooks are called from the top level of component functions, not inside loops, conditions, or nested functions.

**Why it matters:** React hooks must be called in the same order on every render. Conditional hook calls violate the Rules of Hooks and can cause bugs.

**Current Implementation:**

```typescript
// ✅ Correct: Hooks at top level
'use client'
export default function HostDashboardClient({ eventId, eventName }: HostDashboardClientProps) {
  const { submissions } = useRealtimeQueue(eventId) // ✅ Top level
  const { nowPlaying } = useRealtimeNowPlaying(eventId) // ✅ Top level
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({}) // ✅ Top level
  
  // Event handlers below hooks
  const handleApprove = async (submissionId: string) => { /* ... */ }
}
```

**Analysis:** ✅ **Compliant** - All hooks are called at the top level of components, before any conditional logic or event handlers.

#### `useJsxKeyInIterable` 🔑 Keys in Maps

**Rule:** Enforce that elements in iterables have a `key` prop for React's reconciliation.

**Why it matters:** Keys help React identify which items have changed, been added, or removed, improving performance and preventing bugs with component state.

**Current Implementation:**

```typescript
// ✅ Correct: Using stable IDs as keys
{approved.map((sub) => (
  <SortableQueueItem
    key={sub.id} // ✅ Stable ID from database
    submission={sub}
    // ...
  />
))}

{pending.map((sub) => (
  <QueueItem
    key={sub.id} // ✅ Stable ID from database
    submission={sub}
    // ...
  />
))}
```

**Analysis:** ✅ **Compliant** - All map functions use stable database IDs (`sub.id`) as keys, not array indices.

#### `noArrayIndexKey` 🚫 Avoid Index Keys

**Rule:** Prevent using array indices as keys. Array indices are not stable identifiers and can cause issues with component state.

**Why it matters:** If the array order changes, React may reuse components with incorrect state, leading to bugs. Database IDs or other stable identifiers are preferred.

**Current Implementation:**

```typescript
// ✅ Correct: Using database IDs, not indices
approved.map((sub) => (
  <SortableQueueItem key={sub.id} ... /> // ✅ sub.id, not index
))

// ❌ Would be wrong:
approved.map((sub, index) => (
  <SortableQueueItem key={index} ... /> // ❌ Don't do this
))
```

**Analysis:** ✅ **Compliant** - No array indices used as keys. All map functions use stable identifiers from the data.

#### `noChildrenProp` 👶 Children Handling

**Rule:** Prevent passing children as props. Children should be nested between the opening and closing tags.

**Why it matters:** React's children prop is special and should be passed implicitly, not as a named prop. This improves component composition and follows React conventions.

**Current Implementation:**

- The codebase doesn't appear to pass children as props, but if needed:

  ```typescript
  // ✅ Correct: Implicit children
  <Modal>
    <Content />
  </Modal>
  
  // ❌ Wrong: Named children prop
  <Modal children={<Content />} />
  ```

**Analysis:** ✅ **Compliant** - No instances of children passed as named props found.

### Codebase Compliance Summary

| Rule | Status | Notes |
|------|--------|-------|
| `noNextAsyncClientComponent` | ✅ Compliant | All client components are synchronous |
| `noImgElement` | ⚠️ N/A | No images currently used |
| `noHeadElement` | ✅ Compliant | Using Metadata API correctly |
| `useExhaustiveDependencies` | ✅ Compliant | Real-time hooks have correct dependencies |
| `useHookAtTopLevel` | ✅ Compliant | All hooks called at top level |
| `useJsxKeyInIterable` | ✅ Compliant | All maps use proper keys |
| `noArrayIndexKey` | ✅ Compliant | Using stable IDs, not indices |
| `noChildrenProp` | ✅ Compliant | No children passed as props |

### Recommendations

1. **Maintain Hook Dependency Discipline:**
   - Continue including all reactive values in hook dependency arrays
   - The current pattern of creating Supabase client inside effects is correct
   - Consider adding ESLint rule `react-hooks/exhaustive-deps` if not already enabled

2. **When Adding Images:**
   - Use Next.js `Image` component for automatic optimization
   - Provide proper `alt` text for accessibility
   - Use appropriate `width` and `height` or `fill` for responsive images

3. **Consider Adding Linting Rules:**
   - The codebase currently uses ESLint with Next.js configs
   - Consider adding explicit React hooks rules to catch dependency issues early
   - These rules would help maintain code quality as the project grows

---

## Current Implementation Analysis

### ✅ What's Working Well

1. **Clear Separation of Concerns:**
   - Server Components handle auth, initial data, and static content
   - Client Components handle interactivity and real-time updates
   - Route Handlers handle mutations and business logic

2. **Proper Use of Async Params:**
   - All dynamic routes correctly use `params: Promise<{ eventId: string }>`
   - Properly awaited: `const { eventId } = await params`

3. **Server-Side Security:**
   - API routes use `supabase-server.ts` with service role key
   - Auth checks happen in Server Components before rendering
   - Sensitive operations (like creating IVS channels) are server-only

4. **Real-time Architecture:**
   - Custom hooks (`useRealtimeQueue`, `useRealtimeNowPlaying`) properly clean up subscriptions
   - Client Components use these hooks for live updates
   - Server Components provide initial data

### 🔄 Potential Improvements

1. **Server Actions for Form Submissions:**
   Currently, `SubmissionForm` uses a Client Component that calls an API route:

   ```typescript
   // Current: Client Component → API Route
   await fetch('/api/log', { method: 'POST', ... })
   ```

   **Could use Server Actions instead:**

   ```typescript
   // Alternative: Server Action (simpler, no API route needed)
   'use server'
   export async function submitTrack(formData: FormData) {
     // Direct database operation
   }
   ```

   However, your current approach is also valid and provides more control over error handling and logging.

2. **Caching Strategy:**
   Your Server Components don't explicitly set caching options. For event data that changes infrequently, you could add:

   ```typescript
   export const revalidate = 60 // Revalidate every 60 seconds
   ```

   But since you're using real-time subscriptions in Client Components, this may not be necessary.

3. **Error Boundaries:**
   Consider adding React Error Boundaries for better error handling in Client Components.

---

## Recommendations

### 1. Keep Current Architecture ✅

Your current pattern is excellent and follows Next.js 15 best practices:

- Server Components for initial data and auth
- Client Components for interactivity
- Route Handlers for mutations
- Real-time subscriptions in Client Components

### 2. Consider Server Actions for Simple Forms (Optional)

If you want to simplify form submissions, Server Actions could replace some API routes:

- **Pros:** Less code, automatic form handling, progressive enhancement
- **Cons:** Less control over error handling, harder to add custom logging

**Current approach is fine** - Route Handlers give you more flexibility.

### 3. Type Safety Improvements

Consider using the `RouteContext` helper for better type safety in Route Handlers:

```typescript
import type { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/queue/[id]'>
) {
  const { id } = await ctx.params
  // TypeScript knows 'id' exists and is a string
}
```

### 4. Documentation Alignment

Your codebase already follows the patterns documented in Next.js 15:

- ✅ Route Handlers for API endpoints
- ✅ Server Components for data fetching
- ✅ Client Components for interactivity
- ✅ Proper async/await usage
- ✅ Clean separation of server and client code

### 5. Linting Best Practices ✅

Your codebase demonstrates excellent compliance with Next.js and React linting best practices:

- ✅ All Client Components are synchronous (no async client components)
- ✅ Real-time hooks have correct dependency arrays
- ✅ All hooks called at top level (Rules of Hooks compliance)
- ✅ Proper key usage in map functions (stable IDs, not indices)
- ✅ Using App Router Metadata API correctly

**Maintain these practices** as the codebase grows. Consider adding explicit ESLint rules for React hooks to catch dependency issues early in development.

---

## Key Takeaways

1. **Your architecture is solid** - You're using Next.js 15 patterns correctly
2. **Server Components** handle initial data and auth (fast, secure)
3. **Client Components** handle real-time updates and interactivity
4. **Route Handlers** handle mutations and business logic
5. **Real-time subscriptions** require Client Components (correctly implemented)

The demonstr8 codebase demonstrates a mature understanding of Next.js 15 App Router patterns, with a clean separation between server and client concerns.

---

## References

- [Next.js 15 Route Handlers](https://nextjs.org/docs/15/app/getting-started/route-handlers-and-middleware#route-handlers)
- [Server and Client Components](https://nextjs.org/docs/15/app/getting-started/server-and-client-components)
- [Data Fetching](https://nextjs.org/docs/15/app/getting-started/fetching-data)
- [App Router Overview](https://nextjs.org/docs/15/app)
