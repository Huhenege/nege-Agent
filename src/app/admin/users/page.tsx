"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Smith", email: "john@freshmart.com", role: "company_admin", company: "FreshMart Inc.", status: "Active" },
  { id: "2", name: "Sarah Connor", email: "sarah@freshmart.com", role: "company_user", company: "FreshMart Inc.", status: "Active" },
  { id: "3", name: "Mike Johnson", email: "mike@quickshop.com", role: "company_admin", company: "QuickShop Co.", status: "Active" },
  { id: "4", name: "Emily Davis", email: "emily@harbor.com", role: "company_user", company: "Harbor Foods", status: "Suspended" },
  { id: "5", name: "Admin User", email: "admin@solaromega.com", role: "admin", company: "—", status: "Active" },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin": return "danger";
    case "company_admin": return "info";
    default: return "default";
  }
};

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "role",
    header: "Role",
    render: (item: Record<string, unknown>) => (
      <StatusBadge
        status={(item.role as string).replace("_", " ")}
        variant={roleBadgeVariant(item.role as string)}
      />
    ),
  },
  { key: "company", header: "Company" },
  {
    key: "status",
    header: "Status",
    render: (item: Record<string, unknown>) => (
      <StatusBadge
        status={item.status as string}
        variant={item.status === "Active" ? "success" : "danger"}
      />
    ),
  },
];

export default function UserManagementPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Manage platform users and their roles"
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]">
            <Plus size={16} />
            Invite User
          </button>
        }
      />
      <DataTable columns={columns} data={mockUsers} />
    </div>
  );
}
