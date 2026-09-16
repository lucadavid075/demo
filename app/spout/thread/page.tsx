import type { Metadata } from "next";
import Link from "next/link";
import { thread } from "@/lib/teardown";

export const metadata: Metadata = {
  title: "Spout Finance teardown — the thread",
  description:
    "The 19-post version of the Spout Finance beta teardown: the 0% borrowing model, what a liquidation really costs, and the parameters where the docs and the binding Terms disagree.",
};

export default function ThreadPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-ink/10 bg-parchment/90 backdrop-blur">
        <div className="mx-auto flex max-w-[820px] items-center justify-between px-6 py-3 text-sm">
          <Link href="/spout" className="text-[#5C6478] no-underline hover:text-ink">
            ← Full teardown
          </Link>
          <span className="text-xs uppercase tracking-wide text-goldDark">{thread.length} posts</span>
        </div>
      </div>

      <main className="mx-auto max-w-[820px] px-6 py-14">
        <h1 className="font-display text-[clamp(28px,4.4vw,48px)] font-medium leading-tight">
          Spout Finance, in {thread.length} posts
        </h1>
        <p className="mt-4 max-w-[640px] text-lg leading-relaxed text-[#3E4658]">
          The whole teardown, compressed for X. Every post is inside the 280-character limit —
          verified by <code className="font-mono text-sm">node bounty/scripts/check-thread.mjs</code>.
        </p>

        <div className="mt-10 space-y-4">
          {thread.map((post, i) => {
            const len = [...post].length;
            return (
              <article key={i} className="border border-ink/12 bg-parchmentCard px-5 py-4">
                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-[#5C6478]">
                  <span className="font-semibold text-goldDark">
                    {i + 1}/{thread.length}
                  </span>
                  <span className="font-mono">{len}/280</span>
                </div>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{post}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 border border-ink/12 bg-parchmentCard px-6 py-6">
          <h2 className="font-display text-xl font-medium">Posting notes</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#3E4658]">
            <li>• Post 1, 5 and 9 are the highest-value attachment slots: the borrow screen, the drawdown table, and the docs-vs-Terms table.</li>
            <li>• Do not soften post 7. The quote-and-contradiction structure is the reason it travels — and both quotes are Spout&rsquo;s own.</li>
            <li>• If Spout fixes something after publication, reply rather than edit. &ldquo;Fixed since publication&rdquo; is the strongest credibility signal for the next review.</li>
            <li>• Reproduce the numbers before posting. If one moves, change the post, not the script.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            href="/spout"
            className="border border-ink px-6 py-3 font-semibold no-underline hover:bg-ink hover:text-parchment"
          >
            Full teardown &amp; liquidation lab
          </Link>
          <a
            href="https://spout.finance/docs/introduction"
            className="border border-ink/25 px-6 py-3 font-semibold text-[#3E4658] no-underline hover:border-ink"
          >
            Spout&rsquo;s docs ↗
          </a>
          <a
            href="https://spout.finance/terms"
            className="border border-ink/25 px-6 py-3 font-semibold text-[#3E4658] no-underline hover:border-ink"
          >
            Spout&rsquo;s Terms ↗
          </a>
        </div>
      </main>
    </div>
  );
}
