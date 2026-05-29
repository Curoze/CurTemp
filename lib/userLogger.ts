import { prisma } from "@/lib/prisma";

interface CreateUserLogParams {
  userId?: number;
  action: string;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  note?: string;
}

export async function createUserLog({
  userId,
  action,
  ip,
  userAgent,
  success,
  note,
}: CreateUserLogParams) {
  try {
    await prisma.userLogs.create({
      data: {
        user_id: userId || 0,
        action,
        ip: ip as string,
        userAgent: userAgent as string,
        success,
        note,
      },
    });
  } catch (error) {
    console.error("Failed to create user log:", error);
  }
}
