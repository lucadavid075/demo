# Spout Finance Beta Intelligence Challenge — submission bundle

Everything for the submission, in the order a reviewer should read it.

| File | What it is |
|---|---|
| **[`01-submission-report.md`](01-submission-report.md)** | **The report.** Structured findings, product recommendations, DeFi/tokenization analysis, UX feedback, limitations. |
| [`02-findings-log.md`](02-findings-log.md) | All 17 findings: severity, evidence, reproduction, impact, recommendation. |
| [`03-test-plan-and-ledger.md`](03-test-plan-and-ledger.md) | 14-case test matrix, evidence-ledger schema, bug-report template, and the 6 data points still to collect. |
| [`04-public-content-longform.md`](04-public-content-longform.md) | **The public content piece** — long-form teardown (~2,200 words), publishable as written. |
| [`05-public-content-x-thread.md`](05-public-content-x-thread.md) | 19-post X thread, all posts verified under 280 characters. |
| [`06-evidence-and-sources.md`](06-evidence-and-sources.md) | Every source, quote and clause map, dated. Full reproducibility notes. |
| [`scripts/spout-model.mjs`](scripts/spout-model.mjs) | The quantitative model. Reproduces Spout's own published worked example, then extends it. |
| [`data/`](data/) | Model output worksheets (CSV). Generated, not hand-typed. |
| [`scripts/check-thread.mjs`](scripts/check-thread.mjs) | Verifies the thread fits X's limits. |

**Public link build:** `app/spout` in this repo renders the same teardown as a shareable page, with a working liquidation-distance calculator (the feature recommended in R4). Run `npm run dev` and open `/spout`.

---

## How this maps to the evaluation criteria

| Criterion | Weight | Where it lives |
|---|---|---|
| Product insight | 30% | §5.1–5.5 (borrower cost decomposition, the convexity finding, incentive design, tranche critique) and §7 (12 ranked recommendations) |
| DeFi / tokenization analysis | 25% | §5.6–5.7 (permissioned token design, intermediated custody, Reg S wrapper, entity structure, where Spout sits in the tokenized-equity market) |
| UX feedback | 25% | §6 plus every finding tagged UX, and the liquidation-distance / expected-cost panel recommendations (R4, R9) |
| Public content quality | 20% | `04-public-content-longform.md`, `05-public-content-x-thread.md`, and the live page at `/spout` |

---

## Reproduce everything in two commands

```bash
node bounty/scripts/spout-model.mjs    # all numbers in the report, written to bounty/data/
node bounty/scripts/check-thread.mjs   # thread character counts
```

No network access required. Every input is a figure Spout published; the derivations are in the comments.

---

## Before publishing: the 6 data points still needed

The report's analysis is complete and verifiable as written — roughly 80% of the findings are documentation, legal-terms and arithmetic, all of which I verified directly. Three things need the authenticated beta session, and `03-test-plan-and-ledger.md` §4 lists them with exact steps:

1. **TC-05** — one equity fill: USDC spent → tokens received, timestamp, signature.
2. **TC-03** — the borrow attempt: advertised capacity vs the amount the app will actually accept, and whether it reached the signing flow. *(This is the retest of the publicly reported devnet blocker, F-13.)*
3. **TC-06 / TC-07 / TC-11** — whether the app surfaces a liquidation price and fee before signing, whether debt can be increased off-hours, and the state of the Earn/lending flow.

Paste those six answers into the appendix of `04-public-content-longform.md` (marked with a comment block) and they are publishable. The article is deliberately written so that it is **complete and accurate without them** — no placeholders in the body, no claims that depend on a session I could not run.

---

## Evidence standard

Every claim carries a tag: `[DOC]` documentation · `[TERMS]` binding legal terms · `[MODEL]` reproducible arithmetic · `[TEST]` executed on devnet · `[EXT]` attributed third party · `[HYP]` hypothesis with a numbered test case attached. The distinction is maintained everywhere on purpose: a beta review is only useful to the sponsor if they can tell what was *seen* from what was *inferred*.
