import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-300 shadow-card">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-ink-700">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
