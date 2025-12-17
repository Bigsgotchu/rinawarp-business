import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, Key, Users, LineChart, FileText, Settings } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/licenses", label: "Licenses", icon: Key },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/logs", label: "Logs", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-60 border-r border-admin-border bg-admin-sidebar/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-admin-border/60">
        <BrandLogo className="h-7" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-admin-muted">
          Admin Console
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900",
                ].join(" ")
              }
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-3 text-xs text-neutral-500 border-t border-neutral-800">
        © {new Date().getFullYear()} RinaWarp
      </div>
    </aside>
  );
}