import { NextRequest, NextResponse } from "next/server";
import { readInventoryFile, writeInventoryFile } from "@/lib/inventory";
import { generateAllInventoryListings } from "@/lib/ai";

// Dev-only route; force-static so `output: "export"` can prerender it.
export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  try {
    // Optional: { "location": "Eugene, OR" } to stamp Craigslist titles
    let context: { location?: string } | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.location === "string" && body.location) {
        context = { location: body.location };
      }
    } catch {
      // No body is fine.
    }

    const data = readInventoryFile();
    const updatedItems = generateAllInventoryListings(
      { ...data, categories: data.Categories },
      context,
    ) as any[];

    const updated = { ...data, items: updatedItems };
    const saved = writeInventoryFile(updated);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to save generated listings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Generated listings for ${updatedItems.length} items`,
      items: updatedItems.length,
    });
  } catch (error) {
    console.error("Error generating listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate listings" },
      { status: 500 },
    );
  }
}
