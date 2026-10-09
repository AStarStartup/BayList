"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventoryStore, ensureStoreConfig } from "../lib/store";
import InventoryItemCard from "@/components/InventoryItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, MoreVertical, ShoppingBag, ShoppingCart, Package } from "lucide-react";

export default function GalleryPage() {
  const { items, loading, error, fetchData, store } = useInventoryStore();
  const [filter, setFilter] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [exportPlatform, setExportPlatform] = useState<"all" | "ebay" | "craigslist">("all");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    ensureStoreConfig();
    fetchData();
  }, [fetchData]);

  const filteredItems = filter === "All"
    ? items
    : items.filter(item => item.platform === filter);

  // Generate listings for all items (location stamps Craigslist titles)
  const handleGenerateListings = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: store.Location || "" }),
      });
      const data = await response.json();
      if (data.success) {
        setGenerationComplete(true);
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Failed to generate listings:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Export listings
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/export?platform=${exportPlatform}&format=${exportFormat}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportPlatform === 'all' 
        ? `all_listings.${exportFormat}` 
        : `${exportPlatform}_listings.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export listings:", err);
    } finally {
      setExporting(false);
    }
  };

  // Download inventory JSON
  const handleDownloadInventory = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Inventory.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-b py-16 mb-12">
            <div className="max-w-6xl mx-auto px-8 flex justify-between items-end">
              <div className="flex flex-col">
                <Skeleton className="h-16 w-64 mb-4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl shadow-sm max-w-md text-center">
          <h3 className="text-red-600 font-bold mb-2">Error Loading Inventory</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="bg-red-600 hover:bg-red-700">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b py-16 mb-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-6xl font-black tracking-tighter text-slate-900">BayList</h1>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">Open Source</Badge>
            </div>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              Automated listing generator for eBay and Craigslist. Generate optimized titles and descriptions, then export for bulk upload.
              <span className="block mt-1 text-blue-600 font-medium">Host for free with GitHub Pages.</span>
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <span className="mr-2">+</span> Add Item
            </Button>
            <Button
              onClick={handleGenerateListings}
              disabled={generating}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              {generating ? "Generating..." : "Generate Listings"}
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="outline"
              className="rounded-full border-slate-300 hover:bg-slate-100 gap-2"
            >
              {exporting ? "Exporting..." : "Export Listings"}
            </Button>
            <a
              href="https://github.com/AStarStartup"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="rounded-full border-slate-300 hover:bg-slate-100 gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>

      {showAddModal && <InventoryItemCard onClose={() => setShowAddModal(false)} />}

      <div className="max-w-6xl mx-auto px-8">
        {/* Export Controls */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Export Settings</h3>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                value={exportPlatform}
                onChange={(e) => setExportPlatform(e.target.value as any)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All Platforms</option>
                <option value="ebay">eBay Only</option>
                <option value="craigslist">Craigslist Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          {["All", "eBay", "Both", "Craigslist"].map((f) => (
            <Button 
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="rounded-full"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Item Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.Id} className="group bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-slate-100">
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Platform icons - dev only */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                      {item.platform === 'eBay' && <ShoppingBag className="w-4 h-4 text-blue-600" />}
                      {item.platform === 'Craigslist' && <ShoppingCart className="w-4 h-4 text-green-600" />}
                      {item.platform === 'Both' && (
                        <div className="flex gap-0.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                          <ShoppingCart className="w-3.5 h-3.5 text-green-600" />
                        </div>
                      )}
                    </div>
                    {/* ... dropdown - dev only */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item.Id ? null : item.Id);
                        }}
                        className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>
                      {openMenuId === item.Id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                          <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Move to</div>
                          {useInventoryStore.getState().lists.map((list) => (
                            <button
                              key={list.Id}
                              onClick={async () => {
                                await useInventoryStore.getState().moveItemToList(item.Id, list.Id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              {list.Id === 'inventory' && <Package className="w-4 h-4 text-slate-500" />}
                              {list.Id === 'wishlist' && <ShoppingCart className="w-4 h-4 text-blue-500" />}
                              {list.Id === 'sold' && <ShoppingBag className="w-4 h-4 text-green-500" />}
                              {list.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">{item.name}</h3>
                  <p className="text-slate-500 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-black text-blue-600">${item.price}</span>
                    <span className="text-sm text-slate-400">{item.condition}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="rounded-full flex-1"
                      onClick={() => setSelectedItem(item)}
                    >
                      View Listings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => setSelectedItem(item)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">No items found in this category.</p>
          </div>
        )}

        {/* Listing Preview Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* eBay Listing */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-bold mb-2 text-blue-600">eBay Listing</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <div className="p-2 bg-white rounded border text-sm">
                      {selectedItem.ebay_title || "Click 'Generate Listings' to create this title"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <div className="p-2 bg-white rounded border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedItem.ebay_description || "Click 'Generate Listings' to create this description"}
                    </div>
                  </div>
                </div>

                {/* Craigslist Listing */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-bold mb-2 text-green-600">Craigslist Listing</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <div className="p-2 bg-white rounded border text-sm">
                      {selectedItem.cl_title || "Click 'Generate Listings' to create this title"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <div className="p-2 bg-white rounded border text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedItem.cl_description || "Click 'Generate Listings' to create this description"}
                    </div>
                  </div>
                </div>
              </div>

              {generationComplete && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-600 font-medium">✓ Listings generated successfully!</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <Button 
            variant="outline" 
            className="rounded-full border-slate-300 hover:bg-slate-100"
            onClick={handleDownloadInventory}
          >
            Download Inventory JSON
          </Button>
        </div>

        <footer className="mt-20 pt-10 border-t border-slate-200 text-center text-sm text-slate-400">
          Copyright AStartup; all rights reserved
        </footer>
      </div>
    </main>
  );
}
