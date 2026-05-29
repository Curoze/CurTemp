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
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Role { id: number; role: string; }

interface AddUserModalProps {
  onUserAdded?: () => void;
}

export function AddUserModal({ onUserAdded }: AddUserModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    dept: "",
    nik: "",
    role_id: "",
    pass: "",
    status: "unapproved",
    ipAddress: "free",
  });

  useEffect(() => {
    if (open) fetchOptions();
  }, [open]);

  const fetchOptions = async () => {
    try {
      const rolesRes = await fetch("/api/v1/roles/filters");
      const rolesData = await rolesRes.json();
      if (rolesData.roles) {
        setRoles(rolesData.roles.map((r: any) => ({ id: r.value, role: r.label })));
      }
    } catch {
      toast.error("Failed to load options");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", dept: "", nik: "", role_id: "", pass: "", status: "unapproved", ipAddress: "free" });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.nik || !formData.role_id || !formData.pass) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        dept: formData.dept || null,
        nik: formData.nik,
        role_id: parseInt(formData.role_id),
        pass: formData.pass,
        status: formData.status,
        ipAddress: formData.ipAddress,
      };
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");
      toast.success("User created successfully!");
      setOpen(false);
      resetForm();
      onUserAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <Label>NIK *</Label>
            <Input
              placeholder="Employee ID"
              value={formData.nik}
              onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
            />
          </div>

          <div>
            <Label>Department</Label>
            <Input
              placeholder="Department"
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
            <Label>Password *</Label>
            <Input
              type="password"
              placeholder="Password"
              value={formData.pass}
              onChange={(e) => setFormData((p) => ({ ...p, pass: e.target.value }))}
            />
          </div>

          <div>
            <Label>IP Address</Label>
            <Input
              placeholder='Use "free" to allow any IP'
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
