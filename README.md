# BayList_

Automated listing generator: imports inventory data and generates optimized listings for eBay and Craigslist using AI for platform-specific titles and descriptions.

## Architecture

```
BayList_/
├── app/
│   ├── page.tsx             # Gallery UI (browse, generate, export)
│   ├── settings/            # Inventory management
│   ├── api/                 # API routes (dev server mode)
│   │   ├── inventory/       # Inventory CRUD
│   │   ├── sell/            # Mark as sold
│   │   ├── generate/        # Listing generation
│   │   └── export/          # Platform exports (JSON/CSV)
│   └── app.css              # Tailwind + theme tokens
├── components/              # React components
├── lib/
│   ├── types.ts             # Shared domain types
│   ├── ai.ts                # Template-based listing generation
│   ├── export.ts            # Export builders (JSON/CSV)
│   ├── inventory.ts         # Server-side Inventory.json I/O
│   ├── config.ts            # Store config loader (/config.json)
│   └── store.ts             # Zustand client store
├── public/config.json       # Store config (public, editable)
├── scripts/export_inventory.js
└── Inventory.json           # Inventory data (source of truth)
```

## Two ways to run it

**Dev (editable inventory, full API):**

```bash
npm install
npm run dev          # http://localhost:3001
```

Add/edit/sell items through the UI; changes write to `Inventory.json`.

**Static (read-only, e.g. GitHub Pages):**

```bash
npm run publish      # build + copy Inventory.json into out/
```

Deploy `out/`. The client loads `/inventory.json` (static copy) instead of
the API, so browsing, listing preview, and export (client-side generation)
all work without a server. Edit `Inventory.json` and republish to update
data.

## Store configuration

`public/config.json` (shipped in the build) controls the copy baked into
generated listings:

- `StoreName` — seller name in descriptions
- `ContactLine` — contact details shown in listing footers
- `PaymentHandle` — payment line (e.g. `Venmo: your-handle`)
- `ShippingPolicy` — shipping sentence
- `Location` — city shown in Craigslist titles (e.g. `Eugene, OR`)

Edit it locally and republish; keep personal details out of the repo.

## Data

`Inventory.json` is the source of truth:

```json
{
  "StoreName": "...",
  "Categories": [{ "Id": "cat_cameras", "name": "Cameras", "ebayCategory": "...", "clCategory": "photo" }],
  "items": [ { "Id": "cam_fx5_001", "name": "...", "platform": "Both", "price": 4500, "category_id": "cat_cameras", "status": "Available", "..." : "..." } ],
  "wishlist": []
}
```

`npm run dev` reads and writes this file in place; `npm run publish` copies
it to `out/inventory.json`.

## API endpoints (dev mode)

- `GET /api/inventory` — read inventory
- `POST /api/inventory` — add item / add category / move item to a list
- `DELETE /api/inventory` — delete item or category
- `POST /api/generate` — generate listings for all items (`{ "location": "..." }` optional)
- `POST /api/sell` — mark item sold (moves to `wishlist` key + writes `sold/` record)
- `GET /api/export?platform=all|ebay|craigslist&format=json|csv` — export listings

## License

MIT

Copyright [AStartup](https://astartup.net); all rights reserved.
