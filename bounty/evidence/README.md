# Evidence

Screenshots, console dumps and wallet exports for the beta session.

## Naming

    YYYY-MM-DD-HHMM_<case>_<step>.png

Timestamps in **UTC**. Example: `2026-09-14-1405_TC-05_fill-confirmation.png`.

## What is worth capturing

A full-screen shot that includes the number in question is evidence. A crop of a button is not.
The single most valuable image from any session is the **borrow screen before you sign** — it either
shows a liquidation price and fee, or it does not, and that one frame settles finding F-05.

Also worth keeping:
- the wallet dialog naming the cluster (F-12)
- the advertised capacity and a rejection **in the same frame**, if you can get them (F-13)
- the order confirmation while the order is still pending (ownership-language finding)
- the Earn screen's exact wording and any APY figure (F-01, F-07)

## Privacy

Wallet addresses and transaction signatures are public by design. Anything else — full names, email
addresses, KYC documents, your passcode — must be redacted before this folder is published.
Note the redaction in your session notes.

## Console dumps

Save as `YYYY-MM-DD-HHMM_<case>_console.txt`. If you hit a decode or parse error, the console output
is the reproducible half of the finding — keep it verbatim.
