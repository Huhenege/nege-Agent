"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";
import {
  LayoutDashboard,
  Store,
  Building2,
  Users,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";

const adminNavItems = [
  {
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Stores",
    href: "/admin/stores",
    icon: Store,
  },
  {
    label: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Submissions",
    href: "/admin/submissions",
    icon: FileCheck,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.replace("/login");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/[0.06] bg-gray-950/95 backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/25">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            Solar<span className="text-rose-400">Admin</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Administration
          </p>
        )}
        {adminNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-rose-500/10 text-rose-400 shadow-sm shadow-rose-500/5"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
              }`}
            >
              <item.icon
                size={20}
                strokeWidth={1.8}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-rose-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-300"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} className="shrink-0" />
          )}
          {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
        </button>
      </div>
    </aside>
  );
}
