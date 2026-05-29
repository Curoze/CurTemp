import { NextRequest } from "next/server";

export const getClientIP = (req: NextRequest | any, credentials?: any): string => {
  let ip: string = "unknown";

  if (req instanceof NextRequest || req.headers?.get) {
    ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      credentials?.ipAddress ||
      "unknown";
  } else {
    ip =
      req.headers?.["x-forwarded-for"] ||
      req.headers?.["x-real-ip"] ||
      credentials?.ipAddress ||
      "unknown";
  }

  if (typeof ip === "string" && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  if (typeof ip === "string" && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip;
};
