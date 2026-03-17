"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/provider";
import { BrandModal } from "@/components/ui/brand-modal";

export default function BrandsPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  useEffect(() => {
    if (user?.companyId) fetchBrands();
  }, [user]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("brands").select("*").eq("company_id", user?.companyId).order("name");
      if (error) throw error;
      setBrands(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
      setBrands(brands.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns = [
    { key: "name", header: "Brand Name", render: (item: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          {item.logo_url ? <img src={item.logo_url} alt={item.name} className="h-full w-full object-contain" /> : <Shield size={16} />}
        </div>
        <span className="font-medium text-white">{item.name}</span>
      </div>
    )},
    { key: "actions", header: "Actions", render: (item: any) => (
      <div className="flex gap-2">
        <button onClick={() => { setSelectedBrand(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-400"><Edit2 size={16} /></button>
        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-rose-400"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Brands" description="Manage product brands" actions={
        <button onClick={() => { setSelectedBrand(null); setIsModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white">
          <Plus size={16} /> Add Brand
        </button>
      } />
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-white outline-none" placeholder="Search brands..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {loading ? <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-indigo-500" /></div> : <DataTable columns={columns} data={filtered} />}
      {user?.companyId && <BrandModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchBrands} brand={selectedBrand} companyId={user.companyId} />}
    </div>
  );
}
