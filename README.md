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

**Milestone 1 (M1) - In Progress**: 7/50 tasks completed (14%)

✅ **Completed**:
- Project documentation (@CLAUDE.md, spec.md, TODO.md, preferences.md)
- Next.js app setup with TypeScript + Tailwind CSS v4
- Digital Workwear design system implementation
- Core components: QueueItem, NowPlaying, ProcessingBadge
- Supabase client utilities + realtime hooks
- Database schema with Row Level Security policies

⏳ **Next Steps**:
- File upload component (Uppy + Mux Direct Upload)
- API routes for submissions, queue management, Mux webhooks
- Public submission page + host dashboard + live page
- End-to-end testing with real Supabase database

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **Database**: Supabase (Postgres + Realtime + Auth + Storage)
- **Video/Audio**: Mux (Direct Upload + Live RTMP streaming)
- **File Upload**: Uppy + Tus (resumable uploads for large audio files)
- **Drag & Drop**: @dnd-kit/core (queue reordering)
- **Deployment**: Vercel (planned)

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

- **[@CLAUDE.md](.claude/@CLAUDE.md)** — Project context and architecture overview
- **[spec.md](docs/spec.md)** — Complete product specification with design system
- **[TODO.md](docs/TODO.md)** — 50-task breakdown for Milestone 1
- **[preferences.md](.claude/preferences.md)** — Communication patterns and code style
- **[tech-stack.md](docs/tech-stack.md)** — Technology choices and rationale
- **[migration.sql](supabase/migrations/migration.sql)** — Database schema

## Project Structure

```
lecturesfrom/
├── app/
│   ├── src/
│   │   ├── app/              # Next.js pages (App Router)
│   │   ├── components/       # React components
│   │   └── lib/
│   │       ├── hooks/        # Custom React hooks (realtime subscriptions)
│   │       ├── supabase.ts   # Browser client
│   │       └── supabase-server.ts  # Server client
│   ├── package.json
│   └── tailwind.config.ts
├── supabase/
│   └── migrations/           # Database schema
├── docs/                     # Specifications and planning
└── .claude/                  # Project context for Claude
```

## License

Private project (not open source).
