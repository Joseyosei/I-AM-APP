# I AM — Discover Who You Are

> Declare who you are. Receive a personalised roadmap of resources curated just for you.

A faith-based (and worldview-inclusive) identity platform powered by Claude AI.

## Features

- 8 worldview options: Christian, Muslim, Jewish, Buddhist, Hindu, Spiritual, Secular, Exploring
- AI-powered roadmap with: Wisdom, Watch, Learn, Community, Daily Practice
- Secure server-side API key (never exposed to client)
- Beautiful dark gold UI — mobile first
- Deployed on Vercel in under 60 seconds

## Stack

- **Next.js 14** (App Router)
- **Claude claude-sonnet-4-6** via Anthropic SDK
- **Vercel** for deployment
- **TypeScript** + CSS Modules

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Add your API key

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your key at: https://console.anthropic.com

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Then add your environment variable:
```bash
vercel env add ANTHROPIC_API_KEY
```

### Option B — GitHub + Vercel Dashboard

1. Push to GitHub
2. Go to vercel.com → New Project → Import repo
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Deploy

## How it works

1. User types "I am..." declaration
2. User selects their worldview
3. App calls `/api/roadmap` (server-side, key is secure)
4. Claude AI builds a personalised roadmap
5. User receives: Wisdom, Watch, Learn, Community, Daily Practice

## Customisation

- Edit `lib/prompt.ts` to change the AI prompt per worldview
- Edit `lib/types.ts` to add more worldview options
- Edit `app/globals.css` for theme colours

---

Built for the AI Hackathon 2025 🚀
