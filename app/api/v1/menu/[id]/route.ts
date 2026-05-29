import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existing = await prisma.menus.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

    const body = await request.json();

    if (body.parent_id === id) {
      return NextResponse.json({ error: "Menu cannot be its own parent" }, { status: 400 });
    }

    // Update menu roles if provided
    if (body.role_ids?.length) {
      await prisma.menuRoles.deleteMany({ where: { menu_id: id } });
      await prisma.menuRoles.createMany({
        data: body.role_ids.map((rid: number) => ({ menu_id: id, role_id: rid })),
      });
    }

    const menu = await prisma.menus.update({
      where: { id },
      data: {
        title: body.title,
        icon: body.icon ?? null,
        path: body.path ?? null,
        parent_id: body.parent_id ?? null,
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
        updated_at: new Date(),
      },
    });

    global.io?.emit("menuUpdated");
    return NextResponse.json({ menu }, { status: 200 });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Soft delete
    await prisma.menus.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    global.io?.emit("menuUpdated");
    return NextResponse.json({ message: "Menu deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
