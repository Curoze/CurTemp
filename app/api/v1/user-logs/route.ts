import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaWhereFilter, UserLogDbRow } from "@/lib/alltype";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user?.role_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "15");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: PrismaWhereFilter = {};

    const filterColumns: string[] = [];
    const filterValues: string[] = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("filterColumn_")) filterColumns[parseInt(key.split("_")[1])] = value;
      if (key.startsWith("filterValue_")) filterValues[parseInt(key.split("_")[1])] = value;
    });
    filterColumns.forEach((col, i) => {
      if (filterValues[i]) {
        if (col === "action") {
          where[col] = filterValues[i];
        } else if (col === "username") {
          where.user = { nik: { contains: filterValues[i], mode: "insensitive" } };
        } else {
          where[col] = { contains: filterValues[i], mode: "insensitive" };
        }
      }
    });

    const total = await prisma.userLogs.count({ where });
    const logs: UserLogDbRow[] = await prisma.userLogs.findMany({
      where, skip, take: limit, orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { name: true, nik: true } } },
    });

    const items = logs.map((log) => ({
      id: log.id,
      username: log.user?.nik || "unknown",
      action: log.action,
      description: log.note,
      ipAddress: log.ip,
      created_at: log.created_at,
    }));

    return NextResponse.json({ items, total, skip, limit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
