"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";



import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const planBadgeVariant = (plan: string) => {
  switch (plan) {
    case "Enterprise": return "info";
    case "Pro": return "success";
    default: return "default";
  }
};

import { CompanyModal } from "@/components/ui/company-modal";
import { Edit2, Trash2 } from "lucide-react";

export default function CompaniesManagerPage() {
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;

      const companiesWithCounts = await Promise.all((data || []).map(async (company) => {
        const [
          { count: storeCount },
          { count: userCount }
        ] = await Promise.all([
          supabase.from("stores").select("*", { count: "exact", head: true }).eq("company_id", company.id),
          supabase.from("company_users").select("*", { count: "exact", head: true }).eq("company_id", company.id)
        ]);

        return {
          ...company,
          stores: storeCount || 0,
          users: userCount || 0,
          status: "Active"
        };
      }));

      setCompanies(companiesWithCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the company and might affect linked data.")) return;
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
      setCompanies(companies.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { key: "name", header: "Company" },
    {
      key: "plan",
      header: "Plan",
      render: (item: any) => (
        <StatusBadge
          status={item.plan || "Free"}
          variant={planBadgeVariant(item.plan || "Free")}
        />
      ),
    },
    { key: "stores", header: "Stores" },
    { key: "users", header: "Users" },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <StatusBadge
          status={item.status}
          variant={item.status === "Active" ? "success" : "warning"}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedCompany(item);
              setIsModalOpen(true);
            }}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-indigo-400 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="animate-pulse">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Companies"
        description="Manage registered companies and their plans"
        actions={
          <button 
            onClick={() => {
              setSelectedCompany(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Company
          </button>
        }
      />
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <DataTable columns={columns} data={companies} />
      )}

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCompanies}
        company={selectedCompany}
      />
    </div>
  );
}
