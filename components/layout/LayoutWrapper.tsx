"use client";

import AdminPanelLayout from "@/components/layout/AdminPanelLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
