"use client";

import { useSession } from "next-auth/react";
import {
  Users,
  Shield,
  Menu,
  FileText,
  Database,
  Activity,
} from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    title: "Menu Management",
    description: "Manage navigation menus and their permissions",
    href: "/menu",
    icon: Menu,
    color: "bg-blue-500",
  },
  {
    title: "User Management",
    description: "Manage users, their roles and access levels",
    href: "/user-management/users",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Roles",
    description: "Configure roles and their access permissions",
    href: "/user-management/roles",
    icon: Shield,
    color: "bg-purple-500",
  },
  {
    title: "User Logs",
    description: "Monitor user activity and audit trail",
    href: "/user-management/log-user",
    icon: Activity,
    color: "bg-orange-500",
  },
  {
    title: "Master Data",
    description: "Manage master data and reference data",
    href: "/master-data/example",
    icon: Database,
    color: "bg-teal-500",
  },
];

export function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {session?.user?.username || "User"} 👋
            </h1>
            <p className="text-blue-100 text-sm">
              You are logged in as{" "}
              <span className="font-semibold uppercase">
                {session?.user?.role || "Admin"}
              </span>
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FileText size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Menus", value: "—", icon: Menu, color: "text-blue-600" },
          { label: "Total Users", value: "—", icon: Users, color: "text-green-600" },
          { label: "Total Roles", value: "—", icon: Shield, color: "text-purple-600" },
          { label: "User Logs", value: "—", icon: Activity, color: "text-orange-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#1e2433] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="bg-white dark:bg-[#1e2433] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <link.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
