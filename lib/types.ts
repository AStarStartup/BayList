export type Platform = "eBay" | "Craigslist" | "Both";

export type ItemStatus = "Available" | "Sold" | "Pending" | "Wishlist";

export interface InventoryItem {
  Id: string;
  name: string;
  sku: string;
  platform: Platform;
  price: number;
  cost: number;
  category_id: string;
  status: ItemStatus;
  condition: string;
  description: string;
  image_url: string;
  tags: string[];
  brand?: string;
  model?: string;
  features?: string[];
  ebay_title?: string;
  ebay_description?: string;
  cl_title?: string;
  cl_description?: string;
  listing_url_ebay?: string;
  listing_url_cl?: string;
  views?: number;
  watchers?: number;
  date_listed?: string | null;
  date_sold?: string | null;
  listId?: string;
}

export interface Category {
  Id: string;
  name: string;
  ebayCategory?: string;
  clCategory?: string;
}

export interface ListDefinition {
  Id: string;
  name: string;
  description: string;
}

export interface InventoryFile {
  StoreName?: string;
  Categories: Category[];
  items: InventoryItem[];
  wishlist?: InventoryItem[];
}
