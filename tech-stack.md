# Tech Stack & Requirements

> **📚 Related Files:** [@CLAUDE.md](@CLAUDE.md) (project context) | [spec.md](spec.md) (product requirements) | [TODO.md](TODO.md) (implementation tasks) | [migration.sql](migration.sql) (database schema)

---

## Overview

This document outlines all technical requirements, service accounts, dependencies, and configuration needed to build the live listening platform.

**For Non-Technical Readers:**
- **"Tech Stack"** = The tools/services we're using to build the product
- **"Dependencies"** = Code libraries we install (like buying parts for a machine)
- **"Environment Variables"** = Secret keys that connect our app to services (like passwords)

**Why These Choices Matter:**
Each service was chosen for **speed** (ship faster), **cost** (low/free tiers), and **scalability** (works when we grow).

---

## Required Services & Costs

### Month 1 (Development + Testing)

| Service | Tier | Monthly Cost | Purpose | Why We Chose It |
|---------|------|--------------|---------|-----------------|
| **Supabase** | Free | $0 | Auth, Postgres DB, Realtime, Storage | Real-time updates without building WebSockets; free until 50K users |
| **Mux** | Pay-as-you-go | ~$5 | Video API (Direct Upload, Live, VOD) | Handles any audio format (WAV/FLAC/MP3); fans upload directly (no server load) |
| **Vercel** | Hobby | $0 | Next.js hosting, auto-deploy | Zero DevOps; push to GitHub = instant deploy |
| **Stripe** | Free (2.9% + 30¢) | $0 | Payments (M3 only) | Industry standard; fans trust it; 2-day payouts |
| **ngrok** | Free | $0 | Local webhook testing (dev only) | Test webhooks locally before deploying |
| **GitHub** | Free | $0 | Version control | Standard for code collaboration |

**Total Month 1 Cost:** ~$5 (Mux usage for 2-3 test events)
**Business Impact:** ~$5 total spend for first month = minimal risk, maximum learning

### Scaling Costs (100 events/month)

| Service | Usage | Estimated Cost | Business Context |
|---------|-------|----------------|------------------|
| **Supabase** | <500MB DB, <2GB bandwidth | $0 (still free) | Supports 1000s of users before paying |
| **Mux** | 10 hours live + 50 hours VOD | ~$50 | = 5 replay sales to break even |
| **Vercel** | <100GB bandwidth | $0 (still free) | Free tier handles early growth |
| **Stripe** | $1000 GMV (100 × $10 avg) | ~$32 (fees) | 3.2% of revenue (industry standard) |

**Total @ 100 events/month:** ~$82 in costs
**Revenue Potential:** $1000 GMV = $968 net (after Stripe fees) = $886 profit (after infra costs)
**Margin:** 88.6% (excellent for SaaS)

**GTM Insight:** At 100 events/month, we're profitable even if only 10% of fans pay for replays or tips.

---

## Development Environment

### Required Tools

```bash
# Node.js & npm
node >= 18.0.0
npm >= 9.0.0

# Version control
git >= 2.30.0

# Optional but recommended
ngrok (for local webhook testing)
```

### Recommended Editor Setup (VSCode)

**Extensions:**
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Supabase (supabase.supabase)
- TypeScript and JavaScript Language Features (built-in)

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Dependencies

### package.json (Complete)

```json
{
  "name": "lecturesfrom",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",
    "@mux/mux-node": "^8.0.0",
    "@mux/mux-player-react": "^2.3.0",
    "@uppy/core": "^3.9.0",
    "@uppy/tus": "^3.5.0",
    "@uppy/react": "^3.2.0",
    "@uppy/dashboard": "^3.7.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "stripe": "^14.14.0",
    "@stripe/stripe-js": "^2.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

### Installation Commands

```bash
# Initialize Next.js project
npx create-next-app@latest lecturesfrom --typescript --tailwind --app --src-dir --import-alias "@/*"

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr @mux/mux-node @mux/mux-player-react

# Install upload handling
npm install @uppy/core @uppy/tus @uppy/react @uppy/dashboard

# Install drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Install payments (M3 only)
npm install stripe @stripe/stripe-js

# Install utilities
npm install clsx tailwind-merge

# Install dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
```

---

## Environment Variables

### .env.local Template

```bash
# ======================
# Supabase Configuration
# ======================
# Get these from: https://app.supabase.com/project/_/settings/api

# Public URL (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (safe to expose, RLS protects data)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Service Role Key (NEVER expose in browser, server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMTU1NzYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ======================
# Mux Configuration
# ======================
# Get these from: https://dashboard.mux.com/settings/access-tokens

# API Token ID
MUX_TOKEN_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Token Secret (NEVER expose in browser)
MUX_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Signing Secret (from Mux webhook settings)
MUX_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Default Live Stream Playback ID (M1: shared for all events)
# Get from: Mux dashboard → Live Streams → [your stream] → Playback ID
MUX_LIVE_PLAYBACK_ID_DEFAULT=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ======================
# Stripe Configuration (M3 only)
# ======================
# Get these from: https://dashboard.stripe.com/test/apikeys

# Secret Key (NEVER expose in browser)
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY

# Publishable Key (safe to expose in browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Signing Secret (from Stripe webhook settings)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ======================
# Application Configuration
# ======================
# Base URL for your app (change in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

### Environment Variable Security

**Safe to expose in browser (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (protected by RLS policies)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

**NEVER expose (server-only):**
- `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- `MUX_TOKEN_SECRET` (can create/delete assets)
- `MUX_WEBHOOK_SECRET` (can spoof webhooks if leaked)
- `STRIPE_SECRET_KEY` (can charge cards)
- `STRIPE_WEBHOOK_SECRET` (can spoof payment confirmations)

---

## Service Setup Guides

### 1. Supabase Setup (15 minutes)

**Create Project:**
1. Go to https://app.supabase.com
2. Click "New project"
3. Choose organization, name: "lecturesfrom-dev", region: closest to you
4. Set database password (save to password manager)
5. Wait 2 minutes for provisioning

**Get API Keys:**
1. Go to Settings → API
2. Copy `URL` → paste into `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → paste into `SUPABASE_SERVICE_ROLE_KEY`

**Run Migration:**
1. Go to SQL Editor
2. Paste contents of `migration.sql` (we'll create this file)
3. Click "Run"
4. Verify tables created: Database → Tables (should see profiles, events, submissions, etc.)

**Enable Realtime:**
1. Go to Database → Replication
2. Toggle ON for: `submissions`, `now_playing`
3. Click "Save"

---

### 2. Mux Setup (20 minutes)

**Create Account:**
1. Go to https://dashboard.mux.com/signup
2. Create account (no credit card required for free tier)
3. Verify email

**Generate API Token:**
1. Go to Settings → Access Tokens
2. Click "Generate new token"
3. Name: "lecturesfrom-server"
4. Permissions: Check "Mux Video" (Full Access)
5. Click "Generate token"
6. Copy Token ID → paste into `MUX_TOKEN_ID`
7. Copy Token Secret → paste into `MUX_TOKEN_SECRET` (only shown once!)

**Create Live Stream:**
1. Go to Live Streams
2. Click "Create new live stream"
3. Name: "lecturesfrom-default-stream"
4. Playback Policy: "Public"
5. Click "Create live stream"
6. Copy Playback ID → paste into `MUX_LIVE_PLAYBACK_ID_DEFAULT`
7. Copy Stream Key (for OBS setup later)

**Configure Webhook (after deploying to Vercel or using ngrok):**
1. Go to Settings → Webhooks
2. Click "Create new webhook"
3. URL: `https://your-domain.vercel.app/api/mux/webhook` (or ngrok URL for local)
4. Events: Check `video.asset.ready`, `video.asset.errored`
5. Click "Create webhook"
6. Copy Signing Secret → paste into `MUX_WEBHOOK_SECRET`

**Local Development (ngrok):**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the https URL (e.g., https://abcd1234.ngrok.io)
# Use as webhook URL: https://abcd1234.ngrok.io/api/mux/webhook
```

---

### 3. Vercel Setup (10 minutes)

**Deploy Project:**
1. Push code to GitHub repository
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Framework Preset: Next.js (auto-detected)
6. Click "Deploy"

**Add Environment Variables:**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local` (except `NODE_ENV`)
3. Set for: Production, Preview, Development
4. Click "Save"

**Update Mux Webhook URL:**
1. After first deploy, copy your Vercel domain (e.g., `lecturesfrom.vercel.app`)
2. Go to Mux dashboard → Settings → Webhooks
3. Update webhook URL to: `https://lecturesfrom.vercel.app/api/mux/webhook`
4. Click "Save"

---

### 4. Stripe Setup (15 minutes, M3 only)

**Create Account:**
1. Go to https://dashboard.stripe.com/register
2. Create account
3. Activate test mode (toggle in top-left)

**Get API Keys:**
1. Go to Developers → API keys
2. Copy "Publishable key" → paste into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Reveal "Secret key" → paste into `STRIPE_SECRET_KEY`

**Configure Webhook:**
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Events: Select `checkout.session.completed`
5. Click "Add endpoint"
6. Click "Reveal" signing secret → paste into `STRIPE_WEBHOOK_SECRET`

**Test with Stripe CLI (optional):**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Tailwind Configuration

### tailwind.config.js

```javascript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dw: {
          base: '#121212',
          surface: '#1E1C1A',
          text: '#E8E5D8',
          textMuted: '#D0CDC2',
          muted: '#A8A595',
          accent: '#C8D400',
          alert: '#D86830',
          olive: '#5A6B56',
          navy: '#3A4350',
          rust: '#7B5B3A',
          success: '#4C7B47',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Font Setup

### Option 1: Self-Hosted (Recommended for Performance)

**Download fonts:**
1. Satoshi: https://www.fontshare.com/fonts/satoshi
2. Inter: https://rsms.me/inter/

**Add to project:**
```
/public/fonts/
  satoshi-800.woff2
  inter-400.woff2
  inter-600.woff2
```

**Add to globals.css:**
```css
@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/satoshi-800.woff2') format('woff2');
  font-weight: 800;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-400.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-600.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
```

### Option 2: Next.js Font Loader (Easier Setup)

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
})

const satoshi = localFont({
  src: '../public/fonts/satoshi-800.woff2',
  weight: '800',
  variable: '--font-satoshi',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

---

## Testing Tools

### OBS Setup (for Host Live Streaming)

**Download OBS:** https://obsproject.com/download

**Configure RTMP Output:**
1. Settings → Stream
2. Service: Custom
3. Server: `rtmp://global-live.mux.com:5222/app` (from Mux dashboard)
4. Stream Key: [your stream key from Mux]
5. Click "Apply"

**Audio Setup:**
1. Add Audio Input Capture (microphone)
2. Add Browser Source (for playing submitted tracks)
3. Test stream: Click "Start Streaming" in OBS
4. Verify playback: Open `https://stream.mux.com/[PLAYBACK_ID].m3u8` in VLC

---

## Monitoring & Debugging

### Supabase Logs
- Dashboard → Logs → Postgres Logs (query performance)
- Dashboard → Logs → Realtime Logs (subscription activity)

### Mux Logs
- Dashboard → Assets → [asset] → Details (transcoding status)
- Dashboard → Live Streams → [stream] → Health (stream quality)

### Vercel Logs
- Project → Deployments → [deployment] → Runtime Logs
- Real-time logs: `vercel logs --follow`

### Stripe Logs
- Dashboard → Developers → Logs (webhook deliveries)
- Test mode events: Dashboard → Developers → Events

---

## Quick Start Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Supabase project created, keys copied to `.env.local`
- [ ] Mux account created, API token + live stream configured
- [ ] GitHub repo created, code pushed
- [ ] Vercel project deployed, environment variables added
- [ ] ngrok installed (for local webhook testing)
- [ ] OBS installed and configured with Mux RTMP
- [ ] Tailwind config updated with DW color tokens
- [ ] Fonts downloaded and configured
- [ ] All dependencies installed (`npm install`)
- [ ] Migration run in Supabase SQL editor
- [ ] Realtime enabled on `submissions` and `now_playing` tables

**Total setup time:** ~60 minutes (first time), ~15 minutes (subsequent deployments)

---

## 📂 Related Documentation

- **[@CLAUDE.md](@CLAUDE.md)** → Project context, business rationale, architecture overview (start here)
- **[spec.md](spec.md)** → Product requirements, design system, milestones
- **[TODO.md](TODO.md)** → Detailed M1 task breakdown (50 tasks, organized by phase)
- **[migration.sql](migration.sql)** → Database schema + RLS policies (run in Supabase)
- **[.env.example](.env.example)** → Environment variables template (copy to .env.local)
- **[.claude/preferences.md](.claude/preferences.md)** → Communication guide (how to explain changes to Keegan)

---

## 🎓 Learning Resources

**For GTM/Product (Non-Technical):**
- Read [@CLAUDE.md](@CLAUDE.md) for "What we're building and why"
- Review [spec.md](spec.md) "For Non-Technical Readers" section
- Check cost tables above to understand economics

**For Engineering:**
- Service setup guides (this document)
- [TODO.md](TODO.md) for step-by-step implementation tasks
- [spec.md](spec.md) for technical requirements

**For Design:**
- [spec.md](spec.md) → "Design System — Digital Workwear" section
- Tailwind configuration in this document
- Font loading examples above

---

**Last Updated:** 2025-10-04
**Next Review:** After M1 completion (update with actual costs/learnings)
