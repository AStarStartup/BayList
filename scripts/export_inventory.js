/**
 * Copies the local Inventory.json into out/ so the static export serves
 * it at /inventory.json (the client store's static fallback).
 *
 * Run after `next build` (see `npm run publish`).
 */

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "Inventory.json");
const outDir = path.join(__dirname, "..", "out");
const dest = path.join(outDir, "inventory.json");

if (!fs.existsSync(src)) {
  console.error("Inventory.json not found — nothing to publish.");
  process.exit(1);
}
if (!fs.existsSync(outDir)) {
  console.error("out/ not found — run `npm run build` first.");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`Copied ${src} -> ${dest}`);
