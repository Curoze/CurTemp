"use client";

import { useMemo, useState } from "react";
import { MuiDataTable, FilterableColumn } from "@/components/datatable/MuiDataTable";
import { getMenuColumns, Menu } from "@/components/menus/columns";
import { EditMenuDialog } from "@/components/menus/editMenuModal";
import { AddMenuModal } from "@/components/menus/addMenuModal";
import DeleteConfirmationDialog from "@/components/modal/deleteConfirm";
import { Card } from "@/components/ui/card";
import { useMenuContext } from "@/components/contexts/MenuContext";
import { useEffect } from "react";

export default function MenusPage() {
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshMenus } = useMenuContext();

  const columns = useMemo(
    () =>
      getMenuColumns({
        onUpdate: (menu) => setEditingMenu(menu),
        onDelete: (menu) => setDeletingMenu(menu),
      }),
    []
  );

  const handleMenuUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    refreshMenus();
  };

  const filterableColumns: FilterableColumn[] = [
    { id: "title", title: "Title", type: "text", placeholder: "Search by title..." },
    { id: "path", title: "Path", type: "text", placeholder: "Search by path..." },
  ];

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-white">
            Menu Management
          </h1>
          <p className="text-muted-foreground">Manage your menus and their settings</p>
        </div>
        <AddMenuModal onMenuAdded={handleMenuUpdated} />
      </div>

      <Card className="p-3 dark:bg-[#1e2433]">
        <MuiDataTable
          columns={columns}
          apiUrl="/api/v1/menu?"
          refreshKey={refreshKey}
          filterableColumns={filterableColumns}
          defaultSortBy="updated_at"
          defaultSortOrder="desc"
          paginationSize={10}
          enableRowSelection={false}
          filename="menu_export"
          getRowId={(row) => row.id}
        />
      </Card>

      <EditMenuDialog
        isOpen={!!editingMenu}
        onClose={() => setEditingMenu(null)}
        onMenuUpdated={handleMenuUpdated}
        menu={editingMenu}
      />

      <DeleteConfirmationDialog
        data={deletingMenu}
        isOpen={!!deletingMenu}
        onClose={() => setDeletingMenu(null)}
        onDeleted={handleMenuUpdated}
        url={`/api/v1/menu/${deletingMenu?.id}`}
        dataToShow={deletingMenu?.title}
      />
    </div>
  );
}
