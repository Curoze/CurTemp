// =====================================================
//   lib/alltype.ts - Centralized type definitions
// =====================================================

// ============ Prisma query helpers ============

/**
 * Dynamic Prisma WHERE clause filter.
 * Use with a type cast (as Prisma.ModelWhereInput) at the Prisma call site.
 */
export type PrismaWhereFilter = Record<string, unknown>;

/**
 * Dynamic Prisma ORDER BY clause.
 * Supports simple { field: "asc"|"desc" } and nested { relation: { field: "asc"|"desc" } }.
 */
export type PrismaOrderBy = Record<string, string | Record<string, string>>;

// ============ Filter select options ============

/** Shape returned by /api/v1/roles/filters and /api/v1/menu/filters */
export interface FilterOption {
  value: number;
  label: string;
}

/** API response from /api/v1/roles/filters */
export interface RolesFilterApiResponse {
  roles: FilterOption[];
}

/** API response from /api/v1/menu/filters */
export interface MenusFilterApiResponse {
  menus: FilterOption[];
}

// ============ Role ============

export interface RoleOption {
  id: number;
  role: string;
}

// ============ Menu ============

export interface ParentMenuOption {
  id: number;
  title: string;
}

export interface MenuRoleItem {
  id: number;
  role: string;
}

export interface AuthMenuRoleItem {
  menu: {
    path?: string | null;
    is_active: boolean;
  };
}

// ============ User update ============

/** Shape of data used to update a user record (PUT /api/v1/users/[id]) */
export interface UserUpdateData {
  name: string;
  dept: string | null;
  nik: string;
  role_id: number;
  status: string;
  ipAddress: string;
  updated_at: Date;
  pass?: string;
}

/** Payload sent from editUserModal to the PUT users endpoint */
export interface UserUpdatePayload {
  name: string;
  dept: string | null;
  nik: string;
  role_id: number;
  status: string;
  ipAddress: string;
  pass?: string;
}

// ============ Table row data ============

/** Generic row data type for DataTable rows (avoids `any[]`) */
export type TableRowData = Record<string, unknown> & { id?: string | number };

// ============ jsPDF autoTable callback ============

/** Shape of the data argument passed to jsPDF-autotable's didDrawPage callback */
export interface AutoTablePageData {
  settings: {
    margin: { left: number };
  };
}

// ============ DB Row Types (for use with any-typed Prisma client) ============
// Cast Prisma query results to these types to avoid implicit `any` on map/filter callbacks.

export interface MenuFilterRow {
  id: number;
  title: string;
}

export interface RoleFilterRow {
  id: number;
  role: string;
}

export interface MenuChildRow {
  id: number;
  title: string;
  path?: string | null;
  icon?: string | null;
  sort_order: number;
}

export interface MenuWithChildren {
  id: number;
  title: string;
  path?: string | null;
  icon?: string | null;
  sort_order: number;
  parent_id?: number | null;
  is_active: boolean;
  children?: MenuChildRow[];
}

export interface MenuRoleRow {
  menu: MenuWithChildren;
}

export interface MenuDbRow {
  id: number;
  title: string;
  icon?: string | null;
  path?: string | null;
  parent_id?: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  parent?: { id: number; title: string; icon?: string | null; path?: string | null } | null;
  children?: MenuChildRow[];
  menuRoles: { role: { id: number; role: string } }[];
}

export interface UserDbRow {
  id: number;
  name: string;
  nik: string;
  dept?: string | null;
  role?: { id: number; role: string } | null;
  ipAddress: string;
  status: string;
  updated_at: Date;
}

export interface UserLogDbRow {
  id: number;
  user?: { nik?: string; name?: string } | null;
  action: string;
  note?: string | null;
  ip: string;
  created_at: Date;
}

// ============ Error utility ============

/**
 * Extracts a readable message string from an unknown caught error.
 * Use in catch blocks instead of `error: any`.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
