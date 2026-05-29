"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  Maximize,
  Minimize,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavbarProps } from "@/utils/layoutTypes";
import { useSidebarToggle } from "@/utils/use-sidebar-toggle";

export default function Navbar({
  className = "",
  title = "Dashboard",
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { setIsOpen } = useSidebarToggle();

  const date = new Date();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    checkFullscreen();
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("datatable")) {
        localStorage.removeItem(key);
      }
    });
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-[#060818] border-b border-gray-300 dark:border-white/10 ${className}`}
    >
      {/* First Row: Logo, Role Badge, Profile Avatar */}
      <div className="flex justify-between items-center px-4 py-1">
        <div className="flex items-center justify-center">
          <img
            src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
            alt="Logo"
            className="h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 h-fit bg-blue-700 rounded text-xs font-medium text-white uppercase tracking-wide">
            {session?.user?.role || "ADMIN"}
          </span>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1 rounded-full hover:opacity-80 transition-opacity"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 z-[9999]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left text-sm"
                >
                  <LogOut size={18} className="opacity-70" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Sidebar Toggle, Title, Theme, Settings */}
      <div className="flex items-center bg-blue-700 dark:bg-[#131529] gap-2 px-4 py-1 border-t border-gray-300 dark:border-white/10 justify-between">
        <div className="flex gap-3 items-center">
          <button
            onClick={setIsOpen}
            className="p-2 rounded-lg text-white dark:text-white/70 hover:bg-blue-800 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <p className="text-base font-medium text-white">{title}</p>
        </div>

        <div className="flex gap-3 items-center">
          <p className="text-xs font-mono text-white">
            {date.toString().split(" GMT")[0]}
          </p>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-white hover:bg-blue-800 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-lg text-white hover:bg-blue-800 dark:hover:bg-white/5 transition-colors"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 z-[9999]">
                <button
                  onClick={toggleFullscreen}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-white/85 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left text-sm"
                >
                  {isFullscreen ? (
                    <Minimize size={18} className="opacity-70" />
                  ) : (
                    <Maximize size={18} className="opacity-70" />
                  )}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
