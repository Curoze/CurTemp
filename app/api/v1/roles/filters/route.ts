import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roles = await prisma.roles.findMany({
      where: { is_active: true },
      select: { id: true, role: true },
      orderBy: { role: "asc" },
    });

    return NextResponse.json({
      roles: roles.map((r: any) => ({ value: r.id, label: r.role })),
    });
  } catch (error) {
    console.error("Error fetching roles filters:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
