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
import { Role } from "./columns";

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
  role: Role | null;
}

export function EditRoleDialog({ isOpen, onClose, onRoleUpdated, role }: EditRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ role: "", description: "" });

  useEffect(() => {
    if (isOpen && role) {
      setFormData({ role: role.role, description: role.description || "" });
    }
  }, [isOpen, role]);

  const handleSubmit = async () => {
    if (!role) return;
    if (!formData.role) {
      toast.error("Role name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update role");
      toast.success("Role updated successfully!");
      onClose();
      onRoleUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Update role details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Role Name *</Label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
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
