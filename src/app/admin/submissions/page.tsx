"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const mockSubmissions = [
  { id: "#1851", task: "Shelf Display Check", store: "Downtown SuperMart", user: "Sarah Connor", submitted: "Mar 13, 2026", status: "Pending" },
  { id: "#1850", task: "Price Tag Audit", store: "Eastside Groceries", user: "John Smith", submitted: "Mar 13, 2026", status: "Approved" },
  { id: "#1849", task: "Promo Stand Photo", store: "Mall Central Store", user: "Mike Johnson", submitted: "Mar 12, 2026", status: "Rejected" },
  { id: "#1848", task: "Shelf Display Check", store: "Harbor View Market", user: "Emily Davis", submitted: "Mar 12, 2026", status: "Pending" },
  { id: "#1847", task: "Competitor Analysis", store: "Uptown Convenience", user: "Sarah Connor", submitted: "Mar 11, 2026", status: "Approved" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "Approved": return "success";
    case "Rejected": return "danger";
    case "Pending": return "warning";
    default: return "default";
  }
};

const columns = [
  { key: "id", header: "ID" },
  { key: "task", header: "Task" },
  { key: "store", header: "Store" },
  { key: "user", header: "Submitted By" },
  { key: "submitted", header: "Date" },
  {
    key: "status",
    header: "Status",
    render: (item: Record<string, unknown>) => (
      <StatusBadge
        status={item.status as string}
        variant={statusVariant(item.status as string)}
      />
    ),
  },
];

export default function SubmissionReviewPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Submissions"
        description="Review and manage task submissions"
      />

      {/* Quick Filters */}
      <div className="flex items-center gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((filter) => (
          <button
            key={filter}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              filter === "All"
                ? "bg-white/[0.08] text-white"
                : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={mockSubmissions} />
    </div>
  );
}
