export function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

const baseInputClasses =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 outline-none transition focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400";

export function Input({ error, className = "", icon: Icon, ...rest }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
      )}
      <input
        className={`${baseInputClasses} ${Icon ? "pl-9" : ""} ${
          error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-ink-200 focus:border-ink-400 focus:ring-ink-100"
        } ${className}`}
        {...rest}
      />
    </div>
  );
}

export function Select({ error, className = "", children, ...rest }) {
  return (
    <select
      className={`${baseInputClasses} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b76ab%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%2011.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_0.6rem_center] bg-no-repeat pr-9 ${
        error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-ink-200 focus:border-ink-400 focus:ring-ink-100"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = "", ...rest }) {
  return (
    <textarea
      className={`${baseInputClasses} min-h-[96px] resize-y ${
        error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-ink-200 focus:border-ink-400 focus:ring-ink-100"
      } ${className}`}
      {...rest}
    />
  );
}
