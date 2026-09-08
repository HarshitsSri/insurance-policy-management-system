import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { roleLabel } from "../../utils/roleUtils";

const TITLES = [
  { match: "/dashboard", title: "Overview" },
  { match: "/products", title: "Insurance Products" },
  { match: "/plans", title: "Policy Plans" },
  { match: "/policies", title: "Policies" },
  { match: "/claims", title: "Claims" },
  { match: "/payments", title: "Premium Payments" },
  { match: "/users", title: "Users & Insurance Officers" },
  { match: "/customers", title: "Customers" },
  { match: "/profile", title: "My Profile" },
];

function resolveTitle(pathname) {
  const hit = TITLES.find((t) => pathname.includes(t.match));
  return hit?.title || "Dashboard";
}

export default function Navbar() {
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const location = useLocation();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-ink-100 bg-white/80 px-6 backdrop-blur sm:px-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {roleLabel(role)} Portal
        </p>
        <h2 className="font-display text-xl font-bold text-ink-900">{resolveTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3 border-l border-ink-100 pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink-900">{email}</p>
            <p className="text-xs font-medium text-ink-400">{roleLabel(role)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-amber-300">
            {email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
