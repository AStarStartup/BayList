"use client";

import React, { useState, useEffect } from "react";
import { useInventoryStore, ensureStoreConfig } from "@/lib/store";
import { Platform } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit3 } from "lucide-react";

export default function Settings() {
  const { items, categories, loading, error, fetchData, handleAddCategory, handleAddItem, handleDelete } = useInventoryStore();
  
  const [newItem, setNewItem] = useState({ name: "", platform: "eBay", price: "", description: "", imageUrl: "", categoryId: "" });
  const [newCategory, setNewCategory] = useState({ name: "" });

  useEffect(() => {
    ensureStoreConfig();
    fetchData();
  }, [fetchData]);

  const onAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleAddCategory(newCategory.name);
    setNewCategory({ name: "" });
  };

  const onAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleAddItem({
      name: newItem.name,
      platform: newItem.platform as Platform,
      price: parseFloat(newItem.price) || 0,
      description: newItem.description,
      image_url: newItem.imageUrl,
      category_id: newItem.categoryId,
      condition: "Used",
      sku: newItem.name.split(" ").join("-").toUpperCase(),
      cost: parseFloat(newItem.price) || 0,
      tags: [],
    });
    setNewItem({ name: "", platform: "eBay", price: "", description: "", imageUrl: "", categoryId: "" });
  };

  const onDelete = async (id: string, type: "item" | "category") => {
    if (!confirm(`Delete this ${type}?`)) return;
    await handleDelete(id, type);
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-20 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter">Inventory Management</h1>
        <p className="text-muted-foreground">Manage your categories and gear listings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-10">
          <section className="bg-card p-6 rounded-3xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6">Categories</h2>
            <form onSubmit={onAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input 
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Category</Button>
            </form>
            <div className="mt-6 space-y-2">
              {categories.map(c => (
                <div key={c.Id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span>{c.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(c.Id, 'category')} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card p-6 rounded-3xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6">Add New Item</h2>
            <form onSubmit={onAddItem} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input 
                  placeholder="Item Name"
                  value={newItem.name} 
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <select 
                    value={newItem.platform} 
                    onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="eBay">eBay</option>
                    <option value="Craigslist">Craigslist</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input 
                    type="number" 
                    value={newItem.price} 
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  value={newItem.categoryId} 
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  {categories.map(c => (
                    <option key={c.Id} value={c.Id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Item description..."
                  value={newItem.description} 
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!newItem.name}>Add to Inventory</Button>
            </form>
          </section>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Inventory List</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.Id} className="p-4 border rounded-xl bg-white shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors">
                <div className="flex-1">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.platform} • ${item.price}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => console.log("Edit", item)}><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item.Id, 'item')} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
