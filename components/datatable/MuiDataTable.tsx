"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useTheme } from "next-themes";
import { useDebounce } from "use-debounce";
import { X, Filter } from "lucide-react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import * as XLSX from "xlsx";

export interface FilterableColumn {
  id: string;
  title: string;
  type?: "text" | "select" | "number";
  options?: string[] | { label: string; value: string }[];
  placeholder?: string;
}

export interface MuiDataTableProps {
  columns: GridColDef[];
  apiUrl: string;
  filterableColumns?: FilterableColumn[];
  refreshKey?: number;
  additionalParams?: Record<string, string>;
  paginationSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
  enableRowSelection?: boolean;
  filename?: string;
  getRowId?: (row: any) => string | number;
}

interface ActiveFilter {
  column: string;
  value: string;
  type: string;
}

function CustomToolbar({
  filename,
  rows,
  columns,
  isDark,
}: {
  filename: string;
  rows: any[];
  columns: GridColDef[];
  isDark: boolean;
}) {
  const exportableColumns = columns.filter(
    (c) => c.field !== "actions" && c.field !== "__check__"
  );

  const handleExportExcel = () => {
    const header = exportableColumns.map((c) => c.headerName || c.field);
    const body = rows.map((r) =>
      exportableColumns.map((c) => {
        const val = r[c.field];
        return val ?? "";
      })
    );
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename || "export"}.xlsx`);
  };

  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const visibleCols = exportableColumns;
    const headers = visibleCols.map((c) => ({
      content: c.headerName || c.field,
      styles: { halign: "center" as const },
    }));
    const bodyRows = rows.map((r) =>
      visibleCols.map((c) => String(r[c.field] ?? ""))
    );

    const doc = new jsPDF("l", "pt", "a4");
    autoTable(doc, {
      head: [headers],
      body: bodyRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: "center" },
      bodyStyles: { halign: "center" },
      didDrawPage: (data: any) => {
        doc.setFontSize(14);
        doc.text(filename || "Exported Data", data.settings.margin.left, 20);
      },
    });
    doc.save(`${filename || "export"}.pdf`);
  };

  const btnBase =
    "border rounded px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-colors";

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <button
        onClick={handleExportExcel}
        className={`${btnBase} border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ${
          isDark ? "bg-[#1e2433]" : "bg-white"
        }`}
      >
        Excel
      </button>
      <button
        onClick={handleExportPDF}
        className={`${btnBase} border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
          isDark ? "bg-[#1e2433]" : "bg-white"
        }`}
      >
        PDF
      </button>
    </GridToolbarContainer>
  );
}

export function MuiDataTable({
  columns,
  apiUrl,
  filterableColumns = [],
  refreshKey = 0,
  additionalParams = {},
  paginationSize = 10,
  defaultSortBy,
  defaultSortOrder = "asc",
  enableRowSelection = false,
  filename = "export",
  getRowId,
}: MuiDataTableProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: paginationSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(
    defaultSortBy
      ? [{ field: defaultSortBy, sort: defaultSortOrder }]
      : []
  );
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filterInput, setFilterInput] = useState<Record<string, string>>({});
  const [debouncedFilters] = useDebounce(filterInput, 300);

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      background: {
        default: isDark ? "#1e2433" : "#ffffff",
        paper: isDark ? "#1e2433" : "#ffffff",
      },
    },
  });

  const additionalParamsKey = JSON.stringify(additionalParams);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("skip", String(paginationModel.page * paginationModel.pageSize));
      params.set("limit", String(paginationModel.pageSize));

      if (sortModel.length > 0) {
        params.set("sortBy", sortModel[0].field);
        params.set("sortOrder", sortModel[0].sort || "asc");
      }

      activeFilters.forEach((filter, i) => {
        params.set(`filterColumn_${i}`, filter.column);
        params.set(`filterValue_${i}`, filter.value);
      });

      Object.entries(JSON.parse(additionalParamsKey) as Record<string, string>).forEach(([k, v]) => params.set(k, v));

      const url = apiUrl.endsWith("?")
        ? `${apiUrl}${params.toString()}`
        : `${apiUrl}?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRows(data.items || []);
      setRowCount(data.total || 0);
    } catch (err) {
      console.error("MuiDataTable fetch error:", err);
      setRows([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    paginationModel,
    sortModel,
    activeFilters,
    additionalParamsKey,
    apiUrl,
    refreshKey,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const addFilter = (colId: string) => {
    const col = filterableColumns.find((c) => c.id === colId);
    if (!col) return;
    if (activeFilters.find((f) => f.column === colId)) return;
    setActiveFilters((prev) => [
      ...prev,
      { column: colId, value: "", type: col.type || "text" },
    ]);
  };

  const removeFilter = (colId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.column !== colId));
    setFilterInput((prev) => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
  };

  const updateFilterValue = (colId: string, value: string) => {
    setFilterInput((prev) => ({ ...prev, [colId]: value }));
  };

  useEffect(() => {
    setActiveFilters((prev) =>
      prev.map((f) => ({
        ...f,
        value: debouncedFilters[f.column] ?? f.value,
      }))
    );
  }, [debouncedFilters]);

  const availableFilterCols = filterableColumns.filter(
    (c) => !activeFilters.find((f) => f.column === c.id)
  );

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      {filterableColumns.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {availableFilterCols.length > 0 && (
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-gray-500" />
              <select
                className="text-xs border border-gray-200 dark:border-white/10 rounded px-2 py-1 bg-white dark:bg-[#1e2433] text-gray-700 dark:text-gray-300 focus:outline-none"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    addFilter(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">+ Add Filter</option>
                {availableFilterCols.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeFilters.map((filter) => {
            const col = filterableColumns.find((c) => c.id === filter.column);
            if (!col) return null;

            return (
              <div
                key={filter.column}
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-2 py-1"
              >
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {col.title}:
                </span>
                {col.type === "select" ? (
                  <select
                    className="text-xs border-none bg-transparent text-blue-700 dark:text-blue-300 focus:outline-none min-w-[80px]"
                    value={filterInput[filter.column] || ""}
                    onChange={(e) => updateFilterValue(filter.column, e.target.value)}
                  >
                    <option value="">All</option>
                    {(col.options || []).map((opt) => {
                      const label = typeof opt === "string" ? opt : opt.label;
                      const value = typeof opt === "string" ? opt : opt.value;
                      return (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="text-xs border-none bg-transparent text-blue-700 dark:text-blue-300 focus:outline-none w-28"
                    placeholder={col.placeholder || `Search ${col.title}...`}
                    value={filterInput[filter.column] || ""}
                    onChange={(e) => updateFilterValue(filter.column, e.target.value)}
                  />
                )}
                <button
                  onClick={() => removeFilter(filter.column)}
                  className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Grid */}
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div style={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowCount}
            loading={isLoading}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            pageSizeOptions={[5, 10, 25, 50]}
            checkboxSelection={enableRowSelection}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={setRowSelectionModel}
            getRowId={getRowId}
            autoHeight
            disableColumnFilter
            slots={{
              toolbar: () => (
                <CustomToolbar
                  filename={filename}
                  rows={rows}
                  columns={columns}
                  isDark={isDark}
                />
              ),
            }}
            sx={{
              border: "none",
              backgroundColor: isDark ? "#1e2433" : "#ffffff",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: isDark ? "#131529" : "#f8fafc",
                borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                backgroundColor: isDark ? "#131529" : "#f8fafc",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: isDark ? "rgba(255,255,255,0.7)" : "#64748b",
              },
            }}
          />
        </div>
      </ThemeProvider>
    </div>
  );
}
