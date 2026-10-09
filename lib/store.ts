import { create } from "zustand";
import { InventoryItem, Category, ListDefinition } from "./types";
import { loadStoreConfig, StoreConfig } from "./config";

interface InventoryState {
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

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  categories: [],
  lists: [
    { Id: "inventory", name: "Inventory", description: "Available items for sale" },
    { Id: "wishlist", name: "Wishlist", description: "Items you want to acquire" },
    { Id: "sold", name: "Sold", description: "Items that have been sold" },
  ],
  store: {},
  loading: true,
  syncing: false,
  error: null,

  fetchData: async () => {
    const hasLocalData = get().items.length > 0;

    // If we have local data, we don't want a full-screen loading spinner.
    // We just want to show the local data and sync in the background.
    if (hasLocalData) {
      set({ syncing: true });
    } else {
      set({ loading: true });
    }

    try {
      let data: any;

      // 1. Local inventory: API in dev, static /inventory.json in export mode
      const localRes = await fetch("/api/inventory", { cache: "no-store" }).catch(() => null);
      if (localRes && localRes.ok) {
        data = await localRes.json();
        console.log("Store: Data from local inventory:", data);
      } else {
        const staticRes = await fetch("/inventory.json", { cache: "no-store" });
        if (!staticRes.ok) throw new Error(`Inventory fetch failed: ${staticRes.statusText}`);
        data = await staticRes.json();
        console.log("Store: Data from static inventory:", data);
      }

      // 3. Normalize data structure
      if (Array.isArray(data)) {
        set({
          items: data,
          categories: [],
          loading: false,
          syncing: false,
        });
      } else {
        set({
          items: data.items || [],
          categories: data.Categories || [],
          loading: false,
          syncing: false,
        });
      }
    } catch (e: any) {
      console.error("Store: Fetch Error:", e);
      set({ error: e.message, loading: false, syncing: false });
    }
  },

  handleAddCategory: async (name: string) => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", name }),
      });
      if (res.ok) {
        get().fetchData();
      }
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ syncing: false });
    }
  },

  handleAddItem: async (item) => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          price: parseFloat(item.price.toString()),
          status: "Available",
        }),
      });
      if (res.ok) {
        get().fetchData();
      }
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ syncing: false });
    }
  },

  handleDelete: async (id: string, type: "item" | "category") => {
    try {
      const res = await fetch("/api/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        get().fetchData();
      }
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  sellItem: async (id: string) => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        get().fetchData();
      } else {
        const err = await res.text();
        throw new Error(err);
      }
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ syncing: false });
    }
  },

  moveItemToList: async (itemId: string, listId: string) => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "move", itemId, listId }),
      });
      if (res.ok) {
        get().fetchData();
      }
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ syncing: false });
    }
  },
}));

// Load store config once on first client use (generated listing copy).
export function useStoreConfig(): StoreConfig {
  return useInventoryStore((s) => s.store);
}

let configLoaded = false;
export function ensureStoreConfig(): void {
  if (configLoaded) return;
  configLoaded = true;
  loadStoreConfig().then((store) => {
    useInventoryStore.setState({ store });
  });
}
