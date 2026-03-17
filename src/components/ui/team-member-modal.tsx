"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Mail, User, Shield } from "lucide-react";

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: any;
  companyId: string;
}

export function TeamMemberModal({ isOpen, onClose, onSuccess, member, companyId }: TeamMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "company_user",
    job_title: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (member) {
        setFormData({
          full_name: member.full_name || "",
          email: member.email || "",
          role: member.role || "company_user",
          job_title: member.job_title || ""
        });
      } else {
        setFormData({
          full_name: "",
          email: "",
          role: "company_user",
          job_title: ""
        });
      }
      setError(null);
    }
  }, [isOpen, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch some info for the email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser?.id)
        .single();

      // Call our centralized API for both adding and potentially updating
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          fullName: formData.full_name,
          role: formData.role,
          companyId: companyId,
          jobTitle: formData.job_title,
          inviterName: inviterProfile?.full_name || "Admin"
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to process invitation");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? "Edit Team Member" : "Add Team Member"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              type="email"
              disabled={!!member}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 disabled:opacity-50"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 overflow-hidden">
            <label className="text-sm font-medium text-gray-400">Role</label>
            <div className="relative">
              <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="company_user">Member</option>
                <option value="company_admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Job Title</label>
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. Field Agent"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors">Cancel</button>
          <button 
            type="submit" 
            disabled={loading} 
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {member ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
