"use client";

import React, { useState } from "react";
import { useInventoryStore } from "@/lib/store";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

const InventoryImageCountMax = 5;
const MaxTitleLength = 100;

interface InventoryItemCardProps {
  onClose: () => void;
}

export default function InventoryItemCard({ onClose }: InventoryItemCardProps) {
  const { categories, handleAddItem, handleAddCategory } = useInventoryStore();
  
  const [formData, setFormData] = useState({
    name: "",
    platform: "eBay",
    price: "",
    description: "",
    image_urls: [] as string[],
    category_id: "",
    condition_score: 2,
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

  const handleAdd = async () => {
    if (isNewCategoryMode && newCategoryName) {
      await handleAddCategory(newCategoryName);
      setIsNewCategoryMode(false);
    }

    const newItem = {
      name: formData.name,
      platform: formData.platform,
      price: parseFloat(formData.price) || 0,
      description: formData.description,
      image_url: formData.image_urls[0] || "",
      category_id: formData.category_id,
      condition: conditionLabels[formData.condition_score] || "Used",
      sku: formData.name.split(" ").join("-").toUpperCase(),
      cost: parseFloat(formData.price) || 0,
      tags: [],
    };

    await handleAddItem(newItem as Omit<InventoryItem, "Id" | "status">);
    setFormData({
      name: "",
      platform: "eBay",
      price: "",
      description: "",
      image_urls: [],
      category_id: "",
      condition_score: 2,
    });
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      platform: "eBay",
      price: "",
      description: "",
      image_urls: [],
      category_id: "",
      condition_score: 2,
    });
    setNewCategoryName("");
    setIsNewCategoryMode(false);
    onClose();
  };

  const conditionLabels = ["Poor", "Good", "Excellent", "Like New"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <Card className="w-full max-w-2xl p-8 rounded-[2rem] border-white/20 shadow-2xl bg-white/80">
        <h2 className="text-3xl font-bold mb-8 text-center">Add New Item</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <select 
              value={formData.category_id} 
              onChange={(e) => {
                if (e.target.value === "new_category") {
                  setIsNewCategoryMode(true);
                } else {
                  setIsNewCategoryMode(false);
                  setFormData(prev => ({ ...prev, category_id: e.target.value }));
                }
              }}
              className="w-full px-3 py-2 border rounded-md bg-white"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.Id} value={c.Id}>{c.name}</option>
              ))}
              <option value="new_category">New category</option>
            </select>
          </div>

          {isNewCategoryMode && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <Input 
                placeholder="Enter new category name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button variant="ghost" onClick={() => {
                if (newCategoryName) {
                  handleAddCategory(newCategoryName);
                  setIsNewCategoryMode(false);
                }
              }} className="p-2">✓</Button>
              <Button variant="ghost" onClick={() => setIsNewCategoryMode(false)} className="p-2">X</Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Title</Label>
              <span className="text-xs text-muted-foreground">
                {formData.name.length}/{MaxTitleLength}
              </span>
            </div>
            <Input 
              placeholder="Item Title"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              maxLength={MaxTitleLength}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="Describe the item..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input 
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Condition: {conditionLabels[formData.condition_score]}</Label>
            <Slider
              defaultValue={[formData.condition_score]}
              min={0}
              max={3}
              step={1}
              onValueChange={(val) => setFormData(prev => ({ ...prev, condition_score: val[0] }))}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
              <span>Like New</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images (Max {InventoryImageCountMax})</Label>
            <div className="border-2 border-dashed p-4 rounded-xl text-center text-muted-foreground">
              Click to upload images (Simulated)
              <Input type="file" multiple className="hidden" id="img-upload" onChange={(e) => {
                const fileList = e.target.files;
                if (!fileList) return;
                const files = Array.from(fileList);
                if (formData.image_urls.length + files.length <= InventoryImageCountMax) {
                  setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, ...files.map(f => f.name)] }));
                }
              }} />
              <label htmlFor="img-upload" className="cursor-pointer text-blue-500 hover:underline">
                Select Files
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" className="bg-white text-black border-gray-300" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full"
              onClick={handleAdd}
            >
              Add to Inventory
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
