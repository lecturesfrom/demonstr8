# demonstr8 (by lecturesFrom)

A career-development platform for the creative class, where creators host live-streamed sessions and aspiring artists submit their work for real-time feedback.

## What This Is

demonstr8 enables:
- **Submitters**: Upload audio files and get real-time feedback from influential creators
- **Creators**: Host live listening sessions, build their brand, and monetize through the Opportunity Engine
- **Audience**: Experience synchronized live streams with dynamic queue management

Think of it as a launchpad for creative careers — where today's submitter becomes tomorrow's creator.

## Design System: Digital Workwear

Clean, functional, industrial aesthetic inspired by utilitarian design.

**Color Philosophy**: 90% neutral backgrounds, 9% muted support colors, 1% hi-vis accent (only for primary actions).

**Key Tokens**:
- `dw-base` #121212 — matte black background
- `dw-surface`rgb(168, 167, 167) — panels and cards
- `dw-accent` #C8D400 — rare hi-vis yellow (1% rule: only the Play button)
- `dw-success`rgb(240, 233, 17) — approved state indicator
- `dw-alert` #D86830 — skip/warning actions

**Typography**: Clean sans-serif with bold headings (800 weight), comfortable 18px body text.

## Current Status

**Post-Migration**: Successfully migrated from Mux to AWS IVS infrastructure

✅ **Completed**:
- Project setup with Next.js 14, TypeScript, Tailwind CSS
- Digital Workwear design system fully implemented
- Core components: QueueItem, NowPlaying, FileUploader, IVSPlayer
- Pages: submission form, host dashboard (with auth), live page with video player
- API routes: Supabase Storage upload, queue management (approve/play/skip), logging
- Supabase integration with realtime hooks
- Database schema with Row Level Security policies
- Authentication guards on host dashboard
- Queue position auto-assignment
- Drag-and-drop queue reordering
- AWS IVS integration for live streaming
- Supabase Storage for file uploads

⏳ **Next Milestones**:
- **Milestone 2**: Opportunity Engine with dynamic pricing
- **Milestone 3**: Subscription tiers (Free/Pro/Platinum)
- **Milestone 4**: Invite to Stage feature using IVS Stage

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL with Realtime)
- **Streaming**: AWS IVS (Interactive Video Service)
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- AWS Account (for IVS)
- Supabase Project

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/demonstr8.git
cd demonstr8

# Install dependencies
cd app
npm install

# Copy environment variables
cp .env.example .env.local
# Add your Supabase and AWS credentials

# Run database migration in Supabase
# Execute migrate-to-ivs.sql in Supabase SQL Editor

# Start development server
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS IVS
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
app/
├── src/
│   ├── app/              # App router pages
│   │   ├── host/         # Host dashboard
│   │   ├── live/         # Public live page
│   │   ├── submit/       # Submission form
│   │   └── api/          # API routes for uploads, queue, IVS
│   ├── components/       # React components
│   └── lib/              # Utilities, hooks, types
└── public/               # Static assets
```

## Key Features

### For Creators
- Real-time queue management with drag-and-drop reordering
- Live streaming via AWS IVS
- Monetization through dynamic pricing (coming soon)
- Stripe Connect for direct payouts (coming soon)

### For Submitters
- Direct file upload to Supabase Storage
- Real-time queue position updates
- Skip-the-line pricing options (coming soon)
- Subscription tiers for premium features (coming soon)

### For Everyone
- Real-time synchronization across all users
- Industrial design aesthetic with 1% accent rule
- Mobile-responsive interface

## Contributing

This is currently a private project in active development. Contribution guidelines will be added when the project is open-sourced.

## License

Private - All rights reserved

---

Built with the vision of transforming online talent discovery into a structured, monetizable, and fair ecosystem.