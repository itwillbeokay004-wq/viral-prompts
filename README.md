# Viral Prompts

A tiny Next.js app that generates viral video prompt ideas for TikTok and YouTube Shorts.

- Pick a **niche** (12 options) and **platform** (TikTok / YouTube Shorts)
- Get 3–15 scroll-stopping video ideas in one click
- **Hybrid generation**: uses OpenAI when `OPENAI_API_KEY` is set, falls back to a curated static library otherwise
- One-click copy for individual prompts or the whole list

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- OpenAI Chat Completions API (optional)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: add OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | If set, `/api/generate` calls OpenAI. If unset or the call fails, the static library is served. |
| `OPENAI_MODEL` | No | OpenAI model name. Defaults to `gpt-4o-mini`. |

## Project layout

- `src/app/page.tsx` — UI (niche + platform selectors, result list)
- `src/app/api/generate/route.ts` — POST endpoint, AI-with-fallback
- `src/lib/prompts.ts` — niches, platforms, and the curated static library

## Deploy

Deploys cleanly to Vercel. Set `OPENAI_API_KEY` in the Vercel project if you want AI mode.
