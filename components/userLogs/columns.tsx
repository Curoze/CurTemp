"use client";

import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type UserLog = {
  id: number;
  username: string;
  action: string;
  description?: string;
  ipAddress: string;
  created_at: Date | string;
};

export const getUserLogColumns = (): GridColDef[] => [
  {
    field: "username",
    headerName: "Username",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "action",
    headerName: "Action",
    width: 140,
    renderCell: (params: GridRenderCellParams) => {
      const action = params.value as string;
      const colorMap: Record<string, string> = {
        LOGIN: "bg-green-100 text-green-700 border-green-300",
        LOGOUT: "bg-gray-100 text-gray-700 border-gray-300",
        LOGIN_FAILED: "bg-red-100 text-red-700 border-red-300",
        CREATE: "bg-blue-100 text-blue-700 border-blue-300",
        UPDATE: "bg-yellow-100 text-yellow-700 border-yellow-300",
        DELETE: "bg-red-100 text-red-700 border-red-300",
      };
      return (
        <Badge
          variant="outline"
          className={colorMap[action] || "bg-purple-100 text-purple-700 border-purple-300"}
        >
          {action}
        </Badge>
      );
    },
  },
  {
    field: "description",
    headerName: "Description",
    flex: 2,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm text-muted-foreground">{params.value || "—"}</span>
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
    field: "created_at",
    headerName: "Timestamp",
    width: 170,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm">
        {format(new Date(params.value), "MMM dd, yyyy HH:mm:ss")}
      </span>
    ),
  },
];
