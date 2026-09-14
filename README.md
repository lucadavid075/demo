# SCOAN Next.js Redesign

A real, runnable Next.js 14 (App Router) + TypeScript + Tailwind project.
This is what should go on GitHub — not a single `.jsx` file.

## Also in this repo: the Spout Finance beta teardown

An independent, evidence-tagged critical review of Spout Finance's tokenized-equity
borrowing beta (Solana devnet), produced for the Spout Beta Intelligence Challenge.

| Where | What |
|---|---|
| `bounty/` | The submission bundle: report, findings log, test plan and ledger, public long-form piece, X thread, full source appendix. Start at `bounty/README.md`. |
| `node bounty/scripts/spout-model.mjs` | The model. Reproduces Spout's own published worked example to the cent, then extends it. Writes CSVs to `bounty/data/`. |
| `/spout` (dev server) | The public link build: the same teardown as a page, with an interactive liquidation-distance calculator. |
| `/spout/thread` | The 19-post thread, with verified character counts. |

Nothing in `bounty/` is a placeholder: every quantitative claim is either quoted from
Spout's public docs and legal terms with a source line, or produced by the script above.
The one section that needs a live beta session is marked with a comment block in
`bounty/04-public-content-longform.md`, and the article is written to be accurate without it.

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
│   ├── layout.tsx        — root layout, loads Fraunces + Libre Franklin fonts
│   ├── page.tsx           — homepage entry point
│   ├── globals.css        — Tailwind + custom effects (grain, gold beam, hovers)
│   └── spout/             — the Spout teardown page + /spout/thread
├── components/
│   ├── Home.tsx            — the actual homepage design
│   └── spout/               — LiquidationLab (client component)
├── lib/teardown.ts         — typed data behind the /spout pages
├── bounty/                  — the submission bundle (report, findings, tests, content)
├── tailwind.config.ts      — color tokens (parchment, ink, gold)
└── package.json
```
