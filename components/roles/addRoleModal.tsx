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

interface AddRoleModalProps {
  onRoleAdded?: () => void;
}

export function AddRoleModal({ onRoleAdded }: AddRoleModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ role: "", description: "" });

  const resetForm = () => setFormData({ role: "", description: "" });

  const handleSubmit = async () => {
    if (!formData.role) {
      toast.error("Role name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/v1/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create role");
      toast.success("Role created successfully!");
      setOpen(false);
      resetForm();
      onRoleAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>Create a new user role</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Role Name *</Label>
            <Input
              placeholder="e.g. ADMIN, MANAGER"
              value={formData.role}
              onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
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
            {loading ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
