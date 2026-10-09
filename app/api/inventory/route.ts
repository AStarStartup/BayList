import { NextResponse } from "next/server";
import { readInventoryFile, writeInventoryFile } from "@/lib/inventory";
import { InventoryItem } from "@/lib/types";

// Dev-only route; force-static so `output: "export"` can prerender it.
export const dynamic = "force-static";

export async function GET() {
  try {
    const data = readInventoryFile();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = readInventoryFile();

    if (body.type === "category") {
      data.Categories.push({
        Id: Date.now().toString(),
        name: body.name || "New Category",
      });
    } else if (body.type === "move") {
      const item = data.items.find((i: InventoryItem) => i.Id === body.itemId);
      if (item) {
        item.listId = body.listId;
        if (body.listId === "sold") {
          item.status = "Sold";
          item.date_sold = new Date().toISOString();
        }
      }
    } else {
      data.items.push({
        Id: Date.now().toString(),
        name: body.name || "Unnamed Item",
        sku: (body.name || "UNNAMED").toString().split(" ").join("-").toUpperCase(),
        platform: body.platform || "Unknown",
        price: parseFloat(body.price) || 0,
        cost: parseFloat(body.cost) || 0,
        description: body.description || "",
        image_url: body.image_url || body.imageUrl || "",
        status: "Available",
        category_id: body.category_id || body.categoryId || "",
        condition: body.condition || "Used",
        tags: body.tags || [],
      });
    }

    const saved = writeInventoryFile(data);
    if (!saved) {
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, type } = await request.json();
    const data = readInventoryFile();

    if (type === "category") {
      data.Categories = data.Categories.filter((c) => c.Id !== id);
    } else {
      data.items = data.items.filter((i: any) => i.Id !== id);
    }

    const saved = writeInventoryFile(data);
    if (!saved) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
