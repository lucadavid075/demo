# Beta Session — Field Guide

**Read this once before you open the app. Then keep it open on a second screen and work down it.**

The report (`01-submission-report.md`) is already written and ~80% of it is verifiable without an
account. This session exists to fill the remaining 20% — the six questions in §7 — and to give the
submission the thing the bounty rules explicitly require: **genuine platform interaction and bug
discovery.** A blocked flow is a finding, not a failure. Document it and move on.

---

## 0. The 20-second version

| | |
|---|---|
| **Time** | 60–90 minutes if the flows work. 30 minutes if borrowing is blocked. |
| **Assets** | Valueless devnet tokens only. Never send real assets to a devnet address. |
| **Your job** | Stress the product, not sell it. Capture exact strings, numbers and screenshots. |
| **The rule** | Do not paraphrase the UI. **Copy it.** A screenshot of a cropped button is nearly useless; a full-screen shot with the timestamp visible is evidence. |
| **Deliverable** | `bounty/templates/session-ledger.json` filled in, plus screenshots, plus your notes file. |
| **Then** | Hand it back and I will fold it into the report and the article's appendix. |

**The single most valuable thing you can produce today** is a screenshot of the borrow screen showing
what it does and does not tell you before you sign. If everything else fails, get that.

---

## 1. Phase 0 — Prep (15 minutes, before you touch the app)

Do all of this **first**. Context-switching to find a faucet mid-flow is how sessions get wasted.

### 1.1 Clock check — do this before you plan anything

US cash equity market hours are **09:30–16:00 ET**, Monday to Friday, on trading days.

| Your time (Africa/Lagos, UTC+1) | US market |
|---|---|
| **14:30 – 21:00 WAT** | **OPEN** — buying fills, liquidations can execute |
| 21:00 – 14:30 WAT | **CLOSED** — orders queue, oracle is on reduced frequency |
| All weekend | **CLOSED** |

EDT applies in September, so the offset is 5 hours. Verify against a market-calendar site on the day —
if it's a US holiday, treat the whole day as closed.

**This matters because two of your most important tests are time-dependent:**

- **Buy/mint (Phase 2)** behaves differently in and out of hours — you want to see *both*.
- **The off-hours probe (Phase 5)** can only be run when the market is **closed**.

**Recommended plan:** start in the Lagos afternoon so the buy is in-hours, then finish the off-hours
probe after 21:00 WAT the same evening. If you only get one sitting, do the whole thing out of hours
and note it — a queued order is itself a finding.

### 1.2 Get test funds before you start

| What | Where | Notes |
|---|---|---|
| Devnet SOL (fees) | `faucet.solana.com` → Solana Devnet, or CLI `solana airdrop 2` | **Do this even if you think you don't need it.** Many flows fail at signature, not at logic. |
| Test USDC | `faucet.circle.com` → select **Solana Devnet** | This is the stablecoin you'll buy with and borrow. |

Confirm the app labels them as test funds. It should say something like "DEVNET TEST FUNDS" and state
they have no value — **capture that string**, because it's part of finding F-12 if it doesn't.

### 1.3 Set up your capture tools

- [ ] **Wallet** ready (Phantom, Backpack or Solflare) and connected to **devnet**, not mainnet.
      Triple-check this. Mainnet is one dropdown away.
- [ ] **DevTools open on the Console tab** for the entire session. Leave it open. Console errors are
      evidence, and the third-party report's decode error (`CollateralType: unexpected length 213`)
      would have appeared there.
- [ ] **A notes file** — copy `bounty/templates/session-notes.md` and fill it as you go.
- [ ] **Screenshot folder** — name files `YYYY-MM-DD-HHMM_case_step.png` in **UTC**.
- [ ] **Explorer tab** — `explorer.solana.com?cluster=devnet`.

### 1.4 Lines you do not cross

The Terms prohibit circumventing KYC, sanctions or geographic restrictions (including via VPN),
exploiting contract vulnerabilities, and accessing others' accounts. None of that is what this is.

**Stay inside legitimate product testing:** your own wallet, your own funds, devnet only, and no
probing for exploits. You are evaluating a product as a user, not attacking it. If you notice
something that looks like a vulnerability, **stop, screenshot it, and report it to the team** rather
than trying to reproduce it.

---

## 2. Session map

Work down this list. Each phase is a self-contained block you can stop after.

| # | Phase | Time | Produces | Findings it feeds |
|---|---|---|---|---|
| 1 | Access & cluster | 5 min | Gate UX, cluster disclosure | F-12 |
| 2 | Buy / mint an spAsset | 20 min | Fill receipt, cost basis, order states | F-12, F-16 |
| 3 | **Lock & borrow** | 25 min | **Capacity vs limit, HF disclosure** | **F-02, F-05, F-13** |
| 4 | Repayment | 10 min | Partial/over/zero-debt behaviour | F-02 |
| 5 | Off-hours probe | 10 min | Off-hours borrow, oracle staleness | **F-03, F-17** |
| 6 | Earn / lending | 5 min | Exact state and wording | F-07 |
| 7 | Mobile pass | 10 min | Small-viewport breakage | F-05 |

---

## 3. Phase 1 — Access and cluster (5 min)

**Do this, in order:**

1. Open `beta.spout.finance` and enter the email + passcode from your invite.
2. Watch what happens at the gate. Note any error on a wrong passcode, and whether the field is
   labelled "passcode" the same way the email called it.
3. Connect your wallet. **Before approving anything**, check which cluster it says it is on.
4. Take a full-screen screenshot of the connected state.

**Capture:**

- [ ] The exact gate text, verbatim.
- [ ] Whether the cluster/network is stated *before* you connect, or only after.
- [ ] Whether there is any "request access" or support path if the code fails.
- [ ] Any console errors on load.

**Signals — what we're looking for:**

| ✅ Good | ❌ Note it as a finding |
|---|---|
| Cluster named in the wallet dialog; test funds labelled as valueless | Cluster never named; nothing tells you these are test tokens |
| A visible way to get help or request access | Dead end with no support path |
| Passcode concept unambiguous | Email says one thing, field says another |

→ Feeds **F-12**. Even if it's fine, "it was fine" is worth 30 seconds of notes.

---

## 4. Phase 2 — Buy / mint an spAsset (20 min)

You need a position before you can test borrowing. This is the slowest phase because of the market
calendar.

**Do this:**

1. Go to the Buy screen. Choose **NVDA** (it's the asset in Spout's own published example, so your
   numbers become directly comparable to `docs/liquidation-example`).
2. **Test the validation before you place a real order:**
   - Try to buy more than your USDC balance → *expect* a clear, recoverable error.
   - Try to buy a tiny fractional amount → *expect* it to either work or be blocked clearly, not to
     display a misleading `0.000` that is actually non-zero.
   - If you haven't funded devnet SOL yet, try to buy anyway → *expect* an explicit "insufficient SOL
     for fees" message naming the missing asset.
3. **Record the preview**: expected quantity, any fee line, any price.
4. Place a small order — **10 test USDC** matches the public example; more is fine if you want a
   bigger borrow test later.
5. Watch the order state. Wait for the fill.

**The three states to look for, in order:** submitted → pending → filled. **Ownership language must
not appear before the fill.** If the confirmation says something like "you now own 0.045 NVDA" while
the order is still pending, that is a finding — people act on it.

**Capture:**

- [ ] USDC spent, tokens received, timestamp (UTC), and **the transaction signature**.
- [ ] The app's displayed average cost / gain, if it shows one.
- [ ] Every distinct UI string in the order confirmation.
- [ ] Whether Portfolio and Borrow reflect the position only *after* the fill.
- [ ] A screenshot of the pre-fill state **and** the post-fill state.

**Signals:**

| Signal | Why it matters | Finding |
|---|---|---|
| Displayed avg cost ÷ ≠ (USDC spent ÷ tokens received) | A trader will not trust any number in the app if cost basis is wrong. Small divergences from fees are fine; unexplained ones are not. | F-16 |
| "Owns shares" language before the fill | Materially misleading, and it happened in the public report. | F-13 |
| Sub-cent quantity displayed as `0.000` | Suggests you own nothing when you own something. | F-13 |
| Order queued off-hours without saying so | You'll wait for a fill that was never going to happen. | F-12 |

**If the market is closed:** the order will queue to the next open. **That is a valid result, not a
failure.** Capture the pending state, the wording, and what Portfolio/Borrow show. Then either wait
for the open or proceed to Phase 6 (Earn) and come back. Note the timestamp so we can state precisely
how long it queued.

---

## 5. Phase 3 — Lock and borrow (25 min) ← **the core of the session**

This is where the report's P1 findings either get confirmed or get retired. Take your time.

### 5.1 Lock the collateral

1. Lock your NVDA position as collateral.
2. Note whether "locked" is visually and functionally distinct from "held".
3. Note whether the app states the consequence: *locking enrolls the position in the options cycle,
   and after full repayment the collateral exits at the next cycle close* — not instantly.

**Capture:** whether the unlock path is visible while you hold debt (it should be blocked), and the
exact wording of the cycle-close timing.

### 5.2 THE BORROW SCREEN — pause and document everything before you touch anything

**Do not enter an amount yet.** First, answer these four questions and screenshot the screen:

1. Does it show your **current Health Factor**?
2. Does it show the asset's **liquidation threshold** (e.g. "58.8% LTV")?
3. Does it show **the price at which your position gets liquidated**?
4. Does it show **the fee that applies if you are liquidated**?

| Found | Finding status |
|---|---|
| All four present | **F-05 downgraded** — say so, credit the team, and show the screenshot |
| Three or fewer | **F-05 confirmed** — and your screenshot is the proof |

Then: does it show an **expected cost** — anything besides "0% interest"? Does it show the
mint/redeem fee, or the assignment possibility, anywhere near the borrow button? (→ R9)

### 5.3 Test the capacity claim — this is the F-13 retest

This is the highest-value 5 minutes of the session.

1. Read the **advertised borrowing capacity** off the screen. Write it down exactly.
2. Enter **~25% of that capacity** (a conservative, clearly-valid amount).
3. Read the preview: what LTV and HF does it claim?
4. **Submit the request.**

Three outcomes, all useful:

| Outcome | What it means | What to do |
|---|---|---|
| It reaches the wallet signing prompt | **F-13 is fixed.** Say so — that's a good result for the team. | Sign it, capture the signature, continue to 5.4 |
| It's rejected with a number you can't use (e.g. capacity $4.94, "limit $0.00") | **F-13 confirmed and reproduced.** P1 stands. | Screenshot both numbers *in the same frame if possible*. Copy the exact error string. Save the console output. Stop here. |
| Anything mentioning `CollateralType`, "unexpected length", or a decode/parse error | The reported root cause is still live. | Screenshot + console dump. Stop here. |

**Then try once more** with a smaller amount (e.g. 10% of capacity) to establish whether *any* loan is
possible. If a small loan works and a large one doesn't, that's a different and more interesting bug —
capture both.

### 5.4 If you get a loan — take the measurements

- [ ] Debt amount, LTV, and health factor **as displayed**.
- [ ] Compute it yourself: `HF = (collateral value × liquidation threshold) ÷ debt`. For a 58.8%
      threshold and $12,000 collateral against $6,000 debt that's 1.18. **Does the app's number match
      your arithmetic?**
- [ ] The transaction signature.
- [ ] Whether the stablecoins arrived at your wallet, and the amount.

### 5.5 The leverage tooltip (if you see a 1x/2x option)

The public report captured a 2x tooltip that described "half-price funding, zero interest, upside" but
did not mention amplified losses or liquidation. **If you see it, screenshot it and copy the full
text.** If it does mention liquidation risk, say so — that's them having fixed it.

**Signals for the whole phase:**

| Signal | Finding |
|---|---|
| No liquidation price before signing | **F-05 / R4** — the flagship UX finding |
| Advertised capacity ≠ executable amount | **F-13** |
| HF displayed doesn't match the published formula | New finding — a maths bug is more serious than a copy bug |
| Any mention of "delta neutral" in the UI | F-09 |
| Lock described as reversible instantly (no cycle-close caveat) | F-02 |
| "0% interest" as the only cost indicator | R9 |

---

## 6. Phase 4 — Repayment (10 min)

Only if you got a loan. Otherwise skip and note why.

1. **Repay a portion** (e.g. 25%). Capture how debt and HF update, and the exact wording.
2. **Try to unlock collateral while debt remains** → expect it to be blocked, with a clear reason.
3. **Try to repay more than you owe** → expect rejection or capping, not a silent over-payment.
4. **Repay the rest.** Capture the signature.
5. **Then try to unlock** → does it confirm immediately, or tell you it exits at the next cycle close?
   Does it say *when* that is?

**Signals:** any flow where the UI lets you believe collateral is released before it is (→ F-02);
any repayment that leaves a dust balance without saying so.

---

## 7. Phase 5 — Off-hours probe (10 min, **market must be closed**)

This is the test that supports the report's third P1. Run it after 21:00 WAT on a weekday, or at any
point on a weekend.

1. Compare the collateral value the app shows to the actual last close of the underlying. **Note the
   gap, if any, and the time.**
2. Try to **increase your debt** against the existing collateral.
   - *Preferred:* it's blocked, or the effective LTV is reduced, because the market is shut.
   - *Note as a finding if:* you can increase debt freely against a stale close you could never be
     liquidated against overnight.
3. Note whether the app tells you the market is closed at all, anywhere on the borrow screen.
4. If you can, note how long the displayed price has been stale (compare to the last close).

**Capture:** timestamps, the displayed collateral value, the real last close, and whether the borrow
increase was permitted.

→ Feeds **F-03** and **F-17**. Even a clean result is worth writing down: "debt increase blocked
off-hours, market-closed notice shown" is a finding that *retires* a P1, which is just as valuable.

---

## 8. Phase 6 — Earn / lending (5 min)

1. Navigate to the lending or Earn section.
2. Capture its exact state and wording.

**What to note:** is it visible-but-inert, hidden, or absent? If it shows any APY figure, **copy it
exactly** — the docs say ~32% junior and the Terms say 24–27%, so whatever the app shows is the third
number in that disagreement (→ **F-01**, **F-07**).

Also: does it disclose the junior tranche's 45-day notice, or the 0–3% instant-exit haircut, anywhere
before you'd deposit? (→ F-08)

---

## 9. Phase 7 — Mobile pass (10 min)

Resize the browser to **390×844** (or use your phone) and re-check:

- [ ] The borrow screen — is the health factor, capacity and any liquidation price still readable?
- [ ] Does anything overflow horizontally, or clip the digits that matter?
- [ ] Are any tap targets obviously too small?
- [ ] Does the buy preview still show the full quantity, or truncate it?

→ Feeds **F-05**. A liquidation number that's cut off on mobile is a real finding, since that's where
most retail users will be.

---

## 10. Decision trees

### If borrowing is blocked (the most likely outcome)
1. Screenshot the **advertised capacity and the rejection in the same frame** if you possibly can.
2. Copy every error string verbatim, including any that look like a type error.
3. Save the console output (right-click → Save as, or copy all).
4. Try one smaller amount to test whether it's a size threshold or a total block.
5. **Stop. Do not burn an hour on workarounds.** A blocked core flow, thoroughly documented, is one of
   the strongest findings in the submission — it's the difference between a walkthrough and a test.

### If the fill never happens
Capture the pending state, the wording, the elapsed time, and what Portfolio says. Note the market
state at the time. Then move to Phase 6 and come back at the next open. A stuck order is a UX finding.

### If you're short on time
Do these four things and nothing else:
1. Phase 3.2 — the borrow-screen disclosure screenshot (F-05 / R4)
2. Phase 3.3 — the capacity-vs-limit retest (F-13)
3. Phase 5 — the off-hours borrow probe (F-03)
4. Phase 6 — the Earn state and any APY figure (F-01 / F-07)

That's 25 minutes and it covers all four P1s.

---

## 11. The six questions that decide the submission

Everything else is a bonus. These are the gaps:

| # | Question | Where | Feeds |
|---|---|---|---|
| 1 | Was a passcode required, and did the app disclose the cluster before you connected? | Phase 1 | F-12 |
| 2 | One fill: USDC spent → tokens received, timestamp, signature, and did the displayed cost basis reconcile? | Phase 2 | F-16 |
| 3 | **What capacity was advertised, and what would it actually let you borrow?** | Phase 3.3 | **F-13** |
| 4 | **Did the app show a liquidation price and the applicable fee before you signed?** | Phase 3.2 | **F-05** |
| 5 | Could you increase debt while the cash market was closed? | Phase 5 | **F-03** |
| 6 | What is the exact state and wording of the lending/Earn flow, including any APY shown? | Phase 6 | F-01, F-07 |

---

## 12. After the session

1. **Fill in `bounty/templates/session-ledger.json`** — one object per transaction, plus your notes.
2. **Run the validator:**
   ```bash
   node bounty/scripts/check-ledger.mjs bounty/templates/session-ledger.json
   ```
   It checks every signature, recomputes your health factor from the numbers you entered, tests your
   displayed cost basis against the fill, flags exactly the divergence pattern that produced F-13, and
   tells you which of the six questions are still unanswered.
3. **Drop the screenshots** into `bounty/evidence/` with UTC filenames.
4. **Hand it back.** I'll fold the results into `01-submission-report.md`, update any finding whose
   status changed, and fill the appendix of `04-public-content-longform.md`.

**Two things that matter when you write it up:**

- **Say when the product is good.** If the liquidation-distance panel exists, if off-hours borrowing is
  correctly restricted, if the fill reconciles — those retire P1 findings, and a review that only ever
  subtracts is not credible. Some of these may already be fixed.
- **Nulls are data.** "Blocked before signing" is more useful than a description of the blocker. Record
  what you did *not* observe as clearly as what you did.
