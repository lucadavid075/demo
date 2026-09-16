# Evidence & Sources

**Every source read 14 September 2026.** Quotes are verbatim. Both the documentation and the legal terms were checked on the same day, so the divergences catalogued in F-01 are contemporaneous, not version drift across time.

If any page changes after publication, the Wayback Machine snapshot on this date is the reference of record. Suggested permalink format for citations: `https://web.archive.org/web/20260914/https://spout.finance/<path>`.

---

## 1. Primary sources

### Marketing site

| URL | Used for | Key quotes |
|---|---|---|
| `https://spout.finance/` | Positioning, headline yields, FAQ, guarantee claims | "Borrow Like a Billionaire"; "0% Interest Rate", "~9% Sr. Lender APY", "~32% Jr. Lender APY"; "Delta Neutral Yield — Yield comes from collecting options premiums, not from betting on stock prices going up or down"; "Collateral held through a FINRA regulated broker-dealer in segregated custody, verified by Proof of Reserve and **200% collateralized at all times**"; "**You keep your shares in all scenarios**, and positions are fully reconstituted after every cycle"; "Historically this cost averages around 0.5% annualized across the portfolio"; "the same strategy behind institutional products like JEPI and QYLD"; "Monte Carlo stress testing across thousands of simulated paths… shows positive net returns in **over 99% of simulated years**"; "**There are no lockups on either side**"; "All underlying shares are held at a FINRA-registered, **SIPC-covered** US broker-dealer"; "Cost of Borrowing — **13% Interest**" |
| `https://spout.finance/about` | Team thesis, audience framing | "Access is a right, not a privilege… We built Spout to put those exact tools onchain where anyone can access them, **regardless of where they live** or how much they start with"; "no minimums and no gatekeepers" |
| `https://spout.finance/sitemap.xml` | Enumeration of the full public surface (35 docs pages, 20 Learn posts) | — |
| `https://beta.spout.finance/` | Beta gate UX (F-12) | Page title "Buy \| Spout Finance"; "**Testnet is live.** You're among the first to try Spout Testnet. Drop in the email and passcode we sent you." |

### Documentation (`spout.finance/docs/*`)

| Page | Used for | Key quotes |
|---|---|---|
| `/docs/introduction` | Thesis, 0%/9%/32% | "What pays the lenders and what frees the borrower from interest is the same thing: a covered call strategy that runs continuously against the collateral pool." |
| `/docs/why` | The comparator (F-01, row "eligibility") | "In the US, retail margin loans charge **8–13%** annually"; table row "Access: KYC global" |
| `/docs/what` | Tranche marketing | "Senior (~9% APY, **protected**) or Junior (~32% APY, first-loss)" |
| `/docs/getting-started` | Path A / Path B collateral (F-04, F-12) | "If you already hold **xStocks, Ondo tokens**, or other compatible tokenized equities in your wallet, you can deposit them directly as collateral… those positions are immediately available"; "Visit **app.spout.finance** and connect a Solana wallet" |
| `/docs/how-borrowing-works` | Lifecycle, 50% LTV | "Borrow up to 50% of locked collateral value in stablecoins. 0% interest, no recurring fees."; "Locking enrolls your position in the options cycle. Required to borrow."; "After full repayment, collateral exits the cycle at the next close and is fully unlocked." |
| `/docs/health-factor` | HF formula (F-05) | "Health Factor = (collateral value × liquidation threshold) ÷ debt"; "Because the most you can borrow is 50% LTV and the liquidation threshold sits above that, every position opens above 1.00 from day one." |
| `/docs/liquidation` | Fee = buffer (F-01, F-05) | "The fee is not a flat number. It equals your asset's liquidation buffer, the gap between the 50% you borrowed at and the LTV where liquidation triggers, so it **runs from roughly 4% on the steadiest collateral to about 12.5% on the most volatile**." |
| `/docs/liquidation-example` | Reproduced NVDA walkthrough (TC-D3) | "100 shares of NVDA at $120… borrow the maximum: $6,000… NVDA's liquidation line sits at 58.8% LTV… roughly 21 shares at $102 (about $2,184)… NVDA's liquidation fee, 8.8%, comes out of that (about $192)… holding about 79 shares worth $8,016 against roughly $4,000 of debt" |
| `/docs/options-assignment` | F-06, F-16 | "The shares are sold at the strike. The proceeds first cover any outstanding debt… the residual proceeds are automatically used to rebuy the same asset" |
| `/docs/borrowing-lifecycle` | Earnings skip | "For single-name equities, the engine does not run cycles through earnings." |
| `/docs/how-lending-works` | **"0% Deposit / Withdraw Fees"** (F-01) | "Layer 1: Base yield… from a vetted onchain money market"; "0% Deposit / Withdraw Fees" |
| `/docs/lending-tranches` | Waterfall + prose/arithmetic contradiction (F-01, F-07) | "Senior Tranche (**85% of pool**)… 7% priority yield… 25% share of any yield above the 7% floor"; "Junior Tranche (**15% of pool**)… **Junior receives all remaining yield**"; worked example: "$30,000 in gross options premium… Senior receives 25% of this excess ($3,150) and Junior receives the remaining 75% ($9,450)… Junior earned $9,450 on $1.5m, which annualizes to roughly **32.8%**"; "Junior also requires a **45-day notice period** for withdrawals" |
| `/docs/settlement-flow` | Weekly cadence, F-06, F-07 | "Distribution runs every Monday at 9:00am ET"; "For assigned positions, the engine calculates the net: premium received **minus the cost of assignment**"; "If the premium pool in a given week is insufficient to cover the full 7%… the shortfall is noted and **can be** topped up from Insurance Fund surplus" |
| `/docs/withdrawals` | F-08, F-01 (lockups) | Three exit layers; "the reserve in T-bills and stablecoins (**targeting 15% of pool value**)"; "A dynamic haircut of 0% to 3%"; "Queued capital **stops earning yield** from that point"; Junior: "Your claim **keeps bearing losses** until it is paid, and you are paid at NAV on the payment date"; "Junior requires a minimum **45-day notice period**" |
| `/docs/loss-waterfall` | F-03, F-17 | "Insurance Fund (First-Loss)… **Seeded at launch ($50k to $100k)**… targets 2% of total pool value"; "Junior Tranche (Second Layer)"; "Senior Tranche (Last Resort)"; "A loss large enough to reach Senior has not occurred in any historical scenario we have tested." |
| `/docs/insurance-fund` | F-03, F-10 | "A fixed portion of every cycle's protocol fee flows into the fund until it reaches its target level of **2% of total pool value**. At a $10m pool, that target is $200,000."; "The fund is drawn when a cycle produces a net loss (assignment cost exceeds premium collected for that cycle)." |
| `/docs/circuit-breakers` | Risk design | "If the fund draws down past a defined threshold, new cycles for affected assets pause until the reserve is replenished." |
| `/docs/covered-call-strategy` | VRP | "the persistent historical tendency for implied volatility… to be higher than realised volatility" |
| `/docs/where-the-premium-comes-from` | Who pays (5.1) | "Pension funds… buy protective puts and collars… at any reasonable price"; "Retail buys calls as lottery tickets"; "Banks and dealers hedge their own books mechanically" |
| `/docs/strike-selection` | Per-asset calibration | "A high-volatility name like MSTR requires a wider distance between the current price and the strike"; "wins most weeks by a small amount, loses occasionally by a bounded amount" |
| `/docs/tuned-per-asset` | Cycle timing | "Cycle entry happens on Friday at market open. Cycle expiry is the following Friday at market close" |
| `/docs/asset-level-diversification` | F-11 | "A blowup in any single name affects only the portion of the pool exposed to that name. The other cycles continue uninterrupted." |
| `/docs/scenarios` | F-16, earnings skip | "Carol ends the cycle with slightly fewer shares (because the rebuy is at a higher price)"; "Borrowing at max LTV leaves little buffer." |
| `/docs/what-borrowers-should-know` | **F-02** | "The protocol **does not introduce any new failure mode** that does not already exist for someone who simply holds the underlying share." |
| `/docs/what-lenders-should-know` | F-11 | "Neither tranche is directly exposed to individual borrower default, because every borrower is over-collateralized at the protocol level and liquidation is automated." |
| `/docs/oracles` | **F-03**, F-17 | "Spout uses **Stork** as its primary oracle"; "Proof of Reserve attestations verify that the total supply of each spAsset matches the actual number of shares held at the regulated broker"; "If the primary price feed becomes unavailable or returns a stale value, the protocol pauses new borrows and liquidations"; "prices update in real time during US market hours and **at reduced frequency during off-hours**" |
| `/docs/security-and-compliance` | F-10, §5.6 | "spAssets use Solana's **Token-2022** standard with a **transfer hook** that enforces wallet-level KYC. Tokens cannot move to non-verified wallets."; "Spout Finance Inc. is registered with the U.S. Financial Crimes Enforcement Network (FinCEN) as a Money Services Business"; "Shares are held with a regulated US broker. Options execution flows through the same regulated venue." |
| `/docs/supported-collateral` | F-05, roster | 11 assets, all "Max LTV 50%", "Weekly" cycles, free-text notes; "The liquidation threshold is set so that positions are partially liquidated before the collateral value falls close to the outstanding debt" — no per-asset values |
| `/docs/fee-structure` | F-01 | "Borrowing interest 0%, no origination fee, no maintenance fee, no prepayment penalty"; "Transaction fee: 0.20% (20 bps)"; "Liquidation fee… runs from roughly 4%… to about 12.5%"; "Protocol fee: 20% of gross premium"; "Withdrawal fee: 0.20% (20 bps)" |
| `/docs/points` | F-14 | "**Points will be the basis for the protocol's future token distribution.**" |
| `/docs/referrals` | F-14 | "you earn a portion of the protocol fee collected on their cycle premium income, **for as long as they remain active**" |
| `/docs/tax` | Withholding | "subject to the standard 30% US dividend withholding at the broker level. Premium income from covered calls is not subject to this withholding." |
| `/docs/faqs` | F-10, F-16 | "spAssets sit in your wallet… The protocol can write covered calls against locked collateral. It cannot move the underlying out from under you."; "Can I lose my shares? Only through option assignment"; "**Is there a lockup?** Lender deposits have no lockup." |
| `/docs/glossary` | Definitions | "Proof of Reserve: An onchain mechanism that publishes an attestation that the spAsset supply matches the actual share holdings at the broker." |
| `/docs/risks-disclaimers` | The team's own risk disclosure | "in rare extreme scenarios, cycle losses could exceed the Insurance Fund and Junior Tranche buffers and reach Senior principal" |

### Legal terms

| URL | Used for | Key quotes |
|---|---|---|
| `https://spout.finance/terms` | **F-01, F-03, F-10, F-14, F-15** | See the clause table below |
| `https://spout.finance/testnet-terms` | Beta scope | "the Testnet is an experimental, unfinished, and **unaudited or only partially audited** environment"; "all Test Data is simulated, hypothetical, illustrative, or otherwise artificial"; "Test Assets are not real assets… and have no monetary, economic, market, or other value of any kind" |

**Terms clause map (all quoted from the document read 2026-09-14):**

| Clause | Quote | Supports |
|---|---|---|
| §1.2 | "spAssets are tokenized representations of US-listed equity securities. **They are securities.**… offered and sold outside the United States to non-U.S. persons… **not offered, sold, or otherwise made available to U.S. persons**" | F-01 |
| §1.2.1 | "spAssets are not offered to U.S. persons… Securities execution and equity custody are performed by **Alpaca Securities LLC**, a FINRA-member broker-dealer… Company treasury custody is provided by **Anchorage Digital**." | §2, F-04 |
| §1.4 | "Blockchain transactions are irreversible and publicly visible. The Company cannot reverse, cancel, or modify any on-chain transaction once it has been confirmed." | §5.6 |
| §4.1–4.2 | "The Interface is non-custodial with respect to your digital assets… **However**, the underlying US equity securities represented by spAssets are custodied off-chain by Alpaca Securities LLC… in an **intermediated custody arrangement**." | F-10 |
| §5.1, §5.4 | KYC via **Persona**; "freeze assets through the Token-2022 transfer hook mechanism" | §5.6 |
| §6.1–6.4 | Transfer hook prevents transfers to non-KYC wallets; freeze requires CEO or General Counsel authorisation, 48-hour notification, 30-day appeal; hook enforces Reg S by blocking transfers to "wallets associated with U.S. persons" | §5.6 |
| §7.1 | "The 1:1 backing is verified through a **Proof of Reserve mechanism provided by Stork**." Dividends flow through "net of applicable US withholding tax (currently 30% for non-US persons)"; redemption "in exchange for the underlying equity or its stablecoin equivalent" | §5.6, F-17 |
| §7.2 | "borrow stablecoins (**USDC, USDT, or USD1**) at a flat loan-to-value ("LTV") ratio of 50%. There is no interest charged"; "the Protocol writes far out-of-the-money covered calls against the underlying equity shares **through Alpaca Securities LLC**"; "**Your borrowing position is non-recourse.** Your maximum loss is limited to the collateral you posted." | F-03, F-04 |
| §7.3 | Senior: "approximately 7% from gross premium, plus a 25% share of residual yield. The target yield is approximately **8.67%**." Junior: "approximately **24% to 27% net**… **45-day minimum notice period**… no instant exit." | F-01, F-07 |
| §7.4 | "Queued withdrawal claims from the lending pool are **fixed-dollar IOUs that may be sold to outside buyers on a bulletin board at market-determined prices**." | F-14 |
| §8.1 | "(b) Swap / Minting Fee: **0.25%**… (c) Withdrawal Fee: **1% on borrowing and lending withdrawals**… (d) Liquidation Fee… **ranging from 7.5% to 20%**… (e) Idle Routing Fee: **Approximately 7%** on yield from idle pool capital… (f) 0% to 3% haircut" | **F-01** |
| §9.2 | Assignment: shares "sold at the strike price, which will be below the prevailing market price. You lose the difference"; with Auto-Roll "you will own **fewer shares** than before"; "**In a rapidly rising market, assignment can result in a significant reduction in the value of your position relative to simply holding the underlying equity.**" | F-02, F-16 |
| §9.3 | "ranging from a **7.5% to 20% buffer** below the 50% LTV"; "**Liquidation can occur without prior notice.** Liquidations are triggered by on-chain price movements reported by the Stork oracle." | **F-02, F-03, F-05** |
| §9.4 | "The loss waterfall is: Insurance Fund, then Junior Tranche, then **Protocol Treasury**, then Senior Tranche." | F-01 |
| §9.5 | "The Company has engaged **Halborn**… to audit the Protocol's smart contracts." | F-17 |
| §9.6 | "The Protocol relies on price feeds and Proof of Reserve attestations from **Stork**." | F-17 |
| §9.8 | "because the underlying equity securities are held by Alpaca Securities in an **intermediated arrangement on behalf of the Protocol rather than in individual customer accounts in your name**, SIPC protection may not extend to your holdings. **You should assume that SIPC protection does not apply to your spAsset positions.**" | **F-10** |
| §9.9 | "The Protocol accepts **USDC, USDT, and USD1**." | §5.6 |
| §9.12 | "The existence of the insurance fund **does not constitute insurance in any legal or regulatory sense**." | F-03 |
| §9.13 | "Junior tranche exits require a 45-day notice period… In stressed market conditions, all exit mechanisms may experience delays or unfavorable pricing." | F-08 |
| §10.1 | Asset list — same 11 as the docs | §2 |
| §11.1(c) | "Attempting to circumvent KYC requirements, sanctions screening, or geographic restrictions, **including through the use of virtual private networks (VPNs)**" is prohibited | F-01 |
| §12.2 | Restricted jurisdictions: "the United States of America and its territories… Cuba; Iran; North Korea; Syria; the Crimea, Donetsk, and Luhansk regions of Ukraine; Myanmar (Burma); Belarus; Russia; the **People's Republic of China (mainland)**" | F-01 |
| §13.2 | "All yield figures, APY estimates, performance data, and risk metrics displayed in the Interface are for informational purposes only… and **do not predict or guarantee future performance**." | F-07 |
| §15.2 | "the aggregate liability of the Company Parties… **shall not exceed one hundred U.S. dollars ($100.00)**" | F-14-adjacent |
| §19 | Delaware law; JAMS binding arbitration; class action waiver | §5.6 |

### Third-party sources

| Source | Used for |
|---|---|
| `solana.com/podcasts/pirates-parley/episodes/0-interest-loans-on-tokenized-stocks-the-two-pauls-behind-spout-finance-e3o9h6n` (3 Sep 2026) | Founder interview: covered-call funding mechanic, T-bill backstop for idle capital, "US corp, BVI for RWA issuance, Panama for the lending piece", three months in the Solana Incubator, "mainnet in ~1 month", testnet access via X/Telegram. Used for F-15 and §5.6. |
| `github.com/EazyHood/spout-finance-review` (10 Sep 2026) | Independent prior review of the same beta. Cited **only** for F-13 (devnet borrowing blocker: advertised ~$4.94 capacity, $2.40 rejection against a $0.00 limit, `CollateralType: unexpected length 213 (expected 165, or 149 pre-migration)`), attributed and flagged as a third-party observation requiring retest. |
| Broader market context for the borrow-cost comparison (offshore margin pricing, variance risk premium literature) | §5.1, and the 6.5% institutional margin assumption in the borrower cost model — that figure is an *assumption*, stated as such in the script, and the model outputs every rate scenario so the conclusion can be re-run with any rate. |

---

## 2. Model reproducibility

```bash
node bounty/scripts/spout-model.mjs     # prints all worksheets, writes bounty/data/*.csv
node bounty/scripts/check-thread.mjs    # verifies the X thread fits in 280 chars per post
```

| Worksheet | Contents |
|---|---|
| `data/01-tranche-waterfall.csv` | Reproduction of the published senior/junior split, plus the APY implied by the page's conflicting prose |
| `data/02-liquidation-geometry.csv` | Buffer → implied liquidation threshold → drawdown that triggers liquidation |
| `data/03-borrower-cost.csv` | Spout vs margin loan, benign year and post-liquidation, all-in cost as % of the loan |
| `data/03b-drawdown-paths.csv` | Repeated liquidation paths and the permanent share-count loss |
| `data/04-parameter-reconciliation.csv` | The 11 documentation-vs-Terms divergences |
| `data/05-roster.csv` | The 11 launch assets flagged for risk-on / crypto-beta clustering |
| `data/06-liquidity-retention.csv` | Subordination stack and the launch-day insurance-fund underfunding |

**Model assumptions, stated explicitly:** 0.5% annualised assignment cost (Spout's own figure); mint/redeem at 0.20% × 2 (docs) with the Terms' 0.25% × 2 shown as a sensitivity; the liquidation buffer used for the NVDA path is the published 8.8 points; partial liquidations restore exactly 50% LTV and charge a fee equal to the buffer, per the published formula; the comparison series is a plain margin loan at 6.5% (offshore-eligible) and 13% (Spout's own marketing comparator). No backtest, no return forecast, no assumptions about actual premium income.

---

## 3. What is not claimed

- No custody, Proof of Reserve, broker, audit or corporate verification. The testnet terms themselves state the environment is "unaudited or only partially audited" and that all data are simulated.
- No live-market performance claim. All testnet activity used valueless assets.
- The off-hours oracle analysis (F-03) is an inference from documented design, **not an observed exploit**.
- Nothing here is legal, investment, or tax advice. F-14 raises a question for counsel; it does not answer it.
- No representation that any portfolio mentioned is my advice. Numbers are illustrative arithmetic on published parameters.

---

## 4. Author disclosure

Beta participant. Enrolled in the points program described at `/docs/points` (which the docs state will form the basis of a future token distribution) — a fact I am disclosing because it is an incentive to be positive, and this review is not. No payment, no allocation, no equity, no compensation was received from Spout, and none was requested. No relationship with any competing issuer. All testing was performed with valueless Solana devnet assets.
