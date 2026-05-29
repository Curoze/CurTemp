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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "./columns";
import { UserUpdatePayload, getErrorMessage, RolesFilterApiResponse } from "@/lib/alltype";

interface Role { id: number; role: string; }

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

export function EditUserDialog({ isOpen, onClose, onUserUpdated, user }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    dept: "",
    nik: "",
    role_id: "",
    pass: "",
    status: "",
    ipAddress: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchOptions();
      setFormData({
        name: user.name,
        dept: user.dept || "",
        nik: user.nik,
        role_id: "",
        pass: "",
        status: user.status,
        ipAddress: user.ipAddress,
      });
    }
  }, [isOpen, user]);

  const fetchOptions = async () => {
    try {
      const rolesRes = await fetch("/api/v1/roles/filters");
      const rolesData = await rolesRes.json() as RolesFilterApiResponse;
      if (rolesData.roles) {
        const rolesList = rolesData.roles.map((r) => ({
          id: r.value,
          role: r.label,
        }));
        setRoles(rolesList);
        if (user) {
          const currentRole = rolesList.find((r: Role) => r.role === user.role);
          if (currentRole) {
            setFormData((prev) => ({ ...prev, role_id: String(currentRole.id) }));
          }
        }
      }
    } catch {
      toast.error("Failed to load options");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.name || !formData.nik || !formData.role_id) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload: UserUpdatePayload = {
        name: formData.name,
        dept: formData.dept || null,
        nik: formData.nik,
        role_id: parseInt(formData.role_id),
        status: formData.status,
        ipAddress: formData.ipAddress,
      };
      if (formData.pass) payload.pass = formData.pass;

      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update user");
      toast.success("User updated successfully!");
      onClose();
      onUserUpdated();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user account details</DialogDescription>
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
            <Label>NIK *</Label>
            <Input
              value={formData.nik}
              onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
            />
          </div>

          <div>
            <Label>Department</Label>
            <Input
              value={formData.dept}
              onChange={(e) => setFormData((p) => ({ ...p, dept: e.target.value }))}
            />
          </div>

          <div>
            <Label>Role *</Label>
            <Select
              value={formData.role_id}
              onValueChange={(v) => setFormData((p) => ({ ...p, role_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>New Password (leave blank to keep current)</Label>
            <Input
              type="password"
              placeholder="New password"
              value={formData.pass}
              onChange={(e) => setFormData((p) => ({ ...p, pass: e.target.value }))}
            />
          </div>

          <div>
            <Label>IP Address</Label>
            <Input
              value={formData.ipAddress}
              onChange={(e) => setFormData((p) => ({ ...p, ipAddress: e.target.value }))}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="unapproved">Unapproved</SelectItem>
              </SelectContent>
            </Select>
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
