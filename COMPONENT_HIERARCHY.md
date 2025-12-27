# Component Hierarchy & Relationships

This document maps the component structure and data flow in the demonstr8 application.

## Component Architecture Overview

```
app/src/app/
├── page.tsx (Home/Showcase)
├── host/[eventId]/
│   ├── page.tsx (Server)
│   └── HostDashboardClient.tsx (Client)
├── live/[eventId]/
│   ├── page.tsx (Server)
│   └── LivePageClient.tsx (Client)
└── submit/[token]/
    ├── page.tsx (Server)
    └── SubmitPageClient.tsx (Client)

app/src/components/
├── QueueItem.tsx
├── SortableQueueItem.tsx (wraps QueueItem)
├── NowPlaying.tsx
├── AudioPlayer.tsx
├── FileUploader.tsx
├── SubmissionForm.tsx
├── IVSPlayer.tsx
├── LivePlayer.tsx
└── common/
    ├── ActionButton.tsx
    ├── TrackInfo.tsx
    ├── EmptyState.tsx
    └── LoadingSpinner.tsx
```

## Page-Level Components

### Host Dashboard (`/host/[eventId]`)

**Server Component**: `page.tsx`
- Fetches event data server-side
- Passes props to client component

**Client Component**: `HostDashboardClient.tsx`
- Uses `useRealtimeQueue(eventId)` hook for live queue updates
- Uses `useRealtimeNowPlaying(eventId)` hook for now playing updates
- Manages three-column layout:
  - **Pending**: QueueItem components (approve action)
  - **Queue**: SortableQueueItem components (drag-drop, play/skip)
  - **History**: QueueItem components (read-only)

**Components Used**:
- `NowPlaying` - Shows currently playing track
- `QueueItem` - Individual submission cards
- `SortableQueueItem` - Draggable queue items (wraps QueueItem)
- `@dnd-kit` - Drag-and-drop library

**Data Flow**:
```
Supabase Realtime → useRealtimeQueue → submissions array → QueueItem/SortableQueueItem
Supabase Realtime → useRealtimeNowPlaying → nowPlaying → NowPlaying → AudioPlayer
User Action → API Route → Database Update → Realtime Update → UI Update
```

### Live Page (`/live/[eventId]`)

**Server Component**: `page.tsx`
- Fetches event data and IVS playback URL
- Passes props to client component

**Client Component**: `LivePageClient.tsx`
- Uses `useRealtimeQueue(eventId)` for queue
- Uses `useRealtimeNowPlaying(eventId)` for now playing
- Shows public-facing view (no host actions)

**Components Used**:
- `LivePlayer` - IVS video stream player
- `NowPlaying` - Currently playing track
- `QueueItem` - Queue items (read-only, `isHost={false}`)

### Submit Page (`/submit/[token]`)

**Server Component**: `page.tsx`
- Fetches event by token
- Passes props to client component

**Client Component**: `SubmitPageClient.tsx`
- Handles submission form

**Components Used**:
- `SubmissionForm` - Complete submission form
  - `FileUploader` - File upload component
  - `ActionButton` - Submit button

## Component Dependencies

### QueueItem

**Imports**:
- `TrackInfo` from `./common/TrackInfo`
- `ActionButton` from `./common/ActionButton`
- `SubmissionStatus` type from `@/types`

**Props**:
```typescript
{
  submission: {
    id: string
    track_title: string
    artist_name: string
    file_url: string | null
    status: SubmissionStatus
  }
  onApprove?: (id: string) => void
  onPlay?: (id: string) => void
  onSkip?: (id: string) => void
  isHost?: boolean
  isLoading?: boolean
}
```

**Renders**:
- `TrackInfo` component for track metadata
- Conditional `ActionButton` components based on status and `isHost`
- Status-based styling (pending, approved, playing, skipped, done)

**Key Behavior**:
- Play button uses `variant="primary"` (the 1% accent rule)
- Other buttons use `variant="secondary"` or `variant="danger"`

### SortableQueueItem

**Imports**:
- `QueueItem` from `./QueueItem`
- `@dnd-kit/sortable` for drag functionality

**Wraps**: `QueueItem`

**Adds**:
- Drag handle
- Sortable context integration
- Drag state styling

### NowPlaying

**Imports**:
- `AudioPlayer` from `./AudioPlayer`

**Props**:
```typescript
{
  submission: {
    track_title: string
    artist_name: string
    file_url: string | null
  } | null
}
```

**Renders**:
- Empty state if `submission === null`
- `AudioPlayer` component if submission exists

### AudioPlayer

**Uses**: Native HTML5 `<audio>` element

**Features**:
- Play/pause controls
- Progress bar (seekable)
- Time display (current/duration)
- Auto-play attempts (respects browser policies)
- Loading states

**Styling**:
- Uses `bg-dw-accent` for Play button (1% rule)
- Border uses `border-dw-accent`

### FileUploader

**Features**:
- File input (hidden, triggered by button)
- File validation (audio/* types, 50MB max)
- Upload to Supabase Storage via `/api/upload/create`
- Progress indicator
- Success/error callbacks

**API Flow**:
```
User selects file → POST /api/upload/create → Get signed URL
→ PUT file to Supabase Storage → Return public URL → onUploadComplete callback
```

### SubmissionForm

**Imports**:
- `FileUploader` from `./FileUploader`
- `createClient` from `@/lib/supabase`

**Features**:
- Artist name input
- Track title input
- File upload (via FileUploader)
- Form validation
- Submission to database
- Event logging

**Data Flow**:
```
Form submit → Insert to submissions table → POST /api/log → Reset form
```

## Common Components

### ActionButton

**Variants**:
- `primary` - Solid `bg-dw-accent` (only for Play button)
- `secondary` - Border only, transparent background
- `danger` - Border only, `dw-alert` color

**States**:
- Default
- Loading (`isLoading` prop, shows LoadingSpinner)
- Disabled

### TrackInfo

**Variants**:
- `default` - Standard size (used in QueueItem)
- `large` - Larger typography (used in AudioPlayer)

**Shows**:
- Track title
- Artist name
- File status (✓ Ready or ⏳ Processing)
- Playing indicator (if `status === 'playing'`)

### EmptyState

**Props**:
```typescript
{
  title: string
  description: string
}
```

**Usage**: Shown when lists/queues are empty

### LoadingSpinner

**Sizes**: `small`, `medium`, `large`

**Colors**: Inherits from parent or explicit color prop

## Real-time Hooks

### useRealtimeQueue(eventId)

**Location**: `app/src/lib/hooks/useRealtimeQueue.ts`

**Returns**:
```typescript
{
  submissions: Submission[]
  loading: boolean
}
```

**Subscribes To**: `submissions` table changes for the given event
- Filters by `event_id`
- Orders by `queue_position` ASC
- Cleans up subscription on unmount

**Used By**:
- `HostDashboardClient`
- `LivePageClient`

### useRealtimeNowPlaying(eventId)

**Location**: `app/src/lib/hooks/useRealtimeNowPlaying.ts`

**Returns**:
```typescript
{
  nowPlaying: Submission | null
  loading: boolean
}
```

**Subscribes To**: `now_playing` table changes for the given event
- Joins with `submissions` table to get full submission data
- Cleans up subscription on unmount

**Used By**:
- `HostDashboardClient`
- `LivePageClient`

## API Routes

### `/api/queue/approve`
- Updates submission status to `approved`
- Sets `queue_position`
- Logs action

### `/api/queue/play`
- Updates submission status to `playing`
- Updates `now_playing` table
- Logs action

### `/api/queue/skip`
- Updates submission status to `skipped`
- Logs action

### `/api/queue/reorder`
- Updates `queue_position` for multiple submissions
- Used by drag-and-drop reordering

### `/api/upload/create`
- Creates signed upload URL for Supabase Storage
- Returns upload URL and public file URL

## Design System Integration

### Digital Workwear Tokens

All components use design tokens defined in `globals.css`:

**Colors**:
- `dw-base` - Background (#121212)
- `dw-surface` - Panels (#1E1C1A)
- `dw-text` - Primary text (#E8E5D8)
- `dw-accent` - Hi-vis accent (#C8D400) - **1% rule: only Play button**
- `dw-alert` - Warning/skip actions (#D86830)
- `dw-success` - Success states (#4C7B47)

**Typography**:
- `.dw-h1`, `.dw-h2`, `.dw-h3` - Headings (Satoshi, bold)
- `.dw-body` - Body text (18px)
- `.dw-label` - Labels (14px)

**Spacing**: 4px/8px/16px/24px rhythm

**Border Radius**: `rounded-sm` (2px) for subtle rounding

## Component Testing Strategy

### Unit Tests
- Test individual components in isolation
- Mock props and callbacks
- Test all status/state variations

### Integration Tests
- Test component interactions
- Test real-time hooks with mock Supabase
- Test API route integration

### E2E Tests
- Test full user flows
- Test real-time updates across multiple clients
- Test drag-and-drop functionality

## Navigation Tips (Cursor IDE)

**Jump to Definition**:
- `Cmd+Click` (Mac) or `Ctrl+Click` (Windows) on component name
- `F12` on symbol

**Find References**:
- `Shift+F12` to see where component is used
- `Cmd+Shift+F` to search codebase

**Peek Definition**:
- `Alt+F12` to peek at component without navigating away

**Go to File**:
- `Cmd+P` (Mac) or `Ctrl+P` (Windows) then type filename

**Structure View**:
- Use outline/symbol view to see component props and exports

## Quick Reference

**1% Accent Rule**: Only `ActionButton` with `variant="primary"` (Play button) uses solid `bg-dw-accent`

**Real-time Updates**: All queue/now-playing updates flow through Supabase Realtime subscriptions

**Component Isolation**: Each component is self-contained with clear props interface

**Type Safety**: All types defined in `app/src/lib/types.ts`