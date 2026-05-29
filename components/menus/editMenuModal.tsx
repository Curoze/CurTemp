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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, RolesFilterApiResponse, MenusFilterApiResponse } from "@/lib/alltype";
import { Menu } from "./columns";
import {
  ChevronDown, User, Layout, MapPin, BarChart3, FileText, LogOut,
  Mail, Settings, CheckSquare, Bot, MessageSquare, ShoppingCart,
  Building2, Box, List, Info, QrCode, FolderCog, Search, LayoutDashboard,
} from "lucide-react";

interface Role { id: number; role: string; }
interface ParentMenu { id: number; title: string; }

interface EditMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuUpdated: () => void;
  menu: Menu | null;
}

const iconOptions = [
  { value: "0", label: "ChevronDown", icon: ChevronDown },
  { value: "1", label: "User", icon: User },
  { value: "2", label: "Layout", icon: Layout },
  { value: "3", label: "MapPin", icon: MapPin },
  { value: "4", label: "BarChart3", icon: BarChart3 },
  { value: "5", label: "FileText", icon: FileText },
  { value: "6", label: "LogOut", icon: LogOut },
  { value: "7", label: "Mail", icon: Mail },
  { value: "8", label: "Settings", icon: Settings },
  { value: "9", label: "CheckSquare", icon: CheckSquare },
  { value: "10", label: "Bot", icon: Bot },
  { value: "11", label: "MessageSquare", icon: MessageSquare },
  { value: "12", label: "ShoppingCart", icon: ShoppingCart },
  { value: "13", label: "Building2", icon: Building2 },
  { value: "14", label: "Box", icon: Box },
  { value: "15", label: "List", icon: List },
  { value: "16", label: "Info", icon: Info },
  { value: "17", label: "QrCode", icon: QrCode },
  { value: "18", label: "FolderCog", icon: FolderCog },
  { value: "19", label: "Search", icon: Search },
  { value: "20", label: "Dashboard", icon: LayoutDashboard },
];

export function EditMenuDialog({ isOpen, onClose, onMenuUpdated, menu }: EditMenuDialogProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [parentMenus, setParentMenus] = useState<ParentMenu[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    icon: "",
    path: "",
    parent_id: "",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen && menu) {
      fetchFilterOptions();
      setFormData({
        title: menu.title || "",
        icon: menu.icon || "",
        path: menu.path || "",
        parent_id: menu.parent_id?.toString() || "",
        sort_order: menu.sort_order || 0,
        is_active: menu.is_active ?? true,
      });
    }
  }, [isOpen, menu]);

  const fetchFilterOptions = async () => {
    try {
      const [rolesRes, menusRes] = await Promise.all([
        fetch("/api/v1/roles/filters"),
        fetch("/api/v1/menu/filters"),
      ]);
      const rolesData = await rolesRes.json() as RolesFilterApiResponse;
      const menusData = await menusRes.json() as MenusFilterApiResponse;

      if (rolesData.roles) {
        const rolesList = rolesData.roles.map((r) => ({
          id: r.value,
          role: r.label,
        }));
        setRoles(rolesList);
        if (menu?.roles) {
          setSelectedRoles(menu.roles.map((r) => r.id));
        }
      }
      if (menusData.menus) {
        setParentMenus(menusData.menus.map((m) => ({ id: m.value, title: m.label })));
      }
    } catch {
      toast.error("Failed to load form options");
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error("Select at least one role");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        icon: formData.icon,
        path: formData.path || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        role_ids: selectedRoles,
      };
      const response = await fetch(`/api/v1/menu/${menu?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update menu");
      toast.success("Menu updated successfully!");
      onMenuUpdated();
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to update menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu</DialogTitle>
          <DialogDescription>Update menu details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div>
            <Label>Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(v) => setFormData((p) => ({ ...p, icon: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon size={16} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Path</Label>
            <Input
              value={formData.path}
              onChange={(e) => setFormData((p) => ({ ...p, path: e.target.value }))}
            />
          </div>

          <div>
            <Label>Parent Menu</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(v) => setFormData((p) => ({ ...p, parent_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="None (root menu)" />
              </SelectTrigger>
              <SelectContent>
                {parentMenus.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
              }
            />
          </div>

          <div>
            <Label>Roles *</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={`edit-role-${role.id}`} className="font-normal cursor-pointer">
                    {role.role}
                  </Label>
                </div>
              ))}
            </div>
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
