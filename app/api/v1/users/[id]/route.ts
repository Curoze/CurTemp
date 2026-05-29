import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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

    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing || !existing.is_active) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {
      name: body.name,
      dept: body.dept ?? null,
      nik: body.nik,
      role_id: body.role_id,
      status: body.status,
      ipAddress: body.ipAddress,
      updated_at: new Date(),
    };

    if (body.pass) {
      updateData.pass = await bcrypt.hash(body.pass, 10);
    }

    const updated = await prisma.users.update({ where: { id }, data: updateData });
    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
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

    await prisma.users.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
