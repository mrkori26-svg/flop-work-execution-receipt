#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import {
  canonicalJson, fromEmpiresJourney, receiptDigest, receiptId, validateReceipt,
} from "./index.js";

const args = process.argv.slice(2);
const command = args[0];
const path = args[1];
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args[outIndex + 1] : undefined;
const usage = [
  "usage:",
  "  flop-receipt validate <receipt.json>",
  "  flop-receipt digest <receipt.json>",
  "  flop-receipt canonical <receipt.json>",
  "  flop-receipt from-empires <journey.json> [--out receipt.json]",
].join("\n") + "\n";

if (command === "--help" || command === "help") {
  process.stdout.write(usage);
  process.exit(0);
}
if (!path) {
  process.stderr.write(usage);
  process.exit(2);
}

const value = JSON.parse(readFileSync(path, "utf8"));
try {
  if (command === "validate") {
    process.stdout.write(JSON.stringify({valid:true,receipt_id:validateReceipt(value).receipt_id}) + "\n");
  } else if (command === "digest") {
    process.stdout.write(receiptDigest(validateReceipt(value)) + "\n");
  } else if (command === "canonical") {
    process.stdout.write(canonicalJson(validateReceipt(value)) + "\n");
  } else if (command === "from-empires") {
    const receipt = fromEmpiresJourney(value);
    const text = JSON.stringify(receipt, null, 2) + "\n";
    if (out) writeFileSync(out, text);
    else process.stdout.write(text);
  } else {
    process.stderr.write(usage);
    process.exit(2);
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : "invalid receipt") + "\n");
  process.exit(1);
}
