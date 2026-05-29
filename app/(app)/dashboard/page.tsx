import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/dashboardClientPage";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPageRoute() {
  await requireAuth();
  return <DashboardPage />;
}
