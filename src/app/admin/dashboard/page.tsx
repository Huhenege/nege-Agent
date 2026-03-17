"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { Building2, Store, Users, FileCheck } from "lucide-react";

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
          value="148"
          change="+12 this month"
          changeType="positive"
          icon={Building2}
          iconColor="text-violet-400"
        />
        <StatCard
          title="Active Stores"
          value="2,847"
          change="+89 this month"
          changeType="positive"
          icon={Store}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Registered Users"
          value="1,294"
          change="+37 this week"
          changeType="positive"
          icon={Users}
          iconColor="text-sky-400"
        />
        <StatCard
          title="Pending Reviews"
          value="64"
          change="12 urgent"
          changeType="negative"
          icon={FileCheck}
          iconColor="text-amber-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Submissions This Week"
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
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { text: 'New company "FreshMart Inc." registered', time: "2 minutes ago", dot: "bg-emerald-400" },
            { text: "User john@example.com submitted 3 photos", time: "15 minutes ago", dot: "bg-indigo-400" },
            { text: 'Store "Downtown Branch" was deactivated', time: "1 hour ago", dot: "bg-amber-400" },
            { text: "Submission #1847 flagged for review", time: "2 hours ago", dot: "bg-rose-400" },
            { text: "System backup completed successfully", time: "3 hours ago", dot: "bg-gray-400" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]">
              <div className={`h-2 w-2 rounded-full ${item.dot}`} />
              <p className="flex-1 text-sm text-gray-300">{item.text}</p>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
