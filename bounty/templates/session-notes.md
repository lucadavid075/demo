# Spout Beta — Session Notes

Duplicate this file for each session. Fill it in **as you go**, not from memory afterwards.
Use UTC for every timestamp. Copy UI strings verbatim — do not paraphrase.

---

## Session header

| | |
|---|---|
| Date (UTC) | |
| Start / end (UTC) | |
| Tester | |
| Wallet address | |
| Wallet type | |
| Market state at start | open / closed — last US close: |
| App version / commit, if shown | |
| DevTools console open? | yes / no |
| Devnet SOL balance at start | |

---

## Phase 1 — Access

**Gate text (verbatim):**

> 

**Cluster disclosed before connecting?** yes / no / only after —
**Where exactly:**

**Request-access or support path visible?** yes / no —
**Console errors on load:**

**Screenshot:** `evidence/`

---

## Phase 2 — Buy / mint

**Validation tests**

| Test | Result | Error string (verbatim) |
|---|---|---|
| Buy more than balance | | |
| Buy a tiny fractional amount | | |
| Buy with 0 SOL for fees | | |

**Order placement**

| | |
|---|---|
| Asset / target size | |
| Preview: expected quantity | |
| Preview: fees / price shown | |
| Preview: any cost line besides the amount? | |
| Submitted (UTC) | |
| Filled (UTC) | |
| Time queued | |
| USDC spent | |
| Tokens received | |
| Implied price (spent ÷ received) | |
| **Signature** | |

**Order state wording (verbatim, each state):**

- Submitted:
- Pending:
- Filled:

**Did ownership language appear before the fill?** yes / no —
**Did Portfolio reflect the position only after the fill?** yes / no —
**App's displayed average cost / gain:**

**Reconciliation:** displayed avg cost vs implied price — match / divergence of

**Off-hours behaviour (if applicable):** did it say it was queuing? Where?

---

## Phase 3 — Lock and borrow ← the important one

### 3.1 Lock
- Was "locked" visually distinct from "held"? yes / no —
- Did it state the consequence (options cycle enrolment)? verbatim:
- Was the unlock path blocked while holding debt? yes / no —
- Wording on collateral release timing:

### 3.2 Borrow screen disclosure — **answer all four**

| # | Question | Found? | Where / verbatim |
|---|---|---|---|
| 1 | Current Health Factor shown? | | |
| 2 | Liquidation threshold shown? | | |
| 3 | **Liquidation price** shown? | | |
| 4 | Liquidation **fee** shown? | | |

- Any expected-cost figure besides "0% interest"? yes / no —
- Are mint/redeem fees or assignment risk mentioned near the borrow button? yes / no —

**Full-screen screenshot of the borrow screen (before entering an amount):** `evidence/`

### 3.3 Capacity vs executable limit — the retest

| | |
|---|---|
| **Advertised capacity** (exact figure) | |
| Amount attempted (≈25% of that) | |
| Preview LTV / HF claimed | |
| Outcome | reached signing / rejected before signing / error |
| **Error string (verbatim)** | |
| If rejected: smaller amount attempted | |
| Smaller amount outcome | |
| **Signature (if any)** | |

**If an error mentions `CollateralType`, "unexpected length", a parse/decode failure:**
paste it here and attach the console dump.

**Verdict:** F-13 reproduced / F-13 not reproduced (fixed) / different blocker

### 3.4 Measurements (if you got a loan)

| | |
|---|---|
| Debt | |
| Collateral value shown | |
| Liquidation threshold shown | |
| **HF as displayed** | |
| **HF computed** = (collateral × threshold) ÷ debt | |
| Do they match? | |
| Stablecoins received in wallet | |
| **Signature** | |

### 3.5 Leverage tooltip (if present)
Full text, verbatim:
> 

Does it mention amplified losses or liquidation? yes / no —

---

## Phase 4 — Repayment

| Step | Result | Wording / signature |
|---|---|---|
| Repay 25% | | |
| Unlock attempt with debt outstanding | | |
| Over-repay attempt | | |
| Repay remainder | | |
| Unlock after full repayment | | |

Did it confirm immediately, or state a cycle-close delay? Does it say *when* the cycle closes?

---

## Phase 5 — Off-hours probe

| | |
|---|---|
| Time of probe (UTC) | |
| Market state | closed |
| Collateral value as displayed | |
| Actual last close of the underlying | |
| Gap, if any | |
| Displayed price staleness (how old) | |
| **Could you increase debt?** | yes / no |
| Any "market closed" notice on the borrow screen? | |

**Verdict:** off-hours borrowing correctly restricted / not restricted → F-03 status

---

## Phase 6 — Earn / lending

- State: visible-active / visible-inert / hidden / absent
- Exact UI wording:
> 
- Any APY figure shown (exact): senior ___ · junior ___
- Junior 45-day notice disclosed before deposit? yes / no —
- Instant-exit haircut (0–3%) disclosed? yes / no —

---

## Phase 7 — Mobile (390×844)

| Check | Result |
|---|---|
| HF / capacity readable | |
| Any liquidation price readable | |
| Horizontal overflow anywhere | |
| Clipped digits (price, HF, fee) | |
| Truncated quantity on buy preview | |

---

## New findings not in the report

Anything you saw that isn't covered above — especially anything that looked like a maths error,
a state bug, or misleading copy.

| # | Severity guess | What happened | Evidence |
|---|---|---|---|
| | | | |

---

## Screenshot index

| File | Case | What it shows |
|---|---|---|
| | | |
