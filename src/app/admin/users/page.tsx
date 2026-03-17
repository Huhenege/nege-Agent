"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";



import { supabase } from "@/lib/supabase/client";
import { Loader2, Search, Filter } from "lucide-react";

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin": return "danger";
    case "company_admin": return "info";
    default: return "default";
  }
};

import { GlobalUserModal } from "@/components/ui/global-user-modal";
import { Edit2, Trash2 } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select(`
          *,
          company_users (
            company_id,
            job_title,
            companies (name)
          )
        `)
        .order("full_name");

      if (fetchError) throw fetchError;

      const processedUsers = (data || []).map(profile => ({
        ...profile,
        company: profile.company_users?.[0]?.companies?.name || "—",
        jobTitle: profile.company_users?.[0]?.job_title || "—",
        status: "Active"
      }));

      setUsers(processedUsers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will remove the user's profile and company access.")) return;
    try {
      // Note: This only deletes the profile and company_user entry. 
      // Auth user deletion requires Admin API which we should do via an API route if needed.
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: any) => (
        <StatusBadge
          status={(item.role || "user").replace("_", " ")}
          variant={roleBadgeVariant(item.role || "user")}
        />
      ),
    },
    { key: "company", header: "Company" },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <StatusBadge
          status={item.status}
          variant={item.status === "Active" ? "success" : "danger"}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedUser(item);
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

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Manage platform users and their roles"
        actions={
          <button 
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus size={16} />
            Invite User
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or company..."
            className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 shadow-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-gray-900/50 px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredUsers} />
      )}

      <GlobalUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </div>
  );
}
