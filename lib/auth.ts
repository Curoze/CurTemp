import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth.config";
import { Session } from "next-auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session.user;
}

/**
 * Require auth AND that the user's role has access to the given menu path.
 * Redirects to /auth/signin if not logged in, or /dashboard if no access.
 */
export async function requireAccess(path: string) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  const allowed = session.user.allowedPaths ?? [];
  if (!allowed.includes(path)) {
    redirect("/dashboard");
  }
  return session.user;
}

export function canAccess(session: Session | null, path: string): boolean {
  if (!session?.user?.allowedPaths) return false;
  return session.user.allowedPaths.includes(path);
}
