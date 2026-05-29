import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuFilterRow } from "@/lib/alltype";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menus: MenuFilterRow[] = await prisma.menus.findMany({
      where: { is_active: true, parent_id: null },
      select: { id: true, title: true },
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json({
      menus: menus.map((m: MenuFilterRow) => ({ value: m.id, label: m.title })),
    });
  } catch (error) {
    console.error("Error fetching menu filters:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
