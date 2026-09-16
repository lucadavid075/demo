# Spout Beta — Test Plan, Ledger & Bug-Report Templates

Two things live here:

1. **The test matrix.** 14 numbered cases covering every core flow, with exact steps, expected results, and what to capture. Cases marked ✅ were executed during this review; cases marked ⬜ require the authenticated beta session and are ready to run.
2. **The evidence ledger.** A schema and paste-ready template so every executed transaction ends up as a verifiable row (cluster, signature, before/after state) rather than an anecdote. Bug reports are then generated from the ledger, not retyped.

---

## 0. Environment checklist before testing

| Item | Value / note |
|---|---|
| Cluster | Solana **devnet** (`https://api.devnet.solana.com`) — confirm in the wallet dialog; it must say "DEVNET TEST FUNDS" and state the tokens have no value |
| Wallet | Embedded wallet (Privy) or an external wallet (Phantom / Backpack / Solflare) |
| Test stablecoin | Circle devnet USDC — `https://faucet.circle.com` (select Solana Devnet) |
| Test SOL (fees) | `solana airdrop 2` (CLI) or `https://faucet.solana.com` — the app will fail signature validation without it |
| Screenshot convention | `evidence/YYYY-MM-DD-HHMM_<case>_<step>.png`, UTC timestamps in the filename |
| Value at risk | **None.** All assets are valueless test tokens (testnet Terms §3.2). Never send real assets to a devnet address |
| Consent | Testnet Terms apply: everything is simulated, unvalued, unaudited or partially audited, and feedback may be used by the Company |

**Rule for this ledger: a row with no signature is an observation, not evidence.** Both are useful. They must not be mixed.

---

## 1. Test matrix

### Group A — Access & onboarding

| ID | Case | Steps | Expected | Status |
|---|---|---|---|---|
| **TC-01** | Wallet gate and cluster disclosure | Open `beta.spout.finance` → enter email + passcode → connect wallet | Passcode accepted; wallet dialog explicitly labels the cluster as testnet and states test funds have no value | ⬜ |
| **TC-02** | Funding readiness | Attempt to place any order with 0 USDC, then with USDC but 0 SOL | Both blocked with a *specific, recoverable* instruction naming the missing asset and a link to obtain it | ⬜ |
| **TC-12** | Onboarding friction log | Record each screen from landing → first position: what you had to know that was not on screen (cluster, faucet, code source, fee schedule) | — (subjective log; feeds §6 of the report) | ⬜ |

### Group B — Equity acquisition (minting)

| ID | Case | Steps | Expected | Status |
|---|---|---|---|---|
| **TC-05** | Buy preview & validation | Buy screen → choose NVDA → enter an amount above the USDC balance, then a fractional amount near zero | Over-balance rejected with a clear reason; sub-cent fractions either hidden or explicitly marked as rounding; no misleading "0.000" quantity that is actually non-zero | ⬜ |
| **TC-05b** | Order state machine | Place one small order during **market hours**; observe states | Distinct, correctly labelled states: submitted / pending / filled / failed / cancelled. **Ownership language must not appear before the fill** | ⬜ |
| **TC-05c** | After-hours order | Place one small order while the cash market is **closed** | Order queues to the next open and says so explicitly; portfolio and borrow show **no** position until the fill is recorded | ⬜ |
| **TC-05d** | Cost basis reconciliation | After a fill, compare: USDC spent ÷ tokens received vs the app's displayed average cost | Identical, or the difference is explained on screen (fees, FX, execution price) | ⬜ |

### Group C — Borrowing (the core flow)

| ID | Case | Steps | Expected | Status |
|---|---|---|---|---|
| **TC-03** | **Borrow capacity vs executable limit** (retest of the publicly reported blocker, F-13) | With a funded, filled position: open Borrow; record the advertised capacity; attempt a loan at ~25% of capacity | Advertised capacity equals the amount validation accepts; a valid request reaches the signing flow. **Failure signature to look for:** a decode/parse error such as `CollateralType: unexpected length …` alongside a capacity that previews normally but validates against zero | ⬜ |
| **TC-04** | Lock / enroll lifecycle | Lock collateral without borrowing; then lock and borrow | Locking is a distinct, visible state from holding; unlock is only offered when debt is zero; the app states that release occurs at the next cycle close | ⬜ |
| **TC-06** | Health factor & liquidation distance disclosure | On the borrow screen, try to find: current HF, the asset's liquidation threshold, the **price at which liquidation triggers**, and the fee that applies | All four visible **before** signing. Also confirm the app does not claim a "50% LTV" cushion without stating the buffer. Cross-check the displayed HF against `HF = collateral × LT ÷ debt` for the values shown | ⬜ |
| **TC-07** | **Off-hours borrow-increase** (F-03) | While the cash market is closed: attempt to *increase* debt against collateral valued at the last close, and separately attempt to borrow within 15 minutes of a large gap in the underlying | Documented behaviour. Preferred: percentage-based LTV is reduced, or increases are blocked, while the cash market is closed — see F-03 | ⬜ |
| **TC-08** | Repayment paths | Repay 25% of the debt; then close to zero in a second transaction; then attempt to repay more than is owed; then attempt to unlock before full repayment | Partial repayment accepted, debt and HF update; over-repayment rejected or capped; unlock blocked until debt is zero and the app states the cycle-close timing | ⬜ |
| **TC-13** | **Assignment simulation** (sponsor fixture required) | Ask for a fixture or an admin-triggered ITM expiry on a small position | Auto-Roll rebuys and re-enrolls; the statement shows gross premium, assignment cost, the debt reduction, and the **reduction in share count**. Without this fixture a public tester can never observe the protocol's central mechanic — worth requesting explicitly | ⬜ |

### Group D — Risk engine (requires fixtures or a live cycle)

| ID | Case | Steps | Expected | Status |
|---|---|---|---|---|
| **TC-09** | **Liquidation simulation** (sponsor fixture required) | Request a fixture that marks a position below its LT | Shares sold ≈ the model's prediction; the fee equals the asset's published buffer **and matches the docs' 4–12.5% or the Terms' 7.5–20% range** — this reconciles F-01 and F-05 in one observation. Confirm whether any notice or cure window is offered (F-02/R1) | ⬜ |
| **TC-10** | Oracle behaviour | With a position open, compare the collateral's displayed value to the live market price (a) during market hours, (b) 30 minutes after the close, (c) pre-market on the next trading day | Document the actual staleness in minutes at each point. `/docs/oracles/` says "reduced frequency" without quantifying it (F-17) | ⬜ |
| **TC-11** | Lending / Earn | Locate the lending flow in this beta | Observe and record its state. The brief states lending is rolling out soon; if Earn is visible but inert, capture the exact wording and any APY figures shown | ⬜ |
| **TC-14** | Mobile / small viewport | Repeat TC-03, TC-05 and TC-06 at 390×844 | No clipped values, no horizontally scrolling tables, no tap target under 44px, no truncation of the digits that matter (price, HF, fee) | ⬜ |

### Executed during this review (unauthenticated, fully reproducible)

| Case | What was executed | Result |
|---|---|---|
| **TC-D1** ✅ | Full crawl of `spout.finance` + `/docs/*` (35 pages via `sitemap.xml`) + `/terms` + `/testnet-terms`; every published parameter captured with its URL | Findings F-01, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-14, F-16, F-17 |
| **TC-D2** ✅ | Reproduced the protocol's published tranche waterfall from published inputs | Reconciles to the cent; prose/arithmetic contradiction found on the same page (F-01) |
| **TC-D3** ✅ | Reproduced the published NVDA liquidation example from published parameters | Reconciles exactly (21.42 shares, $2,184.47, $192.23, $4,007.77, HF 1.18) — the docs' arithmetic is sound |
| **TC-D4** ✅ | Extended the published example through drawdown-then-recovery paths | F-02 quantified: one event costs $578 of permanent equity; a −30% path leaves 58/100 shares |
| **TC-D5** ✅ | Beta-app accessibility probe (unauthenticated) | First screen is the passcode gate; no request-access flow, no funding guidance, no cluster disclosure before auth (F-12) |
| **TC-D6** ✅ | Cross-source parameter reconciliation | 11 divergences catalogued (F-01) |

---

## 2. Evidence ledger

Copy this row template into `evidence/ledger.csv` for every signed transaction. One row per transaction, no narrative.

```csv
case_id,utc_timestamp,cluster,wallet,action,asset,amount_in,amount_out,usdc_delta,signature,slot,explorer_url,state_before,state_after,ui_claim_before,ui_claim_after,screenshot,notes
TC-05,2026-09-14T13:31:09Z,devnet,<wallet>,buy,NVDA,10.00 USDC,0.045302013 NVDA,-10.00,<base58 sig>,<slot>,https://explorer.solana.com/tx/<sig>?cluster=devnet,"cash 10.00","cash 0.00, NVDA 0.0453","ordering","filled",evidence/....png,"test assets, no value"
```

`ui_claim_before` / `ui_claim_after` are the two most valuable columns in the whole table: they record **what the interface said would happen** next to **what the chain did**. Every UX finding in this report class comes from that pair disagreeing.

### Machine-readable ledger

```json
{
  "tester": "[handle]",
  "review_date": "2026-09-14",
  "cluster": "devnet",
  "environment": { "wallet": "", "rpc": "https://api.devnet.solana.com", "app_version": "", "session_start_utc": "" },
  "transactions": [
    {
      "case_id": "TC-03",
      "utc": "",
      "action": "borrow",
      "asset": "USDC",
      "amount": 0,
      "signature": null,
      "slot": null,
      "ui_claimed_capacity_usd": null,
      "executable_limit_usd": null,
      "ui_claim": "",
      "observed": "",
      "expected": "",
      "state_delta": { "before": {}, "after": {} },
      "screenshots": [],
      "console_errors": []
    }
  ],
  "findings": [
    { "id": "F-xx", "severity": "P1", "title": "", "evidence": "", "repro": "", "impact": "" }
  ]
}
```

**Nulls matter.** A `signature: null` on TC-03 records that borrowing was blocked *before signing* — that is itself the P1 finding, and it is more credible than a description of the block.

---

## 3. Bug report template (for the Spout team)

```markdown
### [SEV] Short title
**Environment:** cluster · app URL · wallet type · UTC timestamp · session id
**Preconditions:** position state, balances, market state (open/closed, last close, any gap)
**Steps:** 1..n, exact and minimal
**Expected:** what should happen, and where that is documented (link)
**Observed:** what happened, with the exact UI strings, numbers, and any console output
**On-chain:** none / signature(s) — if none, say "blocked before signing"
**Evidence:** screenshot paths, screen recording, ledger row
**Impact:** who is affected, when it happens, how often, and what it costs them
**Workaround:** if one exists
**Hypothesis:** optional, clearly labelled as speculation
```

---

## 4. Ledger rows to complete before publication

Six data points are needed to finish the public write-up. Paste them back and they slot into the marked sections of `04-public-content-longform.md`:

1. **Access** — whether a passcode was required, and the cluster shown in the wallet dialog. (F-12)
2. **Acquisition** — one fill: USDC spent, tokens received, timestamp, signature. (TC-05)
3. **Borrow** — the advertised capacity vs the executable limit, and whether the request reached the signing flow. (TC-03, F-13)
4. **Health factor** — whether the app surfaced the liquidation price and the applicable fee before signing. (TC-06, F-05)
5. **Off-hours** — whether debt could be increased while the cash market was closed. (TC-07, F-03)
6. **Earn** — the exact state and wording of the lending flow. (TC-11)
