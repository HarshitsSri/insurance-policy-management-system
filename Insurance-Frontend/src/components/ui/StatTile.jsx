export default function StatTile({ icon: Icon, label, value, sub, tone = "default" }) {
  const toneClasses = {
    default: "bg-ink-900 text-amber-300",
    amber: "bg-amber-400 text-ink-950",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-500">{label}</p>
      {sub && <p className="mt-2 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
