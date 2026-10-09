import { NextRequest, NextResponse } from "next/server";
import { readInventoryFile } from "@/lib/inventory";
import { generateAllExports, ListingExport } from "@/lib/export";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const platform = searchParams.get("platform") || "all";
    const format = searchParams.get("format") || "json";

    const inventoryData = readInventoryFile();
    const exports = generateAllExports(inventoryData);

    let result: string | ListingExport | ListingExport[];
    let contentType = "application/json";
    let filename = "all_listings.json";

    if (platform === "ebay") {
      result = exports.find((e) => e.platform === "ebay") || exports[0];
      filename = "ebay_listings.json";
    } else if (platform === "craigslist") {
      result = exports.find((e) => e.platform === "craigslist") || exports[1];
      filename = "craigslist_listings.json";
    } else {
      result = exports;
    }

    if (format === "csv") {
      contentType = "text/csv";
      filename = filename.replace(".json", ".csv");
      const selected = exports.filter((e) => platform === "all" || e.platform === platform);
      // One CSV per platform, separated by a marker row
      result = selected.map((e) => toCsv(e)).join("\n\n---\n\n");
    }

    return new NextResponse(typeof result === "string" ? result : JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export listings" },
      { status: 500 },
    );
  }
}

function toCsv(exports: ListingExport): string {
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

function csvCell(value: string | number | undefined): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
