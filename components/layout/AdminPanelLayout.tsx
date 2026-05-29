"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/utils/use-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSidebarToggle } from "@/utils/use-sidebar-toggle";
import Navbar from "@/components/layout/Navbar";
import { LayoutProps } from "@/utils/layoutTypes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminPanelLayout({ children }: LayoutProps) {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const [title, setTitle] = useState("Dashboard");
  const pathname = usePathname();

  useEffect(() => {
    setTitle(document.title.split("|")[0].trim() || "Dashboard");
  }, [pathname]);

  if (!sidebar) return null;

  return (
    <>
      <Navbar title={title} />
      <Sidebar />

      {sidebar?.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden top-[99px]"
          onClick={() => sidebar?.setIsOpen()}
        />
      )}

      <main
        className={cn(
          "min-h-screen pt-[99px] bg-gray-50 dark:bg-[#060818]",
          "transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
        )}
      >
        <div className="w-full px-4 pb-8 sm:px-8">{children}</div>
      </main>
    </>
  );
}
