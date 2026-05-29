import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "@/utils/getClient";

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  return NextResponse.json({ ip });
}
