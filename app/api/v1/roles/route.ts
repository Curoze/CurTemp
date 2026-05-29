import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaWhereFilter } from "@/lib/alltype";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "updated_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: PrismaWhereFilter = { is_active: true };

    const filterColumns: string[] = [];
    const filterValues: string[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("filterColumn_")) filterColumns[parseInt(key.split("_")[1])] = value;
      if (key.startsWith("filterValue_")) filterValues[parseInt(key.split("_")[1])] = value;
    });
    filterColumns.forEach((col, i) => {
      if (filterValues[i]) where[col] = { contains: filterValues[i], mode: "insensitive" };
    });

    const total = await prisma.roles.count({ where });
    const roles = await prisma.roles.findMany({
      where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json({ items: roles, total, skip, limit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.role) return NextResponse.json({ error: "Role name is required" }, { status: 400 });

    const existing = await prisma.roles.findFirst({ where: { role: body.role, is_active: true } });
    if (existing) return NextResponse.json({ error: "Role already exists" }, { status: 409 });

    const role = await prisma.roles.create({
      data: {
        role: body.role,
        description: body.description || null,
        is_active: true,
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
