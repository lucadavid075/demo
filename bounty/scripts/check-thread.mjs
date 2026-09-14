#!/usr/bin/env node
/**
 * Verify every post in the X thread fits in 280 characters.
 * Usage: node bounty/scripts/check-thread.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const file = resolve(HERE, "..", "05-public-content-x-thread.md");
const text = readFileSync(file, "utf8");

const LIMIT = 280;
// posts look like:  **n/19**\n body... until the next post marker
const parts = text.split(/\n\*\*(\d+\/\d+)\*\*\n/).slice(1);
let worst = 0, over = 0, count = 0;

for (let i = 0; i < parts.length; i += 2) {
  const label = parts[i];
  const body = parts[i + 1]
    .split(/\n---\n/)[0]
    .replace(/`\[attach:[^\]]*\]`/g, "")   // attachments are not posted as text
    .replace(/\[link\]/g, "https://example.com/spout-teardown") // placeholder URL length
    .trim();
  const len = [...body].length;
  count++;
  worst = Math.max(worst, len);
  const flag = len > LIMIT ? "❌ OVER" : "✅";
  if (len > LIMIT) over++;
  console.log(`${flag} ${label.padEnd(7)} ${String(len).padStart(3)} chars`);
}
console.log(`\n${count} posts · longest ${worst}/${LIMIT} · ${over} over limit`);
process.exit(over ? 1 : 0);
