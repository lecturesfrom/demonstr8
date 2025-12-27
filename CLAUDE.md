# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**demonstr8** (formerly lecturesFrom) is a career-development platform for the creative class where creators host live-streamed sessions and aspiring artists submit their work for real-time feedback. Think of it as a launchpad for creative careers — where today's submitter becomes tomorrow's creator.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL with Realtime subscriptions)
- **Streaming**: AWS IVS (Interactive Video Service)
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Testing**: Vitest with React Testing Library
- **Deployment**: Vercel

## Development Commands

### Running the Application
```bash
cd app
npm run dev        # Start development server on localhost:3000
npm run build      # Build for production
npm start          # Run production build
```

### Testing
```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with Vitest UI
npm run test:coverage # Generate coverage report
```

### Linting
```bash
npm run lint       # Run ESLint
```

## Architecture & Key Concepts

### Real-time Data Flow

The application uses Supabase Realtime for live updates across all connected clients:

1. **Queue Updates**: `useRealtimeQueue(eventId)` hook subscribes to `submissions` table changes
2. **Now Playing**: `useRealtimeNowPlaying(eventId)` hook subscribes to `now_playing` table changes
3. **Pattern**: All hooks clean up subscriptions on unmount to prevent memory leaks

### Database Schema

**Core Tables**:
- `profiles` - User accounts with role-based access (fan/host/creator/admin)
- `events` - Live streaming sessions with IVS channel info
- `submissions` - Audio tracks submitted by fans (stored in Supabase Storage)
- `now_playing` - Single-row table tracking currently playing track per event
- `event_logs` - Audit trail of all actions (submit/approve/play/skip)

**Demonstr8 Features** (M2+):
- `user_subscriptions` - Tiered access (free/pro/platinum)
- `creator_accounts` - Stripe Connect for creator payouts
- `user_locker` - File storage for reusable submissions
- `armed_submissions` - Automated submission for platinum users
- `skip_pricing_history` - Dynamic pricing records for Opportunity Engine

**Security**: All tables have Row Level Security (RLS) policies enabled. Use `supabase-server.ts` for server-side operations that need service role key.

### API Route Patterns

All API routes follow this structure:
1. Parse and validate request body
2. Create Supabase client (server-side with service role key)
3. Perform database operations
4. Log action to `event_logs` table
5. Return JSON response with proper error handling

**Example**: `/api/queue/approve` - Approves a submission, assigns queue position, logs action

### File Upload Flow

**Migration Note**: The app migrated from Mux video processing to direct Supabase Storage uploads.

1. Client calls `/api/upload/create` to get signed upload URL
2. File uploaded directly to `audio-submissions` bucket in Supabase Storage
3. Public URL is immediately available (no processing delays)
4. Submission record created with `file_url` field

### Design System: Digital Workwear

Clean, functional, industrial aesthetic inspired by utilitarian design.

**The 1% Rule**: 90% neutral backgrounds, 9% muted support colors, 1% hi-vis accent.
- The **Play button** is the ONLY element with solid `dw-accent` (#C8D400) background
- This creates intentional visual hierarchy for the primary action

**Key Tokens** (defined in Tailwind config):
- `dw-base` #121212 — matte black background
- `dw-surface` rgb(168, 167, 167) — panels and cards
- `dw-accent` #C8D400 — rare hi-vis yellow (1% rule: only the Play button)
- `dw-success` rgb(240, 233, 17) — approved state indicator
- `dw-alert` #D86830 — skip/warning actions

**Typography**: Satoshi font family with bold headings (800 weight), comfortable 18px body text.

### Component Architecture

**Common Pattern**: Components are organized by purpose:
- `/components/common/` - Reusable UI primitives (ActionButton, TrackInfo, etc.)
- `/components/` - Feature components (QueueItem, NowPlaying, IVSPlayer, etc.)

**State Management**:
- Real-time hooks (`useRealtimeQueue`, `useRealtimeNowPlaying`) handle live updates
- Local state for loading indicators and optimistic updates
- No global state management library (hooks + context only)

**Drag-and-Drop**: Uses `@dnd-kit` for queue reordering
- `SortableQueueItem` wraps `QueueItem` for drag functionality
- Updates are sent to `/api/queue/reorder` endpoint
- Real-time sync ensures all clients see reordered queue

### Type Safety

**Centralized Types**: All shared types defined in `lib/types.ts`
- Database table interfaces match schema exactly
- Union types for status/role enums (e.g., `SubmissionStatus`, `UserRole`)
- API response types for consistency

**Pattern**: Import types from `@/types` (aliased to `lib/types.ts`)

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (safe to expose, RLS protects data)
- `SUPABASE_SERVICE_ROLE_KEY` - Service key (server-only, bypasses RLS)

**AWS IVS**:
- `AWS_ACCESS_KEY_ID` - IAM user access key
- `AWS_SECRET_ACCESS_KEY` - IAM secret key (server-only)
- `AWS_REGION` - AWS region (e.g., us-east-1)

**Application**:
- `NEXT_PUBLIC_APP_URL` - Base URL (http://localhost:3000 for dev)

### Database Setup

Run the migration in Supabase SQL Editor:
```sql
-- Execute contents of migrate-to-ivs.sql
-- This creates all tables, RLS policies, indexes, and storage buckets
```

For testing, run `create-test-event.sql` or `setup-test-data.sql` to generate demo data.

## Project Status & Roadmap

**Current Milestone**: M1 Complete (75%) - Post-migration to AWS IVS

**Completed**:
- ✅ Core submission flow (upload → queue → approve → play)
- ✅ Real-time synchronization across all clients
- ✅ Host dashboard with authentication guards
- ✅ Live page with IVS video player
- ✅ Drag-and-drop queue reordering
- ✅ Digital Workwear design system
- ✅ AWS IVS integration for streaming
- ✅ Supabase Storage for file uploads

**Next Milestones**:
- **M2**: Opportunity Engine - Dynamic "skip the line" pricing based on queue length
- **M3**: Subscription tiers (Free/Pro/Platinum) with Stripe integration
- **M4**: Invite to Stage feature using IVS Stage for multi-host collaboration

## Common Development Patterns

### Creating a New API Route

1. Create route handler in `app/src/app/api/[feature]/route.ts`
2. Import `createClient` from `@/lib/supabase-server` for server-side operations
3. Parse request body and validate required fields
4. Perform database operation with proper error handling
5. Log action to `event_logs` table
6. Return `NextResponse.json()` with data or error

### Adding a New Component

1. Create component in `app/src/components/[ComponentName].tsx`
2. Add JSDoc comment explaining what/why/how it helps users
3. Import types from `@/types` for props
4. Follow Digital Workwear design tokens for styling
5. Add to common/ subdirectory if it's a reusable primitive

### Adding a Real-time Feature

1. Create custom hook in `app/src/lib/hooks/use[Feature].ts`
2. Use `createClient()` from `@/lib/supabase` (client-side)
3. Subscribe to Postgres changes via Supabase Realtime
4. Return cleanup function to remove channel on unmount
5. Handle INSERT/UPDATE/DELETE events appropriately

## Migration Notes (Mux → AWS IVS)

**What Changed**:
- Removed all Mux dependencies (`@mux/mux-node`, `@mux/mux-player-react`)
- Replaced MuxPlayer with IVSPlayer component
- File uploads now go directly to Supabase Storage (no processing webhooks)
- Live streaming uses AWS IVS channels instead of Mux live streams

**Why**: Simpler architecture, faster file availability, lower costs, better scalability for concurrent viewers.

**Database Changes**: See `migrate-to-ivs.sql` for full schema changes (removed mux_* columns, added ivs_* columns)

## Testing Strategy

**Current Setup**: Vitest with jsdom environment for React component testing

**Test Location**: `app/src/__tests__/`

**Running Single Test**:
```bash
npm test [test-file-pattern]
# Example: npm test QueueItem
```

**Coverage**: Configured to exclude node_modules, .next, tests, configs, and type files

## Authentication & Authorization

**Pattern**: Supabase Auth with Row Level Security (RLS)

**Host Protection**: Dashboard pages use `getUser()` server-side to verify authentication
- Redirects to login if not authenticated
- Checks user role in `profiles` table for host/creator permissions

**API Security**:
- Service role key bypasses RLS (use carefully, server-only)
- Client-side operations use anon key with RLS enforcement

## File Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── host/         # Host dashboard (auth required)
│   │   ├── live/         # Public live stream page
│   │   ├── submit/       # Submission form
│   │   └── api/          # API routes (upload, queue, IVS, logs)
│   ├── components/       # React components
│   │   └── common/       # Reusable UI primitives
│   ├── lib/              # Utilities, hooks, types
│   │   ├── hooks/        # Custom React hooks
│   │   ├── supabase*.ts  # Supabase client setup
│   │   ├── types.ts      # Centralized type definitions
│   │   ├── ivs.ts        # AWS IVS utilities
│   │   └── auth*.ts      # Authentication utilities
│   └── __tests__/        # Test files
├── public/               # Static assets
└── *.config.*            # Configuration files

Root:
├── *.sql                 # Database migrations and test data
├── .env.example          # Environment template
└── *.md                  # Documentation
```
