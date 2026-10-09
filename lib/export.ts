/**
 * Platform Exporter - Exports listings to CSV/JSON for bulk upload.
 */

import { InventoryItem, Category, InventoryFile } from "./types";
import { generateAllListings, ListingContext } from "./ai";

export interface ListingExport {
  platform: "ebay" | "craigslist";
  items: Array<{
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    tags: string[];
    item_id: string;
    sku: string;
  }>;
}

// Export listings to JSON format
export function exportToJSON(exports: ListingExport): string {
  return JSON.stringify(exports, null, 2);
}

// Escape a CSV cell: quote when it contains a comma, quote, or newline
function csvCell(value: string | number | undefined): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Export listings to CSV format
export function exportToCSV(exports: ListingExport): string {
  const headers = ["Item ID", "SKU", "Title", "Description", "Price", "Category", "Condition", "Tags"];
  const rows = exports.items.map((item) =>
    [
      csvCell(item.item_id),
      csvCell(item.sku),
      csvCell(item.title),
      csvCell(item.description.replace(/\n/g, " ")),
      csvCell(item.price),
      csvCell(item.category),
      csvCell(item.condition),
      csvCell((item.tags || []).join(", ")),
    ].join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

// Generate eBay export
export function generateEbayExport(
  items: InventoryItem[],
  categories: Category[],
  context?: ListingContext,
): ListingExport {
  const ebayItems = items.filter((item) => item.platform === "Both" || item.platform === "eBay");

  return {
    platform: "ebay",
    items: ebayItems.map((item) => {
      const category = categories.find((c) => c.Id === item.category_id);
      const listings = generateAllListings(item, category, context);

      return {
        title: listings.ebay_title || "",
        description: listings.ebay_description || "",
        price: item.price,
        category: category?.ebayCategory || "",
        condition: item.condition,
        tags: item.tags || [],
        item_id: item.Id,
        sku: item.sku,
      };
    }),
  };
}

// Generate Craigslist export
export function generateClExport(
  items: InventoryItem[],
  categories: Category[],
  context?: ListingContext,
): ListingExport {
  const clItems = items.filter((item) => item.platform === "Both" || item.platform === "Craigslist");

  return {
    platform: "craigslist",
    items: clItems.map((item) => {
      const category = categories.find((c) => c.Id === item.category_id);
      const listings = generateAllListings(item, category, context);

      return {
        title: listings.cl_title || "",
        description: listings.cl_description || "",
        price: item.price,
        category: category?.clCategory || "",
        condition: item.condition,
        tags: item.tags || [],
        item_id: item.Id,
        sku: item.sku,
      };
    }),
  };
}

// Generate all exports
export function generateAllExports(
  inventory: InventoryFile,
  context?: ListingContext,
): ListingExport[] {
  const categories = inventory.Categories || [];
  const items = inventory.items || [];

  return [
    generateEbayExport(items, categories, context),
    generateClExport(items, categories, context),
  ];
}
