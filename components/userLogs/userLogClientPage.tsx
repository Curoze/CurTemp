"use client";

import { useMemo } from "react";
import { MuiDataTable, FilterableColumn } from "@/components/datatable/MuiDataTable";
import { getUserLogColumns } from "@/components/userLogs/columns";
import { Card } from "@/components/ui/card";

export default function UserLogPage() {
  const columns = useMemo(() => getUserLogColumns(), []);

  const filterableColumns: FilterableColumn[] = [
    { id: "username", title: "Username", type: "text", placeholder: "Search by username..." },
    {
      id: "action",
      title: "Action",
      type: "select",
      options: [
        { value: "LOGIN", label: "LOGIN" },
        { value: "LOGOUT", label: "LOGOUT" },
        { value: "LOGIN_FAILED", label: "LOGIN_FAILED" },
        { value: "CREATE", label: "CREATE" },
        { value: "UPDATE", label: "UPDATE" },
        { value: "DELETE", label: "DELETE" },
      ],
    },
  ];

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
          User Activity Logs
        </h1>
        <p className="text-muted-foreground">View all user actions and login history</p>
      </div>

      <Card className="p-3 dark:bg-[#1e2433]">
        <MuiDataTable
          columns={columns}
          apiUrl="/api/v1/user-logs?"
          filterableColumns={filterableColumns}
          defaultSortBy="created_at"
          defaultSortOrder="desc"
          paginationSize={15}
          enableRowSelection={false}
          filename="user_logs_export"
          getRowId={(row) => row.id}
        />
      </Card>
    </div>
  );
}
