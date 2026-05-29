"use client";

import { useMemo, useState } from "react";
import { MuiDataTable, FilterableColumn } from "@/components/datatable/MuiDataTable";
import { getRoleColumns, Role } from "@/components/roles/columns";
import { EditRoleDialog } from "@/components/roles/editRoleModal";
import { AddRoleModal } from "@/components/roles/addRoleModal";
import DeleteConfirmationDialog from "@/components/modal/deleteConfirm";
import { Card } from "@/components/ui/card";

export default function RolesPage() {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const columns = useMemo(
    () =>
      getRoleColumns({
        onUpdate: (role) => setEditingRole(role),
        onDelete: (role) => setDeletingRole(role),
      }),
    []
  );

  const handleRoleUpdated = () => setRefreshKey((prev) => prev + 1);

  const filterableColumns: FilterableColumn[] = [
    { id: "role", title: "Role Name", type: "text", placeholder: "Search by role name..." },
  ];

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
            Role Management
          </h1>
          <p className="text-muted-foreground">Manage roles and their access permissions</p>
        </div>
        <AddRoleModal onRoleAdded={handleRoleUpdated} />
      </div>

      <Card className="p-3 dark:bg-[#1e2433]">
        <MuiDataTable
          columns={columns}
          apiUrl="/api/v1/roles?"
          refreshKey={refreshKey}
          filterableColumns={filterableColumns}
          defaultSortBy="updated_at"
          defaultSortOrder="desc"
          paginationSize={10}
          enableRowSelection={false}
          filename="roles_export"
          getRowId={(row) => row.id ?? 0}
        />
      </Card>

      <EditRoleDialog
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        onRoleUpdated={handleRoleUpdated}
        role={editingRole}
      />

      <DeleteConfirmationDialog
        data={deletingRole}
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onDeleted={handleRoleUpdated}
        url={`/api/v1/roles/${deletingRole?.id}`}
        dataToShow={deletingRole?.role}
      />
    </div>
  );
}
