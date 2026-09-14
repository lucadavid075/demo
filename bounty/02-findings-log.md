# Spout Finance Beta — Findings Log

**All 17 findings, one page each.** Severity is assigned on the standard triage basis:

| Severity | Meaning |
|---|---|
| **P1** | Blocks the core flow, or materially misleads a user about cost, protection, or eligibility. Fix before public launch. |
| **P2** | Harms trust or comprehension; a careful user is misled or cannot complete an informed decision. |
| **P3** | Polish, clarity, or disclosure hygiene. |

**Tags:** `[DOC]` public documentation · `[TERMS]` binding legal terms · `[MODEL]` my arithmetic (reproducible) · `[TEST]` executed on devnet by me · `[EXT]` third-party source · `[HYP]` hypothesis with a numbered test case.

Every source is quoted with its URL and the date I read it (2026-09-14) in `06-evidence-and-sources.md`.

---

## F-01 — P1 — Documentation and binding Terms disagree on every commercial parameter `[DOC]``[TERMS]`

**Impact.** A user cannot compute the cost of their own position from the published surface, and three of the divergences are not reconcilable by rounding. The most damaging: lending withdrawal fee appears as **0%**, **0.20%**, and **1%**; liquidation fee range as **4–12.5%** and **7.5–20%**; junior target APY as **~32%** and **24–27% net**; the loss waterfall has **three** or **four** layers depending on source.

**Evidence (all live 2026-09-14).**
- `/docs/how-lending-works/` stat block: "0% Deposit / Withdraw Fees".
- `/docs/fee-structure/`: "Withdrawal fee: 0.20% (20 bps). Applies to stablecoins leaving the pool"; "Liquidation fee … runs from roughly 4% on the steadiest collateral to about 12.5% on the most volatile"; mint/redeem "0.20% (20 bps)".
- Terms §8.1: "(b) Swap / Minting Fee: 0.25% … (c) Withdrawal Fee: 1% on borrowing and lending withdrawals. (d) Liquidation Fee … ranging from 7.5% to 20% … (e) Idle Routing Fee: Approximately 7% on yield from idle pool capital."
- `/docs/lending-tranches/`: "Junior Tranche (15% of pool) … Junior receives all remaining yield" — the same page's worked example then allocates 25% of the excess to Senior and 75% to Junior.
- `/docs/loss-waterfall/`: Insurance Fund → Junior → Senior. Terms §9.4: "Insurance Fund, then Junior Tranche, then Protocol Treasury, then Senior Tranche."
- Homepage FAQ: "There are no lockups on either side." Terms §7.3: junior subject to a 45-day minimum notice period (also `/docs/withdrawals/`).

**Reproduction.** Open the three pages side by side; no account required. Model worksheet `data/04-parameter-reconciliation.csv`.

**Recommendation.** Generate docs, app and marketing from the deployed configuration. Publish one canonical parameter table with an explicit changelog. Where a difference is intentional (e.g. app shows live values, Terms show floors), label it.

---

## F-02 — P1 — "No new failure mode" is false; forced liquidation permanently impairs the position, with no cure window `[DOC]``[MODEL]`

**Impact.** The docs' central borrower-safety claim is contradicted by the docs' own liquidation mechanism. At max LTV, a −30% drawdown that **fully recovers** leaves the borrower holding 61 of 100 shares, $1,005 worse off than a margin borrower at 6.5% and $615 worse off than one at 13% — a permanent loss, with zero interest saved.

**Evidence.** `/docs/what-borrowers-should-know/`: "The protocol does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share." Compare `/docs/liquidation/` (partial liquidation sells collateral), `/docs/liquidation-example/` (21 of 100 shares sold at the low), and Terms §9.3: "Liquidation can occur without prior notice."

**Reproduction.** `node bounty/scripts/spout-model.mjs` → section 4b; same methodology as the LiquidationLab component on the public page. Monotone drawdown in 60 steps with an 8.8-point buffer, then recovery to the entry price.

| Drawdown (then full recovery to $120) | Events | Shares left | Fees | Equity at recovery | All-in cost of the loan |
|---|---|---|---|---|---|
| −15% | 1 | 78.6 | $192 | $5,314 | 11.4% |
| −30% | 2 | 61.4 | $323 | $4,605 | 23.3% |
| −45% | 3 | 47.9 | $410 | $3,890 | 35.2% |

**Recommendation (R1).** Cure window: notify at HF < 1.15, allow deposit/repay until the next cycle open, then liquidate. Rewrite the borrower-safety page to describe the cap on upside and the forced-sale path in the same breath as the 0% rate.

---

## F-03 — P1 — Non-recourse debt + reduced-frequency off-hours oracle + cash-market-only execution `[DOC]``[TERMS]``[HYP]`

**Impact.** Between Friday's close and Monday's open the protocol (a) prices collateral less frequently by design, (b) cannot execute a liquidation because the equity venue is closed, and (c) has capped the borrower's loss contractually. A genuine gap in that window is therefore absorbed by the loss waterfall, and the borrower has no economic incentive to help, because the loan is non-recourse and has no maturity.

**Evidence.**
- `/docs/oracles/`: "For health factor monitoring and liquidation checks, prices update in real time during US market hours and at reduced frequency during off-hours, since the underlying equities only trade during market sessions."
- Terms §7.2: "Your borrowing position is non-recourse. Your maximum loss is limited to the collateral you posted."
- Terms §9.3: liquidations "triggered by on-chain price movements reported by the Stork oracle… Oracle failures, network congestion, or extreme volatility may result in liquidations at prices that differ from actual market values."
- `/docs/security-and-compliance/`: "Options execution flows through the same regulated venue", i.e. Alpaca — a US cash-equity venue with market hours.
- `/docs/loss-waterfall/`: order of loss absorption.

**Not claimed.** I am not asserting an exploitable attack. The documented deviation bounds and confirmation checks address *manipulation*, and are appropriate. This finding is about *real* repricing while monitoring is degraded and execution is impossible.

**Test.** TC-07 (borrow-increase attempted off-hours), TC-06 (HF display vs last close).

**Recommendation (R5, R6).** Haircut collateral for gap risk when the cash market is closed — do not permit debt increases off-hours, or apply a larger discount to the last print. Publish tail statistics (annual expected shortfall, worst simulated week, loss given a 20% market move) instead of a survival rate.

---

## F-04 — P1 — Path B (third-party tokenized equities as collateral) is structurally unexplained `[DOC]`

**Impact.** Either third-party collateral cannot participate in the options programme — in which case the entire "0% because your collateral does the work" logic does not apply to it and it should not be borrowable on the same terms — or there is an undisclosed arrangement placing those shares under Spout's control, in which case the "1:1 real shares at a regulated broker verified by Proof of Reserve" guarantee now spans multiple issuers with different custody, legal and solvency profiles.

**Evidence.** `/docs/getting-started/` Path B: "If you already hold **xStocks, Ondo tokens**, or other compatible tokenized equities in your wallet, you can deposit them directly as collateral… those positions are immediately available. No KYC required through Spout for this path". `/docs/how-borrowing-works/`: "Locking enrolls your position in the options cycle. Required to borrow." Terms §7.2: "the Protocol writes far out-of-the-money covered calls against the underlying equity shares **through Alpaca Securities LLC**." Terms §7.1/§9.8 describe 1:1 backing and intermediated custody for **spAssets** only.

**Recommendation.** Publish a collateral matrix: which token, which issuer, which custody, whether it can be enrolled in an options cycle, and what happens to PoR. If third-party collateral is borrow-only, say so and price it accordingly.

---

## F-05 — P2 — No published per-asset liquidation threshold; "50% LTV" hides a 3.9× range `[DOC]``[MODEL]`

**Impact.** A borrower cannot compute the price at which they will be force-sold. An ordinary 7.4% pullback can begin liquidating a low-volatility position, while the marketing implies a uniform, generous cushion.

**Evidence.** `/docs/supported-collateral/` publishes "Max LTV 50%" and free-text notes for all 11 assets, plus the sentence "The liquidation threshold is set so that positions are partially liquidated before the collateral value falls close to the outstanding debt" — with no per-asset value. The only published example is NVDA at 58.8% LTV (`/docs/liquidation-example/`). `/docs/liquidation/` gives a fee range 4–12.5%; Terms §9.3 gives 7.5–20%.

**Reproduction.** `data/02-liquidation-geometry.csv`. Drawdown to HF = 1.00 is `1 − 0.50 / (0.50 + buffer)`: 4 pts → 7.4%; 8.8 pts → 15.0%; 12.5 pts → 20.0%; 20 pts → 28.6%.

**Recommendation (R4).** Publish the parameter table and a live liquidation-distance panel: LT, current HF, trigger price, applicable fee, and a −10/−20/−30% scenario.

---

## F-06 — P2 — The assignment cost appears to be borne twice `[DOC]`

**Impact.** If the pool's weekly P&L is reduced by assignment cost *and* the borrower's share count is reduced by the same move, the borrower is paying for a loss the lender also books; if it is borne only once, one of the two descriptions is wrong. Either way, neither user can reconcile their statement.

**Evidence.** `/docs/options-assignment/`: "The shares are sold at the strike. The proceeds first cover any outstanding debt… the residual proceeds are automatically used to rebuy the same asset" (borrower side, unambiguous). `/docs/settlement-flow/`: "For assigned positions, the engine calculates the net: premium received **minus the cost of assignment** (the difference between the strike and the closing price, applied pro-rata across enrolled positions)" (pool side). `/docs/insurance-fund/`: the fund is drawn when "assignment cost exceeds premium collected for that cycle".

**Recommendation.** Publish one worked assignment example with a full ledger showing exactly which entity books which line, then align the three pages to it.

---

## F-07 — P2 — "Protected" senior tranche is a conditional priority claim, not a coupon `[DOC]``[TERMS]`

**Impact.** A conservative lender buys "~9% APY, protected" and receives something that can pay less than the headline in low-volatility weeks, with a discretionary top-up from the same fund that insures losses.

**Evidence.** `/docs/settlement-flow/`: "If the premium pool in a given week is insufficient to cover the full 7% (which is rare but possible during low-vol stretches), the shortfall is noted and can be topped up from Insurance Fund surplus in subsequent weeks." `/docs/what/` and the homepage: "Senior (~9% APY, protected)". Terms §13.2: "All yield figures, APY estimates… do not predict or guarantee future performance." Terms §7.3 target: "approximately 8.67%".

**Recommendation.** Rename to "priority yield, subject to premium sufficiency", publish the historical distribution of weekly premium coverage of the 7% floor, and remove the word "protected" from any sentence that does not also contain "principal".

---

## F-08 — P2 — The junior withdrawal queue rewards exiting early and penalises staying `[DOC]`

**Impact.** In a deteriorating market, the informed junior queues first: queued capital "stops earning yield from that point" while it "keeps bearing losses until it is paid". The lenders who remain absorb a larger share of any subsequent loss. The 45-day notice exists to prevent exactly this outcome and, as implemented, produces it.

**Evidence.** `/docs/withdrawals/` (just quoted). Senior claims, by contrast, "fixed in dollars at the NAV when you requested" and "no longer bear losses while it waits".

**Recommendation (R10).** Keep yield accruing until the payment date, or price the exit at the NAV of the payment date with a queue-depth-based adjustment, so that the timing of the queue request carries no advantage. Publish queue depth and the funding source for FIFO fills.

---

## F-09 — P2 — "Delta Neutral Yield" is factually incorrect `[DOC]`

**Impact.** Lenders are told the strategy is market-neutral when it is structurally short volatility — the exact exposure whose tail is the subject of the protocol's risk section. Sophisticated allocators will read this as either an error or a euphemism.

**Evidence.** Homepage section heading "Delta Neutral Yield", body: "Yield comes from collecting options premiums, not from betting on stock prices going up or down. This creates a more stable and sustainable source of returns." A covered call is long the underlying (short an out-of-the-money call against it) and short implied volatility.

**Recommendation.** "Premium yield with a short-volatility profile: positive carry in most weeks, negatively skewed." Publish the return distribution (see F-03/R6).

---

## F-10 — P2 — Guarantee language that the Terms walk back `[DOC]``[TERMS]`

Three overstatements, each with a directly contradicting clause in the binding agreement.

| Marketing says | Terms say |
|---|---|
| "held at a FINRA-registered, **SIPC-covered** US broker-dealer in segregated custody" (homepage FAQ) | §9.8: shares are held "in an intermediated arrangement on behalf of the Protocol rather than in individual customer accounts in your name, [so] SIPC protection may not extend to your holdings. You should assume that SIPC protection does not apply to your spAsset positions." |
| "The protocol operates at **200% collateralized**" (homepage FAQ) | That is 1 ÷ 50% LTV — the borrowers' collateral ratio, not the lenders' protection. Actual subordination below Senior is the Insurance Fund target (2%) plus Junior (15%) ≈ 17% of pool. |
| "You keep your shares in all scenarios" (homepage FAQ) | §9.2: assignment leaves you "own[ing] fewer shares than before"; §9.3: "your entire collateral position may be liquidated"; §6.2: transfers can be frozen. |

**Recommendation (R8).** Delete the SIPC implication entirely; replace "200% collateralized" with the actual subordination stack; replace "you keep your shares in all scenarios" with "your downside is limited to your collateral; your upside is capped at each week's strike, and a drawdown can reduce your share count."

---

## F-11 — P2 — Roster concentration: 5 of 11 assets are the same factor `[DOC]``[MODEL]`

**Impact.** The diversification argument fails in precisely the states it is invoked for. A risk-on shock hits NVDA, SMCI, IBIT, MSTR and BSOL together; a melt-up assigns calls across the book in the same week. Both tails are correlated.

**Evidence.** `/docs/asset-level-diversification/`: "A blowup in any single name affects only the portion of the pool exposed to that name. The other cycles continue uninterrupted." `/docs/supported-collateral/` roster. `/docs/what-lenders-should-know/`: "Neither tranche is directly exposed to individual borrower default, because every borrower is over-collateralized at the protocol level and liquidation is automated."

**Reproduction.** `data/05-roster.csv`.

**Recommendation.** Publish the correlation matrix and a joint-tail loss metric; add non-equity-beta collateral (T-bill-like, low-beta defensives) to the roster before scaling; treat a 20%+ single-week index move as the design scenario for buffer sizing.

---

## F-12 — P2 — Testnet onboarding is undocumented `[DOC]``[TEST]`

**Impact.** A recruited beta tester cannot find out how to fund a testnet wallet, which cluster to use, or what "test USDC" means. `/docs/getting-started/` sends them to the mainnet app URL.

**Evidence.** `beta.spout.finance` first screen: "Testnet is live. You're among the first to try Spout Testnet. Drop in the email and passcode we sent you." `/docs/getting-started/`: "Visit app.spout.finance and connect a Solana wallet… Complete a one-time KYC verification inside the app." No testnet page exists in `/sitemap.xml`.

**Recommendation (R11).** Self-serve sandbox with faucet funds pre-loaded, plus a `Testnet` docs page: cluster, RPC, faucets, what is simulated, known limitations, and how to report a bug.

---

## F-13 — P2 — Beta regression to retest: borrowing blocked after a fill `[EXT]`

**Impact.** If still present, the product's headline flow (borrow against collateral) is untestable end-to-end by a public tester.

**Evidence (attributed, not my observation).** Independent public review, 10 September 2026: after a 10 test-USDC NVDA order filled (0.045302013 tokens received), the Borrow screen advertised ~$4.94 of capacity but rejected a $2.40 request against a reported $0.00 limit, alongside a decode error — "CollateralType: unexpected length 213 (expected 165, or 149 pre-migration)". Source: `github.com/EazyHood/spout-finance-review`.

**Test.** TC-03 in the test ledger.

**Recommendation.** If reproducible, publish a known-issues banner on the borrow screen rather than allowing an advertised capacity that validation ignores. If fixed, publish the fix in the beta changelog — a tester who cannot get past step 3 cannot review steps 4–7.

---

## F-14 — P3 — Incentive layer sits outside the securities framing `[DOC]``[TERMS]`

Points "will be the basis for the protocol's future token distribution" (`/docs/points/`); referrals pay "a portion of the protocol fee collected on their cycle premium income, **for as long as they remain active**" (`/docs/referrals/`); queued withdrawal claims are tradeable "fixed-dollar IOUs… sold to outside buyers" (Terms §7.4). The Terms' securities analysis (Reg S) covers **spAssets only** and is silent on all three. Each creates an expectation of profit from the efforts of others, in a product whose collateral is a regulated security. Not a legal opinion — a flag for counsel before scaling any of these.

---

## F-15 — P3 — Entity map is public only in a podcast `[EXT]`

The founders describe a US corporation, a BVI entity for RWA issuance and a Panama entity for lending. The Terms name only **Spout Finance Inc. (Delaware)** as counterparty. Which entity holds the lending pool, and therefore whose courts and insolvency regime govern a lender's claim, should be a docs page, not an interview answer.

---

## F-16 — P3 — "Fully reconstituted" understates permanent share loss `[DOC]`

`/docs/scenarios/` correctly concedes that on assignment "Carol ends the cycle with slightly fewer shares (because the rebuy is at a higher price)". The homepage FAQ instead says "positions are fully reconstituted after every cycle". Auto-Roll restores *a position*, not the *share count*. Use the scenario page's language everywhere.

---

## F-17 — P3 — Unlinked audit, undefined oracle cadence, unstated backtest window `[DOC]``[TERMS]`

- Halborn is named in Terms §9.5 but no audit report is linked from the docs.
- "At reduced frequency during off-hours" (`/docs/oracles/`) is not quantified. Publish the actual cadence and the staleness threshold.
- The "over 99% of simulated years" claim (homepage FAQ) and "multi-year backtests" (`/docs/loss-waterfall/`) never state the window, the price process, the jump or correlation assumptions, or whether the seed collateral ($50k–$100k) was modelled at its launch size or at its 2% target.

An unquantified "reduced frequency" is also the input a lender needs to size F-03.
