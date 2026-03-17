interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-gray-500/10 text-gray-400 ring-gray-500/20",
  success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  danger: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
  info: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
};

const getAutoVariant = (status: string): keyof typeof variantStyles => {
  const s = status.toLowerCase();
  if (["active", "approved", "completed", "success", "published"].includes(s)) return "success";
  if (["pending", "reviewing", "submitted", "warning", "medium"].includes(s)) return "warning";
  if (["inactive", "rejected", "failed", "danger", "high", "suspended"].includes(s)) return "danger";
  if (["info", "low"].includes(s)) return "info";
  return "default";
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const activeVariant = variant || getAutoVariant(status);
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${variantStyles[activeVariant]}`}
    >
      {status}
    </span>
  );
}
