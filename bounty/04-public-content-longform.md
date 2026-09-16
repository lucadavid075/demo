# Spout Finance: the 0% loan is real. The risk transfer is what nobody tells you.

*A critical teardown of the first protocol to let you borrow against tokenized US stocks at 0% interest — what the maths actually says, what the docs and the legal terms disagree about, and the four things I would fix before launch.*

---

I have spent a week inside Spout Finance's beta, and I want to start with the part that surprised me: **the 0% is not a gimmick, and it is not a subsidy.**

Most "0% borrowing" in crypto is a marketing rate with a token printed behind it. Spout does something structurally different. You deposit tokenized US equities as collateral, the protocol writes covered calls against those shares through a regulated US broker, and the option premium — paid by an unrelated third party, the option buyer — funds the lenders. Your collateral generates the yield. You are not being charged interest because someone else is paying it.

That is a genuinely better primitive than 90% of what calls itself "real yield" in this market, and it will survive a token winter. The variance risk premium that a covered call harvests is one of the most well-documented anomalies in finance.

So this is not a piece about how 0% is a lie. It is a piece about the fact that **you are not being charged in cash — you are being charged in convexity — and in a bad year the second cost is more than ten times the first.**

---

## What I did, and how to check my work

Everything quantitative below comes from one of three places, and I have tagged each:

- **their published numbers** — the docs, the marketing site, and the binding Terms of Service, all read on 14 September 2026;
- **my own arithmetic**, reproduced in a script anyone can run (`node bounty/scripts/spout-model.mjs`) — the outputs are plain CSVs;
- **my testnet session** on Solana devnet, which is a sandbox of valueless tokens and is labelled as such throughout.

I have been deliberately explicit about which is which, because the most interesting finding in this review does not need a wallet at all — it is visible on Spout's own website.

---

## First, credit: the mechanism is sound and their arithmetic checks out

Spout publishes a worked liquidation example. 100 shares of NVDA at $120, borrow $6,000 — the maximum 50% loan-to-value. NVDA's liquidation buffer is 8.8 percentage points. The stock falls 15% to $102.

I rebuilt it from their published parameters. It reconciles exactly: 21.42 shares sold, $2,184.47 of proceeds, a $192.23 liquidation fee, debt down to $4,007.77, 78.6 shares left, LTV restored to 50%, health factor back to 1.18.

That matters, because it means Spout is not hiding anything in its example. The problem is the thing the example leaves out. And I rebuilt their tranche waterfall too — a $10m pool with $8.5m senior and $1.5m junior, $30,000 a week of gross option premium — and it also reconciles to the cent: senior gets $14,582 a week (8.92% APY), junior gets $9,418 (32.65%).

Their maths is honest. Their framing is where the trouble starts.

---

## The cost they don't price: forced sales are permanent

Here is the same position, run through a full year, where the stock ends exactly where it started. The only difference between rows is what happened in between.

| What happened during the year | Your equity at year-end | All-in cost, as % of the $6,000 you borrowed |
|---|---|---|
| **Nothing. Benign year.** | **$5,892** | **1.8%** |
| A margin loan at 6.5% (what an offshore-eligible borrower actually pays) | $5,610 | 6.5% |
| A margin loan at 13% (the rate Spout compares itself to) | $5,220 | 13.0% |
| **Spout, with ONE liquidation at −15%, then full recovery** | **$5,314** | **11.4%** |

Read that last row again. The stock fell 15%, Spout sold 21 of your 100 shares at the bottom, the stock then recovered fully — and you finish the year **$578 poorer in permanent equity**, which is 9.6% of everything you borrowed. At a 6.5% financing rate, that single event — in a year that ends where it started — erases the entire advantage of 0% interest.

It compounds when the drawdown is deeper, because every liquidation resets your health factor to a hair above 1.00, right back at the edge:

| Drawdown, then full recovery to $120 | Liquidations | Shares left (of 100) | Equity at recovery | All-in cost of the loan |
|---|---|---|---|---|
| −15% | 1 | 78.6 | $5,314 | 11.4% |
| −30% | 2 | 61.4 | $4,605 | 23.3% |
| −45% | 3 | 47.9 | $3,890 | 35.2% |

A −30% year in a single name is not a tail event. NVDA, MSTR and SMCI — three of the eleven assets Spout launches with — have each done it more than once in the last three years. On that path the borrower ends the year $1,005 worse off than a margin borrower at 6.5%, and $615 worse off than one paying **13%** — the rate Spout puts on its own homepage.

Here is the sentence that made me write this piece. Spout's documentation says:

> "The protocol does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share."

That is false, and it is contradicted by Spout's own liquidation page, by Spout's own worked example, and by Spout's own Terms of Service — which state, plainly, that "liquidation can occur without prior notice."

A buy-and-hold investor has the same paper loss and the same 100 shares. A Spout borrower at maximum LTV has 61 shares, permanently, and the 0% rate did not save them a cent of it.

**The fix is small and every prime broker already ships it:** a cure window. Notify the borrower, let them post more collateral or reduce the position, and only then sell. Spout's current design sells first and tells you after. That single change converts the borrower's downside from "permanent share loss" into "a loan that got more expensive", and it removes the biggest reputational risk in the launch.

---

## The finding you can verify without a beta code

Open Spout's documentation in one tab and its Terms of Service in another. They describe two different products.

| Parameter | The docs say | The binding Terms say |
|---|---|---|
| Lending withdrawal fee | **0%** ("0% Deposit / Withdraw Fees") | **1%** (and 0.20% on a different docs page) |
| Mint / redeem fee | **0.20%** | **0.25%** |
| Liquidation fee | **4% – 12.5%** | **7.5% – 20%** |
| Junior lender target yield | **~32%** | **24% – 27% net** |
| Junior's share of excess premium | "Junior receives **all** remaining yield" | **75%** — per the worked example on the same page |
| Loss waterfall | Insurance Fund → Junior → Senior | Insurance Fund → Junior → **Treasury** → Senior |
| Lender lockups | "**There are no lockups on either side**" | Junior: **45-day** notice, and losses keep accruing while you wait |
| Broker protection | "held at a FINRA-registered, **SIPC-covered** US broker-dealer" | "**assume that SIPC protection does not apply** to your spAsset positions" |

None of those are typos you can round away. A lender comparing a 32% target to a 24–27% binding range is comparing different products. A borrower pricing a 12.5% worst-case liquidation fee against a 20% one is pricing different risk.

And the last two rows are worse than an inconsistency. The Terms also disclose that because the underlying shares are held "in an intermediated arrangement on behalf of the Protocol rather than in individual customer accounts in your name," SIPC protection may not cover you *at all*. The marketing page implies the opposite by naming an SIPC-covered broker and letting you draw the conclusion. That one belongs in the "fix before launch" column, not the "fix the docs" column.

**Same problem, different axis, on eligibility.** Spout's entire pitch is a US-tax-and-margin argument: "never trigger a taxable sale", a big "13% — what a margin loan costs you" comparator, quotes from Buffett, Munger, Chamath and Saylor. The Terms prohibit **US persons** entirely (Regulation S), along with eleven restricted jurisdictions, and make VPN circumvention a material breach. The people the marketing is aimed at cannot legally use the product. The eligible cohort's real alternative is an offshore broker's margin rate — roughly 5–7% — not 13%. That single correction turns "we save you 13 points" into "we save you about 5, if nothing goes wrong."

---

## The tail nobody is modelling

Three published facts, read together:

1. **The loan is non-recourse.** Your maximum loss is capped at the collateral you posted.
2. **Off-hours, the oracle updates at "reduced frequency"** — in Spout's own words — because the underlying equities only trade during market sessions.
3. **Liquidations can only execute when that market is open**, because the shares are real shares sitting at a real broker-dealer.

Now put them in one weekend. Between Friday's close and Monday's open, a stock can gap 5–15% on macro news, a takeover, an FDA decision. During that window the protocol prices collateral *less* accurately by design, cannot sell anything to protect itself, and has contractually capped what it can recover from the borrower. The deviation bounds and confirmation checks the docs describe are good engineering — they defend against manipulation and flash crashes. They cannot defend against a real repricing, because a real repricing is real.

The loss then lands where all losses land: insurance fund, then junior tranche, then senior.

And here is the part I would escalate to the risk team. The insurance fund targets **2% of pool value** and is seeded at launch with **$50k–$100k** — so it starts life at roughly 0.5–1% of a $10m pool, and fills from a slice of a 20% fee on weekly premium. Junior is 15%. On paper that is about 17% of subordination below senior. But a $10m lending pool supports roughly $20m of collateral at 50% LTV, so a 10% gap across the book is a $2m event — larger than the entire insurance fund target.

Meanwhile, the published protection against this is a Monte Carlo claim: "positive net returns in over 99% of simulated years." On a strategy that sells volatility for a living, *that is not a risk metric — it is a description of the payoff's skew.* Selling options produces many small wins and rare large losses; a high survival rate is what the shape looks like from the inside. The numbers that would actually tell a lender something are the expected shortfall of the annual return, the worst simulated week, and the loss given a 20% single-week market move. Publish those.

Two aggravating details:

- **Five of the eleven launch assets are the same trade** — NVDA, SMCI, IBIT, MSTR and BSOL. The docs say "a blowup in any single name affects only the portion of the pool exposed to that name." True for idiosyncratic events, false for the systematic ones, where correlations go to one and both tails arrive at once: liquidations cluster in selloffs, and option assignments cluster in melt-ups.
- **The protocol has no documented right to call a loan.** A 0% interest, non-recourse loan with no maturity gives the borrower a free option to never repay. That is fine, until lender withdrawals depend on voluntary repayments from a counterparty who is already out of the money. Which entity funds the FIFO queue's "estimated time to fill" is not stated anywhere.

---

## What this actually is, in tokenization terms

I want to be fair here, because the crypto-native critique of Spout writes itself and most of it is wrong.

Spout's token — an SPL Token-2022 asset with a transfer hook enforcing wallet-level KYC and Regulation S transfer restrictions — is permissioned. It can be frozen by the issuer with CEO or General Counsel sign-off. It cannot move to a non-KYC wallet, which means it is not general DeFi collateral, whatever "onchain composability" means in the FAQ. The underlying shares sit in an intermediated arrangement at a broker; you do not hold record title; SIPC may not apply; and the founders describe a three-jurisdiction structure (US corporation, BVI issuance, Panama lending) that the Terms never mention.

So: this is **not** trustless DeFi. It is a regulated broker product with on-chain settlement and a DeFi interface.

And that is probably the correct architecture for real US equities. You cannot give a retail wallet in Lagos or Bogotá direct record ownership of a share held at a US transfer agent. Pretending otherwise is how the last four years of synthetic-equity projects blew up. Spout chose real shares, real custody, real dividends, and a compliance wrapper — and then wrapped it in language it cannot back. "You do not have to take our word for the existence of the underlying; the math is on the chain" is the line to delete. A Stork attestation is a company vouching for a broker's records. That is a perfectly respectable trust model. It is not mathematics.

One structural question I could not resolve from the public docs, and would ask the team first: the getting-started page says you can deposit **third-party tokenized equities — xStocks, Ondo tokens** — as collateral, with no KYC. But the covered calls are written through Alpaca against shares the protocol controls. So either that collateral cannot be enrolled in the options programme — in which case the "0% because your collateral does the work" logic does not apply to it — or there is an arrangement to place those shares under Spout's control, in which case the "1:1 real shares at a regulated broker, verified by Proof of Reserve" guarantee now spans other issuers' custody, solvency and legal structures. Either answer is fine. Silence is not.

---

## What I'd fix, in order

1. **A liquidation cure window** — notify, allow a top-up, then act. Converts permanent loss into a cost.
2. **One parameter source.** Generate docs, app, marketing and Terms from the deployed config. Eleven divergences should be impossible, not documented.
3. **A liquidation-distance panel.** Every asset's threshold, the price that triggers it, and the fee that applies — shown *before* signing. Right now a borrower cannot compute their own liquidation price from anything Spout publishes, and "50% LTV" hides a 3.9× range in room before forced selling, from a 7.4% drawdown on the steadiest asset to 28.6% on the most volatile.
4. **Honest language.** Delete "delta neutral" (a covered call is long-delta and short volatility), delete "no new failure mode", delete "you keep your shares in all scenarios", and delete the SIPC implication. The accurate version is still a very good product — and in the average year, it really is cheaper than the alternative.

---

## The verdict

Spout has built something real: the first version of tokenized equities that I would actually borrow against, with a yield source that is not a token printing press, and maths that reconciles when you check it by hand. In the benign case the economics genuinely beat a margin loan — by a wide margin against retail rates, and by a defensible one against institutional rates — and their published example does not hide the mechanism.

What the 0% headline hides is not a fee. It is a trade: you are selling the upside above a weekly strike, and you are accepting that the protocol will sell your shares for you at the worst possible moment, without telling you first. That is a reasonable trade for some portfolios. It is not the trade the marketing describes.

Four changes — a cure window, one source of truth, a liquidation-distance panel, and a page of honest language — and this stops being a clever frame and becomes a defensible product.

---

## Method, disclosure and limits

I am a beta participant and I am enrolled in Spout's points program; I was not paid, and I did not ask to be. All on-chain activity in this review used valueless testnet assets on Solana devnet.

I did not verify custody, the Proof of Reserve attestations, the Halborn audit, or any live-market performance, and nothing here should be read as doing so. The quantitative model is arithmetic built on Spout's own published parameters — it prices the *structure*, it does not forecast returns. The off-hours oracle discussion is an inference from documented design, not an observed exploit.

Everything in the parameter tables, the liquidation walkthrough, and the tranche reconciliation is reproducible today from Spout's public docs and Terms. The script is one command. If any number here is wrong, it is wrong in a way you can show me in a comment, and I will update it.

<!-- ═══════════════════════════════════════════════════════════════════════
     OPTIONAL: paste your testnet session results below before publishing.
     The piece above is complete and accurate as written without this block.
     Delete this whole section if you would rather not include it.
     ═══════════════════════════════════════════════════════════════════════ -->

### Appendix: my testnet session

- **Access:** _[cluster shown in the wallet dialog; whether a passcode was required]_
- **Acquisition:** _[USDC spent → tokens received, UTC timestamp, signature]_
- **Borrow:** _[advertised capacity vs the amount the app would actually accept; did it reach signing?]_
- **Health factor:** _[did the app show the liquidation price and the applicable fee before signing?]_
- **Off-hours:** _[could debt be increased while the cash market was closed?]_
- **Earn:** _[exact state and wording of the lending flow in this beta]_
