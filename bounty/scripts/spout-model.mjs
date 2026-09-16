#!/usr/bin/env node
/**
 * Spout Finance beta teardown — reproducible model worksheets.
 *
 * Every number below is either (a) reproduced from a figure published by Spout,
 * or (b) derived from published figures with the derivation shown in the comments.
 * No private data, no wallet access, no network calls. Runs offline:
 *
 *     node bounty/scripts/spout-model.mjs
 *
 * Outputs CSV worksheets to bounty/data/ and a human-readable summary to stdout.
 *
 * Sources for every input constant are listed in bounty/06-evidence-and-sources.md
 * (docs + legal terms, each quoted with the date it was checked: 2026-09-14).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "..", "data");
mkdirSync(OUT, { recursive: true });

const pct = (x, dp = 2) => `${(x * 100).toFixed(dp)}%`;
const usd = (x) => `$${x.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const usd2 = (x) => `$${x.toFixed(2)}`;
const csv = (rows) => rows.map((r) => r.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(",")).join("\n") + "\n";
const write = (name, rows) => {
  writeFileSync(resolve(OUT, name), csv(rows));
  console.log(`  wrote data/${name} (${rows.length - 1} rows)`);
};

const rule = (t) => console.log(`\n${"─".repeat(78)}\n${t}\n${"─".repeat(78)}`);

/* ═══════════════════════════════════════════════════════════════════════
   1. TRANCHE WATERFALL — reproduce the docs' own worked example
   Published input: $10m pool, 85/15 split, $30,000 gross weekly premium,
   20% protocol fee, 7% senior priority, 25/75 split of the excess.
   Source: /docs/lending-tranches/
   ═══════════════════════════════════════════════════════════════════════ */

const pool = 10_000_000;
const seniorCap = 0.85 * pool;
const juniorCap = 0.15 * pool;
const grossPremium = 30_000;
const protocolFee = grossPremium * 0.20;
const netPremium = grossPremium - protocolFee;
const seniorPriority = (seniorCap * 0.07) / 52;
const excess = netPremium - seniorPriority;
const seniorFromExcess = excess * 0.25;
const juniorFromExcess = excess * 0.75;
const seniorWeek = seniorPriority + seniorFromExcess;
const juniorWeek = juniorFromExcess;
const seniorApy = (seniorWeek * 52) / seniorCap;
const juniorApy = (juniorWeek * 52) / juniorCap;
const blendedApy = ((seniorWeek + juniorWeek) * 52) / pool;
// Counterfactual: what the doc PROSE says ("Junior receives all remaining yield")
const juniorApyIfProseTrue = (excess * 52) / juniorCap;

rule("1. TRANCHE WATERFALL — reproduction of the published worked example");
console.log(`gross premium / week        ${usd(grossPremium)}`);
console.log(`protocol fee (20%)          ${usd(protocolFee)}`);
console.log(`net premium                 ${usd(netPremium)}`);
console.log(`senior priority (7% / 52)   ${usd(seniorPriority)}`);
console.log(`excess after priority       ${usd(excess)}`);
console.log(`  senior 25% of excess      ${usd(seniorFromExcess)}`);
console.log(`  junior 75% of excess      ${usd(juniorFromExcess)}`);
console.log(`senior / week               ${usd(seniorWeek)}  → APY ${pct(seniorApy)}   (docs: ~8.9%)`);
console.log(`junior / week               ${usd(juniorWeek)}  → APY ${pct(juniorApy)}   (docs: ~32.8%)`);
console.log(`blended pool APY            ${pct(blendedApy)}`);
console.log(`\n  IF the prose "junior receives all remaining yield" were true:`);
console.log(`  junior APY would be       ${pct(juniorApyIfProseTrue)}  (vs ${pct(juniorApy)} in the same page's worked example)`);
console.log(`  → prose and arithmetic on /docs/lending-tranches/ disagree by ${((juniorApyIfProseTrue - juniorApy) * 100).toFixed(1)} points of APY`);
console.log(`\n  Headline 32% vs Terms §7.3 junior target 24–27%: headline sits ${(32 - 27).toFixed(1)}–${(32 - 24).toFixed(1)} pts above the binding range.`);

write("01-tranche-waterfall.csv", [
  ["line_item", "amount_usd_per_week", "note"],
  ["gross_options_premium", grossPremium, "published example"],
  ["protocol_fee_20pct", protocolFee, "funds ops + insurance fund"],
  ["net_premium", netPremium, "distributed"],
  ["senior_priority_7pct_annualised", seniorPriority, "paid first"],
  ["excess_after_priority", excess, ""],
  ["senior_share_of_excess_25pct", seniorFromExcess, ""],
  ["junior_share_of_excess_75pct", juniorFromExcess, ""],
  ["senior_total_week", seniorWeek, `APY ${pct(seniorApy)}`],
  ["junior_total_week", juniorWeek, `APY ${pct(juniorApy)}`],
  ["blended_pool_apy_pct", (blendedApy * 100).toFixed(2), ""],
  ["junior_apy_if_prose_were_true_pct", (juniorApyIfProseTrue * 100).toFixed(2), "contradicts worked example on same page"],
]);

/* ═══════════════════════════════════════════════════════════════════════
   2. LIQUIDATION GEOMETRY
   Published relation (both /docs/liquidation/ and Terms §8.1(d)):
        liquidation fee  =  liquidation buffer  =  LT − 50% LTV
   where LT is the liquidation-threshold LTV.
   Derived: a position opened at exactly 50% LTV reaches HF = 1.00 after a
        drawdown of   1 − 0.50 / LT
   ═══════════════════════════════════════════════════════════════════════ */

const bufferCases = [
  { label: "docs minimum (steadiest collateral)", buffer: 0.04, source: "docs fee + liquidation pages" },
  { label: "docs NVDA worked example", buffer: 0.088, source: "docs liquidation-example" },
  { label: "docs maximum (most volatile)", buffer: 0.125, source: "docs fee + liquidation pages" },
  { label: "terms minimum", buffer: 0.075, source: "Terms §8.1(d), §9.3" },
  { label: "terms maximum", buffer: 0.20, source: "Terms §8.1(d), §9.3" },
];

rule("2. LIQUIDATION GEOMETRY — drawdown needed to trigger a partial liquidation");
console.log("buffer  →  LT (buffer+50%)  →  drawdown to HF=1.00");
const bufferRows = [["buffer_pct", "implied_lt_pct", "drawdown_to_liquidation_pct", "source", "same_param_elsewhere"]];
for (const c of bufferCases) {
  const lt = 0.5 + c.buffer;
  const dd = 1 - 0.5 / lt;
  console.log(`  ${pct(c.buffer).padStart(7)}  →  ${pct(lt).padStart(7)}          →  ${pct(dd).padStart(7)}    ${c.label}`);
  bufferRows.push([(c.buffer * 100).toFixed(2), (lt * 100).toFixed(2), (dd * 100).toFixed(2), c.source, c.label]);
}
const spread = (1 - 0.5 / 0.7) / (1 - 0.5 / 0.54);
console.log(`\n  Same "50% LTV" headline, ${spread.toFixed(1)}× difference in room before forced selling`);
console.log(`  (${pct(1 - 0.5 / 0.54)} for the steadiest asset at a 4-pt buffer → ${pct(1 - 0.5 / 0.7)} at a 20-pt buffer).`);
console.log(`  No per-asset liquidation-threshold table is published anywhere on the public surface.`);
write("02-liquidation-geometry.csv", [
  ["metric", "value_pct", "source"],
  ["max_ltv_borrow", "50.00", "docs supported-collateral (flat 50% across all 11 assets)"],
  ["docs_buffer_range", "4.00-12.50", "/docs/liquidation/, /docs/fee-structure/"],
  ["terms_buffer_range", "7.50-20.00", "Terms §8.1(d), §9.3"],
  ...bufferRows.slice(1).map((r) => [`drawdown_to_liq_buffer_${r[0]}pct`, r[2], r[3]]),
]);

/* ═══════════════════════════════════════════════════════════════════════
   3. PARTIAL LIQUIDATION — solve for the shares sold, then price the
      "liquidate in a drawdown, then the stock recovers" path against a
      plain margin loan.
   ═══════════════════════════════════════════════════════════════════════ */

function partialLiquidation({ shares, entryPrice, ltv = 0.5, buffer, price, debt: debtIn }) {
  // pre-liquidation state (debt may be carried in from a previous event)
  const debt0 = debtIn ?? shares * entryPrice * ltv;
  const lt = 0.5 + buffer;
  const collateral = shares * price;
  const hf = (collateral * lt) / debt0;
  if (hf >= 1) return { triggered: false, hf, debt0, shares };
  // sell n shares so that post-sale debt / collateral returns to the position's LTV target
  // (the published example restores to 50%, which is the default `ltv`)
  const target = ltv;
  const fee = buffer; // published: fee = buffer
  const n = (debt0 - target * shares * price) / (price * (1 - fee) - target * price);
  const proceeds = n * price;
  const feeUsd = proceeds * fee;
  const debt1 = debt0 - (proceeds - feeUsd);
  return {
    triggered: true, hf, lt, debt0, sharesSold: n, proceeds, feeUsd,
    debt1, sharesLeft: shares - n, collateral1: (shares - n) * price,
    postLtv: debt1 / ((shares - n) * price),
    hfAfter: ((shares - n) * price * lt) / debt1,
  };
}

rule("3. PARTIAL LIQUIDATION — reproduce the published NVDA example, then stress it");
const nvda = partialLiquidation({ shares: 100, entryPrice: 120, buffer: 0.088, price: 102 });
console.log(`  100 NVDA @ $120 = ${usd(12_000)} collateral, borrow ${usd(6_000)} (50% LTV)`);
console.log(`  price falls to $102 (−15%)  →  HF ${nvda.hf.toFixed(3)}  → liquidation triggers`);
console.log(`  shares sold            ${nvda.sharesSold.toFixed(2)}  (docs: "roughly 21 shares")`);
console.log(`  proceeds               ${usd2(nvda.proceeds)}    (docs: about $2,184)`);
console.log(`  liquidation fee 8.8%   ${usd2(nvda.feeUsd)}      (docs: about $192)`);
console.log(`  debt after             ${usd2(nvda.debt1)}     (docs: roughly $4,000)`);
console.log(`  shares / collateral    ${nvda.sharesLeft.toFixed(1)} / ${usd(nvda.collateral1)} (docs: ~79 / ~$8,016)`);
console.log(`  LTV restored to        ${pct(nvda.postLtv)}  →  HF ${nvda.hfAfter.toFixed(2)}`);
console.log(`  → the published worked example reconciles. Credit where due.`);

/* Walk a monotone drawdown from the entry price to entry*(1-drop) in `steps` increments,
   applying every partial liquidation on the way. This is the canonical methodology: it is
   the same one used by the LiquidationLab component on the site, so the script and the
   public page cannot disagree. */
function walkDrawdown({ shares, entryPrice, ltv = 0.5, buffer, drop, steps = 60 }) {
  let s = shares, debt = shares * entryPrice * ltv, events = 0, fees = 0;
  const log = [];
  const floor = entryPrice * (1 - drop);
  for (let i = 1; i <= steps; i++) {
    const p = entryPrice - (entryPrice - floor) * (i / steps);
    const r = partialLiquidation({ shares: s, entryPrice, buffer, price: p, debt, ltv });
    if (r.triggered) {
      s = r.sharesLeft; debt = r.debt1; events++; fees += r.feeUsd;
      log.push(`   $${p.toFixed(2)}  →  HF ${r.hf.toFixed(2)}  →  LIQ #${events}: sold ${r.sharesSold.toFixed(1)} sh @ $${p.toFixed(2)}, fee ${usd2(r.feeUsd)}, ${s.toFixed(1)} sh left, debt ${usd2(debt)}`);
    }
  }
  return { sharesLeft: s, debt, events, fees, log };
}

// Compare three paths after a full recovery to the entry price.
const entry = 120, shares0 = 100, collateral0 = shares0 * entry, debt0 = collateral0 * 0.5;
const assignmentCost = 0.005 * collateral0;  // published: ~0.5% annualised across the portfolio
const roundTripDocs = 0.002 * collateral0 * 2;
const roundTripTerms = 0.0025 * collateral0 * 2;
const recoveryPrice = entry; // stock fully recovers

const equity = (shares, debt) => shares * recoveryPrice - debt;

const margin = (rate) => equity(shares0, debt0 * (1 + rate));
const spoutClean = (roundTrip) => equity(shares0, debt0) - assignmentCost - roundTrip;

/** Spout path: draw down `drop`, liquidate as required, then recover to the entry price. */
function spoutPath(drop, roundTrip = roundTripDocs, buffer = 0.088) {
  const w = walkDrawdown({ shares: shares0, entryPrice: entry, buffer, drop });
  const eq = equity(w.sharesLeft, w.debt) - assignmentCost - roundTrip;
  return { ...w, equity: eq, allIn: (equity(shares0, debt0) - eq) / debt0 };
}
const spoutLiq = (roundTrip, drop = 0.15) => spoutPath(drop, roundTrip).equity;

rule("4. BORROWER COST DECOMPOSITION — $12,000 collateral, $6,000 borrowed, 1 year, stock round-trips to entry");
const rows = [
  ["path", "equity_usd", "cost_vs_no_borrow_usd", "cost_as_pct_of_loan"],
  ["plain margin @ 6.5%", margin(0.065), debt0 * 0.065, "6.50%"],
  ["plain margin @ 8.0%", margin(0.08), debt0 * 0.08, "8.00%"],
  ["plain margin @ 13.0% (Spout's own comparator)", margin(0.13), debt0 * 0.13, "13.00%"],
  ["Spout, benign year (docs fees)", spoutClean(roundTripDocs), assignmentCost + roundTripDocs, pct((assignmentCost + roundTripDocs) / debt0)],
  ["Spout, benign year (Terms fees)", spoutClean(roundTripTerms), assignmentCost + roundTripTerms, pct((assignmentCost + roundTripTerms) / debt0)],
  ["Spout, one liquidation + full recovery (docs fees)", spoutLiq(roundTripDocs), spoutClean(roundTripDocs) - spoutLiq(roundTripDocs) + assignmentCost + roundTripDocs, pct((spoutClean(roundTripDocs) - spoutLiq(roundTripDocs) + assignmentCost + roundTripDocs) / debt0)],
];
for (const r of rows.slice(1)) console.log(`  ${r[0].padEnd(52)} equity ${usd(r[1]).padStart(9)}   all-in cost ${String(r[3]).padStart(7)}`);
const oneLiqDrag = spoutClean(roundTripDocs) - spoutLiq(roundTripDocs);
console.log(`\n  One liquidation event costs ${usd2(oneLiqDrag)} of permanent equity (${pct(oneLiqDrag / collateral0)} of collateral, ${pct(oneLiqDrag / debt0)} of the loan)`);
console.log(`  after which the stock fully recovers — the loss is the sold-and-not-rebought shares, not a paper mark.`);
const breakEven1 = ((assignmentCost + roundTripDocs) + oneLiqDrag) / debt0;
console.log(`\n  Break-even margin rate, benign year:            ${pct((assignmentCost + roundTripDocs) / debt0)}`);
console.log(`  Break-even margin rate, one liquidation:        ${pct(breakEven1)}`);
console.log(`  → At a 6.5% institutional margin rate (the rate an offshore IBKR customer can get),`);
console.log(`    a single liquidation event in a recovering market flips the comparison to the margin loan.`);
console.log(`    Against the 13% US retail margin rate used in Spout's own marketing, Spout wins even with one event.`);
console.log(`    The marketing comparator is priced off a cohort (US persons) that the Terms forbid (Reg S).`);
write("03-borrower-cost.csv", rows.map((r, i) =>
  i === 0 ? r : r.map((c, j) => (typeof c === "number" && j >= 1 ? Number(c.toFixed(2)) : c))));

/* 4b. CANONICAL TABLE — what a drawdown does to the borrower, even when the stock fully recovers.
      Same methodology as the LiquidationLab component on the /spout page. */
rule("4b. DRAWDOWN PATH — repeated partial liquidations, stock then recovers to $120");
const pathRows = [["drawdown_pct", "liquidation_events", "fees_paid_usd", "shares_left_of_100", "equity_at_recovery_usd", "all_in_cost_pct_of_loan", "vs_margin_6.5pct", "vs_margin_13pct"]];
for (const drop of [0.15, 0.30, 0.45]) {
  const p = spoutPath(drop);
  console.log(`\n  −${(drop * 100).toFixed(0)}%  (then a full recovery to $120)`);
  p.log.forEach((l) => console.log(l));
  console.log(`   events ${p.events} · fees ${usd2(p.fees)} · ${p.sharesLeft.toFixed(1)} shares left · equity ${usd(p.equity)} · all-in ${pct(p.allIn)}`);
  pathRows.push([(drop * 100).toFixed(0), p.events, p.fees.toFixed(2), p.sharesLeft.toFixed(2), p.equity.toFixed(0), (p.allIn * 100).toFixed(2), (p.equity - margin(0.065)).toFixed(0), (p.equity - margin(0.13)).toFixed(0)]);
}
console.log(`\n  Every liquidation resets HF to ~1.18, so each further ~15% decline triggers the next one.`);
console.log(`  The shares are sold at the low and only the residual (net of the buffer-sized fee) buys debt down,`);
console.log(`  so the loss is permanent even though the stock ends the year where it started.`);
write("03b-drawdown-paths.csv", pathRows);

/* ═══════════════════════════════════════════════════════════════════════
   5. FEE / PARAMETER RECONCILIATION — docs vs binding terms
   ═══════════════════════════════════════════════════════════════════════ */

rule("5. PUBLISHED PARAMETERS, TWO SOURCES — one number each, please");
const recon = [
  ["spAsset mint / redeem fee", "0.20%", "0.25%", "/docs/fee-structure/ vs Terms §8.1(b)"],
  ["Withdrawal fee", "0.20%", "1%", "/docs/fee-structure/ vs Terms §8.1(c)"],
  ["Withdrawal fee (stating page)", "0%", "0.20%", "/docs/how-lending-works/ stat block vs /docs/fee-structure/"],
  ["Liquidation fee range", "4%–12.5%", "7.5%–20%", "/docs/liquidation/ vs Terms §8.1(d)"],
  ["Senior target APY", "~9%", "~8.67%", "homepage/docs vs Terms §7.3"],
  ["Junior target APY", "~32%", "24%–27% net", "homepage/docs vs Terms §7.3"],
  ["Idle-routing fee", "not disclosed", "~7% of idle yield", "/docs/fee-structure/ vs Terms §8.1(e)"],
  ["Loss waterfall order", "Insurance → Junior → Senior", "Insurance → Junior → Treasury → Senior", "/docs/loss-waterfall/ vs Terms §9.4"],
  ["Lender exit", "\"no lockups on either side\"", "Junior: 45-day notice, loss-bearing while queued", "homepage FAQ vs /docs/withdrawals/ + Terms §7.3"],
  ["SIPC protection", "\"SIPC-covered US broker-dealer\"", "\"assume that SIPC protection does not apply\"", "homepage FAQ vs Terms §9.8"],
  ["Eligible users", "\"KYC global\", \"access is a right\"", "US persons prohibited (Reg S); 11 restricted jurisdictions", "homepage/docs getting-started vs Terms §1.2, §12.2"],
];
console.log("  " + "parameter".padEnd(28) + "docs".padEnd(34) + "binding terms");
for (const r of recon) console.log(`  ${r[0].padEnd(28)}${String(r[1]).padEnd(34)}${r[2]}`);
write("04-parameter-reconciliation.csv", [["parameter", "documentation_says", "binding_terms_say", "where"], ...recon]);

/* ═══════════════════════════════════════════════════════════════════════
   6. TAIL / CONCENTRATION — why "diversified roster" is weakest in the tails
   ═══════════════════════════════════════════════════════════════════════ */

rule("6. ROSTER CONCENTRATION — 11 assets, one regime");
const roster = [
  ["AAPL", "Large-cap tech"], ["NVDA", "Tech / AI"], ["GOOG", "Tech"], ["SMCI", "AI infrastructure"],
  ["IBIT", "Bitcoin ETF"], ["MSTR", "Bitcoin proxy equity"], ["BSOL", "Solana ETF"],
  ["PFE", "Healthcare"], ["GS", "Financials"], ["XOM", "Energy"], ["GLD", "Gold"],
];
const riskOn = ["NVDA", "SMCI", "IBIT", "MSTR", "BSOL"];
console.log(`  risk-on / crypto-beta cluster: ${riskOn.join(", ")} = ${riskOn.length}/11 = ${pct(riskOn.length / 11, 0)} of the roster`);
console.log(`  docs claim: "A blowup in any single name affects only the portion of the pool exposed to that name."`);
console.log(`  true for idiosyncratic events; the tail is systematic — a crypto drawdown hits 3–5 of 11 at once,`);
console.log(`  and a melt-up assigns calls across the book in the same week (losses cluster in both tails).`);
write("05-roster.csv", [["asset", "sector", "risk_on_cluster"], ...roster.map((r) => [r[0], r[1], riskOn.includes(r[0]) ? "yes" : "no"])]);

/* ═══════════════════════════════════════════════════════════════════════
   7. LIQUIDITY TRANSFORMATION
   ═══════════════════════════════════════════════════════════════════════ */

rule("7. LIQUIDITY — instant liabilities, no borrower repayment obligation");
const reserve = 0.15 * pool;
console.log(`  senior instant-exit reserve target  15% of pool = ${usd(reserve)}`);
console.log(`  insurance fund target                2% of pool = ${usd(0.02 * pool)}`);
console.log(`  junior loss buffer                  15% of pool = ${usd(juniorCap)}`);
const subordination = 0.02 * pool + juniorCap;
console.log(`  → ${usd(subordination)} (${pct(subordination / pool)}) must be exhausted before senior principal is touched.`);
console.log(`\n  Asset side: weekly options cycles (7-day duration). Liability side: no lockup on senior.`);
console.log(`  A 0%-interest, non-recourse, open-maturity loan gives the borrower a free option to never repay;`);
console.log(`  the docs describe no protocol right to call a loan. Exit therefore depends on voluntary repayment`);
console.log(`  and new inflows — the FIFO queue's "estimated time to fill" has no stated funding source.`);
write("06-liquidity-retention.csv", [
  ["layer", "pct_of_pool", "usd_on_10m_pool", "note"],
  ["insurance_fund_target", "2.00", usd(0.02 * pool), "seeded at launch with $50k-$100k per /docs/loss-waterfall/"],
  ["junior_tranche", "15.00", usd(juniorCap), "first-loss after the fund"],
  ["senior_instant_exit_reserve", "15.00", usd(reserve), "T-bills + stablecoins; haircut 0-3%"],
  ["total_before_senior_principal", ((subordination / pool) * 100).toFixed(2), usd(subordination), "insurance target + junior"],
  ["launch_day_seed", "0.50-1.00", "$50k-$100k", "vs a 2% target = the buffer starts under-funded by design"],
]);

console.log(`\n${"═".repeat(78)}\nAll worksheets written to bounty/data/. Re-run: node bounty/scripts/spout-model.mjs\n${"═".repeat(78)}`);
