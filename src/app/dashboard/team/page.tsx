"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Mail, MoreHorizontal, User, Trash2, Edit2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/provider";
import { TeamMemberModal } from "@/components/ui/team-member-modal";

const roleLabels: Record<string, string> = {
  company_admin: "Admin",
  company_user: "Member",
};

const avatarColors = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    if (user?.companyId) {
      fetchTeamMembers();
    }
  }, [user?.companyId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      // Fetch members linked to this company
      const { data, error: fetchError } = await supabase
        .from("company_users")
        .select(`
          id,
          job_title,
          profiles (
            id,
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .eq("company_id", user?.companyId);

      if (fetchError) throw fetchError;

      // Transform data for the UI
      const results = (data || []).map(row => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: row.id,
          name: profile?.full_name || "Unknown",
          email: profile?.email || "No email",
          role: profile?.role || "company_user",
          job_title: row.job_title,
          status: "Active",
        };
      });

      setMembers(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;

    try {
      const { error: delError } = await supabase
        .from("company_users")
        .delete()
        .eq("id", memberId)
        .eq("company_id", user?.companyId);

      if (delError) throw delError;
      
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err: any) {
      alert("Error removing member: " + err.message);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Manage your team members and roles"
        actions={
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.08]">
              <Mail size={16} />
              Send Invite
            </button>
            <button 
              onClick={() => {
                setSelectedMember(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>
        }
      />

      {/* Team Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Team Members", value: members.length.toString(), sub: "Managed by company admin" },
          { label: "Company Organization", value: user?.role === "company_admin" ? "Administrator" : "Member", sub: user?.companyId ? "Linked to Company" : "Personal Account" },
          { label: "System Role", value: user?.role || "user", sub: "Global access level" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-5 backdrop-blur-xl">
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Team Members List */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-400">Members</h3>
        </div>
        
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="animate-pulse">Loading team members...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl p-8 text-red-400">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Failed to load team</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {members.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-gray-500 italic">
                No team members found.
              </div>
            ) : (
              members.map((member, idx) => (
                <div key={member.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
                  {/* Avatar */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} text-xs font-bold text-white shadow-lg`}>
                    {getInitials(member.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      {member.job_title && (
                        <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                          {member.job_title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="hidden sm:block">
                    <StatusBadge
                      status={roleLabels[member.role] || member.role}
                      variant={member.role === "company_admin" ? "info" : "default"}
                    />
                  </div>

                  {/* Status */}
                  <StatusBadge
                    status={member.status}
                    variant={member.status === "Active" ? "success" : "warning"}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setSelectedMember(member);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-amber-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    {user?.id !== member.id && (
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTeamMembers}
        member={selectedMember}
        companyId={user?.companyId || ""}
      />
    </div>
  );
}
