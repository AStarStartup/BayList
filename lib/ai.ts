/**
 * AI Listing Generator - Creates platform-specific titles and descriptions.
 * Template-based generation with contextual optimization.
 *
 * Store-specific copy (location, contact line, payment handle) is supplied
 * through a `ListingContext` so this module stays free of personal data.
 */

import { InventoryItem, Category } from "./types";
import { StoreConfig } from "./config";

export interface ListingContext {
  store?: StoreConfig;
  /** Location shown in Craigslist titles, e.g. "Eugene, OR". Optional. */
  location?: string;
}

// Platform-specific keyword optimization
const EBAY_KEYWORDS: Record<string, string[]> = {
  cameras: ["Sony", "Canon", "Nikon", "Mirrorless", "Cinema", "4K", "Video", "Photography", "Professional"],
  lenses: ["E-Mount", "FE", "Prime", "Zoom", "Fast Aperture", "Sharp", "Bokeh"],
  broadcast: ["ATEM", "Switcher", "Broadcast", "Streaming", "Professional", "Live"],
  capture: ["Capture Card", "HDMI", "USB 3.0", "4K", "Live Streaming", "OBS"],
  computing: ["GPU", "CPU", "RAM", "SSD", "NVMe", "RTX", "Gaming", "AI", "Workstation"],
  audio: ["Audio Interface", "MIDI", "USB-C", "Professional", "Recording", "Studio"],
  lighting: ["Video Light", "RGB", "Bi-color", "Studio", "LED", "Softbox"],
  keyboards: ["Mechanical", "Gaming", "RGB", "Hot Swap", "Wireless", "TKL"],
  mounting: ["Camera Cage", "Matte Box", "Slider", "Tripod", "Mount", "Support"],
  small: ["Webcam", "Microphone", "Adapter", "Cable", "Accessory"],
  robotics: ["Arduino", "Raspberry Pi", "Embedded", "Development Board", "IoT"],
  cables: ["HDMI", "USB-C", "SDI", "XLR", "Audio Cable", "Video Cable"],
};

const CL_KEYWORDS: Record<string, string[]> = {
  cameras: ["Sony", "Canon", "Nikon", "Video Camera", "Photography", "4K"],
  lenses: ["Camera Lens", "E-Mount", "FE Mount", "Prime Lens", "Zoom Lens"],
  broadcast: ["ATEM", "Switcher", "Live Production", "Streaming Setup"],
  capture: ["Capture Card", "HDMI Capture", "USB Capture Card", "4K Capture"],
  computing: ["GPU", "Graphics Card", "CPU", "Processor", "RAM", "SSD"],
  audio: ["Audio Interface", "MIDI Controller", "USB Audio", "Recording"],
  lighting: ["Video Light", "Studio Light", "LED Panel", "Softbox"],
  keyboards: ["Mechanical Keyboard", "Gaming Keyboard", "RGB Keyboard"],
  mounting: ["Camera Mount", "Tripod", "Slider", "Matte Box", "Camera Cage"],
  small: ["Webcam", "Microphone", "Adapter", "Accessory"],
  robotics: ["Arduino", "Raspberry Pi", "Development Board", "Embedded"],
  cables: ["HDMI Cable", "USB Cable", "SDI Cable", "XLR Cable"],
};

const BRANDS = [
  "Sony", "Canon", "Nikon", "Blackmagic", "ATEM", "Elgato", "Magewell", "MOTU",
  "Audient", "Yamaha", "Tilta", "NEEWER", "GVM", "Viltrox", "7Artisans", "Sirui",
  "Lenovo", "AMD", "Intel", "RTX", "Gigabyte", "AORUS", "OSEE", "Apple",
  "Microsoft", "Corsair", "Tameron",
];

// Extract key specs from item name
function extractKeySpecs(name: string): string[] {
  const specs: string[] = [];

  // Extract resolution
  if (name.includes("4K")) specs.push("4K");
  if (name.includes("1080p")) specs.push("1080p");
  if (name.includes("2K")) specs.push("2K");

  // Extract brand
  for (const brand of BRANDS) {
    if (name.includes(brand)) specs.push(brand);
  }

  // Extract model numbers
  const modelPatterns = /\d{2,4}[A-Z]{1,3}/g;
  const matches = name.match(modelPatterns);
  if (matches) {
    specs.push(...matches.slice(0, 2));
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = specs.filter((s) => {
    const lower = s.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  return unique.slice(0, 3); // Limit to 3 specs
}

// Extract brand and model from item name/tags
function extractBrandAndModel(item: InventoryItem): { brand: string; model: string } {
  const name = item.name;
  const tags = item.tags || [];

  // First try brand from tags (most reliable)
  let brand = item.brand;
  if (!brand) {
    for (const tag of tags) {
      if (BRANDS.includes(tag)) {
        brand = tag;
        break;
      }
    }
  }

  // Fallback: search name for brand
  if (!brand) {
    for (const b of BRANDS) {
      if (name.includes(b)) {
        brand = b;
        break;
      }
    }
  }

  // Extract model from name (everything after brand)
  let model = item.model;
  if (!model) {
    if (brand && name.includes(brand)) {
      // Everything after the brand name
      const rawModel = name.substring(name.indexOf(brand) + brand.length).trim();

      // Smart truncation: keep the most important parts.
      // For RAM/memory items, keep capacity, type, speed, form factor, and device model.
      const isMemory =
        rawModel.toLowerCase().includes("ram") ||
        rawModel.toLowerCase().includes("memory") ||
        rawModel.toLowerCase().includes("dimm");
      if (isMemory) {
        // Extract device model (e.g., iMac Pro A1862)
        const deviceModelMatch = rawModel.match(/(iMac Pro [A-Z]\d{4}|iMac [A-Z]\d{4}|Mac Pro [A-Z]\d{4})/i);
        // Extract key specs: capacity, type, speed, form factor
        // Use word boundaries to avoid partial matches
        const capacityMatch = rawModel.match(/\b(\d+GB)\b/i);
        const typeMatch = rawModel.match(/\b(DDR\d+|ECC|RDIMM|SO-DIMM)\b/);
        const speedMatch = rawModel.match(/\b(\d+MHz)\b/);
        const formFactorMatch = rawModel.match(/\b(\d+x\s*\d+GB)\b/i);

        const parts: string[] = [];
        if (deviceModelMatch) parts.push(deviceModelMatch[0]);
        if (formFactorMatch) parts.push(formFactorMatch[0]);
        if (capacityMatch) parts.push(capacityMatch[0]);
        if (typeMatch) parts.push(typeMatch[0]);
        if (speedMatch) parts.push(speedMatch[0]);

        model = parts.join(" ") || rawModel.substring(0, 40);
      } else {
        // For other items, take first meaningful chunk up to 40 chars
        model = rawModel.substring(0, 40);
      }
    } else {
      // No brand found — use first 3 words as model identifier
      model = name.split(" ").slice(0, 3).join(" ");
    }
  }

  return { brand: brand || "Generic", model };
}

// Generate eBay-optimized title (max 80 chars)
export function generateEbayTitle(item: InventoryItem, category: Category | undefined, _context?: ListingContext): string {
  const { name, condition, features } = item;
  const categoryKeywords = category ? EBAY_KEYWORDS[category.ebayCategory?.toLowerCase() || ""] || [] : [];
  const { brand, model } = extractBrandAndModel(item);

  const specs = extractKeySpecs(name);
  const conditionStr = condition || "Like New";
  const useCase = categoryKeywords[0] || "Professional";
  const featureHighlight = features?.[0] || "";

  // Check if this is a RAM/memory item - those need a different template
  const isMemory =
    name.toLowerCase().includes("ram") ||
    name.toLowerCase().includes("memory") ||
    name.toLowerCase().includes("dimm");

  if (isMemory) {
    // For RAM: Brand Model Specs Condition
    // e.g., "Apple iMac Pro A1862 32GB RAM 4x8GB ECC DDR4 2666MHz"
    const templates = [
      `${brand} ${model} ${conditionStr}`,
      `${brand} ${model} - ${conditionStr}`,
      `${brand} ${model} ${conditionStr} - ${useCase}`,
    ];
    for (const template of templates) {
      if (template.length <= 80) return template.trim();
    }
    return templates[0].substring(0, 77) + "...";
  }

  // Try different template combinations and pick the best fit
  const templates = [
    `${brand} ${model} ${specs.join(" ")} ${conditionStr} - ${useCase}`,
    `${brand} ${model} ${specs.join(" ")} ${featureHighlight} ${conditionStr}`,
    `${conditionStr} ${brand} ${model} ${specs.join(" ")} ${featureHighlight}`,
  ];

  // Pick the first one that fits under 80 chars
  for (const template of templates) {
    if (template.length <= 80) return template.trim();
  }

  // Fallback: truncate the first template
  return templates[0].substring(0, 77) + "...";
}

// Generate Craigslist-optimized title (max 70 chars)
export function generateClTitle(item: InventoryItem, category: Category | undefined, context?: ListingContext): string {
  const { name, price } = item;

  const { brand, model } = extractBrandAndModel(item);
  const specs = extractKeySpecs(name);
  const priceDisplay = `$${item.price}`;
  const locationSuffix = context?.location ? ` (${context.location})` : "";

  // Check if this is a RAM/memory item - model already contains key specs
  const isMemory =
    name.toLowerCase().includes("ram") ||
    name.toLowerCase().includes("memory") ||
    name.toLowerCase().includes("dimm");

  if (isMemory) {
    // For RAM: Brand Model - Condition - Price (Location)
    const templates = [
      `${brand} ${model} - ${item.condition || "Used"} - ${priceDisplay}${locationSuffix}`,
      `${brand} ${model} - ${priceDisplay}${locationSuffix}`,
      `${brand} ${model} ${priceDisplay}${locationSuffix}`,
    ];
    for (const template of templates) {
      if (template.length <= 70) return template.trim();
    }
    return templates[0].substring(0, 67) + "...";
  }

  const templates = [
    `${brand} ${model} - ${specs.join(" ")} - ${priceDisplay}${locationSuffix}`,
    `${brand} ${model} ${specs.join(" ")} - ${item.condition || "Like New"} - ${priceDisplay}`,
  ];

  for (const template of templates) {
    if (template.length <= 70) return template.trim();
  }

  return templates[0].substring(0, 67) + "...";
}

// Generate eBay-optimized description
export function generateEbayDescription(item: InventoryItem, category: Category | undefined, context?: ListingContext): string {
  const { name, description, features, condition, price } = item;
  const { brand, model } = extractBrandAndModel(item);
  const store = context?.store;

  const featuresList =
    features && features.length > 0
      ? features.map((f: string) => `<li>${f}</li>`).join("\n  ")
      : `<li>Professional grade equipment</li>
  <li>Tested and working</li>
  <li>Fast shipping available</li>`;

  const paymentLine = store?.PaymentHandle
    ? `Payment via ${store.PaymentHandle}.`
    : "Payment arrangements made at sale.";
  const shippingLine = store?.ShippingPolicy || "Fast shipping with tracking.";

  const contactBlock = store?.ContactLine
    ? `<h3>Contact</h3>\n<p>${store.ContactLine}</p>\n\n`
    : "";

  const sellerName = store?.StoreName || "BayList";

  const html = `
<h2>${name}</h2>
<p><strong>Brand:</strong> ${brand}</p>
<p><strong>Model:</strong> ${model}</p>
<p><strong>Condition:</strong> ${condition || "Like New"}</p>
<p><strong>Price:</strong> $${price}</p>

<h3>Product Details</h3>
<p>${description || "Professional grade equipment in excellent condition."}</p>

<h3>Features</h3>
<ul>
  ${featuresList}
</ul>

<h3>What's Included</h3>
<p>Original packaging and accessories if available</p>

<h3>Shipping & Payment</h3>
<p>${shippingLine} ${paymentLine}</p>
${contactBlock}<h3>About the Seller</h3>
<p>${sellerName} — all items tested and described accurately. Fast shipping and excellent customer service.</p>
`.trim();

  return html;
}

// Generate Craigslist-optimized description
export function generateClDescription(item: InventoryItem, category: Category | undefined, context?: ListingContext): string {
  const { name, description, features, price } = item;
  const store = context?.store;

  const featuresList =
    features && features.length > 0
      ? features.map((f: string) => `<li>${f}</li>`).join("\n  ")
      : `<li>Professional grade equipment</li>
  <li>Tested and working</li>
  <li>Local pickup preferred</li>`;

  const paymentLine = store?.PaymentHandle
    ? `${store.PaymentHandle} — PayPal accepted.`
    : "PayPal accepted.";
  const shippingLine = store?.ShippingPolicy || "Shipping available.";

  const contactBlock = store?.ContactLine
    ? `\n\n<p>Contact: ${store.ContactLine}</p>`
    : "";

  const html = `
<h2>${name}</h2>

<p><strong>$${price}</strong> | ${item.condition || "Like New"}</p>

<p>${description || "Professional grade equipment in excellent condition."}</p>

<h3>Details</h3>
<ul>
  ${featuresList}
</ul>

<h3>Pickup & Payment</h3>
<p>${paymentLine} ${shippingLine}</p>${contactBlock}
`.trim();

  return html;
}

// Generate all listings for an item
export function generateAllListings(
  item: InventoryItem,
  category: Category | undefined,
  context?: ListingContext,
): Partial<InventoryItem> {
  return {
    ebay_title: generateEbayTitle(item, category, context),
    ebay_description: generateEbayDescription(item, category, context),
    cl_title: generateClTitle(item, category, context),
    cl_description: generateClDescription(item, category, context),
  };
}

// Generate listings for all items
export function generateAllInventoryListings(
  inventory: { categories?: any[]; Categories?: any[]; items: any[] },
  context?: ListingContext,
): any[] {
  const categories = inventory.categories || inventory.Categories || [];
  const items = inventory.items || [];

  return items.map((item: any) => {
    const category = categories.find((c: Category) => c.Id === item.category_id);
    if (!category) return item;

    const listings = generateAllListings(item, category, context);
    return { ...item, ...listings };
  });
}
