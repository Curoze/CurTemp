"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type Menu = {
  id: number;
  title: string;
  icon?: string;
  parent_id?: number | null;
  path?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date | string;
  updated_at: Date | string;
  parent?: { id: number; title: string } | null;
  roles?: { id: number; role: string }[];
};

type ColumnOptions = {
  onDelete: (menu: Menu) => void;
  onUpdate: (menu: Menu) => void;
};

export const getMenuColumns = ({ onDelete, onUpdate }: ColumnOptions): GridColDef[] => [
  {
    field: "title",
    headerName: "Title",
    flex: 1,
    minWidth: 150,
    renderCell: (params: GridRenderCellParams) => (
      <span className="font-medium">{params.value}</span>
    ),
  },
  {
    field: "path",
    headerName: "Path",
    flex: 1,
    minWidth: 150,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {params.value || "—"}
      </span>
    ),
  },
  {
    field: "parent",
    headerName: "Parent Menu",
    flex: 1,
    minWidth: 130,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      const parent = params.value as Menu["parent"];
      return (
        <span className="text-sm">{parent ? parent.title : "—"}</span>
      );
    },
  },
  {
    field: "sort_order",
    headerName: "Order",
    width: 80,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm">{params.value}</span>
    ),
  },
  {
    field: "roles",
    headerName: "Roles",
    flex: 1,
    minWidth: 150,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      const roles = params.value as Menu["roles"];
      if (!roles || roles.length === 0) return <span className="text-gray-400 text-sm">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {roles.map((r) => (
            <Badge key={r.id} variant="outline" className="text-xs">
              {r.role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    field: "updated_at",
    headerName: "Last Updated",
    width: 160,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm">
        {format(new Date(params.value), "MMM dd, yyyy HH:mm")}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 110,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      const menu = params.row as Menu;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="bg-blue-700 hover:bg-blue-800 text-white h-8 w-8"
            onClick={() => onUpdate(menu)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8"
            onClick={() => onDelete(menu)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
