"use client";

import { useMemo, useState } from "react";
import { MuiDataTable, FilterableColumn } from "@/components/datatable/MuiDataTable";
import { getMasterExampleColumns, MasterExample } from "@/components/masterExample/columns";
import { EditMasterExampleDialog } from "@/components/masterExample/editModal";
import { AddMasterExampleModal } from "@/components/masterExample/addModal";
import DeleteConfirmationDialog from "@/components/modal/deleteConfirm";
import { Card } from "@/components/ui/card";

export default function MasterExamplePage() {
  const [editingItem, setEditingItem] = useState<MasterExample | null>(null);
  const [deletingItem, setDeletingItem] = useState<MasterExample | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const columns = useMemo(
    () =>
      getMasterExampleColumns({
        onUpdate: (item) => setEditingItem(item),
        onDelete: (item) => setDeletingItem(item),
      }),
    []
  );

  const handleUpdated = () => setRefreshKey((prev) => prev + 1);

  const filterableColumns: FilterableColumn[] = [
    { id: "name", title: "Name", type: "text", placeholder: "Search by name..." },
  ];

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
            Master Data Example
          </h1>
          <p className="text-muted-foreground">Template for master data management</p>
        </div>
        <AddMasterExampleModal onAdded={handleUpdated} />
      </div>

      <Card className="p-3 dark:bg-[#1e2433]">
        <MuiDataTable
          columns={columns}
          apiUrl="/api/v1/master-example?"
          refreshKey={refreshKey}
          filterableColumns={filterableColumns}
          defaultSortBy="updated_at"
          defaultSortOrder="desc"
          paginationSize={10}
          enableRowSelection={false}
          filename="master_example_export"
          getRowId={(row) => row.id ?? 0}
        />
      </Card>

      <EditMasterExampleDialog
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onUpdated={handleUpdated}
        item={editingItem}
      />

      <DeleteConfirmationDialog
        data={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onDeleted={handleUpdated}
        url={`/api/v1/master-example/${deletingItem?.id}`}
        dataToShow={deletingItem?.name}
      />
    </div>
  );
}
