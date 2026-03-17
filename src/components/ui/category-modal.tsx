"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Tag, FileText } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: any;
  companyId: string;
}

export function CategoryModal({ isOpen, onClose, onSuccess, category, companyId }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || "",
        description: category?.description || ""
      });
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      company_id: companyId
    };

    try {
      if (category) {
        const { error: err } = await supabase.from("categories").update(payload).eq("id", category.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("categories").insert([payload]);
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
    <Modal isOpen={isOpen} onClose={onClose} title={category ? "Edit Category" : "Add New Category"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Category Name</label>
          <input
            required
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="e.g. Beverages"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Description</label>
          <textarea
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 min-h-[100px]"
            placeholder="Describe this category..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : (category ? "Save" : "Create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
