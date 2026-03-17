"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "./modal";
import { AlertCircle, Loader2, Mail, User, Building2, Briefcase } from "lucide-react";

interface GlobalUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

export function GlobalUserModal({ isOpen, onClose, onSuccess, user }: GlobalUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "company_user",
    companyId: "",
    jobTitle: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      if (user) {
        setFormData({
          email: user.email || "",
          fullName: user.full_name || "",
          role: user.role || "company_user",
          companyId: user.company_users?.[0]?.company_id || "",
          jobTitle: user.company_users?.[0]?.job_title || ""
        });
      } else {
        setFormData({
          email: "",
          fullName: "",
          role: "company_user",
          companyId: "",
          jobTitle: ""
        });
      }
    }
  }, [isOpen, user]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").order("name");
    if (data) setCompanies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For Admins, we should probably use the same /api/invite endpoint 
      // but we might need to adjust it to handle multiple companies.
      // Or we can do manual profile/company_user updates if the user already exists.
      
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inviterName: "System Admin"
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to invite user");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Invite New User"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              type="email"
              disabled={!!user}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 disabled:opacity-50"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">System Role</label>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-gray-900 py-3 px-4 text-sm text-white outline-none focus:border-indigo-500/50"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="company_user">Field Agent</option>
              <option value="company_admin">Company Admin</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Company</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                required={formData.role !== 'admin'}
                className="w-full rounded-xl border border-white/[0.08] bg-gray-900 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              >
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-400">Job Title / Department</label>
          <div className="relative">
            <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="e.g. Regional Manager"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {user ? "Save Changes" : "Send Invitation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
