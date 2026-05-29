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

    const total = await prisma.masterExample.count({ where });
    const items = await prisma.masterExample.findMany({
      where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json({ items, total, skip, limit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching master example:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const item = await prisma.masterExample.create({
      data: {
        name: body.name,
        description: body.description || null,
        value: body.value || null,
        is_active: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating master example:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
