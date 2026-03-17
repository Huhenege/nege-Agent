"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-indigo-400",
}: StatCardProps) {
  const changeColorMap = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-gray-400",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColorMap[changeType]}`}>
              {changeType === "positive" && "↑ "}
              {changeType === "negative" && "↓ "}
              {change}
            </p>
          )}
        </div>
        <div className={`rounded-xl bg-white/[0.05] p-3 ${iconColor}`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
