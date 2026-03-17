"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";

const mockCompanies = [
  { id: "1", name: "FreshMart Inc.", plan: "Enterprise", stores: "24", users: "48", status: "Active" },
  { id: "2", name: "QuickShop Co.", plan: "Pro", stores: "12", users: "18", status: "Active" },
  { id: "3", name: "Harbor Foods", plan: "Pro", stores: "8", users: "11", status: "Active" },
  { id: "4", name: "GreenLeaf Markets", plan: "Free", stores: "3", users: "4", status: "Trial" },
  { id: "5", name: "Metro Retail Group", plan: "Enterprise", stores: "56", users: "120", status: "Active" },
];

const planBadgeVariant = (plan: string) => {
  switch (plan) {
    case "Enterprise": return "info";
    case "Pro": return "success";
    default: return "default";
  }
};

const columns = [
  { key: "name", header: "Company" },
  {
    key: "plan",
    header: "Plan",
    render: (item: Record<string, unknown>) => (
      <StatusBadge
        status={item.plan as string}
        variant={planBadgeVariant(item.plan as string)}
      />
    ),
  },
  { key: "stores", header: "Stores" },
  { key: "users", header: "Users" },
  {
    key: "status",
    header: "Status",
    render: (item: Record<string, unknown>) => (
      <StatusBadge
        status={item.status as string}
        variant={item.status === "Active" ? "success" : "warning"}
      />
    ),
  },
];

export default function CompaniesManagerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Companies"
        description="Manage registered companies and their plans"
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]">
            <Plus size={16} />
            Add Company
          </button>
        }
      />
      <DataTable columns={columns} data={mockCompanies} />
    </div>
  );
}
