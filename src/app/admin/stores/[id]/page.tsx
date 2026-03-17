"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { 
  MapPin, 
  Building2, 
  Calendar, 
  ChevronLeft, 
  Store, 
  Loader2, 
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function StoreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStoreDetails();
    }
  }, [id]);

  const fetchStoreDetails = async () => {
    setLoading(true);
    try {
      // Fetch store with company
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Fetch recent tasks for this store
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("store_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (taskError) throw taskError;
      setTasks(taskData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p>Loading details...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="mb-4 text-rose-500" />
        <h2 className="mb-2 text-2xl font-bold text-white">Store not found</h2>
        <p className="mb-6 text-gray-400">{error || "The store you are looking for does not exist."}</p>
        <Link href="/admin/stores" className="text-indigo-400 hover:underline">
          Back to stores list
        </Link>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="rounded-xl border border-white/[0.06] bg-gray-900/50 p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <PageHeader 
          title={store.name} 
          description={`Registered at ${new Date(store.created_at).toLocaleDateString()}`} 
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length.toString()}
          icon={ClipboardList}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Completed"
          value={completedTasks.toString()}
          icon={CheckCircle2}
          change="85%"
          changeType="positive"
        />
        <StatCard
          title="Pending"
          value={pendingTasks.toString()}
          icon={Clock}
          change="-2"
          changeType="negative"
        />
        <StatCard
          title="Accuracy"
          value="94%"
          icon={Store}
          iconColor="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl shadow-xl">
            <h3 className="mb-6 text-lg font-semibold text-white">Store Details</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-200">{store.address}</p>
                </div>
              </div>


              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-lg bg-amber-500/10 p-2 text-amber-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Created On</p>
                  <p className="mt-1 text-sm text-gray-200">{new Date(store.created_at).toLocaleString()}</p>
                </div>
              </div>

              {store.latitude && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-gray-950/50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">GPS COORDINATES</p>
                  <div className="flex gap-4 font-mono text-xs text-indigo-400">
                    <span>LAT: {store.latitude}</span>
                    <span>LNG: {store.longitude}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Store Tasks</h3>
              <Link href="/admin/submissions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View All Activity →
              </Link>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] text-gray-500">
                  <ClipboardList size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">No tasks assigned to this store yet</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] p-4 border border-white/[0.06] transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-2 ${
                        task.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                        task.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        <ClipboardList size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{task.title}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                      task.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
