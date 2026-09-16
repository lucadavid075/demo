"use client";

import { useMemo, useState } from "react";

/**
 * LiquidationLab — the risk panel Spout's borrow screen does not have (recommendation R4).
 *
 * Same arithmetic as bounty/scripts/spout-model.mjs, which reproduces Spout's own
 * published NVDA worked example exactly. Inputs are the borrower's position; the
 * liquidation buffer is the asset parameter Spout does not publish per asset.
 */

type Liq = {
  sharesSold: number;
  proceeds: number;
  feeUsd: number;
  sharesLeft: number;
  debtLeft: number;
  hfBefore: number;
  fullWipe: boolean;
};

function step(shares: number, debt: number, price: number, buffer: number, target: number): Liq | null {
  const lt = 0.5 + buffer;
  const hf = (shares * price * lt) / debt;
  if (hf >= 1 || shares <= 0) return null;

  // published: the fee equals the buffer, charged on the collateral sold
  const fee = buffer;
  let n = (debt - target * shares * price) / (price * (1 - fee) - target * price);
  let fullWipe = false;
  if (!isFinite(n) || n <= 0) return null;
  if (n >= shares) {
    n = shares;
    fullWipe = true;
  }
  const proceeds = n * price;
  const feeUsd = proceeds * fee;
  const net = proceeds - feeUsd;
  const debtLeft = Math.max(0, debt - net);
  return { sharesSold: n, proceeds, feeUsd, sharesLeft: shares - n, debtLeft, hfBefore: hf, fullWipe };
}

/** Walk a monotone drawdown to `drop`, applying every partial liquidation on the way, then recover to entry. */
function walk(opts: {
  shares: number;
  entry: number;
  ltv: number;
  buffer: number;
  drop: number;
  assignmentCost: number;
  roundTrip: number;
}) {
  const { shares, entry, ltv, buffer, drop, assignmentCost, roundTrip } = opts;
  let s = shares;
  let debt = shares * entry * ltv;
  let events = 0;
  let fees = 0;
  const floor = entry * (1 - drop);

  for (let i = 1; i <= 60; i++) {
    const price = entry - (entry - floor) * (i / 60);
    const r = step(s, debt, price, buffer, ltv);
    if (r) {
      s = r.sharesLeft;
      debt = r.debtLeft;
      events++;
      fees += r.feeUsd;
    }
  }

  const debt0 = shares * entry * ltv;
  const equityAtRecovery = s * entry - debt - assignmentCost * shares * entry - roundTrip * shares * entry;
  const marginEquity = shares * entry - debt0 * 1.065;
  const costPct = ((shares * entry - debt0 - equityAtRecovery) / debt0) * 100;
  return { sharesLeft: s, events, fees, equityAtRecovery, marginEquity, costPct, ddToFirst: (1 - ltv / (0.5 + buffer)) * 100 };
}

const PRESETS = [
  { label: "Steadiest collateral (docs min)", buffer: 0.04 },
  { label: "Terms minimum", buffer: 0.075 },
  { label: "NVDA (docs example)", buffer: 0.088 },
  { label: "Most volatile (docs max)", buffer: 0.125 },
  { label: "Terms maximum", buffer: 0.2 },
];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function LiquidationLab() {
  const [bufferIdx, setBufferIdx] = useState(2);
  const [entry, setEntry] = useState(120);
  const [shares, setShares] = useState(100);
  const [ltv, setLtv] = useState(50);
  const [marginRate, setMarginRate] = useState(6.5);
  const [drop, setDrop] = useState(30);

  const buffer = PRESETS[bufferIdx].buffer;
  const assignment = 0.005; // published: ~0.5% annualised across the portfolio
  const roundTrip = 0.002 * 2; // docs mint/redeem 0.20% each way

  const base = useMemo(
    () => ({ shares, entry, ltv: ltv / 100, buffer, assignmentCost: assignment, roundTrip }),
    [shares, entry, ltv, buffer]
  );

  // drawdown at which HF reaches 1.00: 1 − LTV ÷ liquidation threshold
  const ddToFirst = (1 - ltv / 100 / (0.5 + buffer)) * 100;
  const debt0 = shares * entry * (ltv / 100);

  const scenarios = [10, 15, 20, 30, 40, 50].map((d) => ({
    d,
    ...walk({ ...base, drop: d / 100 }),
  }));

  const current = walk({ ...base, drop: drop / 100 });
  const marginEquity = shares * entry - debt0 * (1 + marginRate / 100);
  const holdingEquity = shares * entry;

  const tone =
    current.costPct < marginRate
      ? "text-emerald-700"
      : "text-red-700";

  return (
    <div className="border border-ink/15 bg-parchmentCard">
      <div className="border-b border-ink/10 px-6 py-5">
        <h3 className="font-display text-2xl font-medium">Liquidation lab</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#3E4658]">
          What your 50% LTV position actually does on the way down — and what it costs even when the
          stock comes all the way back. Arithmetic reproduced from Spout&rsquo;s published
          liquidation example.
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,300px)_1fr]">
        {/* inputs */}
        <div className="border-b border-ink/10 px-6 py-6 md:border-b-0 md:border-r">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-goldDark">
            Asset liquidation buffer
          </label>
          <select
            value={bufferIdx}
            onChange={(e) => setBufferIdx(Number(e.target.value))}
            className="mt-2 w-full border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            {PRESETS.map((p, i) => (
              <option key={p.label} value={i}>
                {(p.buffer * 100).toFixed(1)}% — {p.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-[#5C6478]">
            = the fee you pay if liquidated, and the gap between 50% LTV and the liquidation
            threshold. Not published per asset.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Field label="Entry price" value={entry} onChange={setEntry} prefix="$" />
            <Field label="Shares" value={shares} onChange={setShares} />
            <Field label="Your LTV" value={ltv} onChange={setLtv} suffix="%" />
            <Field label="Alt. margin rate" value={marginRate} onChange={setMarginRate} suffix="%" step={0.5} />
          </div>

          <label className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-goldDark">
            Drawdown, then full recovery: {drop}%
          </label>
          <input
            type="range"
            min={5}
            max={55}
            value={drop}
            onChange={(e) => setDrop(Number(e.target.value))}
            className="mt-2 w-full accent-[#C9A227]"
          />
        </div>

        {/* output */}
        <div className="px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              k="Liquidation distance"
              v={`${ddToFirst.toFixed(1)}%`}
              s={`sell begins below ${money(entry * (1 - ddToFirst / 100))}`}
              tone={ddToFirst < 12 ? "warn" : "ok"}
            />
            <Stat k="Liquidations on this path" v={String(current.events)} s={current.events ? "forced, no notice" : "none — benign path"} tone={current.events ? "warn" : "ok"} />
            <Stat k="Shares left of " v={`${current.sharesLeft.toFixed(1)} / ${shares}`} s={`${(100 - (current.sharesLeft / shares) * 100).toFixed(0)}% permanently sold`} tone={current.sharesLeft < shares * 0.85 ? "warn" : "ok"} />
            <Stat k="Liquidation fees paid" v={money(current.fees)} s="charged on collateral sold" tone="warn" />
          </div>

          <div className="mt-6 border-t border-ink/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-goldDark">
              All-in cost of the {money(debt0)} loan, stock back at entry
            </p>
            <div className="mt-3 space-y-2">
              <Bar label="This Spout position" pct={current.costPct} tone="bad" note={`${current.costPct.toFixed(1)}% · equity ${money(current.equityAtRecovery)}`} />
              <Bar label={`Alternative margin loan @ ${marginRate}%`} pct={marginRate} tone="neutral" note={`${marginRate.toFixed(1)}% · equity ${money(marginEquity)}`} />
              <Bar label="Buy and hold, no loan" pct={0} tone="good" note={`0% · equity ${money(holdingEquity)}`} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${tone}`}>
              {current.costPct < marginRate
                ? `0% still wins here — the structure costs ${(marginRate - current.costPct).toFixed(1)} points less than the margin loan on this path.`
                : `The 0% loan costs ${(current.costPct - marginRate).toFixed(1)} points MORE than a ${marginRate}% margin loan on this path.`}
            </p>
          </div>

          <div className="mt-6 overflow-x-auto border-t border-ink/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-goldDark">
              Every drawdown, then a full recovery to entry
            </p>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#5C6478]">
                  <th className="py-2 pr-4 font-semibold">Drawdown</th>
                  <th className="py-2 pr-4 font-semibold">Events</th>
                  <th className="py-2 pr-4 font-semibold">Shares left</th>
                  <th className="py-2 pr-4 font-semibold">Equity at recovery</th>
                  <th className="py-2 font-semibold">All-in cost</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.d} className="border-t border-ink/10">
                    <td className="py-2 pr-4 font-semibold">−{s.d}%</td>
                    <td className="py-2 pr-4">{s.events}</td>
                    <td className="py-2 pr-4">{s.sharesLeft.toFixed(1)}</td>
                    <td className="py-2 pr-4">{money(s.equityAtRecovery)}</td>
                    <td className={`py-2 font-semibold ${s.costPct > marginRate ? "text-red-700" : "text-emerald-700"}`}>
                      {s.costPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 bg-ink px-6 py-5 text-sm leading-relaxed text-parchment/75">
        <span className="font-semibold text-gold">Why this panel matters.</span> Spout publishes the
        liquidation buffer only in the abstract (&ldquo;roughly 4% on the steadiest collateral to
        about 12.5% on the most volatile&rdquo;) and the binding Terms give a different range again
        (7.5%&ndash;20%), with no per-asset table anywhere. Until a borrower can see the price at
        which their shares start being sold &mdash; and the fee charged when it happens &mdash; the
        headline &ldquo;0% interest&rdquo; is the only number in the decision.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step: stp = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#5C6478]">{label}</span>
      <span className="mt-1 flex items-center border border-ink/20 bg-white px-2">
        {prefix && <span className="text-sm text-[#5C6478]">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={stp}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent px-1 py-2 text-sm outline-none"
        />
        {suffix && <span className="text-sm text-[#5C6478]">{suffix}</span>}
      </span>
    </label>
  );
}

function Stat({ k, v, s, tone }: { k: string; v: string; s: string; tone: "ok" | "warn" }) {
  return (
    <div className="border border-ink/10 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5C6478]">{k}</p>
      <p className={`mt-1 font-display text-2xl font-medium ${tone === "warn" ? "text-red-800" : "text-ink"}`}>{v}</p>
      <p className="mt-1 text-xs leading-snug text-[#5C6478]">{s}</p>
    </div>
  );
}

function Bar({ label, pct, tone, note }: { label: string; pct: number; tone: "good" | "neutral" | "bad"; note: string }) {
  const w = Math.min(100, Math.max(2, pct * 5));
  const color = tone === "bad" ? "bg-red-700/80" : tone === "neutral" ? "bg-ink/40" : "bg-emerald-700/70";
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-[#5C6478]">{note}</span>
      </div>
      <div className="mt-1 h-2 w-full bg-ink/10">
        <div className={`h-2 ${color}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
