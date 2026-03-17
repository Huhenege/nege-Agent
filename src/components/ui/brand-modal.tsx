"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Shield, Image as ImageIcon } from "lucide-react";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brand?: any;
  companyId: string;
}

export function BrandModal({ isOpen, onClose, onSuccess, brand, companyId }: BrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: brand?.name || "",
        logo_url: brand?.logo_url || ""
      });
      setPreviewUrl(brand?.logo_url || null);
    }
  }, [isOpen, brand]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `brands/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
      setPreviewUrl(publicUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      logo_url: formData.logo_url,
      company_id: companyId
    };

    try {
      if (brand) {
        const { error: err } = await supabase.from("brands").update(payload).eq("id", brand.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("brands").insert([payload]);
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
    <Modal isOpen={isOpen} onClose={onClose} title={brand ? "Edit Brand" : "Add New Brand"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Brand Logo Upload */}
        <div className="flex flex-col items-center justify-center space-y-3 py-4">
          <div className="relative group">
            <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.04] transition-all group-hover:border-indigo-500/50 ${previewUrl ? 'border-none' : ''}`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Logo" className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500">
                  {uploading ? <Loader2 size={24} className="animate-spin text-indigo-500" /> : <Shield size={28} />}
                  <span className="text-[10px] font-medium uppercase tracking-wider">Brand Logo</span>
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              <span className="text-xs font-semibold text-white">Change Logo</span>
            </label>
          </div>
          {uploading && <p className="text-[10px] text-indigo-400 animate-pulse font-medium uppercase tracking-widest">Uploading...</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Brand Name</label>
          <div className="relative">
            <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. Coca-Cola"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : (brand ? "Save" : "Create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
