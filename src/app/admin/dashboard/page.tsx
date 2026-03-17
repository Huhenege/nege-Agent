"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { Building2, Store, Users, FileCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const submissionsData = [
  { name: "Mon", value: 42 },
  { name: "Tue", value: 63 },
  { name: "Wed", value: 55 },
  { name: "Thu", value: 78 },
  { name: "Fri", value: 91 },
  { name: "Sat", value: 34 },
  { name: "Sun", value: 22 },
];

const growthData = [
  { name: "Jan", value: 120 },
  { name: "Feb", value: 180 },
  { name: "Mar", value: 240 },
  { name: "Apr", value: 310 },
  { name: "May", value: 420 },
  { name: "Jun", value: 530 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState({
    companies: 0,
    stores: 0,
    users: 0,
    pendingSubmissions: 0
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        { count: companyCount },
        { count: storeCount },
        { count: userCount },
        { count: pendingCount },
        { data: activities }
      ] = await Promise.all([
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("submissions")
          .select(`
            id,
            status,
            created_at,
            profiles (full_name)
          `)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      setStats({
        companies: companyCount || 0,
        stores: storeCount || 0,
        users: userCount || 0,
        pendingSubmissions: pendingCount || 0
      });

      if (activities) {
        setRecentActivity(activities.map((a: any) => ({
          text: `Submission from ${a.profiles?.full_name || "Agent"}`,
          time: new Date(a.created_at).toLocaleString(),
          dot: a.status === "submitted" ? "bg-amber-400" : a.status === "approved" ? "bg-emerald-400" : "bg-rose-400"
        })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and system health"
      />

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={stats.companies.toString()}
          change="Real-time"
          changeType="positive"
          icon={Building2}
          iconColor="text-violet-400"
        />
        <StatCard
          title="Active Stores"
          value={stats.stores.toString()}
          change="Active only"
          changeType="positive"
          icon={Store}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Registered Users"
          value={stats.users.toString()}
          change="Total profiles"
          changeType="positive"
          icon={Users}
          iconColor="text-sky-400"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingSubmissions.toString()}
          change="Requires action"
          changeType={stats.pendingSubmissions > 0 ? "negative" : "positive"}
          icon={FileCheck}
          iconColor="text-amber-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Submissions Evolution"
          data={submissionsData}
          color="#8b5cf6"
        />
        <AreaChartCard
          title="Platform Growth"
          data={growthData}
          color="#06b6d4"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Recent Global Activity</h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity found.</p>
          ) : (
            recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]">
                <div className={`h-2 w-2 rounded-full ${item.dot}`} />
                <p className="flex-1 text-sm text-gray-300">{item.text}</p>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
