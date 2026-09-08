import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Receipt,
  PackageSearch,
  ClipboardList,
  LogOut,
  ShieldHalf,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { roleLabel } from "../../utils/roleUtils";

const MENUS = {
  ADMIN: [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: PackageSearch },
    { name: "Plans", path: "/admin/plans", icon: ClipboardList },
    { name: "Policies", path: "/admin/policies", icon: ShieldCheck },
    { name: "Claims", path: "/admin/claims", icon: FileText },
    { name: "Payments", path: "/admin/payments", icon: Receipt },
    { name: "Users & Insurance Officers", path: "/admin/users", icon: Users },
  ],
  AGENT: [
    { name: "Overview", path: "/agent/dashboard", icon: LayoutDashboard },
    { name: "Policies", path: "/agent/policies", icon: ShieldCheck },
    { name: "Claims", path: "/agent/claims", icon: FileText },
    { name: "Payments", path: "/agent/payments", icon: Receipt },
    { name: "Customers", path: "/agent/customers", icon: Users },
  ],
  CUSTOMER: [
    { name: "Overview", path: "/customer/dashboard", icon: LayoutDashboard },
    { name: "Browse Plans", path: "/customer/plans", icon: PackageSearch },
    { name: "My Policies", path: "/customer/policies", icon: ShieldCheck },
    { name: "Payments", path: "/customer/payments", icon: Receipt },
    { name: "Claims", path: "/customer/claims", icon: FileText },
    { name: "My Profile", path: "/customer/profile", icon: Users },
  ],
};

export default function Sidebar() {
  const role = localStorage.getItem("role");
  const { logout } = useAuth();

  const menu = MENUS[role] || MENUS.CUSTOMER;

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col bg-ink-950 text-ink-100">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-ink-950">
          <ShieldHalf size={20} strokeWidth={2.25} />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-none text-white">Insurance CRM</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">
            {roleLabel(role)} Portal
          </p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-400 text-ink-950 shadow-sm"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={17} strokeWidth={2.25} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-ink-200 transition hover:bg-rose-500/90 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
