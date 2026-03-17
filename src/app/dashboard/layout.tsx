"use client";

import React from "react";
import { ClientSidebar } from "@/components/ui/client-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      <ClientSidebar />
      <main className="pl-64 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
