import type { Metadata } from "next";
import Link from "next/link";
import LiquidationLab from "@/components/spout/LiquidationLab";
import {
  meta,
  verdict,
  criteria,
  findings,
  reconciliation,
  buffers,
  costRows,
  drawdowns,
  recommendations,
} from "@/lib/teardown";

export const metadata: Metadata = {
  title: "Spout Finance beta teardown — the 0% loan is real, the risk transfer is not disclosed",
  description:
    "An independent critical teardown of Spout Finance's beta: the covered-call borrowing model, what a liquidation really costs, the eleven parameters where the docs and the binding Terms disagree, and four fixes before launch.",
};

const sevStyle: Record<string, string> = {
  P1: "bg-red-700 text-white",
  P2: "bg-gold text-ink",
  P3: "bg-ink/15 text-ink",
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-ink/20 px-1.5 py-0.5 font-mono text-[10px] tracking-tight text-[#5C6478]">
      {children}
    </span>
  );
}

function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="font-mono text-xs text-goldDark">{n}</span>
      <h2 className="font-display text-[clamp(24px,3.4vw,40px)] font-medium leading-tight">{children}</h2>
    </div>
  );
}

export default function SpoutTeardown() {
  const p1 = findings.filter((f) => f.sev === "P1").length;
  const p2 = findings.filter((f) => f.sev === "P2").length;
  const p3 = findings.filter((f) => f.sev === "P3").length;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-ink/10 bg-parchment/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3">
          <Link href="/" className="text-sm text-[#5C6478] no-underline hover:text-ink">
            ← Home
          </Link>
          <div className="flex items-center gap-4 text-xs tracking-wide">
            <span className="font-semibold uppercase text-goldDark">Independent beta teardown</span>
            <Link href="/spout/thread" className="text-[#5C6478] no-underline hover:text-ink">
              Thread
            </Link>
          </div>
        </div>
      </div>

      {/* hero */}
      <header className="relative mx-auto max-w-[1100px] px-6 pt-16 pb-12">
        <div className="beam" />
        <div className="relative">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-goldDark">
            Spout Finance · Solana devnet beta · {meta.date}
          </p>
          <h1 className="mt-5 max-w-[900px] font-display text-[clamp(32px,5.2vw,64px)] font-medium leading-[1.05] tracking-tight">
            The 0% loan is real.
            <br />
            <span className="italic text-[#5A4712]">The risk transfer is what nobody tells you.</span>
          </h1>
          <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-[#3E4658]">{meta.standfirst}</p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#5C6478]">
            <span>
              <strong className="font-semibold text-ink">17 findings</strong> · {p1} P1 · {p2} P2 · {p3} P3
            </span>
            <span>
              <strong className="font-semibold text-ink">11</strong> doc/Terms divergences
            </span>
            <span>
              Sources checked <strong className="font-semibold text-ink">{meta.verifiedOn}</strong>
            </span>
          </div>

          <p className="mt-8 max-w-[720px] border-l-2 border-gold pl-4 text-sm leading-relaxed text-[#5C6478]">
            {meta.disclosure}
          </p>
        </div>
      </header>

      {/* verdict */}
      <section className="mx-auto max-w-[1100px] px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          {verdict.map((v) => (
            <div key={v.k} className="border border-ink/12 bg-parchmentCard px-6 py-5">
              <h3 className="font-display text-xl font-medium">{v.k}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3E4658]">{v.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-ink/12 bg-parchmentCard">
          <div className="border-b border-ink/10 px-6 py-4">
            <h3 className="font-display text-lg font-medium">Against the four evaluation criteria</h3>
          </div>
          <div className="divide-y divide-ink/10">
            {criteria.map((c) => (
              <div key={c.c} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{c.c}</span>
                  <span className="font-mono text-xs text-goldDark">{c.w}</span>
                </div>
                <p className="text-[15px] leading-relaxed text-[#3E4658]">{c.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="border-y border-ink/10 bg-ink text-parchment">
        <div className="mx-auto max-w-[1100px] px-6 py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">The mechanic</p>
          <h2 className="mt-4 max-w-[760px] font-display text-[clamp(24px,3.4vw,40px)] font-medium leading-tight">
            The borrower does not fund the lender. The option buyer does.
          </h2>
          <p className="mt-5 max-w-[720px] text-[17px] leading-relaxed text-parchment/75">
            Spout writes weekly covered calls against deposited tokenized equities through a regulated
            US broker. The premium &mdash; paid by an unrelated third party &mdash; funds the lending
            pool, split into an 85% senior tranche and a 15% junior tranche. The borrower pays 0%
            interest and, in exchange, gives up the upside above each week&rsquo;s strike.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { k: "Option buyers", v: "pay the premium", d: "Pension hedging demand and retail call buying push implied volatility above realised. The variance risk premium is real and well documented." },
              { k: "Lenders", v: "collect it", d: "80% of gross premium after a 20% protocol fee. Senior targets ~9% with a 7% priority; junior targets ~32% (24–27% in the binding Terms) as first-loss." },
              { k: "Borrowers", v: "pay in convexity", d: "0% interest, non-recourse, no maturity. The cost is the capped upside and the forced sale in a drawdown." },
              { k: "The protocol", v: "takes 20%", d: "Funds operations and an insurance fund targeting 2% of pool value — seeded at launch with $50k–$100k." },
            ].map((x) => (
              <div key={x.k} className="border border-parchment/15 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold">{x.k}</p>
                <p className="mt-2 font-display text-xl font-medium">{x.v}</p>
                <p className="mt-2 text-sm leading-relaxed text-parchment/65">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the cost */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle n="01">What the 0% actually costs</SectionTitle>
        <p className="max-w-[760px] text-[17px] leading-relaxed text-[#3E4658]">
          I rebuilt Spout&rsquo;s own worked example from its published parameters first, and it
          reconciles exactly: 21.42 shares sold, $2,184.47 of proceeds, a $192.23 fee, debt down to
          $4,007.77, health factor back to 1.18. Their arithmetic is honest. The problem is what the
          example leaves out &mdash; the year that follows.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border border-ink/12 bg-parchmentCard">
            <div className="border-b border-ink/10 px-5 py-3">
              <h3 className="font-display text-lg font-medium">$12,000 collateral · $6,000 borrowed · stock ends at entry</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#5C6478]">
                  <th className="px-5 py-3 font-semibold">Path</th>
                  <th className="px-5 py-3 text-right font-semibold">Equity</th>
                  <th className="px-5 py-3 text-right font-semibold">All-in</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((r) => (
                  <tr key={r.path} className={`border-t border-ink/10 ${r.tone === "bad" ? "bg-red-50" : ""}`}>
                    <td className="px-5 py-3 leading-snug">{r.path}</td>
                    <td className="px-5 py-3 text-right font-medium">${r.equity.toLocaleString()}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${r.tone === "bad" ? "text-red-700" : ""}`}>
                      {r.cost.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-ink/12 bg-parchmentCard">
            <div className="border-b border-ink/10 px-5 py-3">
              <h3 className="font-display text-lg font-medium">Drawdown, then a full recovery to entry</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#5C6478]">
                  <th className="px-5 py-3 font-semibold">Drawdown</th>
                  <th className="px-5 py-3 text-right font-semibold">Events</th>
                  <th className="px-5 py-3 text-right font-semibold">Shares left</th>
                  <th className="px-5 py-3 text-right font-semibold">Equity</th>
                  <th className="px-5 py-3 text-right font-semibold">All-in</th>
                </tr>
              </thead>
              <tbody>
                {drawdowns.map((r) => (
                  <tr key={r.dd} className="border-t border-ink/10">
                    <td className="px-5 py-3 font-semibold">{r.dd}</td>
                    <td className="px-5 py-3 text-right">{r.events}</td>
                    <td className="px-5 py-3 text-right">{r.shares.toFixed(1)}</td>
                    <td className="px-5 py-3 text-right font-medium">${r.equity.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-semibold text-red-800">{r.cost.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-ink/10 px-5 py-4 text-sm leading-relaxed text-[#3E4658]">
              A &minus;30% year in a single name is not a tail event: NVDA, MSTR and SMCI &mdash; three
              of the eleven launch assets &mdash; have each done it more than once in three years. A
              holder keeps 100 shares through the same round trip. The borrower keeps 61 &mdash; and
              finishes $615 worse off than a borrower paying the 13% margin rate Spout puts on its own
              homepage.
            </p>
          </div>
        </div>

        <blockquote className="mt-8 border-l-2 border-gold bg-parchmentCard px-6 py-5">
          <p className="font-display text-xl italic leading-relaxed">
            &ldquo;The protocol does not introduce any new failure mode that does not already exist for
            someone who simply holds the underlying share.&rdquo;
          </p>
          <p className="mt-3 text-sm text-[#5C6478]">— Spout&rsquo;s docs. Their own Terms say the opposite: &ldquo;Liquidation can occur without prior notice.&rdquo;</p>
        </blockquote>
      </section>

      {/* lab */}
      <section className="border-y border-ink/10 bg-[#EFE8DA]">
        <div className="mx-auto max-w-[1100px] px-6 py-16">
          <SectionTitle n="02">The panel the borrow screen should have</SectionTitle>
          <p className="max-w-[760px] text-[17px] leading-relaxed text-[#3E4658]">
            Spout publishes the liquidation buffer only in the abstract, the binding Terms give a
            different range, and no per-asset liquidation threshold appears anywhere on the public
            surface. So I built the missing panel. Change the inputs and watch what the structure does
            to a borrower.
          </p>
          <div className="mt-8">
            <LiquidationLab />
          </div>
        </div>
      </section>

      {/* reconciliation */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle n="03">The finding you can verify without a beta code</SectionTitle>
        <p className="max-w-[760px] text-[17px] leading-relaxed text-[#3E4658]">
          Open Spout&rsquo;s documentation in one tab and its Terms of Service in another. They
          describe two different products. Every row below was live on {meta.verifiedOn}.
        </p>

        <div className="mt-8 overflow-x-auto border border-ink/12 bg-parchmentCard">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-ink/5">
              <tr className="text-left text-xs uppercase tracking-wide text-[#5C6478]">
                <th className="px-5 py-3 font-semibold">Parameter</th>
                <th className="px-5 py-3 font-semibold">The documentation says</th>
                <th className="px-5 py-3 font-semibold">The binding Terms say</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.map((r) => (
                <tr key={r.p + r.d} className="border-t border-ink/10 align-top">
                  <td className="px-5 py-3 font-medium leading-snug">{r.p}</td>
                  <td className="px-5 py-3 leading-snug text-[#3E4658]">{r.d}</td>
                  <td className="px-5 py-3 leading-snug text-[#3E4658]">{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { k: "Same fee, three numbers", v: "The lending withdrawal fee is 0% on one docs page, 0.20% on another, and 1% in the Terms — all on Spout's own site." },
            { k: "Same product, two yield targets", v: "A lender comparing a ~32% junior target against a binding 24–27% range is comparing different products." },
            { k: "Same protection, opposite claims", v: "\"SIPC-covered broker-dealer\" in the FAQ; §9.8 tells you to assume SIPC protection does not apply at all." },
          ].map((x) => (
            <div key={x.k} className="border-l-2 border-gold bg-parchmentCard px-5 py-4">
              <p className="font-medium">{x.k}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#3E4658]">{x.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tail */}
      <section className="border-y border-ink/10 bg-ink text-parchment">
        <div className="mx-auto max-w-[1100px] px-6 py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">The tail</p>
          <h2 className="mt-4 max-w-[820px] font-display text-[clamp(24px,3.4vw,40px)] font-medium leading-tight">
            Three published facts that are fine separately and dangerous together.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", k: "The loan is non-recourse", d: "Your maximum loss is capped at the collateral you posted (§7.2). There is no documented right for the protocol to call the loan, and no maturity." },
              { n: "02", k: "The oracle slows down off-hours", d: "Prices update “at reduced frequency during off-hours” in Spout's own words, because the underlying equities only trade during market sessions." },
              { n: "03", k: "Liquidations can only execute at the open", d: "The shares are real shares at a US broker-dealer. A weekend gap is priced less accurately, cannot be sold into, and cannot be recovered from the borrower." },
            ].map((x) => (
              <div key={x.n}>
                <p className="font-mono text-xs text-gold">{x.n}</p>
                <h3 className="mt-2 font-display text-xl font-medium">{x.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-parchment/70">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-[820px] border-t border-parchment/15 pt-6 text-[16px] leading-relaxed text-parchment/80">
            The insurance fund targets 2% of pool value and is seeded at launch with $50k&ndash;$100k.
            A $10m lending pool supports roughly $20m of collateral at 50% LTV, so a 10% gap across the
            book is a $2m event &mdash; larger than the entire fund target. Meanwhile the published
            protection is a Monte Carlo line: &ldquo;positive net returns in over 99% of simulated
            years.&rdquo; On a strategy that sells volatility for a living, that is not a risk metric.
            It is a description of the skew.
          </p>
        </div>
      </section>

      {/* findings */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle n="04">Findings</SectionTitle>
        <p className="mb-8 max-w-[760px] text-[17px] leading-relaxed text-[#3E4658]">
          Every claim is tagged by how it was established:{" "}
          <Tag>DOC</Tag> public documentation · <Tag>TERMS</Tag> binding legal terms ·{" "}
          <Tag>MODEL</Tag> reproducible arithmetic · <Tag>TEST</Tag> executed on devnet ·{" "}
          <Tag>EXT</Tag> attributed third party · <Tag>HYP</Tag> hypothesis with a test attached.
        </p>

        <div className="space-y-3">
          {findings.map((f) => (
            <div key={f.id} className="grid gap-3 border border-ink/12 bg-parchmentCard px-5 py-4 sm:grid-cols-[92px_1fr]">
              <div className="flex items-start gap-2 sm:flex-col sm:gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-bold ${sevStyle[f.sev]}`}>{f.sev}</span>
                <span className="font-mono text-[11px] text-[#5C6478]">{f.id}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-medium leading-snug">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#3E4658]">{f.body}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* recommendations */}
      <section className="border-y border-ink/10 bg-[#EFE8DA]">
        <div className="mx-auto max-w-[1100px] px-6 py-16">
          <SectionTitle n="05">What to fix, ranked</SectionTitle>
          <div className="overflow-x-auto border border-ink/12 bg-parchmentCard">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-ink/5">
                <tr className="text-left text-xs uppercase tracking-wide text-[#5C6478]">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Recommendation</th>
                  <th className="px-5 py-3 font-semibold">Why</th>
                  <th className="px-5 py-3 text-center font-semibold">Effort</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r) => (
                  <tr key={r.n} className="border-t border-ink/10 align-top">
                    <td className="px-5 py-3 font-mono text-xs text-goldDark">{r.n}</td>
                    <td className="px-5 py-3 font-medium leading-snug">{r.t}</td>
                    <td className="px-5 py-3 leading-snug text-[#3E4658]">{r.w}</td>
                    <td className="px-5 py-3 text-center">{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* method + verdict */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <SectionTitle n="06">Verdict, method and limits</SectionTitle>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[17px] leading-relaxed text-[#3E4658]">
              Spout has built something real: the first version of tokenized equities I would actually
              borrow against, with a yield source that is not a token printing press, and maths that
              reconciles when you check it by hand. In the benign case the economics genuinely beat a
              margin loan &mdash; by a wide margin against retail rates, and by a defensible one
              against institutional rates.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-[#3E4658]">
              What the 0% headline hides is a trade: you sell the upside above a weekly strike, and you
              accept that the protocol will sell your shares for you at the worst possible moment,
              without telling you first. That is a reasonable trade for some portfolios. It is not the
              trade the marketing describes.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-[#3E4658]">
              Four changes &mdash; a cure window, one source of truth, a liquidation-distance panel, and
              a page of honest language &mdash; and this stops being a clever frame and becomes a
              defensible product.
            </p>
          </div>
          <div className="border border-ink/12 bg-parchmentCard px-6 py-6">
            <h3 className="font-display text-lg font-medium">What is not claimed</h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#3E4658]">
              <li>• No custody, Proof of Reserve, broker or audit verification. The testnet terms themselves describe the environment as unaudited or only partially audited, with all data simulated.</li>
              <li>• No live-market performance claim. All on-chain activity used valueless devnet assets.</li>
              <li>• The off-hours oracle discussion is an inference from documented design, not an observed exploit.</li>
              <li>• The model is arithmetic on published parameters. It prices the structure; it does not forecast returns.</li>
              <li>• Nothing here is legal, investment or tax advice.</li>
            </ul>
            <h3 className="mt-6 font-display text-lg font-medium">Reproduce it</h3>
            <pre className="mt-2 overflow-x-auto border border-ink/15 bg-ink px-4 py-3 font-mono text-xs text-parchment/85">
{`node bounty/scripts/spout-model.mjs
node bounty/scripts/check-thread.mjs`}
            </pre>
            <p className="mt-3 text-sm leading-relaxed text-[#5C6478]">
              Every input is a figure Spout published; the derivations are in the comments. The full
              finding log, test plan, evidence ledger and source quotes live in <code className="font-mono text-xs">/bounty</code>.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-inkDeep px-6 py-12 text-parchment/60">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 text-sm">
          <span>Independent beta teardown · {meta.date} · not affiliated with Spout Finance</span>
          <div className="flex gap-6">
            <Link href="/spout/thread" className="no-underline hover:text-parchment">
              X thread →
            </Link>
            <Link href="/" className="no-underline hover:text-parchment">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
