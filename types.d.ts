import type { InventoryItem, Category, ListDefinition, Platform } from "@/lib/types";
import type { StoreConfig } from "@/lib/config";

export interface InventoryState {
  items: InventoryItem[];
  categories: Category[];
  lists: ListDefinition[];
  store: StoreConfig;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  handleAddCategory: (name: string) => Promise<void>;
  handleAddItem: (item: Omit<InventoryItem, "Id" | "status">) => Promise<void>;
  handleDelete: (id: string, type: "item" | "category") => Promise<void>;
  sellItem: (id: string) => Promise<void>;
  moveItemToList: (itemId: string, listId: string) => Promise<void>;
}
