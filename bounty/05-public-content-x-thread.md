# X / Twitter thread — Spout Finance beta teardown

**19 posts. Every post is under 280 characters (verified by `scripts/check-thread.mjs`).**
Post 1 is the hook; post 19 carries the link. Suggested attachments in `[brackets]`.

Post this **after** completing at least the acquisition and borrow tests in
`03-test-plan-and-ledger.md`, and paste those results into the appendix of the long-form piece.

---

**1/19**
Spout Finance lets you borrow against tokenized US stocks at 0% interest.

I spent a week stress-testing their beta.

The 0% is real. It's also not the cost that matters.

A teardown, with maths you can run yourself 🧵

`[attach: hero screenshot of the borrow screen]`

---

**2/19**
The mechanics, honestly stated:

You deposit tokenized equities. The protocol writes weekly covered calls against them via a regulated US broker. The premium — paid by *option buyers* — funds the lenders.

Your collateral does the work. It is not a token subsidy.

---

**3/19**
First, credit: their maths checks out.

I rebuilt their NVDA liquidation example from published parameters — 21.42 shares sold, $192.23 fee, debt to $4,007, HF back to 1.18.

Reconciles exactly. Their tranche waterfall too, to the cent.

---

**4/19**
But the fee isn't the cost. Convexity is.

Max 50% LTV. Stock falls 15%. The protocol sells 21 of your 100 shares at the bottom. Stock then FULLY recovers.

You are $578 permanently poorer — 9.6% of everything you borrowed.

And you paid 0% interest.

---

**5/19**
Deeper drawdowns, then full recovery to entry:

−15% → 78.6 shares left, $5,314 equity
−30% → 61.4 shares, $4,605
−45% → 47.9 shares, $3,890

Every liquidation resets your health factor to ~1.0. You're back at the edge, again.

`[attach: drawdown table]`

---

**6/19**
Next to the alternatives, on the same $6,000 loan:

Benign year, Spout: **1.8%** all-in
One liquidation + full recovery: **11.4%**
Margin loan at 6.5%: 6.5%
Margin loan at 13%: 13%

A single forced sale erases the entire 0%.

---

**7/19**
Spout's docs say:

"The protocol does not introduce any new failure mode that does not already exist for someone who simply holds the underlying share."

That is false. Their own Terms contradict it:

"Liquidation can occur without prior notice."

---

**8/19**
The fix is small, and every prime broker already ships it:

A cure window. Notify the borrower. Let them top up or repay. *Then* sell.

Spout sells first and tells you after.

---

**9/19**
Now the finding you can verify without a beta code.

Spout's documentation and Spout's binding Terms of Service describe two different products.

Eleven parameters disagree. 🔍

---

**10/19**
Withdrawal fee: docs say 0%. Another docs page says 0.20%. Terms say 1%.

Liquidation fee: 4–12.5% vs 7.5–20%.

Junior lender target: ~32% vs 24–27% net.

Loss waterfall: 3 layers vs 4.

---

**11/19**
Lender lockups: "There are no lockups on either side" vs a 45-day junior notice — where queued capital also stops earning while still absorbing losses.

SIPC: "SIPC-covered US broker" vs "assume that SIPC protection does not apply to your spAsset positions."

---

**12/19**
Worse, the pitch is aimed at people who can't use it.

Marketing sells a US tax + 13%-margin story. The Terms prohibit US persons entirely (Reg S), plus 11 restricted jurisdictions.

The eligible cohort's real alternative is ~5–7% offshore margin. Not 13%.

---

**13/19**
The tail: the loan is non-recourse. The oracle deliberately updates at "reduced frequency" when the market's closed. And liquidations can only execute when the shares' venue is open.

A weekend gap = degraded pricing, no execution, capped recovery from the borrower.

---

**14/19**
The loss then lands on the waterfall: insurance fund → junior → senior.

The fund targets 2% of pool, seeded at $50–100k. A $10m pool supports ~$20m of collateral, so a 10% gap is a $2m event — larger than the entire fund target.

---

**15/19**
And "positive net returns in over 99% of simulated years" is not a risk metric on a strategy that sells volatility for a living.

It's a description of the skew. Publish the expected shortfall and the worst week instead.

---

**16/19**
Tokenization reality check:

Token-2022 + a KYC transfer hook = permissioned, freezable, can't move to non-KYC wallets. Real shares at a real broker, in an intermediated arrangement.

Right architecture for US equities. Not "trustless DeFi", not "the math is on the chain".

---

**17/19**
What's genuinely good:

→ Yield from a real third-party cash flow, not emissions
→ Partial, not total, liquidations
→ Earnings-cycle skips
→ Per-asset strike calibration
→ Docs detailed enough to be audited

That last one is why this review is this specific.

---

**18/19**
Four fixes before launch:

1. Liquidation cure window
2. One parameter source for docs/app/Terms
3. A liquidation-distance panel — "50% LTV" hides a 3.9× range: a 7.4% to 28.6% drawdown
4. Delete "delta neutral", "no new failure mode", and the SIPC implication

---

**19/19**
Verdict: the first tokenized-equity product I'd actually borrow against — one documentation pass from being safe to launch.

Full teardown + model script: **[link]**

Disclosure: beta participant, points program, unpaid. Devnet only.

---

## Notes for the poster

- **Screenshots beat claims.** Attach the borrow screen, the capacity-vs-limit mismatch if you hit it, and the liquidation-distance absence. Post 1, 5 and 9 are the highest-engagement attachment slots.
- **Do not soften post 7.** The quote-and-contradiction structure is the reason this thread travels. It is also the fairest possible way to make the point: both quotes are Spout's.
- **If Spout fixes something before you post**, add a reply rather than editing — "fixed since publication" replies are the strongest possible credibility signal for the next review.
- **Reproduce before you post.** `node bounty/scripts/spout-model.mjs`. If a number moves, change the post, not the script.
