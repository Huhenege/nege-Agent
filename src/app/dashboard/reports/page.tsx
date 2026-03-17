"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { TrendingUp, Target, Eye, Award } from "lucide-react";
import { Download } from "lucide-react";

const storePerformance = [
  { name: "SuperMart", value: 94 },
  { name: "Eastside", value: 87 },
  { name: "Mall Central", value: 72 },
  { name: "Harbor", value: 91 },
  { name: "Uptown", value: 68 },
];

const monthlyCompletion = [
  { name: "Oct", value: 78 },
  { name: "Nov", value: 82 },
  { name: "Dec", value: 75 },
  { name: "Jan", value: 88 },
  { name: "Feb", value: 92 },
  { name: "Mar", value: 95 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Analytics and performance insights"
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.08]">
            <Download size={16} />
            Export Report
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Avg Completion Rate"
          value="91%"
          change="+4% vs last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Task Accuracy"
          value="96%"
          change="+2% improvement"
          changeType="positive"
          icon={Target}
          iconColor="text-indigo-400"
        />
        <StatCard
          title="Photo Quality"
          value="4.7/5"
          change="Based on 842 reviews"
          changeType="neutral"
          icon={Eye}
          iconColor="text-sky-400"
        />
        <StatCard
          title="Top Performer"
          value="Sarah C."
          change="48 tasks completed"
          changeType="positive"
          icon={Award}
          iconColor="text-amber-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Store Performance Score"
          data={storePerformance}
          color="#8b5cf6"
        />
        <AreaChartCard
          title="Monthly Completion Rate (%)"
          data={monthlyCompletion}
          color="#06b6d4"
        />
      </div>

      {/* Report Summary Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Weekly Summary",
            description: "Task completion, store visits, and performance metrics for the current week.",
            updated: "Updated 2h ago",
          },
          {
            title: "Monthly Analytics",
            description: "Comprehensive monthly breakdown of all task activities and quality scores.",
            updated: "Updated Mar 1",
          },
          {
            title: "Custom Report",
            description: "Build a custom report with selected metrics, date ranges, and store filters.",
            updated: "Create new",
          },
        ].map((report, idx) => (
          <div
            key={idx}
            className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg hover:shadow-indigo-500/5"
          >
            <h4 className="text-sm font-semibold text-white">{report.title}</h4>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{report.description}</p>
            <p className="mt-4 text-xs text-gray-500">{report.updated}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
