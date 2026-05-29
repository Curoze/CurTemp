import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "updated_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = { is_active: true };

    const filterColumns: string[] = [];
    const filterValues: string[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("filterColumn_")) filterColumns[parseInt(key.split("_")[1])] = value;
      if (key.startsWith("filterValue_")) filterValues[parseInt(key.split("_")[1])] = value;
    });
    filterColumns.forEach((col, i) => {
      if (filterValues[i]) where[col] = { contains: filterValues[i], mode: "insensitive" };
    });

    const orderBy: any = { [sortBy]: sortOrder };
    const total = await prisma.menus.count({ where });
    const menus = await prisma.menus.findMany({
      where, skip, take: limit, orderBy,
      include: {
        parent: { select: { id: true, title: true, icon: true, path: true } },
        children: { select: { id: true, title: true, icon: true, path: true, sort_order: true }, orderBy: { sort_order: "asc" } },
        menuRoles: { include: { role: { select: { id: true, role: true } } } },
      },
    });

    const items = menus.map((m: any) => ({
      ...m,
      roles: m.menuRoles.map((mr: any) => mr.role),
      menuRoles: undefined,
    }));

    return NextResponse.json({ items, total, skip, limit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!body.role_ids?.length) return NextResponse.json({ error: "At least one role is required" }, { status: 400 });

    const menu = await prisma.menus.create({
      data: {
        title: body.title,
        icon: body.icon || null,
        path: body.path || null,
        parent_id: body.parent_id || null,
        sort_order: body.sort_order ?? 0,
        is_active: true,
        menuRoles: {
          create: body.role_ids.map((rid: number) => ({ role_id: rid })),
        },
      },
    });

    global.io?.emit("menuUpdated");
    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
