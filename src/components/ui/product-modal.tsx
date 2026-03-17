"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Package, Tag, Hash, Image as ImageIcon, Shield } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
  companyId: string;
}

export function ProductModal({ isOpen, onClose, onSuccess, product, companyId }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category_id: "",
    brand_id: "",
    size: "",
    image_url: ""
  });

  useEffect(() => {
    if (isOpen && companyId) {
      fetchData();
      if (product) {
        setFormData({
          name: product.name || "",
          barcode: product.barcode || "",
          category_id: product.category_id || "",
          brand_id: product.brand_id || "",
          size: product.size || "",
          image_url: product.image_url || ""
        });
        setPreviewUrl(product.image_url || null);
      } else {
        setFormData({
          name: "",
          barcode: "",
          category_id: "",
          brand_id: "",
          size: "",
          image_url: ""
        });
        setPreviewUrl(null);
      }
    }
  }, [isOpen, product, companyId]);

  const fetchData = async () => {
    const [cats, brs] = await Promise.all([
      supabase.from("categories").select("id, name").eq("company_id", companyId).order("name"),
      supabase.from("brands").select("id, name").eq("company_id", companyId).order("name")
    ]);
    if (cats.data) setCategories(cats.data);
    if (brs.data) setBrands(brs.data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setPreviewUrl(publicUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      company_id: companyId,
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
    };

    try {
      if (product) {
        const { error: err } = await supabase.from("products").update(payload).eq("id", product.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("products").insert([payload]);
        if (err) throw err;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add New Product"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <div className="relative group">
            <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.04] transition-all group-hover:border-indigo-500/50 ${previewUrl ? 'border-none' : ''}`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500">
                  {uploading ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : <ImageIcon size={24} />}
                  <span className="text-[8px] font-medium uppercase tracking-wider">Image</span>
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              <span className="text-[10px] font-semibold text-white">Change</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 overflow-hidden">
            <label className="text-sm font-medium text-gray-400">Brand</label>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              value={formData.brand_id}
              onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            >
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <label className="text-sm font-medium text-gray-400">Category</label>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Product Name</label>
          <div className="relative">
            <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. Coca Cola"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Size (e.g. 330ml)</label>
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="330ml"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Barcode</label>
            <div className="relative">
              <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                placeholder="Barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
