# LecturesFrom

A live listening platform where fans submit audio files, hosts curate and play tracks in real-time, and listeners experience a synchronized live stream.

## What This Is

LecturesFrom enables:
- **Fans**: Submit audio files via a public link (no account needed)
- **Hosts**: Manage queue, approve tracks, control playback from a dashboard
- **Listeners**: Watch live streams with synchronized audio and queue display

Think of it as "collaborative DJ set meets live radio" — fan submissions become the content, host curates, audience experiences together.

## Design System: Digital Workwear

Clean, functional, industrial aesthetic inspired by utilitarian design.

**Color Philosophy**: 90% neutral backgrounds, 9% muted support colors, 1% hi-vis accent (only for primary actions).

**Key Tokens**:
- `dw-base` #121212 — matte black background
- `dw-surface` #1E1C1A — panels and cards
- `dw-accent` #C8D400 — rare hi-vis yellow (1% rule: only the Play button)
- `dw-success` #4C7B47 — approved state indicator
- `dw-alert` #D86830 — skip/warning actions

**Typography**: Clean sans-serif with bold headings (800 weight), comfortable 18px body text.

## Current Status

**Milestone 1 (M1) - Near Completion**: ~30/50 tasks completed (60%)

✅ **Completed**:
- Project setup with Next.js 14, TypeScript, Tailwind CSS
- Digital Workwear design system fully implemented
- All core components: QueueItem, NowPlaying, ProcessingBadge, FileUploader, LivePlayer
- All pages: submission page, host dashboard (with auth), live page with video player
- All API routes: Mux upload/webhook, queue management (approve/play/skip), logging
- Supabase integration with realtime hooks
- Database schema with Row Level Security policies
- Authentication guards on host dashboard
- Mux webhook signature verification
- Queue position auto-assignment
- Shared types and constants files

⏳ **Remaining Tasks**:
- Add loading states to buttons
- Implement drag-and-drop queue reordering
- Full end-to-end testing with real Supabase
- Deploy to Vercel

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (Postgres + Realtime + Auth)
- **Video/Audio**: Mux (Direct Upload + Live RTMP streaming)
- **File Upload**: Fetch API with Mux Direct Upload
- **Drag & Drop**: @dnd-kit/core (installed, not yet implemented)
- **Deployment**: Vercel (ready to deploy)

## Quick Start

```bash
# Install dependencies
cd app
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Mux credentials

# Run database migrations
# (Connect to your Supabase project and run migration.sql)

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the component showcase.

## Documentation

- **[@CLAUDE.md](@CLAUDE.md)** — Project context and architecture overview
- **[spec.md](spec.md)** — Complete product specification with design system
- **[TODO.md](TODO.md)** — 50-task breakdown for Milestone 1
- **[preferences.md](.claude/preferences.md)** — Communication patterns and code style
- **[tech-stack.md](tech-stack.md)** — Technology choices and rationale
- **[migration-fixed.sql](migration-fixed.sql)** — Database schema with RLS policies

## Project Structure

```
lecturesfrom/
├── app/
│   ├── src/
│   │   ├── app/              # Next.js pages (App Router)
│   │   │   ├── submit/       # Public submission page
│   │   │   ├── host/         # Host dashboard (with auth)
│   │   │   ├── live/         # Public live view page
│   │   │   └── api/          # API routes for Mux, queue, logging
│   │   ├── components/       # React components
│   │   └── lib/
│   │       ├── hooks/        # Custom React hooks (realtime)
│   │       ├── types.ts      # Shared TypeScript types
│   │       ├── constants.ts  # Shared constants
│   │       ├── auth.ts       # Authentication utilities
│   │       ├── supabase.ts   # Browser client
│   │       └── supabase-server.ts  # Server client
│   ├── package.json
│   └── tailwind.config.ts
├── migration-fixed.sql       # Database schema with RLS
├── setup-test-event.sql      # Test data setup
└── .claude/                  # Project context for Claude
```

## Known Issues

- **Drag-and-drop reordering**: @dnd-kit is installed but not yet implemented in the host dashboard
- **Loading states**: Buttons don't show loading spinners during API calls yet
- **Full auth flow**: Basic auth guard in place, but full Supabase Auth setup needed
- **Deployment**: Ready for Vercel deployment but not yet deployed

## License

Private project (not open source).
