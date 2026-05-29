"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  MapPin,
  BarChart3,
  FileText,
  LogOut,
  Mail,
  Settings,
  Building2,
  Bot,
  MessageSquare,
  ShoppingCart,
  Box,
  List,
  Info,
  QrCode,
  FolderCog,
  Layout,
  Search,
  CheckSquare,
} from "lucide-react";
import { MenuItem } from "@/utils/layoutTypes";
import { SidebarProps } from "@/utils/layoutTypes";
import { useSidebarToggle } from "@/utils/use-sidebar-toggle";
import { useStore } from "@/utils/use-store";
import { cn } from "@/lib/utils";
import { useMenuContext } from "@/components/contexts/MenuContext";

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const [openMenus, setOpenMenus] = useState<number[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { menuRefreshKey } = useMenuContext();

  const icons = [
    <ChevronDown key="0" size={18} />,
    <User key="1" size={18} />,
    <Layout key="2" size={18} />,
    <MapPin key="3" size={18} />,
    <BarChart3 key="4" size={18} />,
    <FileText key="5" size={18} />,
    <LogOut key="6" size={18} />,
    <Mail key="7" size={18} />,
    <Settings key="8" size={18} />,
    <CheckSquare key="9" size={18} />,
    <Bot key="10" size={18} />,
    <MessageSquare key="11" size={18} />,
    <ShoppingCart key="12" size={18} />,
    <Building2 key="13" size={18} />,
    <Box key="14" size={20} />,
    <List key="15" size={18} />,
    <Info key="16" size={20} />,
    <QrCode key="17" size={20} />,
    <FolderCog key="18" size={20} />,
    <Search key="19" size={20} />,
  ];

  const fetchMenuData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/menu/list");
      if (!response.ok) throw new Error("Failed to fetch menu data");
      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error("Error fetching menu", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuData();
  }, [menuRefreshKey]);

  useEffect(() => {
    menus.forEach((menu, index) => {
      if (menu.submenuItems) {
        const hasActiveSubmenu = menu.submenuItems.some(
          (item) => pathname === `/${item.path}`
        );
        if (hasActiveSubmenu && !openMenus.includes(index)) {
          setOpenMenus((prev) => [...prev, index]);
        }
      }
    });
  }, [pathname, menus]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem("infouser");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  const handleMenuClick = useCallback(
    (menu: MenuItem, index: number) => {
      if (menu.title === "Logout") {
        handleLogout();
        return;
      }

      if (menu.submenu) {
        setOpenMenus((prev) =>
          prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]
        );
      } else if (menu.path) {
        router.push(menu.path.startsWith("/") ? menu.path : `/${menu.path}`);
        if (window.innerWidth < 1024 && sidebar?.isOpen) {
          sidebar?.setIsOpen();
        }
      }
    },
    [handleLogout, router, sidebar]
  );

  const isMenuActive = useCallback(
    (menu: MenuItem, index: number): boolean => {
      if (openMenus.includes(index)) return true;
          if (menu.path && pathname === (menu.path.startsWith("/") ? menu.path : `/${menu.path}`)) return true;
      if (menu.submenuItems) {
        return menu.submenuItems.some((item) => pathname === `/${item.path}`);
      }
      return false;
    },
    [openMenus, pathname]
  );

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-[99px] z-40 h-[calc(100vh-99px)] border-r border-gray-300 dark:border-white/10",
        "bg-gray-50 dark:bg-[#1a1f2e] transition-all ease-in-out duration-300",
        "transform -translate-x-full lg:translate-x-0",
        sidebar?.isOpen && "translate-x-0",
        sidebar?.isOpen === false ? "lg:w-[90px]" : "w-72",
        className
      )}
    >
      <nav className="overflow-y-auto h-full">
        <ul className="list-none p-0 m-0">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
              {sidebar?.isOpen ? "Loading menu..." : "..."}
            </li>
          ) : menus.length === 0 ? (
            <li className="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
              {sidebar?.isOpen ? "No menu items available" : "---"}
            </li>
          ) : (
            menus.map((menu, index) => {
              const isActive = isMenuActive(menu, index);
              const IconComponent =
                menu.icon !== undefined ? (
                  icons[menu.icon]
                ) : (
                  <LayoutDashboard size={18} />
                );

              return (
                <li
                  key={index}
                  className={cn(
                    isActive &&
                      "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-700"
                  )}
                >
                  {menu.submenu ? (
                    <button
                      onClick={() => handleMenuClick(menu, index)}
                      className="w-full text-left"
                      title={!sidebar?.isOpen ? menu.title : undefined}
                    >
                      <div
                        className={cn(
                          "flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer",
                          sidebar?.isOpen
                            ? "justify-between"
                            : "lg:justify-center justify-between"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-gray-600 dark:text-gray-300",
                              isActive && "text-blue-700 dark:text-blue-400"
                            )}
                          >
                            {IconComponent}
                          </span>
                          {sidebar?.isOpen && (
                            <span
                              className={cn(
                                "text-gray-700 dark:text-gray-200 text-sm font-medium whitespace-nowrap",
                                isActive &&
                                  "text-blue-700 dark:text-blue-400 font-semibold"
                              )}
                            >
                              {menu.title}
                            </span>
                          )}
                        </div>
                        {sidebar?.isOpen && menu.submenu && (
                          <ChevronDown
                            className={cn(
                              "text-gray-600 dark:text-gray-300 transition-transform duration-200",
                              openMenus.includes(index) && "rotate-180",
                              isActive && "text-blue-700 dark:text-blue-400"
                            )}
                            size={16}
                          />
                        )}
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={menu.path ? (menu.path.startsWith("/") ? menu.path : `/${menu.path}`) : "#"}
                      onClick={() => handleMenuClick(menu, index)}
                      className="block"
                      title={!sidebar?.isOpen ? menu.title : undefined}
                    >
                      <div
                        className={cn(
                          "flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer",
                          sidebar?.isOpen
                            ? "justify-start"
                            : "lg:justify-center justify-start"
                        )}
                      >
                        <span
                          className={cn(
                            "text-gray-600 dark:text-gray-300",
                            isActive && "text-blue-700 dark:text-blue-400"
                          )}
                        >
                          {IconComponent}
                        </span>
                        {sidebar?.isOpen && (
                          <span
                            className={cn(
                              "ml-3 text-gray-700 dark:text-gray-200 text-sm font-medium whitespace-nowrap",
                              isActive &&
                                "text-blue-700 dark:text-blue-400 font-semibold"
                            )}
                          >
                            {menu.title}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  {menu.submenu &&
                    menu.submenuItems &&
                    sidebar?.isOpen &&
                    openMenus.includes(index) && (
                      <ul className="list-none bg-gray-100 dark:bg-[#131529]">
                        {menu.submenuItems.map((submenuItem, submenuIndex) => {
                          const isSubmenuActive =
                            pathname === `/${submenuItem.path}`;

                          return (
                            <li key={submenuIndex}>
                              <Link
                                href={`/${submenuItem.path}`}
                                onClick={() => {
                                  if (
                                    window.innerWidth < 1024 &&
                                    sidebar?.isOpen
                                  ) {
                                    sidebar?.setIsOpen();
                                  }
                                }}
                                className={cn(
                                  "block px-4 py-2 pl-14 text-sm hover:bg-gray-200 dark:hover:bg-white/5 transition-colors",
                                  isSubmenuActive
                                    ? "text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20"
                                    : "text-gray-600 dark:text-gray-400"
                                )}
                              >
                                {submenuItem.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                </li>
              );
            })
          )}
        </ul>
      </nav>
    </aside>
  );
};
