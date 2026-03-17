"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Zap, CheckCircle } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with basic features",
    features: ["Up to 3 stores", "50 tasks/month", "Basic reports", "Email support"],
    current: false,
    cta: "Downgrade",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    features: ["Up to 25 stores", "Unlimited tasks", "Advanced analytics", "Priority support", "Team management", "API access"],
    current: true,
    cta: "Current Plan",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations",
    features: ["Unlimited stores", "Unlimited tasks", "Custom reports", "Dedicated support", "SSO / SAML", "SLA guarantee", "Custom integrations"],
    current: false,
    cta: "Upgrade",
  },
];

const invoices = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "Paid" },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment methods"
      />

      {/* Current Plan Info */}
      <div className="flex items-center gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
          <Zap size={24} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Pro Plan</p>
          <p className="text-sm text-gray-400">Your next billing date is April 1, 2026</p>
        </div>
        <button className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]">
          Manage Subscription
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 transition-all duration-300 ${
              plan.highlight
                ? "border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.04] shadow-lg shadow-indigo-500/10"
                : "border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 hover:border-white/[0.12]"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1 text-xs font-semibold text-white">
                Current
              </div>
            )}
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-gray-400">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                plan.current
                  ? "border border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                  : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]"
              }`}
              disabled={plan.current}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Payment Method</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-xs font-bold text-white">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-400">Expires 12/2028</p>
          </div>
          <button className="ml-auto text-sm text-indigo-400 hover:text-indigo-300">
            Update
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Invoice History</h3>
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-white">{inv.id}</p>
                <span className="text-xs text-gray-500">{inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300">{inv.amount}</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
