"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type MasterExample = {
  id: number;
  name: string;
  description?: string;
  value?: string;
  updated_at: Date | string;
};

type ColumnOptions = {
  onDelete: (item: MasterExample) => void;
  onUpdate: (item: MasterExample) => void;
};

export const getMasterExampleColumns = ({ onDelete, onUpdate }: ColumnOptions): GridColDef[] => [
  {
    field: "name",
    headerName: "Name",
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
    field: "value",
    headerName: "Value",
    width: 130,
    renderCell: (params: GridRenderCellParams) => (
      <span>{params.value || "—"}</span>
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
      const item = params.row as MasterExample;
      return (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="bg-blue-700 hover:bg-blue-800 text-white h-8 w-8"
            onClick={() => onUpdate(item)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
