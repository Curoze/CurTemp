import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PrismaWhereFilter, PrismaOrderBy, UserDbRow } from "@/lib/alltype";

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

    const status = searchParams.get("status");
    if (status) where.status = status;

    let orderBy: PrismaOrderBy;
    if (sortBy === "role") {
      orderBy = { role: { role: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const total = await prisma.users.count({ where });
    const users: UserDbRow[] = await prisma.users.findMany({
      where, skip, take: limit, orderBy,
      include: { role: { select: { id: true, role: true } } },
    });

    const items = users.map((u) => ({
      id: u.id,
      name: u.name,
      nik: u.nik,
      dept: u.dept,
      role: u.role?.role,
      ipAddress: u.ipAddress,
      status: u.status,
      updated_at: u.updated_at,
    }));

    return NextResponse.json({ items, total, skip, limit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.name || !body.nik || !body.role_id || !body.pass) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await prisma.users.findFirst({ where: { nik: body.nik, is_active: true } });
    if (existing) return NextResponse.json({ error: "NIK already exists" }, { status: 409 });

    const hashedPass = await bcrypt.hash(body.pass, 10);
    const newUser = await prisma.users.create({
      data: {
        name: body.name,
        dept: body.dept || null,
        nik: body.nik,
        role_id: body.role_id,
        pass: hashedPass,
        status: body.status || "unapproved",
        ipAddress: body.ipAddress || "free",
        is_active: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
