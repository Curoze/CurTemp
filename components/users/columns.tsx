"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type User = {
  id: number;
  name: string;
  role: string;
  dept?: string;
  station?: string;
  nik: string;
  ipAddress: string;
  status: string;
  updated_at: Date | string;
};

type ColumnOptions = {
  onDelete: (user: User) => void;
  onUpdate: (user: User) => void;
};

export const getUserColumns = ({ onDelete, onUpdate }: ColumnOptions): GridColDef[] => [
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "nik",
    headerName: "NIK",
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <span className="font-mono text-sm">{params.value}</span>
    ),
  },
  {
    field: "role",
    headerName: "Role",
    width: 130,
    renderCell: (params: GridRenderCellParams) => (
      <Badge variant="outline" className="font-medium">
        {params.value}
      </Badge>
    ),
  },
  {
    field: "dept",
    headerName: "Department",
    width: 140,
    renderCell: (params: GridRenderCellParams) => (
      <span>{params.value || "—"}</span>
    ),
  },
  {
    field: "ipAddress",
    headerName: "IP Address",
    width: 130,
    renderCell: (params: GridRenderCellParams) => (
      <span className="font-mono text-sm">{params.value}</span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    renderCell: (params: GridRenderCellParams) => {
      const status = params.value as string;
      return (
        <Badge
          className={
            status === "approved"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-yellow-100 text-yellow-700 border-yellow-300"
          }
          variant="outline"
        >
          {status}
        </Badge>
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
      const user = params.row as User;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="bg-blue-700 hover:bg-blue-800 text-white h-8 w-8"
            onClick={() => onUpdate(user)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
