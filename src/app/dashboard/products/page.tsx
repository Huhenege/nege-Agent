"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2, Package, Tag, Hash } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/provider";
import { ProductModal } from "@/components/ui/product-modal";

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (user?.companyId) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select(`
          *,
          brands (name),
          categories (name)
        `)
        .eq("company_id", user?.companyId)
        .order("name");

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (product.brands?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (product.categories?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      header: "Product",
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              <Package size={20} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{item.name}</span>
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase tracking-wider text-gray-500">{item.size || "No Size"}</span>
               <span className="text-[10px] text-gray-600">•</span>
               <span className="text-[10px] uppercase tracking-wider text-indigo-400/70">{item.brands?.name || "No Brand"}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: "category", 
      header: "Category",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gray-500" />
          <span className="text-sm text-gray-300">{item.categories?.name || "Uncategorized"}</span>
        </div>
      )
    },
    {
       key: "barcode",
       header: "Barcode",
       render: (item: any) => (
         <span className="text-xs font-mono text-gray-400">{item.barcode || "-"}</span>
       )
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedProduct(item);
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Manage your product catalog for store audits"
        actions={
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by name, SKU or category..."
          className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 shadow-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold text-lg">Failed to load products</h3>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="animate-pulse">Loading products...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredProducts} emptyMessage="No products found" />
      )}

      {user?.companyId && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchProducts}
          product={selectedProduct}
          companyId={user.companyId}
        />
      )}
    </div>
  );
}
