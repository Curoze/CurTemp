"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddMasterExampleModalProps {
  onAdded?: () => void;
}

export function AddMasterExampleModal({ onAdded }: AddMasterExampleModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", value: "" });

  const resetForm = () => setFormData({ name: "", description: "", value: "" });

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/v1/master-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create item");
      toast.success("Item created successfully!");
      setOpen(false);
      resetForm();
      onAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Create a new master data entry</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              placeholder="Item name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              placeholder="Item value"
              value={formData.value}
              onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
