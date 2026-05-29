"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type Role = {
  id: number;
  role: string;
  description?: string;
  updated_at: Date | string;
};

type ColumnOptions = {
  onDelete: (role: Role) => void;
  onUpdate: (role: Role) => void;
};

export const getRoleColumns = ({ onDelete, onUpdate }: ColumnOptions): GridColDef[] => [
  {
    field: "role",
    headerName: "Role Name",
    flex: 1,
    minWidth: 150,
  },
  {
    field: "description",
    headerName: "Description",
    flex: 2,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-muted-foreground">{params.value || "—"}</span>
    ),
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
      const role = params.row as Role;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="bg-blue-700 hover:bg-blue-800 text-white h-8 w-8"
            onClick={() => onUpdate(role)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8"
            onClick={() => onDelete(role)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
