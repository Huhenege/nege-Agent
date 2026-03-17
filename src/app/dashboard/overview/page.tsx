"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const weeklyTasks = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 18 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 22 },
  { name: "Fri", value: 28 },
  { name: "Sat", value: 8 },
  { name: "Sun", value: 5 },
];

const completionTrend = [
  { name: "Week 1", value: 67 },
  { name: "Week 2", value: 72 },
  { name: "Week 3", value: 78 },
  { name: "Week 4", value: 85 },
  { name: "Week 5", value: 82 },
  { name: "Week 6", value: 91 },
];

export default function OverviewDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your task performance."
      />

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value="186"
          change="+24 this week"
          changeType="positive"
          icon={ClipboardList}
          iconColor="text-indigo-400"
        />
        <StatCard
          title="Completed"
          value="142"
          change="76% completion rate"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="In Progress"
          value="32"
          change="17 due today"
          changeType="neutral"
          icon={Clock}
          iconColor="text-sky-400"
        />
        <StatCard
          title="Overdue"
          value="12"
          change="3 critical"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="text-rose-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Tasks Created This Week"
          data={weeklyTasks}
          color="#6366f1"
        />
        <AreaChartCard
          title="Completion Rate Trend (%)"
          data={completionTrend}
          color="#10b981"
        />
      </div>

      {/* Recent Tasks */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Recent Tasks</h3>
        <div className="space-y-3">
          {[
            { title: "Shelf Display Check — Downtown SuperMart", status: "Completed", statusColor: "text-emerald-400", time: "2h ago" },
            { title: "Price Tag Audit — Eastside Groceries", status: "In Progress", statusColor: "text-sky-400", time: "4h ago" },
            { title: "Promo Stand Photo — Mall Central", status: "Pending", statusColor: "text-amber-400", time: "6h ago" },
            { title: "Competitor Analysis — Harbor View", status: "Overdue", statusColor: "text-rose-400", time: "1d ago" },
          ].map((task, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${task.statusColor.replace("text-", "bg-")}`} />
                <p className="text-sm text-gray-300">{task.title}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${task.statusColor}`}>{task.status}</span>
                <span className="text-xs text-gray-500">{task.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
