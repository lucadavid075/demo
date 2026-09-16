# Spout Finance Beta Intelligence Challenge — submission bundle

Everything for the submission, in the order a reviewer should read it.

| File | What it is |
|---|---|
| **[`07-beta-session-field-guide.md`](07-beta-session-field-guide.md)** | **Start here if you are about to log in.** The chronological walkthrough: what to click, what to capture, what each result means for a finding. Includes market-hours timing, decision trees, and a 25-minute fast path. |
| [`01-submission-report.md`](01-submission-report.md) | The report. Structured findings, product recommendations, DeFi/tokenization analysis, UX feedback, limitations. |
| [`02-findings-log.md`](02-findings-log.md) | All 17 findings: severity, evidence, reproduction, impact, recommendation. |
| [`03-test-plan-and-ledger.md`](03-test-plan-and-ledger.md) | The 14-case test matrix (the reference version of the field guide), evidence-ledger schema, and bug-report template. |
| [`04-public-content-longform.md`](04-public-content-longform.md) | **The public content piece** — long-form teardown (~2,200 words), publishable as written. |
| [`05-public-content-x-thread.md`](05-public-content-x-thread.md) | 19-post X thread, all posts verified under 280 characters. |
| [`06-evidence-and-sources.md`](06-evidence-and-sources.md) | Every source, quote and clause map, dated. Full reproducibility notes. |
| [`templates/session-notes.md`](templates/session-notes.md) | Fill-in capture sheet. Duplicate per session, fill it **as you go**. |
| [`templates/session-ledger.json`](templates/session-ledger.json) | Machine-readable ledger for every signed transaction and UI observation. |
| [`scripts/check-ledger.mjs`](scripts/check-ledger.mjs) | Validates a filled ledger: signatures, health-factor arithmetic, cost-basis reconciliation, the F-13 divergence pattern, and which of the six critical questions are still open. |
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

## Reproduce everything

```bash
node bounty/scripts/spout-model.mjs                                        # all numbers in the report
node bounty/scripts/check-thread.mjs                                       # thread character counts
node bounty/scripts/check-ledger.mjs bounty/templates/session-ledger.json  # validate a beta session
```

No network access required. Every input is a figure Spout published; the derivations are in the comments.

## Running the beta session

Read `07-beta-session-field-guide.md` before you open the app, and keep
`templates/session-notes.md` beside you while you work. The guide is ordered so that the four
highest-value tests — borrow-screen disclosure, capacity-vs-limit, off-hours borrowing, and the Earn
state — come first and fit in 25 minutes if that is all the time you have.

Fill `templates/session-ledger.json` as you go, then validate it:

```bash
node bounty/scripts/check-ledger.mjs bounty/templates/session-ledger.json
```

The validator recomputes your health factor from the numbers you entered, tests the app's displayed
cost basis against the actual fill, detects the exact capacity-vs-limit divergence pattern behind
F-13, and lists which of the six submission-critical questions are still unanswered. A blocked flow
recorded as `blocked_before_signing: true` with the error string is worth more than a description of
the block.

---

## Before publishing: the 6 data points still needed

**The step-by-step walkthrough for collecting these is [`07-beta-session-field-guide.md`](07-beta-session-field-guide.md).** Read that first if you are about to log in; this is the summary.

The report's analysis is complete and verifiable as written — roughly 80% of the findings are documentation, legal-terms and arithmetic, all verified directly. The remainder needs the authenticated beta session:

1. **Access** — was a passcode required, and did the app disclose the cluster before you connected? (F-12)
2. **One fill** — USDC spent → tokens received, timestamp, signature, and did the displayed cost basis reconcile? (F-16)
3. **Borrow** — advertised capacity vs what the app actually accepts, and whether it reached signing. *(The retest of the publicly reported devnet blocker, F-13.)*
4. **Disclosure** — did the app surface a liquidation price and the applicable fee before you signed? (F-05)
5. **Off-hours** — could debt be increased while the cash market was closed? (F-03)
6. **Earn** — the exact state and wording of the lending flow, including any APY shown. (F-01, F-07)

Drop the results into the appendix of `04-public-content-longform.md` (marked with a comment block) and they are publishable. The article is deliberately written so that it is **complete and accurate without them** — no placeholders in the body, no claims that depend on a session that has not been run.

---

## Evidence standard

Every claim carries a tag: `[DOC]` documentation · `[TERMS]` binding legal terms · `[MODEL]` reproducible arithmetic · `[TEST]` executed on devnet · `[EXT]` attributed third party · `[HYP]` hypothesis with a numbered test case attached. The distinction is maintained everywhere on purpose: a beta review is only useful to the sponsor if they can tell what was *seen* from what was *inferred*.
