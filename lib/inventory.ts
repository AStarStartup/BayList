/**
 * Shared inventory file helpers (server-side only).
 *
 * All file I/O lives here so API routes stay thin. Paths are resolved at
 * call time (not at import time) so tests can run from other directories.
 */

import fs from "fs";
import path from "path";
import { InventoryFile } from "./types";

export function InventoryJsonPath(): string {
  return path.join(process.cwd(), "Inventory.json");
}

export function SoldDirectory(): string {
  return path.join(process.cwd(), "sold");
}

export function readInventoryFile(): InventoryFile {
  try {
    const p = InventoryJsonPath();
    if (!fs.existsSync(p)) {
      return { items: [], Categories: [] };
    }
    const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
    if (Array.isArray(parsed)) {
      return { items: parsed, Categories: [] };
    }
    return {
      ...parsed,
      Categories: parsed.Categories || [],
      items: parsed.items || [],
    };
  } catch (error) {
    console.error("Error reading inventory:", error);
    return { items: [], Categories: [] };
  }
}

export function writeInventoryFile(data: InventoryFile): boolean {
  try {
    fs.writeFileSync(InventoryJsonPath(), JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving inventory:", error);
    return false;
  }
}
