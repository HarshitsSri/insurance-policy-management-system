export default function Card({ children, className = "", padded = true, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white shadow-card ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-amber-300">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
