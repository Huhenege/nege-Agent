"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/tables/data-table";
import { Plus, Edit2, Trash2, Search, Calendar, Store as StoreIcon, Package, Trophy, AlertCircle, Loader2, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/provider";
import { TaskModal } from "@/components/ui/task-modal";
import { StatusBadge } from "@/components/ui/status-badge";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (user?.companyId) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select(`
          *,
          stores (name, address),
          task_products (product_id)
        `)
        .eq("company_id", user?.companyId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.stores?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: "title", 
      header: "Task Detail",
      render: (item: any) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-white">{item.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
            <StoreIcon size={12} />
            {item.stores?.name}
          </div>
        </div>
      )
    },
    { 
      key: "products", 
      header: "Audit Items",
      render: (item: any) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Package size={14} />
          {item.task_products?.length || 0} products
        </div>
      )
    },
    { 
      key: "due_date", 
      header: "Due Date",
      render: (item: any) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Clock size={14} className={new Date(item.due_date) < new Date() ? "text-rose-400" : ""} />
          {new Date(item.due_date).toLocaleDateString()}
        </div>
      )
    },
    { 
      key: "reward_points", 
      header: "Reward",
      render: (item: any) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
          <Trophy size={14} />
          {item.reward_points}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => <StatusBadge status={item.status} />
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex gap-2">
          <button 
            onClick={() => { setSelectedTask(item); setIsModalOpen(true); }}
            className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
            title="Edit Task"
          >
            <Edit2 size={16} />
          </button>
          <Link 
            href={`/dashboard/tasks/${item.id}`}
            className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
            title="View Submissions"
          >
            <Eye size={16} />
          </Link>
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
            title="Delete Task"
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
        title="Tasks Management"
        description="Create and monitor retail audit tasks"
        actions={
          <button 
            onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Plus size={16} />
            Create Task
          </button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by title or store..."
          className="w-full rounded-xl border border-white/[0.06] bg-gray-900/50 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 shadow-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="animate-pulse">Loading tasks...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredTasks} emptyMessage="No tasks found" />
      )}

      {user?.companyId && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTasks}
          task={selectedTask}
          companyId={user.companyId}
        />
      )}
    </div>
  );
}
