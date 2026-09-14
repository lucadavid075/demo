#!/usr/bin/env node
/**
 * Validate a filled-in beta session ledger.
 *
 *   node bounty/scripts/check-ledger.mjs bounty/templates/session-ledger.json
 *
 * Checks the things a reviewer cannot check by eye:
 *   - every signature is a plausible base58 Solana signature
 *   - the displayed health factor matches the published formula
 *   - the displayed cost basis reconciles with the actual fill
 *   - the exact divergence pattern behind F-13 (capacity advertised, amount rejected)
 *   - which of the six submission-critical questions are still unanswered
 *
 * Exit code 0 = ledger structurally complete. Exit code 1 = gaps or errors found.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = process.argv[2] ?? "bounty/templates/session-ledger.json";
const pass = [];
const fail = [];
const warn = [];
const todo = [];

const ok = (m) => pass.push(m);
const no = (m) => fail.push(m);
const meh = (m) => warn.push(m);
const need = (m) => todo.push(m);

const LINE = "─".repeat(76);
const rule = (t) => console.log(`\n${LINE}\n${t}\n${LINE}`);

const isBlank = (v) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

let L;
try {
  L = JSON.parse(readFileSync(resolve(file), "utf8"));
} catch (e) {
  console.error(`\n❌ Could not read ${resolve(file)}\n   ${e.message}\n`);
  process.exit(1);
}

const g = (path, dflt = null) =>
  path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), L) ?? dflt;

/* ── 1. session header ───────────────────────────────────────────────── */
rule("1. SESSION HEADER");
const s = L.session ?? {};
const checks = [
  ["tester", s.tester],
  ["start_utc", s.start_utc],
  ["market_state_at_start", s.market_state_at_start],
  ["wallet", s.wallet],
];
checks.forEach(([k, v]) => (isBlank(v) ? need(`session.${k}`) : ok(`session.${k} = ${v}`)));

const isoOk = (t) => typeof t === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/.test(t);
if (isBlank(s.start_utc)) need("a UTC timestamp for the session start");
else if (!isoOk(s.start_utc)) meh(`session.start_utc "${s.start_utc}" is not ISO-8601 UTC (expected e.g. 2026-09-14T13:31:09Z)`);
else ok("session.start_utc is valid ISO-8601 UTC");

if (s.cluster_confirmed_in_wallet_dialog === true) ok("cluster was confirmed in the wallet dialog at connect time");
else if (s.cluster_confirmed_in_wallet_dialog === false) no("cluster was NOT confirmed in the wallet dialog — this is F-12; keep the screenshot");
else need("whether the wallet dialog named the cluster (F-12)");

/* ── 2. signatures ───────────────────────────────────────────────────── */
rule("2. SIGNATURES");
const txns = Array.isArray(L.transactions) ? L.transactions : [];
const B58 = /^[1-9A-HJ-NP-Za-km-z]{80,92}$/;
let sigNull = 0, sigBad = 0, sigOk = 0;

const collect = [];
const walk = (o, p = "") => {
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    const path = p ? `${p}.${k}` : k;
    if (k === "signature") collect.push([path, v]);
    else if (typeof v === "object") walk(v, path);
  }
};
walk(L);
collect.forEach(([p, v]) => {
  if (isBlank(v)) sigNull++;
  else if (!B58.test(String(v))) { sigBad++; no(`${p} does not look like a base58 signature: "${v}"`); }
  else sigOk++;
});
txns.forEach((t, i) => {
  const p = `transactions[${i}]`;
  if (isBlank(t.case_id)) no(`${p}.case_id missing`);
  if (isBlank(t.utc)) meh(`${p}.utc missing — timestamps make the evidence verifiable`);
  else if (!isoOk(t.utc)) meh(`${p}.utc not ISO-8601 UTC`);
  if (isBlank(t.signature)) {
    sigNull++;
    if (isBlank(t.error_string_verbatim) && isBlank(t.blocked_before_signing) && t.blocked_before_signing !== true)
      meh(`${p}: no signature and no stated blocker — record WHY it didn't sign`);
  } else if (!B58.test(String(t.signature))) no(`${p}.signature is not base58`);
  else sigOk++;
});
console.log(`  ${sigOk} valid · ${sigNull} null (blocked or not attempted) · ${sigBad} malformed`);
if (sigBad) no(`${sigBad} malformed signature(s) — re-copy from the wallet activity screen`);
if (sigNull && !sigBad) meh(`${sigNull} action(s) have no signature. That is fine IF each records why. "Blocked before signing" is a finding.`);

/* ── 3. cost basis reconciliation ────────────────────────────────────── */
rule("3. COST BASIS — did the fill match what the app said?");
const o = g("phase_2_buy.order") ?? {};
if (isBlank(o.usdc_spent) || isBlank(o.tokens_received)) {
  need("phase_2_buy.order: usdc_spent and tokens_received (one fill is enough)");
} else {
  const implied = o.usdc_spent / o.tokens_received;
  console.log(`  spent ${o.usdc_spent} USDC for ${o.tokens_received} tokens → implied price ${implied.toFixed(6)}`);
  if (isBlank(o.displayed_avg_cost)) {
    meh("the app's displayed average cost was not recorded — needed to test F-16");
  } else {
    const div = Math.abs(o.displayed_avg_cost - implied) / implied;
    console.log(`  displayed avg cost ${o.displayed_avg_cost} → divergence ${(div * 100).toFixed(3)}%`);
    if (div <= 0.005) ok(`cost basis reconciles (${(div * 100).toFixed(3)}% divergence — inside fee/rounding tolerance)`);
    else no(`cost basis does NOT reconcile: displayed ${o.displayed_avg_cost} vs implied ${implied.toFixed(6)} — ${(div * 100).toFixed(2)}% off. This is F-16; keep the screenshot.`);
  }
  if (o.ownership_language_before_fill === true) no("ownership language appeared BEFORE the fill — F-13 sub-finding; keep the screenshot");
  else if (o.ownership_language_before_fill === false) ok("no ownership language before the fill");
  else need("whether ownership language appeared before the fill");
}

/* ── 4. health factor arithmetic ─────────────────────────────────────── */
rule("4. HEALTH FACTOR — does the app's number match the published formula?");
const p3 = L.phase_3_borrow ?? {};
const pos = p3.position_if_opened ?? {};
if (isBlank(pos.debt) || isBlank(pos.collateral_value)) {
  need("phase_3_borrow.position_if_opened: debt + collateral (only if a loan opened)");
} else if (isBlank(pos.liquidation_threshold_pct) || isBlank(pos.health_factor_displayed)) {
  need("phase_3_borrow.position_if_opened: liquidation_threshold_pct and health_factor_displayed");
} else {
  const computed = (pos.collateral_value * (pos.liquidation_threshold_pct / 100)) / pos.debt;
  const delta = Math.abs(computed - pos.health_factor_displayed);
  console.log(`  HF = (${pos.collateral_value} × ${pos.liquidation_threshold_pct}%) ÷ ${pos.debt} = ${computed.toFixed(3)}`);
  console.log(`  displayed: ${pos.health_factor_displayed}`);
  if (delta <= 0.02) ok(`health factor matches the published formula (Δ ${delta.toFixed(3)})`);
  else no(`health factor does NOT match the formula: computed ${computed.toFixed(3)} vs displayed ${pos.health_factor_displayed}. A maths mismatch is more serious than a copy bug — screenshot it.`);
}

/* ── 5. the F-13 pattern ─────────────────────────────────────────────── */
rule("5. F-13 — capacity advertised vs capacity executable");
const cap = p3.capacity_test ?? {};
if (isBlank(cap.advertised_capacity)) {
  need("phase_3_borrow.capacity_test.advertised_capacity — this is the flagship retest");
} else if (isBlank(cap.amount_attempted)) {
  need("phase_3_borrow.capacity_test.amount_attempted");
} else {
  console.log(`  advertised ${cap.advertised_capacity} · attempted ${cap.amount_attempted} (${((cap.amount_attempted / cap.advertised_capacity) * 100).toFixed(0)}% of capacity)`);
  const rejectedWithinCapacity =
    cap.blocked_before_signing === true && cap.amount_attempted <= cap.advertised_capacity;
  if (rejectedWithinCapacity) {
    no("F-13 REPRODUCED — a request within the advertised capacity was rejected before signing.");
    if (!isBlank(cap.error_string_verbatim)) console.log(`     error: "${cap.error_string_verbatim}"`);
    if (!isBlank(cap.console_error)) console.log(`     console: "${cap.console_error}"`);
    if (isBlank(cap.error_string_verbatim)) meh("record the exact error string verbatim — it is the reproducible part");
  } else if (cap.reached_signing === true) {
    ok("a request within advertised capacity reached the signing flow — F-13 appears FIXED. Say so in the report.");
  } else {
    meh("outcome unclear — record reached_signing / blocked_before_signing explicitly");
  }
  if (!isBlank(cap.smaller_amount_attempted))
    console.log(`  smaller retry: ${cap.smaller_amount_attempted} → ${cap.smaller_amount_outcome || "(not recorded)"}`);
}
const disc = p3.disclosure ?? {};
const four = ["health_factor_shown", "liquidation_threshold_shown", "liquidation_price_shown", "liquidation_fee_shown"];
const found = four.filter((k) => disc[k] === true);
console.log(`\n  Borrow-screen disclosure: ${found.length}/4 of HF, threshold, liquidation price, liquidation fee`);
if (found.length === 4) ok("all four disclosed — F-05 / R4 resolved; credit the team and show the screenshot");
else if (found.length > 0 || four.some((k) => disc[k] === false)) {
  no(`only ${found.length}/4 disclosed — F-05 confirmed. Missing: ${four.filter((k) => disc[k] !== true).join(", ")}`);
} else need("phase_3_borrow.disclosure — answer all four (this is the flagship UX finding)");

/* ── 6. off-hours probe ──────────────────────────────────────────────── */
rule("6. F-03 — off-hours borrowing");
const oh = L.phase_5_offhours ?? {};
if (isBlank(oh.probe_utc)) {
  need("phase_5_offhours.probe_utc — run this with the US market closed (after 21:00 WAT, or a weekend)");
} else {
  if (oh.could_increase_debt === false) ok("debt increase was correctly restricted while the cash market was closed — F-03 mitigated; say so");
  else if (oh.could_increase_debt === true) no("debt increase was permitted off-hours against a stale close — F-03 CONFIRMED as designed. Note the staleness and keep the screenshot.");
  else need("phase_5_offhours.could_increase_debt");
  if (!isBlank(oh.price_staleness_minutes)) console.log(`  displayed price was ${oh.price_staleness_minutes} minutes stale`);
  else meh("record price_staleness_minutes — it quantifies the 'reduced frequency' wording in F-17");
  if (oh.market_closed_notice_shown === false) no("no market-closed notice anywhere on the borrow screen (F-03 UX)");
}

/* ── 7. earn / lending ───────────────────────────────────────────────── */
rule("7. F-01 / F-07 — the lending flow");
const e = L.phase_6_earn ?? {};
if (isBlank(e.state)) need("phase_6_earn.state (visible-active / visible-inert / hidden / absent)");
else {
  ok(`earn state: ${e.state}`);
  const apys = [e.senior_apy_shown, e.junior_apy_shown].filter((v) => !isBlank(v));
  if (apys.length) {
    console.log(`  APY shown in app: senior ${e.senior_apy_shown ?? "—"} · junior ${e.junior_apy_shown ?? "—"}`);
    if (!isBlank(e.junior_apy_shown)) {
      const j = parseFloat(String(e.junior_apy_shown).replace(/[^\d.]/g, ""));
      if (isFinite(j)) {
        if (j > 27) no(`app shows a junior APY of ${j}%, above the Terms' binding 24–27% range — F-01 gains a third number`);
        else ok(`${j}% sits inside the Terms' 24–27% range — F-01 narrows for junior APY specifically`);
      }
    }
  } else meh("no APY figure recorded — if the app showed one it belongs in F-01");
  if (e.junior_45day_notice_disclosed === false) no("45-day junior notice not disclosed before deposit (F-08)");
  if (e.instant_exit_haircut_disclosed === false) no("0–3% instant-exit haircut not disclosed (F-08)");
}

/* ── 8. coverage ─────────────────────────────────────────────────────── */
rule("8. COVERAGE — the six submission-critical questions");
const six = [
  ["1. Access: passcode + cluster disclosure (F-12)", !isBlank(s.passcode_required) && s.cluster_confirmed_in_wallet_dialog !== null],
  ["2. One fill: spend → receive + signature (F-16)", !isBlank(o.usdc_spent) && !isBlank(o.tokens_received) && !isBlank(o.signature)],
  ["3. Capacity advertised vs executable (F-13)", !isBlank(cap.advertised_capacity) && (cap.reached_signing !== null || cap.blocked_before_signing !== null)],
  ["4. Liquidation price + fee before signing (F-05)", four.every((k) => typeof disc[k] === "boolean")],
  ["5. Off-hours debt increase probe (F-03)", oh.could_increase_debt !== null && oh.could_increase_debt !== undefined],
  ["6. Earn state + any APY shown (F-01/F-07)", !isBlank(e.state)],
];
six.forEach(([label, done]) => console.log(`  ${done ? "✅" : "⬜"} ${label}`));
const doneCount = six.filter(([, d]) => d).length;
console.log(`\n  ${doneCount}/6 answered.`);
if (doneCount === 6) ok("all six critical questions answered — the session appendix can be written");
else if (doneCount >= 3) meh(`${6 - doneCount} still open — the report is publishable regardless, but each one tightens a finding`);
else no(`only ${doneCount}/6 — the bounty requires genuine platform interaction; prioritise Phase 3`);

/* ── summary ─────────────────────────────────────────────────────────── */
rule("SUMMARY");
if (fail.length) { console.log(`\n❌ ${fail.length} problem(s) to resolve:\n`); fail.forEach((m) => console.log(`   • ${m}`)); }
if (warn.length) { console.log(`\n⚠️  ${warn.length} thing(s) worth recording:\n`); warn.forEach((m) => console.log(`   • ${m}`)); }
if (pass.length) { console.log(`\n✅ ${pass.length} confirmed:\n`); pass.forEach((m) => console.log(`   • ${m}`)); }
if (todo.length) { console.log(`\n⬜ still to fill in (${todo.length}):\n`); todo.forEach((m) => console.log(`   • ${m}`)); }

console.log("");
process.exit(fail.length ? 1 : 0);
