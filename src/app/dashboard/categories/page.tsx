"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/provider";
import { CategoryModal } from "@/components/ui/category-modal";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    if (user?.companyId) fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("company_id", user?.companyId).order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns = [
    { key: "name", header: "Category Name", render: (item: any) => (
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-indigo-400" />
        <span className="font-medium text-white">{item.name}</span>
      </div>
    )},
    { key: "description", header: "Description" },
    { key: "actions", header: "Actions", render: (item: any) => (
      <div className="flex gap-2">
        <button onClick={() => { setSelectedCategory(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-400"><Edit2 size={16} /></button>
        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-rose-400"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Categories" description="Manage product categories" actions={
        <button onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white">
          <Plus size={16} /> Add Category
        </button>
      } />
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-white outline-none" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {loading ? <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-indigo-500" /></div> : <DataTable columns={columns} data={filtered} />}
      {user?.companyId && <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchCategories} category={selectedCategory} companyId={user.companyId} />}
    </div>
  );
}
