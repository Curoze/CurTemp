import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuRoleRow } from "@/lib/alltype";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menuRoles: MenuRoleRow[] = await prisma.menuRoles.findMany({
      where: { role_id: user.role_id },
      include: {
        menu: {
          include: {
            children: {
              where: { is_active: true },
              orderBy: { sort_order: "asc" },
            },
          },
        },
      },
    });

    const parentMenus = menuRoles
      .filter((mr) => mr.menu.parent_id === null && mr.menu.is_active)
      .map((mr) => mr.menu)
      .sort((a, b) => a.sort_order - b.sort_order);

    const transformedMenus = parentMenus.map((menu) => {
      const hasChildren = (menu.children?.length ?? 0) > 0;
      return {
        id: menu.id,
        title: menu.title,
        path: menu.path,
        icon: menu.icon ? parseInt(menu.icon) : undefined,
        submenu: hasChildren,
        submenuItems: hasChildren
          ? menu.children!.map((child) => ({
              title: child.title,
              path: child.path || "",
              icon: child.icon ? parseInt(child.icon) : undefined,
            }))
          : undefined,
      };
    });

    return NextResponse.json(transformedMenus, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
