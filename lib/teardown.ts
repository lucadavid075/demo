/**
 * Spout Finance beta teardown — site data.
 *
 * Single source of truth for the /spout pages. Every figure here is either
 * (a) a number Spout published, or (b) derived from published numbers by
 * bounty/scripts/spout-model.mjs. Nothing in this file is estimated.
 */

export const meta = {
  title: "Spout Finance: the 0% loan is real — the risk transfer is what nobody tells you",
  standfirst:
    "A critical teardown of the first protocol to let you borrow against tokenized US stocks at 0% interest: what the maths actually says, what the docs and the binding legal terms disagree about, and the four things to fix before launch.",
  date: "14 September 2026",
  author: "Beta tester",
  disclosure:
    "Beta participant, enrolled in the points program (which the docs say will form the basis of a future token distribution). Not paid. No competing interest. All on-chain testing used valueless Solana devnet assets.",
  verifiedOn: "14 September 2026",
};

export const verdict = [
  {
    k: "The mechanic is sound",
    v: "Option buyers fund the lenders, the collateral does the work, and the maths reconciles to the cent when you rebuild it from published parameters.",
  },
  {
    k: "The cost is convex, not linear",
    v: "One forced liquidation in a year that ends where it started costs a max-LTV borrower ~$578 of permanent equity — 9.6% of everything borrowed. At a 6.5% financing rate, that single event erases the entire advantage of 0%.",
  },
  {
    k: "The docs and the Terms are different products",
    v: "Eleven parameters disagree, including the withdrawal fee (0% / 0.20% / 1%), the liquidation fee range (4–12.5% vs 7.5–20%), and whether SIPC protection applies (implied yes vs “assume it does not”).",
  },
  {
    k: "The tail is assembled from three published facts",
    v: "Non-recourse debt + an oracle that updates at “reduced frequency” off-hours + liquidations that can only execute when the equity venue is open. Each component is reasonable; the combination belongs on the risk register.",
  },
];

export const criteria = [
  { c: "Product insight", w: "30%", a: "Strong core, mispriced edges. Free at every LTV, expensive only on events — classic adverse selection, fixable with three product changes." },
  { c: "DeFi / tokenization analysis", w: "25%", a: "The honest middle path between DeFi and TradFi, executed with a permissioned token. Not trustless — and that is probably the right answer for real equities." },
  { c: "UX feedback", w: "25%", a: "No liquidation price is discoverable before signing, and the onboarding funnel asks a tester to know things the docs never state." },
  { c: "Public content quality", w: "20%", a: "Long-form teardown, a 19-post thread, and this page with a working liquidation-distance calculator." },
];

export type Finding = {
  id: string;
  sev: "P1" | "P2" | "P3";
  title: string;
  body: string;
  tags: string[];
};

export const findings: Finding[] = [
  {
    id: "F-01",
    sev: "P1",
    title: "Documentation and binding Terms disagree on every commercial parameter",
    body:
      "Eleven divergences, none reconcilable by rounding. Lending withdrawal fee appears as 0%, 0.20% and 1%. Liquidation fee range as 4–12.5% and 7.5–20%. Junior target APY as ~32% and 24–27% net. The loss waterfall has three layers in the docs and four in the Terms. A user cannot compute the cost of their own position from the published surface.",
    tags: ["DOC", "TERMS"],
  },
  {
    id: "F-02",
    sev: "P1",
    title: "“No new failure mode” is false, and there is no cure window",
    body:
      "The docs claim the protocol “does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share.” Their own liquidation page, their own worked example and §9.3 (“liquidation can occur without prior notice”) disprove it. A buy-and-hold holder keeps 100 shares through a drawdown that recovers; a max-LTV borrower keeps 58, permanently.",
    tags: ["DOC", "MODEL"],
  },
  {
    id: "F-03",
    sev: "P1",
    title: "Non-recourse debt + reduced-frequency off-hours oracle + cash-market-only execution",
    body:
      "Over a weekend gap the protocol prices collateral less accurately by design, cannot sell to protect itself, and has contractually capped recovery from the borrower. The documented deviation bounds defend against manipulation, not against real repricing. The loss lands on the waterfall — and the borrower has no economic reason to help, because the loan is non-recourse and has no maturity.",
    tags: ["DOC", "TERMS", "HYP"],
  },
  {
    id: "F-04",
    sev: "P1",
    title: "Third-party collateral (xStocks, Ondo) cannot be squared with an Alpaca-executed options programme",
    body:
      "The docs invite users to deposit third-party tokenized equities with no KYC, and say locking “enrolls your position in the options cycle”. The calls are written through Alpaca against shares the protocol controls. Either that collateral cannot earn premium — in which case the “0% because your collateral does the work” logic does not apply to it — or the 1:1 Proof-of-Reserve guarantee now spans other issuers’ custody and legal structure. Silence is the finding.",
    tags: ["DOC", "TERMS"],
  },
  {
    id: "F-05",
    sev: "P2",
    title: "No published per-asset liquidation threshold; “50% LTV” hides a 3.9× range",
    body:
      "The parameter that determines when a position is force-sold is not published for any of the 11 assets. Derived from the published buffer formula, the distance to the first partial liquidation runs from a 7.4% drawdown on the steadiest collateral to 28.6% on the most volatile.",
    tags: ["DOC", "MODEL"],
  },
  {
    id: "F-06",
    sev: "P2",
    title: "The assignment cost appears to be charged twice",
    body:
      "The assignment page has the borrower’s shares sold at the strike (borrower bears it). The settlement page has the pool booking “premium received minus the cost of assignment” (lenders bear it). Same dollar, two payers. One worked ledger showing which entity books which line would resolve it.",
    tags: ["DOC"],
  },
  {
    id: "F-07",
    sev: "P2",
    title: "The “protected” senior tranche is a conditional priority claim, not a coupon",
    body:
      "If weekly premium does not cover the 7% priority in a low-volatility stretch, the docs say the shortfall is “noted” and “can be” topped up from the insurance fund’s surplus. Subordination is genuine; a guaranteed return is not. Meanwhile the junior’s share of excess is “all remaining yield” in prose and 75% in the worked example on the same page.",
    tags: ["DOC"],
  },
  {
    id: "F-08",
    sev: "P2",
    title: "The junior exit queue rewards leaving early and penalises staying",
    body:
      "On notice, junior capital stops earning yield but keeps bearing losses until paid. The rationally-informed junior therefore queues first in a deteriorating market, concentrating risk on those who stay — the exact outcome the 45-day notice exists to prevent.",
    tags: ["DOC"],
  },
  {
    id: "F-09",
    sev: "P2",
    title: "“Delta Neutral Yield” is factually wrong",
    body:
      "A covered call is long-delta (long stock, short an out-of-the-money call) and structurally short volatility. Telling lenders the strategy is market-neutral when the entire risk story is a fat left tail is the single most misleading line on the site.",
    tags: ["DOC"],
  },
  {
    id: "F-10",
    sev: "P2",
    title: "Three guarantee claims the Terms walk back",
    body:
      "“SIPC-covered broker-dealer” vs §9.8 (“assume that SIPC protection does not apply to your spAsset positions”). “200% collateralized” vs the actual ~17% subordination below senior. “You keep your shares in all scenarios” vs §9.2/§9.3/§6.2.",
    tags: ["DOC", "TERMS"],
  },
  {
    id: "F-11",
    sev: "P2",
    title: "Five of eleven launch assets are the same trade",
    body:
      "NVDA, SMCI, IBIT, MSTR and BSOL are one risk-on factor. Liquidations cluster in selloffs and assignments cluster in melt-ups, so the diversification argument fails precisely in the states it is invoked for.",
    tags: ["DOC", "MODEL"],
  },
  {
    id: "F-12",
    sev: "P2",
    title: "Testnet onboarding is undocumented",
    body:
      "Access is a passcode from Telegram; the app’s first screen says nothing about the cluster, fees or funding; /docs/getting-started points testers at the mainnet URL and describes KYC and buying real shares. A recruited beta tester cannot find out how to obtain test USDC or devnet SOL.",
    tags: ["DOC", "TEST"],
  },
  {
    id: "F-13",
    sev: "P2",
    title: "Retest: borrowing blocked after a fill (third-party report)",
    body:
      "An independent review dated 10 September 2026 documents a filled 10 test-USDC NVDA order, then a Borrow screen advertising ~$4.94 of capacity while rejecting a $2.40 request against a reported $0.00 limit, with a collateral decode error. Attributed, not my observation — and the first thing to retest, because a tester who cannot pass step 3 cannot review steps 4–7.",
    tags: ["EXT"],
  },
  {
    id: "F-14",
    sev: "P3",
    title: "The incentive layer sits outside the securities framing",
    body:
      "Points “will be the basis for the protocol’s future token distribution”; referrals pay a fee share “for as long as they remain active”; queued claims are tradeable IOUs. The Terms’ Regulation S analysis covers spAssets only and is silent on all three. A flag for counsel, not a legal conclusion.",
    tags: ["DOC", "TERMS"],
  },
  {
    id: "F-15",
    sev: "P3",
    title: "The entity map is public only in a podcast",
    body:
      "The founders describe a US corporation, a BVI issuance entity and a Panama lending entity. The Terms name only a Delaware corporation as counterparty. Whose courts and insolvency regime govern a lender’s claim should be a docs page.",
    tags: ["EXT", "TERMS"],
  },
  {
    id: "F-16",
    sev: "P3",
    title: "“Fully reconstituted” understates permanent share loss",
    body:
      "The scenario page correctly concedes the borrower “ends the cycle with slightly fewer shares”. The FAQ says positions are “fully reconstituted”. Auto-Roll restores a position, not a share count.",
    tags: ["DOC"],
  },
  {
    id: "F-17",
    sev: "P3",
    title: "Unlinked audit, undefined oracle cadence, unstated backtest window",
    body:
      "Halborn is named in the Terms but no report is linked. “Reduced frequency” off-hours is not quantified — and it is the input needed to size F-03. The “99% of simulated years” claim never states the window, price process, jump or correlation assumptions.",
    tags: ["DOC", "TERMS"],
  },
];

/** Documentation vs binding Terms. All quoted live on 14 September 2026. */
export const reconciliation = [
  { p: "Lending withdrawal fee", d: "0% — “0% Deposit / Withdraw Fees”", t: "1% on borrowing and lending withdrawals" },
  { p: "Lending withdrawal fee (third page)", d: "0.20% (20 bps)", t: "1%", note: "all three numbers are on Spout’s own site" },
  { p: "spAsset mint / redeem fee", d: "0.20%", t: "0.25%" },
  { p: "Borrow-side origination", d: "“no origination fee, no maintenance fee”", t: "1% withdrawal fee on borrowing" },
  { p: "Liquidation fee range", d: "4% – 12.5%", t: "7.5% – 20%" },
  { p: "Senior target APY", d: "~9%", t: "~8.67%" },
  { p: "Junior target APY", d: "~32%", t: "24% – 27% net" },
  { p: "Junior residual split", d: "“Junior receives all remaining yield”", t: "75% of excess — per the worked example on the same page" },
  { p: "Idle-routing fee", d: "not disclosed", t: "~7% of idle money-market yield" },
  { p: "Loss waterfall", d: "Insurance → Junior → Senior", t: "Insurance → Junior → Treasury → Senior" },
  { p: "Lender lockups", d: "“There are no lockups on either side”", t: "Junior: 45-day notice, loss-bearing while queued" },
  { p: "Broker protection", d: "“SIPC-covered US broker-dealer”", t: "“assume that SIPC protection does not apply to your spAsset positions”" },
  { p: "Eligible users", d: "“KYC global”, “access is a right”", t: "US persons prohibited (Reg S) + 11 restricted jurisdictions; VPN circumvention is a breach" },
];

/** The published buffer formula, and what it means for the borrower. */
export const buffers = [
  { b: 4.0, src: "docs: steadiest collateral", lt: 54.0, dd: 7.4 },
  { b: 7.5, src: "Terms: minimum", lt: 57.5, dd: 13.0 },
  { b: 8.8, src: "docs: NVDA worked example", lt: 58.8, dd: 15.0 },
  { b: 12.5, src: "docs: most volatile", lt: 62.5, dd: 20.0 },
  { b: 20.0, src: "Terms: maximum", lt: 70.0, dd: 28.6 },
];

/** $12,000 collateral, $6,000 borrowed, one year, stock back at entry. */
export const costRows = [
  { path: "Spout, benign year (docs fees)", equity: 5892, cost: 1.8, tone: "good" },
  { path: "Spout, benign year (Terms fees)", equity: 5880, cost: 2.0, tone: "good" },
  { path: "Margin loan @ 6.5% (offshore-eligible)", equity: 5610, cost: 6.5, tone: "neutral" },
  { path: "Spout, one liquidation at −15%, then full recovery", equity: 5314, cost: 11.43, tone: "bad" },
  { path: "Margin loan @ 13% (Spout’s own comparator)", equity: 5220, cost: 13.0, tone: "neutral" },
];

export const drawdowns = [
  { dd: "−15%", events: 1, shares: 78.6, fees: 192, equity: 5314, cost: 11.4 },
  { dd: "−30%", events: 2, shares: 61.4, fees: 323, equity: 4605, cost: 23.3 },
  { dd: "−45%", events: 3, shares: 47.9, fees: 410, equity: 3890, cost: 35.2 },
];

export const recommendations = [
  { n: "R1", t: "Liquidation cure window + voluntary top-up", w: "Notifies at HF < 1.15 and allows a deposit or partial repayment until the next cycle open. Converts permanent share loss into a cost, and removes the launch’s biggest reputational risk. Every prime broker already does this.", e: "M" },
  { n: "R2", t: "Over-liquidate to a target below max LTV", w: "Restoring to 50% LTV resets HF to ~1.00–1.18, so a −30% path triggers two events (58 shares left, not 79). A single deeper cut does less damage than two shallow ones.", e: "S" },
  { n: "R3", t: "LTV-based borrower pricing", w: "With a free loan at every LTV, every rational borrower takes the maximum — maximising liquidation frequency and demands on the insurance fund. Price the risk ex-ante instead of only on the event.", e: "M" },
  { n: "R4", t: "Publish per-asset parameters + a liquidation-distance panel", w: "Threshold, HF, the price that triggers, the fee that applies, and a −10/−20/−30% scenario — before signing. Currently uncomputable from anything Spout publishes.", e: "S" },
  { n: "R5", t: "Gap-risk haircut for off-hours borrowing", w: "A non-recourse borrower should not be able to size debt against a stale close that cannot be liquidated. Reduce the effective LTV, or block debt increases, while the cash market is closed.", e: "S" },
  { n: "R6", t: "Publish the distribution, not the survival rate", w: "Worst simulated week, annual expected shortfall, correlation matrix, loss given a 20% market move, and the backtest window. “99% of years positive” is a description of short-vol skew, and sophisticated lenders read it that way.", e: "S" },
  { n: "R7", t: "One canonical parameter source", w: "Generate docs, app, marketing and Terms from the deployed configuration. Eleven divergences should be impossible rather than documented.", e: "S–M" },
  { n: "R8", t: "Fix the trust language", w: "Remove “delta neutral”, “no new failure mode”, “you keep your shares in all scenarios”, “the math is on the chain”, and the SIPC implication. The accurate version is still an excellent product.", e: "S" },
  { n: "R9", t: "Expected-cost disclosure at the point of borrow", w: "In dollars and as an APR-equivalent: benign-year estimate, and post-liquidation estimate. Makes the 0% claim honest and more persuasive, because on the average case the number really is better.", e: "S" },
  { n: "R10", t: "Junior queue economics", w: "Keep yield accruing until payment, or price the exit at payment-date NAV, so the timing of the queue request carries no advantage. Publish queue depth and the FIFO funding source.", e: "M" },
  { n: "R11", t: "Self-serve devnet sandbox", w: "Faucet funds pre-loaded, plus a Testnet docs page: cluster, RPC, faucets, what is simulated, known limitations.", e: "S" },
  { n: "R12", t: "Publish the diligence four", w: "The Halborn audit (named but unlinked), the entity map (US/BVI/Panama), the corporate-actions policy, and spAsset redemption mechanics.", e: "S–M" },
];

export const thread: string[] = [
  "Spout Finance lets you borrow against tokenized US stocks at 0% interest.\n\nI spent a week stress-testing their beta.\n\nThe 0% is real. It's also not the cost that matters.\n\nA teardown, with maths you can run yourself 🧵",
  "The mechanics, honestly stated:\n\nYou deposit tokenized equities. The protocol writes weekly covered calls against them via a regulated US broker. The premium — paid by *option buyers* — funds the lenders.\n\nYour collateral does the work. It is not a token subsidy.",
  "First, credit: their maths checks out.\n\nI rebuilt their NVDA liquidation example from published parameters — 21.42 shares sold, $192.23 fee, debt to $4,007, HF back to 1.18.\n\nReconciles exactly. Their tranche waterfall too, to the cent.",
  "But the fee isn't the cost. Convexity is.\n\nMax 50% LTV. Stock falls 15%. The protocol sells 21 of your 100 shares at the bottom. Stock then FULLY recovers.\n\nYou are $578 permanently poorer — 9.6% of everything you borrowed.\n\nAnd you paid 0% interest.",
  "Deeper drawdowns, then full recovery to entry:\n\n−15% → 78.6 shares left, $5,314 equity\n−30% → 61.4 shares, $4,605\n−45% → 47.9 shares, $3,890\n\nEvery liquidation resets your health factor to ~1.0. You're back at the edge, again.",
  "Next to the alternatives, on the same $6,000 loan:\n\nBenign year, Spout: 1.8% all-in\nOne liquidation + full recovery: 11.4%\nMargin loan at 6.5%: 6.5%\nMargin loan at 13%: 13%\n\nA single forced sale erases the entire 0%.",
  "Spout's docs say:\n\n\"The protocol does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share.\"\n\nThat is false. Their own Terms contradict it:\n\n\"Liquidation can occur without prior notice.\"",
  "The fix is small, and every prime broker already ships it:\n\nA cure window. Notify the borrower. Let them top up or repay. *Then* sell.\n\nSpout sells first and tells you after.",
  "Now the finding you can verify without a beta code.\n\nSpout's documentation and Spout's binding Terms of Service describe two different products.\n\nEleven parameters disagree. 🔍",
  "Withdrawal fee: docs say 0%. Another docs page says 0.20%. Terms say 1%.\n\nLiquidation fee: 4–12.5% vs 7.5–20%.\n\nJunior lender target: ~32% vs 24–27% net.\n\nLoss waterfall: 3 layers vs 4.",
  "Lender lockups: \"There are no lockups on either side\" vs a 45-day junior notice — where queued capital also stops earning while still absorbing losses.\n\nSIPC: \"SIPC-covered US broker\" vs \"assume that SIPC protection does not apply to your spAsset positions.\"",
  "Worse, the pitch is aimed at people who can't use it.\n\nMarketing sells a US tax + 13%-margin story. The Terms prohibit US persons entirely (Reg S), plus 11 restricted jurisdictions.\n\nThe eligible cohort's real alternative is ~5–7% offshore margin. Not 13%.",
  "The tail: the loan is non-recourse. The oracle deliberately updates at \"reduced frequency\" when the market's closed. And liquidations can only execute when the shares' venue is open.\n\nA weekend gap = degraded pricing, no execution, capped recovery from the borrower.",
  "The loss then lands on the waterfall: insurance fund → junior → senior.\n\nThe fund targets 2% of pool, seeded at $50–100k. A $10m pool supports ~$20m of collateral, so a 10% gap is a $2m event — larger than the entire fund target.",
  "And \"positive net returns in over 99% of simulated years\" is not a risk metric on a strategy that sells volatility for a living.\n\nIt's a description of the skew. Publish the expected shortfall and the worst week instead.",
  "Tokenization reality check:\n\nToken-2022 + a KYC transfer hook = permissioned, freezable, can't move to non-KYC wallets. Real shares at a real broker, in an intermediated arrangement.\n\nRight architecture for US equities. Not \"trustless DeFi\", not \"the math is on the chain\".",
  "What's genuinely good:\n\n→ Yield from a real third-party cash flow, not emissions\n→ Partial, not total, liquidations\n→ Earnings-cycle skips\n→ Per-asset strike calibration\n→ Docs detailed enough to be audited\n\nThat last one is why this review is this specific.",
  "Four fixes before launch:\n\n1. Liquidation cure window\n2. One parameter source for docs/app/Terms\n3. A liquidation-distance panel — \"50% LTV\" hides a 3.9× range: a 7.4% to 28.6% drawdown\n4. Delete \"delta neutral\", \"no new failure mode\", and the SIPC implication",
  "Verdict: the first tokenized-equity product I'd actually borrow against — one documentation pass from being safe to launch.\n\nFull teardown + model script: spout-teardown.vercel.app\n\nDisclosure: beta participant, points program, unpaid. Devnet only.",
];
