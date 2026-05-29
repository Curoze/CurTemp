import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menuRoles = await prisma.menuRoles.findMany({
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
      .filter((mr: any) => mr.menu.parent_id === null && mr.menu.is_active)
      .map((mr: any) => mr.menu)
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    const transformedMenus = parentMenus.map((menu: any) => {
      const hasChildren = menu.children?.length > 0;
      return {
        id: menu.id,
        title: menu.title,
        path: menu.path,
        icon: menu.icon ? parseInt(menu.icon) : undefined,
        submenu: hasChildren,
        submenuItems: hasChildren
          ? menu.children.map((child: any) => ({
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
