"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Building2, Layout, Image as ImageIcon } from "lucide-react";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: any;
}

export function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    plan: "Free",
    logo_url: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (company) {
        setFormData({
          name: company.name || "",
          plan: company.plan || "Free",
          logo_url: company.logo_url || ""
        });
      } else {
        setFormData({
          name: "",
          plan: "Free",
          logo_url: ""
        });
      }
    }
  }, [isOpen, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      plan: formData.plan,
      logo_url: formData.logo_url.trim() || null
    };

    try {
      if (company) {
        const { error: err } = await supabase
          .from("companies")
          .update(payload)
          .eq("id", company.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("companies")
          .insert([payload]);
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
    <Modal isOpen={isOpen} onClose={onClose} title={company ? "Edit Company" : "Add New Company"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Company Name</label>
          <div className="relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Subscription Plan</label>
          <div className="relative">
            <Layout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-gray-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Logo URL (Optional)</label>
          <div className="relative">
            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {company ? "Save Changes" : "Create Company"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
