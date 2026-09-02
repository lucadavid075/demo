# SCOAN Next.js Redesign

A real, runnable Next.js 14 (App Router) + TypeScript + Tailwind project.
This is what should go on GitHub — not a single `.jsx` file.

## 1. Run it locally

```bash
cd scoan-next
npm install
npm run dev
```

Open http://localhost:3000 — you should see the full site.

## 2. Deploy it so you have a live link to show

The fastest path — free, and built by the makers of Next.js:

1. Push to GitHub (above).
2. Go to https://vercel.com, sign in with GitHub.
3. "Add New Project" → select your repo → Deploy.
4. No config needed — Vercel auto-detects Next.js.

You'll get a live URL (e.g. `scoan-redesign.vercel.app`) in about a
minute — genuinely useful to have in your back pocket for the meeting.

## Project structure

```
demo/
├── app/
│   ├── layout.tsx      — root layout, loads Fraunces + Libre Franklin fonts
│   ├── page.tsx         — homepage entry point
│   └── globals.css      — Tailwind + custom effects (grain, gold beam, hovers)
├── components/
│   └── Home.tsx          — the actual homepage design
├── tailwind.config.ts    — color tokens (parchment, ink, gold)
└── package.json
```
