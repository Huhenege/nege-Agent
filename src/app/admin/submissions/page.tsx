"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";



import { supabase } from "@/lib/supabase/client";
import { Loader2, Search, Eye } from "lucide-react";
import Link from "next/link";

const statusVariant = (status: string) => {
  switch (status) {
    case "approved": return "success";
    case "rejected": return "danger";
    case "submitted": return "warning";
    default: return "default";
  }
};

export default function SubmissionReviewPage() {
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("All");

  React.useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("submissions")
        .select(`
          *,
          tasks (title, stores (name)),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false });

      if (filter !== "All") {
        query = query.eq("status", filter.toLowerCase());
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setSubmissions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: "id", 
      header: "ID",
      render: (item: any) => <span className="text-xs font-mono text-gray-500">#{item.id.slice(0, 5)}</span>
    },
    { 
      key: "task", 
      header: "Task / Store",
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{item.tasks?.title}</span>
          <span className="text-[10px] text-gray-500 uppercase">{item.tasks?.stores?.name}</span>
        </div>
      )
    },
    { 
      key: "user", 
      header: "Submitted By",
      render: (item: any) => <span className="text-sm">{item.profiles?.full_name || "Unknown"}</span>
    },
    { 
      key: "submitted", 
      header: "Date",
      render: (item: any) => <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <StatusBadge
          status={item.status}
          variant={statusVariant(item.status)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <Link 
          href={`/admin/submissions/${item.id}`} // We should create this detailed view
          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
        >
          <Eye size={16} />
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="animate-pulse">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Submissions"
        description="Review and manage task submissions"
      />

      <div className="flex items-center gap-2">
        {["All", "Submitted", "Approved", "Rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              f === filter
                ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <DataTable columns={columns} data={submissions} />
      )}
    </div>
  );
}
