import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900 disabled:bg-ink-300",
  accent:
    "bg-amber-400 text-ink-950 hover:bg-amber-300 focus-visible:ring-amber-500 disabled:bg-amber-100 disabled:text-amber-400",
  outline:
    "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 focus-visible:ring-ink-400 disabled:text-ink-300",
  ghost:
    "text-ink-600 hover:bg-ink-100 focus-visible:ring-ink-300 disabled:text-ink-300",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 disabled:bg-rose-200",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 disabled:bg-emerald-200",
};

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={16} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={16} />}
    </button>
  );
}
