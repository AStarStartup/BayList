import { readInventoryFile, writeInventoryFile, SoldDirectory } from "@/lib/inventory";
import fs from "fs";
import path from "path";

// Dev-only route; force-static so `output: "export"` can prerender it.
export const dynamic = "force-static";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    // 1. Read Inventory.json
    const inventoryData = readInventoryFile();
    const inventory = inventoryData.items || [];

    const itemIndex = inventory.findIndex((i: any) => i.Id === id);
    if (itemIndex === -1) {
      return new Response("Item not found", { status: 404 });
    }

    const item = inventory[itemIndex];
    const soldAt = new Date().toISOString();

    // 2. Record the sale and move the item to the sold list
    item.status = "Sold";
    item.date_sold = soldAt;
    inventoryData.items = inventory.slice(0, itemIndex);
    inventoryData.items.push(...inventory.slice(itemIndex + 1));
    inventoryData.wishlist = inventoryData.wishlist || [];
    inventoryData.wishlist.push(item);

    // 3. Write a sold/ record folder so sales have a durable trail
    const timestamp = soldAt.replace(/[:.]/g, "-");
    const folderName = `${timestamp}_${item.Id}_${item.name.replace(/\s+/g, "_")}`;
    const soldPath = path.join(SoldDirectory(), folderName);
    fs.mkdirSync(soldPath, { recursive: true });
    fs.writeFileSync(
      path.join(soldPath, "README.md"),
      `\n# Sold Item: ${item.name}\n- **Platform:** ${item.platform}\n- **Price:** $${item.price}\n- **Sold Date:** ${soldAt}\n`,
    );

    const saved = writeInventoryFile(inventoryData);
    if (!saved) {
      return new Response("Failed to save inventory", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, folder: soldPath }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}
