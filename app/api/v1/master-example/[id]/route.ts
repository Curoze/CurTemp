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

    const existing = await prisma.masterExample.findUnique({ where: { id } });
    if (!existing || !existing.is_active) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const updated = await prisma.masterExample.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        value: body.value ?? null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ item: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating master example:", error);
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

    await prisma.masterExample.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting master example:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
