# Spout Finance — Beta Intelligence Report

**Structured submission for the Spout Finance Beta Intelligence Challenge**

| | |
|---|---|
| **Prepared by** | _[author / handle]_ |
| **Date** | 14 September 2026 |
| **Product** | Spout Finance — 0% interest borrowing against tokenized US equities (Solana) |
| **Beta surface tested** | `spout.finance` (marketing, docs, legal), `beta.spout.finance` (Solana testnet app), `x.com/SpoutFi`, Telegram |
| **Cluster** | Solana devnet (testnet terms in force; all assets valueless) |
| **Disclosure** | Beta tester; enrolled in the points program. No compensation, no equity, no payment was received or requested from Spout. All testing used valueless testnet assets. |

---

## 0. Verdict in one page

**Spout is the most interesting thing I have tested in the tokenized-equity space this year, and it is one documentation pass and one risk-feature sprint away from being safe to launch.**

The core mechanic is real, and it is not a gimmick. A covered call written against stock you actually own does produce cash premium, the variance risk premium is a genuine, well-documented phenomenon, and structuring it as a two-sided lending market with senior/junior tranching is a legitimate piece of financial engineering. Reproducing Spout's own worked example from its published parameters reconciles to the cent (see §5.2). The 0% headline survives contact with a pricing model — **for the average case**.

Three things do not survive contact:

1. **The cost is real but hidden, and it is convex, not linear.** A borrower who takes the advertised 50% LTV and then lives through a **−30% drawdown that fully recovers** ends up permanently worse off than a plain margin borrower paying 6.5% — by $1,005, or 18% of the equity that margin borrower would have — and $615 worse off than even the 13% margin rate Spout markets against. And this is a year in which the stock went back to where it started. "0% interest" is not a lie; it is a *marketing frame that hides the actual risk transfer*. Spout's own docs claim "the protocol does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share." That statement is false, and it is contradicted by Spout's own liquidation page, its worked example, and its Terms.
2. **The public documentation and the binding legal Terms disagree on essentially every commercial parameter.** Withdrawal fee: `0%` / `0.20%` / `1%` depending on which Spout page you read. Mint fee: `0.20%` or `0.25%`. Liquidation fee: `4–12.5%` or `7.5–20%`. Junior APY: `~32%` or `24–27%`. Loss waterfall: three layers or four. SIPC: implied coverage or "assume SIPC protection does not apply". Eligible users: "KYC global, access is a right" or "U.S. persons are prohibited". A user cannot compute the cost of their own position from the published surface, and in several places the two sources are not reconcilable by rounding.
3. **The tail is where the whole model lives, and the tail is under-specified.** A 0%-interest, non-recourse, open-maturity loan with no documented right for the protocol to call the loan, an oracle that deliberately updates at *reduced frequency* when the underlying market is closed, and a roster where 5 of 11 assets are the same risk-on trade, is a stack in which every layer is reasonable in isolation and dangerous in combination. The published protection against this is a Monte Carlo line — "positive net returns in over 99% of simulated years" — which, on a short-volatility book, is not a risk *metric*, it is a description of the payoff's skew.

**What is genuinely excellent and should be preserved:** the fee philosophy on the borrower side (no origination, no maintenance, no prepayment penalty); the earnings-cycle skip; per-asset strike calibration; the partial-liquidation design *intent*; the decision to put real shares in regulated custody rather than inventing a synthetic claim; and disclosing that intent in public docs at all. Most teams at this stage publish nothing. Spout publishes enough to be audited — which is exactly what this report does.

**Scorecard against the four evaluation criteria**

| Criterion | Weight | My assessment of the beta |
|---|---|---|
| Product insight | 30% | **Strong core, mispriced edges.** The mechanic works; the borrower-side incentive design (free at every LTV, expensive only on events) produces adverse selection and makes the insurance fund hot in exactly the wrong states. Fixable with three product changes (§7). |
| DeFi / tokenization analysis | 25% | **The honest middle path between DeFi and TradFi**, executed with a permissioned token. Not trustless, not decentralised, not composable in the sense the docs claim — and that is probably the *right* engineering answer for real equities. The docs should stop using trust language it cannot back. |
| UX feedback | 25% | **Onboarding funnel is the weakest part of the public surface.** Beta access requires a code from Telegram; the docs never mention testnet funding, the cluster, or where to get test SOL/USDC; the app's first screen is a passcode gate with no fallback. Testnet-specific friction is documented in §6 and the test ledger. |
| Public content quality | 20% | Delivered alongside this file: long-form teardown (`04-public-content-longform.md`) and an X thread (`05-public-content-x-thread.md`), plus a public link build of the same analysis with a working risk calculator. |

**Severity summary** — 4 P1 (product-blocking or material-disclosure), 9 P2 (usability/trust), 4 P3 (polish). Full log in `02-findings-log.md`.

---

## 1. Evidence standard used in this report

Every claim in this document carries one of four tags. I have not blurred them, because the value of a beta review is that the sponsor can act on it.

| Tag | Meaning |
|---|---|
| **`[DOC]`** | Verbatim from Spout's public documentation, marketing site, or legal terms. Quoted, dated, and linked in `06-evidence-and-sources.md`. **Fully re-verifiable by anyone, right now.** |
| **`[TERMS]`** | Verbatim from the binding legal agreement (`/terms`, `/testnet-terms`). |
| **`[MODEL]`** | My own arithmetic, reproducible with `node bounty/scripts/spout-model.mjs`. Inputs are published figures; the derivation is shown. |
| **`[TEST]`** | Executed by me on Solana devnet with valueless test assets. Transaction signatures and timestamps in the test ledger (`03-test-plan-and-ledger.md`). |
| **`[EXT]`** | Third-party source, attributed (including one independent pre-existing review of the same beta). |
| **`[HYP]`** | Hypothesis derived from published design, not yet executed. Each has a numbered test case attached. |

**Why this matters for this submission:** the challenge rules disqualify superficial or promotional content. The strongest anti-promotional signal I can give is to separate what I *saw* from what I *inferred*, and to hand over the derivation so the sponsor can falsify it. Roughly 80% of the findings below are `[DOC]`/`[TERMS]`/`[MODEL]` and are therefore testable by Spout's own team in the time it takes to open their own docs.

---

## 2. What the protocol actually does

Spout is a two-sided market with a third party footing the bill.

```
                        ┌────────────────────────────────────────┐
   option buyers ──────▶│  covered calls written weekly against  │
   (retail calls,       │  borrower collateral, per asset,       │
    pension hedges,     │  executed at Alpaca Securities LLC     │
    dealer hedging)     └───────────────┬────────────────────────┘
                                        │ premium
                        ┌───────────────▼────────────────────────┐
                        │  protocol fee 20% → ops + insurance    │
                        │  fund (target 2% of pool)              │
                        └───────────────┬────────────────────────┘
                                        │ 80% of premium
              ┌─────────────────────────┴─────────────────────────┐
              ▼                                                   ▼
   ┌──────────────────────┐                          ┌──────────────────────┐
   │ SENIOR (85% of pool) │ 7% priority + 25% excess │ JUNIOR (15% of pool) │
   │ target ~9% APY       │◀─────────────────────────│ target ~32% APY      │
   │ instant exit, 0–3%   │   25/75 excess split     │ first-loss after the │
   │ haircut, or FIFO     │                          │ fund; 45-day notice  │
   └──────────┬───────────┘                          └──────────────────────┘
              │ stablecoins
   ┌──────────▼───────────────────────────────────────────────────────────┐
   │ BORROWER: locks tokenized equities, borrows up to 50% LTV at 0%,     │
   │ repayment any time, position is non-recourse, collateral is enrolled │
   │ in the options cycle and capped at the strike each week              │
   └──────────────────────────────────────────────────────────────────────┘
```

Sources: `[DOC]` `/docs/lending-tranches/`, `/docs/settlement-flow/`, `/docs/loss-waterfall/`; `[TERMS]` §7.1–7.4, §8.1.

The economically important thing in that diagram is **who is not paying**: the borrower does not fund the lender. The option buyer funds the lender. The borrower pays in *forgone convexity* — every week, the upside above the strike belongs to somebody else, and in a deep drawdown the position is mechanically sold into the weakness and does not get those shares back. That distinction is the whole review.

**Published parameters** (`[DOC]` `/docs/supported-collateral/`, `[TERMS]` §10): 11 assets — AAPL, NVDA, GOOG, SMCI, IBIT, MSTR, BSOL, PFE, GS, XOM, GLD. Flat 50% max LTV across all of them. Weekly cycles (some biweekly), entering Friday at market open. No cycles run through single-name earnings `[DOC]` `/docs/borrowing-lifecycle/`. Custody and options execution at **Alpaca Securities LLC**, a FINRA member broker-dealer `[TERMS]` §1.2.1. Price oracle **Stork**; Proof of Reserve also **Stork** `[DOC]` `/docs/oracles/`. KYC via Persona; wallet auth via Privy. Legal entity: **Spout Finance Inc., Delaware**, registered with FinCEN as an MSB.

---

## 3. Findings

Full repro steps, quotes, and severity rationale in `02-findings-log.md`. Summary here.

| ID | Sev | Finding | Tag | Evidence |
|---|---|---|---|---|
| F-01 | **P1** | Public docs and binding Terms disagree on every commercial parameter — fee, yield, waterfall, lockup, protection, eligibility. A user cannot compute their own cost from the published surface. | `[DOC]``[TERMS]` | §4 below |
| F-02 | **P1** | "No new failure mode vs simply holding the share" is false. At max LTV, forced partial liquidation converts a paper drawdown into a permanent share-count loss with no cure window. | `[DOC]``[MODEL]` | §5.3 |
| F-03 | **P1** | Off-hours oracle updates at "reduced frequency" while the loan is **non-recourse** and liquidations can only execute when the cash market is open. Detectable breach — unwindowable execution — capped borrower loss. The gap risk lands on the loss waterfall. | `[DOC]``[TERMS]``[HYP]` | §5.4, TC-07 |
| F-04 | **P1** | Path B ("deposit existing xStocks / Ondo tokens as collateral") is structurally unexplained: how does third-party-issued collateral get enrolled in an Alpaca-executed options programme, and what happens to the "1:1 real shares at a regulated broker" guarantee for that collateral? | `[DOC]` | §5.6 |
| F-05 | P2 | No published per-asset liquidation threshold. "50% LTV" masks a **3.9×** range in distance-to-forced-selling (7.4% to 28.6% drawdown). | `[DOC]``[MODEL]` | §5.3 |
| F-06 | P2 | Assignment cost is described as borne by the borrower (shares sold at strike, fewer shares after Auto-Roll) *and* by the pool (cycle loss drawn from the Insurance Fund). Same dollar, two payers. | `[DOC]` | §5.5 |
| F-07 | P2 | Senior tranche is marketed as "~9% APY, protected". It is a conditional priority claim, not a coupon: if weekly premium < 7%/52, the shortfall is "noted" and only optionally topped up. Loss subordination is not return certainty. | `[DOC]` | §5.5 |
| F-08 | P2 | Junior capital in the withdrawal queue stops earning but keeps bearing losses, which incentivises the *best-informed* juniors to queue first and concentrates risk on those who stay. | `[DOC]` | §5.5 |
| F-09 | P2 | "Delta Neutral Yield" is factually wrong. A covered call is long-delta (long stock, short call). The *pool* is structurally **short volatility**, at roughly 1× the collateral notional. | `[DOC]` | §5.2 |
| F-10 | P2 | "200% collateralized" / "SIPC-covered" / "you keep your shares in all scenarios" each overstate the guarantee. The Terms walk all three back. | `[DOC]``[TERMS]` | §4, §5.6 |
| F-11 | P2 | Reference assets include five of eleven names in the same risk-on factor (NVDA, SMCI, IBIT, MSTR, BSOL). "A blowup in any single name affects only that name's exposure" holds for idiosyncratic events and fails for the systematic tail that matters. | `[DOC]``[MODEL]` | §5.4 |
| F-12 | P2 | Onboarding: access is a passcode from Telegram; the app shows no funding instructions; the docs point to `app.spout.finance` (mainnet) and never name the testnet cluster, faucet, or how to get test USDC / devnet SOL. | `[DOC]``[TEST]` | §6 |
| F-13 | P2 | Known devnet blocker in the same beta: borrowing capacity advertised, then rejected against a $0.00 limit with a collateral decode error. Independently reported 10 Sep 2026; retest prescribed. | `[EXT]` | TC-03 |
| F-14–17 | P3 | Points → "future token distribution" and a perpetual referral revenue share on a product whose collateral is a security; the entity map is public only in a podcast; "$100 aggregate liability" cap; no stated backtest window for the 99% claim; no published audit report link (Halborn named only in Terms §9.5); "reduced frequency" oracle undefined; Auto-Roll "fully reconstituted" wording understates permanent share loss. | `[DOC]``[TERMS]` | §5.5–5.7 |

---

## 4. The centrepiece finding: the published surface contradicts itself

This is verifiable today, without an account, and it is the finding I would fix first — before any feature work. A borrower comparing the docs to the Terms is comparing two different products.

| Parameter | Documentation says | Binding Terms say | Where |
|---|---|---|---|
| spAsset mint / redeem fee | **0.20%** | **0.25%** | `/docs/fee-structure/` vs §8.1(b) |
| Lending withdrawal fee | **0%** — "0% Deposit / Withdraw Fees" | **0.20%** | `/docs/how-lending-works/` vs `/docs/fee-structure/` vs §8.1(c) |
| Lending withdrawal fee | **0.20%** | **1%** | same three sources |
| Borrow-side withdrawal fee | "no origination fee, no maintenance fee" | **1% "on borrowing and lending withdrawals"** | `/docs/fee-structure/` vs §8.1(c) |
| Liquidation fee range | **4% – 12.5%** | **7.5% – 20%** | `/docs/liquidation/` vs §8.1(d), §9.3 |
| Senior target APY | **~9%** | **~8.67%** | homepage vs §7.3 |
| Junior target APY | **~32%** | **24% – 27% net** | homepage vs §7.3 |
| Junior residual yield | "Junior receives **all** remaining yield" | worked example on the *same page* splits it **25% Senior / 75% Junior** | `/docs/lending-tranches/` |
| Idle-routing fee | not disclosed anywhere | **~7% of idle money-market yield** | §8.1(e) |
| Loss waterfall | Insurance Fund → Junior → Senior | Insurance Fund → Junior → **Protocol Treasury** → Senior | `/docs/loss-waterfall/` vs §9.4 |
| Lender exit | "**There are no lockups on either side**" | Junior: **45-day notice**, loss-bearing while queued | homepage FAQ vs §7.3 + `/docs/withdrawals/` |
| SIPC | "held at a FINRA-registered, **SIPC-covered** US broker-dealer" | "**assume that SIPC protection does not apply** to your spAsset positions" | homepage FAQ vs §9.8 |
| Who can use it | "KYC **global**", "Access is a right, not a privilege… regardless of where they live" | U.S. persons **prohibited** (Reg S); 11 restricted jurisdictions incl. mainland China, Russia, Belarus, Myanmar; VPN circumvention is a material breach | `/docs/why/`, `/about`, `/docs/getting-started/` vs §1.2, §12.2, §11.1(c) |

**Why the last row is the sharpest.** Spout's entire marketing narrative is a *US-tax-and-margin* argument: "never trigger a taxable sale", a "13% Interest — what a margin loan costs you" comparator, quotes from Buffett, Munger, Lynch, Chamath and Saylor, and a `/docs/why/` page whose benchmark is "US retail margin 8–13%". The people who can legally use the product are, by construction, not those people. The correct comparator for the eligible cohort is not US retail margin; it is an offshore broker's margin rate (benchmark + ~0.5–1.5%), i.e. roughly 5–7%. **`[MODEL]`** That change alone moves the competitive claim materially: it is the difference between "we save you 13 points" and "we save you ~5, if nothing goes wrong, and we cost you more than that if it does."

**Recommendation (F-01, highest priority in this report):** publish one canonical parameter source, generated from the deployed configuration, and have the docs render from it. Any number that appears in marketing, docs, app, and Terms should be the same number or the divergence should be intentional and labelled ("app shows the live value; Terms show the floor").

---

## 5. DeFi / tokenization analysis

### 5.1 The 0% is real. Here is exactly what it costs, and who pays.

Three parties touch the premium. Naming them properly is most of the analysis:

1. **The option buyer pays the premium.** `[DOC]` `/docs/where-the-premium-comes-from/` argues — correctly — that pension hedging demand, retail lottery-ticket call buying, and dealer delta-hedging push implied volatility above realised. This is the variance risk premium, and it is real and well-documented.
2. **The lender collects it** — 80% of gross, after the 20% protocol fee, inside a tranched structure.
3. **The borrower pays in convexity.** Not in cash, and not in interest. Every cycle, the upside above the strike is sold, and if the shares are assigned they are repurchased at a higher price, so the position *shrinks*. Spout documents this honestly in exactly one place — the MSTR scenario in `/docs/scenarios/`, which concedes "Carol ends the cycle with slightly fewer shares" — and obscures it everywhere else with "positions are fully reconstituted after every cycle" and "you keep your shares in all scenarios".

Spout's own estimate is that the realised assignment cost averages **~0.5% annualised** across the portfolio. If that number holds, the borrower's average carry is nearly free and the marketing claim is defensible. My objection is not to the average. It is to the variance, and to what happens when the borrower's position is force-sold at the bottom.

**`[MODEL]` Reproducing Spout's own numbers first (credit where due):** the NVDA worked example in `/docs/liquidation-example/` reconciles exactly — 100 shares at $120, $6,000 borrowed, an 8.8-point liquidation buffer, a fall to $102 (−15%) triggers at HF 1.000, 21.42 shares sold, $2,184.47 of proceeds, $192.23 of fee, debt down to $4,007.77, 78.6 shares left, LTV restored to 50%, HF back to 1.18. Spout's arithmetic is correct. Their example is not hiding anything. That is worth saying, because it means the problem is what the example *omits*, not what it states.

**`[MODEL]` What the example omits — the same position after the stock recovers.** Take the max-LTV borrower ($12,000 collateral, $6,000 debt) and run a year in which the stock ends exactly where it started:

| Path | Equity at year-end (stock back at $120) | All-in cost as % of the $6,000 loan |
|---|---|---|
| **Spout, benign year** (0.5% assignment cost + 0.20% × 2 mint/redeem) | **$5,892** | **1.80%** |
| Spout, benign year, using Terms' fee schedule | $5,880 | 2.00% |
| Spout, **one** liquidation at −15% then full recovery | **$5,314** | **11.43%** |
| Margin loan @ 6.5% (offshore-eligible benchmark) | $5,610 | 6.50% |
| Margin loan @ 13% (Spout's own marketing benchmark) | $5,220 | 13.00% |

Read the third line twice. **One partial liquidation in a year, after which the stock fully recovers, costs the borrower $578 of permanent equity — 9.6% of the loan — because 21 of their 100 shares are gone and only the residue (net of the 8.8% liquidation fee) bought debt down.** At a 6.5% financing rate, that single event flips the comparison to the margin loan. Break-even margin rate moves from 1.80% (benign year) to 11.43% (one event).

Extend the drawdown and it compounds, because every liquidation resets HF to a hair above 1.00 (the max-LTV edge) rather than to a comfortable level:

| Drawdown path (stock then recovers fully to $120) | Liquidation events | Shares left of 100 | Fees paid | Equity at recovery | vs margin @ 6.5% | vs margin @ 13% |
|---|---|---|---|---|---|---|
| −15% | 1 | 78.6 | $192 | $5,314 | −$296 | +$94 |
| −30% | 2 | 61.4 | $323 | **$4,605** | **−$1,005** | **−$615** |
| −45% | 3 | 47.9 | $410 | **$3,890** | −$1,720 | −$1,330 |

A −30% drawdown in a 50%-LTV position is not a tail event; it is a normal equity-market year for a single name (NVDA, MSTR and SMCI have all done it more than once in the last three years). A buy-and-hold holder of that stock has the same paper loss and the same 100 shares. The Spout borrower has 61, permanently, **and the 0% rate did not save them a cent of it.**

**This is the finding I would lead the launch with, and the fix is small:** a *cure window*. Every prime broker that runs this business issues a margin call and gives the borrower time to post collateral or reduce the position before selling. **`[TERMS]` §9.3** currently states the opposite: "Liquidation can occur without prior notice." A notification + grace period (even two hours, or "next cycle open") plus a *voluntary* top-up path converts the protocol's forced-sale tail into a choice, and the borrower's downside from "permanent share loss" into "a loan that got more expensive". It also removes the single biggest source of reputational blow-up risk at launch, which is a borrower posting the liquidation receipt on X.

### 5.2 "Delta neutral" is not a thing that is true

`[DOC]` The homepage puts a section titled **"Delta Neutral Yield"** above the text "Yield comes from collecting options premiums, not from betting on stock prices going up or down."

A covered call is **long delta**. Long the stock, short an out-of-the-money call; net delta is roughly the call's delta-adjusted exposure, typically 0.5–0.8 of a share per share. The premium *seller* is structurally **short volatility** — the P&L is small-positive in most weeks and large-negative when realised volatility spikes. The correct description is "short volatility, positive carry, negative skew", and it is materially different from delta-neutral in exactly the scenario the strategy's own risk section is about.

This is not pedantry: "delta neutral" tells a lender that the position is market-neutral, when the whole risk story is that the position has a fat left tail. Every lender I have shown this to has said the same thing — "then why does it say neutral?" Correct label: **"Premium yield with a short-volatility profile"**, and the risk section should publish the *distribution*, not just the survival rate.

### 5.3 What "50% LTV" actually means, per asset

The published relation is elegant: `[DOC]` `/docs/liquidation/` and `[TERMS]` §8.1(d) — the liquidation fee **equals** the asset's liquidation buffer, i.e. the gap between the 50% LTV you borrowed at and the LTV at which liquidation triggers. Fee scales with the risk the asset carries. Good design.

Two problems.

**First, the numbers are published twice with different ranges** (F-01): 4–12.5% in the docs, 7.5–20% in the Terms. Those ranges imply different liquidation thresholds, and therefore different distances to forced selling.

**`[MODEL]` Second, the borrower-facing consequence is never stated.** From `drawdown to HF = 1.00 = 1 − 0.50 / (0.50 + buffer)`:

| Liquidation buffer | Implied liquidation threshold | **Drawdown that triggers the first partial liquidation** |
|---|---|---|
| 4.0 pts (docs: steadiest asset) | 54.0% LTV | **7.4%** |
| 8.8 pts (docs: NVDA example) | 58.8% LTV | **15.0%** |
| 12.5 pts (docs: most volatile) | 62.5% LTV | 20.0% |
| 7.5 pts (Terms: minimum) | 57.5% LTV | 13.0% |
| 20 pts (Terms: maximum) | 70.0% LTV | 28.6% |

The same "borrow up to 50%" headline hides a **3.9× spread** in the distance to forced selling — and the *steadiest* asset has the *tightest* room (7.4%), because its buffer is set narrow precisely because it rarely moves. That is defensible as parameter design and indefensible as UX: a borrower who puts up a low-volatility name like PFE and reads "borrow half the value, 0% interest" will not guess that a 7.4% pullback — smaller than an ordinary monthly range — begins selling their position.

No per-asset liquidation threshold is published anywhere on the public surface. `[DOC]` `/docs/supported-collateral/` shows "Max LTV 50%" and a free-text note ("Higher vol, wider strike buffer") for each of the 11 assets and no liquidation parameter. **A borrower cannot compute their own liquidation price from Spout's published parameters.** That is a hard blocker for informed consent, and it is the single cheapest thing on this list to fix.

**Recommendation (F-05):** ship a "liquidation distance" panel on the borrow screen — for every asset: current LT, HF, the price at which HF = 1.00, and the fee that applies if it happens. This is Spout's own worked example, generalised and made live. Sample implementation, driven by the same published parameters, is in the accompanying public build.

### 5.4 The tail: non-recourse + a stale oracle + an unexecutable liquidation

This is the most consequential technical risk I found, and it is assembled entirely from Spout's own documents.

- `[DOC]` `/docs/oracles/`: "For health factor monitoring and liquidation checks, prices update in real time during US market hours and **at reduced frequency during off-hours**, since the underlying equities only trade during market sessions."
- `[TERMS]` §7.2: "Your borrowing position is **non-recourse**. Your maximum loss is limited to the collateral you posted."
- `[TERMS]` §9.3: liquidations are triggered by Stork prices; "Oracle failures, network congestion, or extreme volatility may result in liquidations at prices that differ from actual market values."
- `[DOC]` `/docs/security-and-compliance/`: the protocol never holds the underlying; the shares sit at Alpaca. Liquidation therefore means **selling real shares in the cash-equity market**, which is only open 6.5 hours a day, 252 days a year.

Chain those together and you get a genuine, structural asymmetry:

> Between Friday's close and Monday's open, an equity can gap 5–15% on macro news, an M&A announcement, an FDA decision, or a sector shock. During that window the protocol's price feed is deliberately *less* frequent, and it **cannot execute a liquidation anyway** because the venue is closed. The borrower's downside is capped by the non-recourse structure. The lender's is not.

The mitigations Spout describes (deviation bounds, confirmation checks, pausing borrows on a stale feed) defend against **manipulation and flash crashes** — they do not and cannot defend against a **real gap**, because a real gap is a real repricing. The loss lands where all losses land: Insurance Fund → Junior → (Treasury) → Senior.

Two aggravating factors make this worse than it looks on paper:

**The borrower has no incentive to help.** The loan is non-recourse, 0% interest, and has no maturity. A rational borrower whose collateral gaps through the liquidation threshold has no economic reason to repay — their maximum loss was capped the moment the loan was drawn. `[DOC]` Nowhere in `/docs/` is there a described protocol right to *call* a loan (only to partially liquidate an unhealthy one). So the pool's retention is now dependent on voluntary repayment decisions made by a counterparty who is already out of the money in equity terms.

**`[MODEL]` The protection stack is thin relative to the gap it is insuring.** Insurance Fund target: 2% of pool value, seeded at launch with $50k–$100k `[DOC]` `/docs/loss-waterfall/` — i.e. it starts at roughly **0.5–1% of a $10m pool** and must be filled from a slice of a 20% fee on weekly premium. Junior is 15%. On a $10m pool, total subordination below Senior is ~17%. Now consider that the pool's *exposure* is levered: $10m of lending supports ~$20m of collateral at 50% LTV. A 10% gap in the collateral book is a $2m event, larger than the entire Insurance Fund target and almost as large as Junior. That is not a reason to panic — liquidation proceeds repay debt before losses are realised — but it does mean the buffer sizing claim ("Monte Carlo stress testing across thousands of simulated paths… positive net returns in over 99% of simulated years") is doing an enormous amount of load-bearing work, and the docs never state the simulation window, the return-generating process, the jump/gap assumptions, or the correlation structure.

**A "99% of years positive" statistic on a short-volatility book is not a safety metric.** It is the *signature* of the payoff: many small wins, rare large losses. The informative statistics are the expected shortfall of the annual return, the worst simulated week, and the loss given a 20%+ one-week market move. Publish those, and this section becomes a non-issue; publish survival rates and sophisticated lenders will read it as exactly what it is.

**Recommendations (F-03, F-11):** (1) haircut collateral value for gap risk when the market is closed — either prohibit *increasing* debt off-hours or apply a larger discount to the last print, so an overnight gap cannot be borrowed against; (2) report the loss distribution as tail statistics, not survival rates; (3) publish the correlation matrix and the joint-tail loss, because 5 of 11 assets (NVDA, SMCI, IBIT, MSTR, BSOL) are the same risk-on factor and assignment events cluster in melt-ups while liquidations cluster in sell-offs — the diversification argument fails precisely in the states it is meant to cover.

### 5.5 Tranche design: good skeleton, three soft joints

The structure is a legitimate, standard cash-flow waterfall: 85/15 tranching, 7% senior priority, 25/75 excess split, first-loss insurance fund, loss absorption bottom-up. **`[MODEL]`** I reproduced the published worked example ($10m pool, $30k/week gross premium) and it reconciles to the cent: senior $14,582/week → 8.92% APY; junior $9,418/week → 32.65% APY; blended 12.48%.

Three soft joints:

**"Protected" ≠ fixed income (F-07).** `[DOC]` `/docs/settlement-flow/` states that if premium in a week is insufficient to cover the full 7% priority — which it says is "rare but possible during low-vol stretches" — "the shortfall is noted and can be topped up from Insurance Fund surplus in subsequent weeks." So the Senior's 7% is a *priority claim on a variable premium pool*, not a coupon, and its backstop is optional and drawn from the same fund that insures losses. Meanwhile the homepage presents "~9% Sr. Lender APY" beside copy implying stability. Junior is the same problem inverted: on the page's own arithmetic, the prose says Junior receives *all* residual yield (43.5% APY) while the worked example gives it 75% (32.65%). A lender cannot tell which structure they are buying. Note also the Terms' own junior target is 24–27% net — a full 5–8 points below the headline on the website.

**The junior exit queue is pro-cyclical (F-08).** `[DOC]` `/docs/withdrawals/`: on giving 45 days' notice, junior capital "moves into escrow", "stops earning yield from that point", and "keeps bearing losses until it is paid". Senior claims, by contrast, fix in dollars at request and stop bearing losses. So in a deteriorating market the rationally-informed junior gives notice *first* (to stop earning-but-keep-bearing losses as early as possible, and to fix queue priority), while the juniors who stay absorb a larger share of any subsequent loss. The 45-day notice is well-intentioned — the docs explain it exists to stop early leavers dumping losses on stayers — but the implemented version does the opposite: it *rewards* queuing early and *penalises* staying. Cleaner: keep loss-exposure but keep paying yield until the payment date (so queueing has no timing edge), or price the exit (a NAV haircut that rises with the queue).

**The claim-resale market is a securities question, not a feature (F-14).** `[TERMS]` §7.4: queued withdrawal claims are "fixed-dollar IOUs that may be sold to outside buyers on a bulletin board at market-determined prices." A tradeable, yield-bearing claim on a pool of securities-backed loans, sold to the public, marketed with APY targets, is at minimum adjacent to securities distribution and possibly a market. The Terms' securities analysis (Reg S) is written entirely around **spAssets** and is silent on the lending tranches, the claims, the points program (`[DOC]` `/docs/points/`: "Points will be the basis for the protocol's future token distribution"), and the perpetual referral revenue share (`[DOC]` `/docs/referrals/`: "you earn a portion of the protocol fee collected on their cycle premium income, for as long as they remain active"). I am not a lawyer and this is not legal advice — but every one of those four things creates an expectation of profit derived from the efforts of others on an asset whose collateral is a regulated security, and none of them is covered by the Reg S framing. Get a memo, and be careful with referral economics attached to a security-backed product.

### 5.6 The tokenization wrapper: what is real, what is branding

Spout's architecture is a deliberate, defensible choice, and the docs should describe it with the honesty it deserves.

**Real:**
- spAssets are Token-2022 tokens with a **transfer hook enforcing wallet-level KYC** `[DOC]` `/docs/security-and-compliance/`. Real equity exposure, real dividends, real corporate actions, held at a real FINRA broker-dealer, with an on-chain supply attestation.
- The legal wrapper is coherent: **Regulation S** — offshore offering, no U.S. persons §1.2, restricted jurisdictions enumerated §12.2, transfer hook enforcing Reg S transfer restrictions §6.4. This is how you legally put a US-listed equity into a non-US retail wallet, and it is why Path A requires KYC.
- Non-recourse, over-collateralised, partial liquidation, weekly cycle: the risk primitives are the right ones.

**Branding, and it should be labelled as such:**
- **"Non-custodial"** §4.1 is immediately qualified by §4.2: the on-chain layer is non-custodial, the *equities* are "held by Alpaca Securities LLC in an intermediated custody arrangement." §9.8 goes further and says that because the shares are held in an intermediated arrangement "rather than in individual customer accounts in your name", **SIPC protection may not extend to your holdings and "you should assume that SIPC protection does not apply."** The homepage FAQ says the shares are held at a "FINRA-registered, **SIPC-covered** US broker-dealer" and leaves the implication standing. This is the one documentation issue in this report that I would call a consumer-protection problem rather than an inconsistency (F-10).
- **"Decentralized"** is bounded by an admin key that can freeze transfers: §6.2–6.3 allow the Company to restrict or freeze spAsset transfers, with CEO or General Counsel authorisation and a 48-hour notice plus a 30-day appeal. That is a sound, defensible compliance design — sanctions and Reg S enforcement require it — but it means the protocol is a **permissioned ledger with DeFi UX**, not a trust-minimised system, and "you do not have to take our word for the existence of the underlying; the math is on the chain" is not accurate: a Stork attestation is a *company vouching for a broker's records*. That is a normal, auditable trust model. It is not mathematics.
- **"Composability"** is limited by the same transfer hook: a token that cannot move to a non-KYC wallet cannot be general DeFi collateral. That is an acceptable trade — but the docs promise "onchain composability without sacrificing the legal status of the underlying" and should say which integrations the hook actually permits.
- **Three jurisdictions.** The founders describe a US corporation, a BVI RWA-issuance entity and a Panama lending entity `[EXT]`. The Terms name only **Spout Finance Inc. (Delaware)** as counterparty, with Alpaca as broker. Which entity holds the lending pool, and therefore which law governs a lender's claim, is not disclosed anywhere on the public surface. For a product whose selling point is legally real equity exposure, the entity map should be a page in the docs, not a podcast anecdote (F-15).

**F-04 — the one I would ask the team about first.** `[DOC]` `/docs/getting-started/` Path B tells users they can "deposit existing tokenized equities — **xStocks, Ondo tokens**, or other compatible tokenized equities" and that "those positions are immediately available," with no KYC. But the options programme is executed **through Alpaca Securities LLC** against shares the protocol controls `[TERMS]` §7.2. If the collateral is a token issued by a different provider with a different underlying-custody structure, then either (a) the locked collateral cannot be enrolled in the options cycle — in which case it earns no premium, and the "0% because the collateral does the work" logic does not apply to it, and it should not be borrowable at the same terms; or (b) there is an undisclosed arrangement (redeem-and-rebuy, or a securities-lending agreement) that puts those shares under Spout's control — in which case the "1:1 real shares at a regulated broker, verified by Proof of Reserve" guarantee now spans *third-party issuers*, and PoR per issuer becomes a materially different claim. Either answer is fine. Silence is not, because it is the one place where the protocol's central safety claim becomes heterogeneous.

### 5.7 Where this sits in the tokenized-equity landscape

The honest framing, for a reader who follows the sector: Spout is not competing with Dinari or xStocks on *issuance* and not with Aave on *lending*. It is competing with **the margin desk** — and it wins on distribution (a non-US wallet with a phone can access it) while losing on the two things a margin desk sells: a cure window, and a rate that is legible in advance.

The genuinely novel contribution is that Spout has found a way to make 0% *structural* rather than subsidised: instead of paying lenders with emissions or a token, it routes a real, third-party cash flow (equity option premium) to them. That is a better primitive than 90% of "real yield" claims in the market, and it will survive a token-market winter. The catch is that this cash flow is compensation for **short volatility risk**, and the structure currently pushes the correlated part of that risk onto the borrower (via forced sales) and the untested part onto the junior tranche and insurance fund. Whoever ends up holding the tail is the real question, and today the answer is documented as: *the borrower first, then the fund, then the juniors, then the seniors — in that order, with no notice at any step.*

---

## 6. UX friction

**Public funnel (verifiable without an account):**

1. **`[TEST]` Access is gated by a passcode that arrives by email, and the only public route to a code is a DM to a Telegram handle.** The beta app's first screen is: "Testnet is live. You're among the first to try Spout Testnet. Drop in the email and passcode we sent you." There is no "request access" flow, no status page, no indication of queue position, no explanation of what access entails. For a challenge explicitly recruiting creators and researchers, the funnel should be: landing page → one-click request → immediate devnet sandbox with test funds already in the wallet. **Recommend:** a self-serve devnet sandbox with faucet integration (Circle test USDC + devnet SOL), no code required.
2. **`[DOC]` The docs never explain the testnet.** `/docs/getting-started/` says "Visit app.spout.finance" (mainnet), describes KYC and buying real shares, and mentions no cluster, no faucet, no test stablecoin. A tester who arrives from the bounty brief and reads the docs first is being onboarded to the wrong product. Add a dedicated `Testnet` doc page: cluster name, RPC, faucet links, what is simulated, what is real, and the known-limitations list.
3. **`[TEST]` Two different passcodes in the same flow.** The emailed code and the app's "Passcode" field are not the same concept if a user is also asked for an email OTP; the UI does not distinguish them. One field, one label, one error message.
4. **`[DOC]` Fee opacity at the point of decision.** The borrow flow's headline is "0% interest". The user's actual expected cost is a function of the assignment cost, the mint/redeem fee, the liquidation buffer fee, and their chosen LTV — none of which is in one place. The right panel on the borrow screen is not "interest: 0%" but **"expected cost of this loan: ~X% of borrowed value per year, plus a Y% fee if your collateral falls Z%."**

**In-app observations:** recorded in the test ledger (`03-test-plan-and-ledger.md`), including the retest of the publicly reported devnet borrowing blocker `[EXT]`, the off-hours borrow behaviour `[HYP]`, and the liquidation-distance display check.

---

## 7. Product recommendations, ranked

Ordered by expected impact on safety and trust per unit of engineering effort.

| # | Recommendation | Why | Effort |
|---|---|---|---|
| **R1** | **Liquidation cure window + voluntary top-up.** Notify on HF < 1.15; allow the borrower to deposit collateral or repay debt until the next cycle open; only then liquidate. | Converts the borrower's permanent share-count loss into a choice. Removes the launch's biggest reputational risk. Every prime broker already does this. | M |
| **R2** | **Over-liquidate to a target below max LTV** (e.g. restore to 40% not 50%), and make the target configurable per asset. | Each liquidation currently resets HF to ~1.00–1.18, so a −30% path triggers *two* events. A single deeper cut does less damage than two shallow ones. | S |
| **R3** | **LTV-based borrower pricing** (a small cycle fee that falls with LTV, or a points/yield bonus for borrowing under 35%). | With a free loan at every LTV, every rational borrower takes 50% — maximising the probability of liquidation events and the demands on the insurance fund. Price the risk ex-ante instead of only on the event. | M |
| **R4** | **Publish per-asset risk parameters and a live "liquidation distance" panel** (LT, HF, the price that triggers, the fee that applies, and a −10/−20/−30% scenario). | Currently uncomputable from public docs. Turns the single most misunderstood number in the product into a surfaced one. | S |
| **R5** | **Gap-risk haircut for off-hours borrowing** (or disable borrow-increases while the cash market is closed). | Closes F-03: a non-recourse borrower should not be able to size debt against a stale close that cannot be liquidated. | S |
| **R6** | **Publish the risk distribution, not the survival rate**: worst simulated week, annual expected shortfall, correlation matrix, loss-given-20%-market-move, and the backtest window and assumptions. | "99% of years positive" reads as a red flag to the sophisticated lenders Spout is targeting. Tail statistics read as competence. | S |
| **R7** | **One canonical parameter source** rendered into docs + app + marketing, with an explicit changelog. | Removes the entire F-01 class permanently. | S–M |
| **R8** | **Fix the trust language.** Remove "delta neutral", "no new failure mode", "you keep your shares in all scenarios", "the math is on the chain", and the SIPC implication. Replace with the accurate version. | Every one of these is quoted back at Spout by a sceptical lender on launch day. The accurate version is still an excellent product. | S |
| **R9** | **Borrower-side "expected cost" disclosure at the point of borrow**, in dollars and as an APR-equivalent, including the benign-year estimate and the post-liquidation estimate. | Makes the 0% claim honest *and* more persuasive, because on the average case the number really is better than the alternative. | S |
| **R10** | **Junior queue economics**: keep yield accruing (or apply a NAV-based exit price) so queuing early carries no advantage; publish queue depth and expected fill funding source. | Removes the pro-cyclical incentive in F-08 and makes the FIFO estimate honest. | M |
| **R11** | **Self-serve devnet sandbox** with faucet funds and a documented testnet page. | Fixes the onboarding funnel for exactly the audience this challenge is recruiting. | S |
| **R12** | **Publish the Halborn audit** (named in Terms §9.5 but not linked), the entity map (US/BVI/Panama), the corporate-actions policy, and the redemption mechanics for spAssets. | Four documents that a serious lender will ask for in the first diligence call. | S–M |

---

## 8. What I could not verify, and what that means

Stated plainly so the sponsor can discount accordingly:

- **No legal, custody, broker or audit verification.** Nothing in this report confirms that shares exist at Alpaca, that the Proof of Reserve attestation is accurate, or that the Halborn audit covers the deployed programme. Those are diligence items, not beta-test items, and the testnet terms correctly disclaim them.
- **No live-market performance claim.** All testnet activity uses valueless assets. `[TERMS]` (testnet) §3 is explicit that everything on testnet is simulated. Yields, HF values, and liquidation behaviour observed on devnet are **fixtures**, not evidence about the strategy's real-world P&L.
- **The quantitative model in §5 is an arithmetic model, not a backtest.** It uses Spout's own published parameters. Its purpose is to price the *structure*, not to forecast returns. It deliberately assumes the strategy's benign case (0.5% annualised assignment cost) and shows what the tail does anyway.
- **In-app coverage is limited to what is documented in the test ledger**, including any beta blockers encountered. I have flagged the specific tests that a sponsor-side fixture would unlock (TC-08 assignment simulation, TC-09 liquidation simulation) — they are not available to a public tester and should be.
- **The oracle behaviour in §5.4 is `[HYP]`**, not an observed exploit. It follows from documented design. TC-07 is the test.

---

## 9. Conclusion

Spout has built the first version of this product I would actually use, and I say that as someone whose default answer to "tokenized equities" is no. The mechanic is sound, the numbers reconcile, and the team's decision to publish a real economic story — including the parts that are uncomfortable — is why this review can be this specific.

The gap between where it is and where it needs to be for a public launch is not a rewrite. It is: **one parameter source**, **one risk panel**, **one cure window**, and **one page of honest language about who bears what**. Fix those four things and the 0% headline stops being a clever frame and starts being a defensible product claim — because in the average case, the numbers really are better than the alternative, and the borrower who understands the tail is the borrower who stays.

---

*Full finding log: `02-findings-log.md` · Test plan and ledger: `03-test-plan-and-ledger.md` · Reproducible model: `bounty/scripts/spout-model.mjs` + `bounty/data/` · Sources: `06-evidence-and-sources.md` · Public content: `04-public-content-longform.md`, `05-public-content-x-thread.md`*
