"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MasterExample } from "./columns";

interface EditMasterExampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  item: MasterExample | null;
}

export function EditMasterExampleDialog({
  isOpen,
  onClose,
  onUpdated,
  item,
}: EditMasterExampleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", value: "" });

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        value: item.value || "",
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async () => {
    if (!item) return;
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/master-example/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update item");
      toast.success("Item updated successfully!");
      onClose();
      onUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update master data entry</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              value={formData.value}
              onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
