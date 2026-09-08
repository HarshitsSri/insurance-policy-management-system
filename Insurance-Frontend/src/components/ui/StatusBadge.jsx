import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  Hourglass,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// Central status registry — every status pill in the app (policy, claim, payment,
// product/plan active flags, user active flags) resolves through this map so the
// "ledger stamp" look stays consistent everywhere.
const STATUS_MAP = {
  // Policy statuses
  ACTIVE: { tone: "emerald", icon: ShieldCheck, label: "Active" },
  PENDING_PAYMENT: { tone: "amber", icon: Hourglass, label: "Pending Payment" },
  EXPIRED: { tone: "slate", icon: ShieldOff, label: "Expired" },
  CANCELLED: { tone: "rose", icon: XCircle, label: "Cancelled" },

  // Claim statuses
  SUBMITTED: { tone: "sky", icon: Clock3, label: "Submitted" },
  UNDER_REVIEW: { tone: "amber", icon: ShieldQuestion, label: "Under Review" },
  RECOMMENDED_FOR_APPROVAL: { tone: "emerald", icon: ThumbsUp, label: "Recommended: Approve" },
  RECOMMENDED_FOR_REJECTION: { tone: "rose", icon: ThumbsDown, label: "Recommended: Reject" },
  APPROVED: { tone: "emerald", icon: CheckCircle2, label: "Approved" },
  REJECTED: { tone: "rose", icon: XCircle, label: "Rejected" },

  // Payment statuses
  SUCCESS: { tone: "emerald", icon: CheckCircle2, label: "Success" },
  FAILED: { tone: "rose", icon: XCircle, label: "Failed" },
  PENDING: { tone: "amber", icon: Clock3, label: "Pending" },

  // Generic active/inactive (users, products, plans)
  TRUE: { tone: "emerald", icon: CheckCircle2, label: "Active" },
  FALSE: { tone: "slate", icon: AlertTriangle, label: "Inactive" },
};

const TONE_CLASSES = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-300",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  indigo: "bg-ink-100 text-ink-700 ring-ink-200",
};

export default function StatusBadge({ status, label, size = "md" }) {
  const key = typeof status === "boolean" ? String(status).toUpperCase() : status;
  const entry = STATUS_MAP[key] || { tone: "indigo", icon: AlertTriangle, label: key || "—" };
  const Icon = entry.icon;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap ${padding} ${TONE_CLASSES[entry.tone]}`}
    >
      <Icon size={size === "sm" ? 11 : 13} strokeWidth={2.5} />
      {label || entry.label}
    </span>
  );
}

export function Pill({ tone = "indigo", children, size = "md" }) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap ${padding} ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
