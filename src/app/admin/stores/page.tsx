"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Edit2, Trash2, Eye, Search, AlertCircle, Loader2, Settings, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StoreModal } from "@/components/ui/store-modal";
import { StoreTypeModal } from "@/components/ui/store-type-modal";
import Link from "next/link";

export default function StoresManagerPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [storeTypes, setStoreTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  useEffect(() => {
    fetchStores();
    fetchStoreTypes();
  }, []);

  const fetchStoreTypes = async () => {
    const { data } = await supabase.from("store_types").select("*").order("name");
    if (data) setStoreTypes(data);
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select(`
          id, name, address, latitude, longitude, is_active, created_at, type_id,
          store_types (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setStores(stores.filter(s => s.id !== id));
    } catch (err: any) {
      alert("Error deleting store: " + err.message);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || store.type_id === selectedType;
    return matchesSearch && matchesType;
  });

  const columns = [
    { 
      key: "name", 
      header: "Store Name",
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{item.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-indigo-400/70">
            {item.store_types?.name || "Uncategorized"}
          </span>
        </div>
      )
    },
    { key: "address", header: "Address" },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Link 
            href={`/admin/stores/${item.id}`}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-indigo-400 transition-colors"
          >
            <Eye size={16} />
          </Link>
          <button 
            onClick={() => {
              setSelectedStore(item);
              setIsModalOpen(true);
            }}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-amber-400 transition-colors"
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Store Management"
        description="View and manage all retail locations across all companies"
        actions={
          <div className="flex gap-3">
             <button 
              onClick={() => setIsTypeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <Settings size={18} />
              Types
            </button>
            <button 
              onClick={() => {
                setSelectedStore(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Store
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search stores..."
            className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 shadow-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter id="filter-icon" size={18} className="text-gray-500" />
          <select
            className="rounded-xl border border-white/[0.06] bg-gray-900/50 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 shadow-xl min-w-[160px]"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Store Types</option>
            {storeTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold">Failed to load stores</h3>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="animate-pulse">Loading stores...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredStores} emptyMessage="No stores found match your search" />
      )}

      <StoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStores}
        store={selectedStore}
      />

      <StoreTypeModal 
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          fetchStoreTypes();
          fetchStores();
        }}
      />
    </div>
  );
}
