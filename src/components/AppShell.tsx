import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Users, Car,
  BarChart3, Settings, LogOut, Sparkles, Search, ReceiptText,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shops", label: "Stores", icon: Building2 },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/billing", label: "Billing", icon: ReceiptText },
  { to: "/parking", label: "Parking", icon: Car },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const roleLabel = user?.role || "guest";

  return (
    <div className="min-h-screen flex w-full">
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 glass-strong border-r border-sidebar-border transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold leading-tight">SmartMall</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Suite</div>
          </div>
        </div>
        <nav className="px-3 py-2 space-y-1">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-primary-glow mt-0.5">{roleLabel}</div>
            <button
              onClick={signOut}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/70 transition"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-border">
          <div className="flex items-center gap-3 px-4 lg:px-8 py-3">
            <button onClick={() => setOpen((o) => !o)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-semibold text-lg flex-1 truncate">{title}</h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-input border border-border w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search…" className="bg-transparent flex-1 text-sm focus:outline-none" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}