"use client";

import { useMemo, useState } from "react";
import { MuiDataTable, FilterableColumn } from "@/components/datatable/MuiDataTable";
import { getUserColumns, User } from "@/components/users/columns";
import { EditUserDialog } from "@/components/users/editUserModal";
import { AddUserModal } from "@/components/users/addUserModal";
import DeleteConfirmationDialog from "@/components/modal/deleteConfirm";
import { Card } from "@/components/ui/card";

export default function UsersPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const columns = useMemo(
    () =>
      getUserColumns({
        onUpdate: (user) => setEditingUser(user),
        onDelete: (user) => setDeletingUser(user),
      }),
    []
  );

  const handleUserUpdated = () => setRefreshKey((prev) => prev + 1);

  const filterableColumns: FilterableColumn[] = [
    { id: "name", title: "Name", type: "text", placeholder: "Search by name..." },
    { id: "nik", title: "NIK", type: "text", placeholder: "Search by NIK..." },
    { id: "dept", title: "Department", type: "text", placeholder: "Search by department..." },
    {
      id: "status",
      title: "Status",
      type: "select",
      options: [
        { value: "approved", label: "Approved" },
        { value: "unapproved", label: "Unapproved" },
      ],
    },
  ];

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
            User Management
          </h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <AddUserModal onUserAdded={handleUserUpdated} />
      </div>

      <Card className="p-3 dark:bg-[#1e2433]">
        <MuiDataTable
          columns={columns}
          apiUrl="/api/v1/users?"
          refreshKey={refreshKey}
          filterableColumns={filterableColumns}
          defaultSortBy="updated_at"
          defaultSortOrder="desc"
          paginationSize={10}
          enableRowSelection={false}
          filename="users_export"
          getRowId={(row) => row.id ?? 0}
        />
      </Card>

      <EditUserDialog
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
        user={editingUser}
      />

      <DeleteConfirmationDialog
        data={deletingUser}
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onDeleted={handleUserUpdated}
        url={`/api/v1/users/${deletingUser?.id}`}
        dataToShow={deletingUser?.name}
      />
    </div>
  );
}
