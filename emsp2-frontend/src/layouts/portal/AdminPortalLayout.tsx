import {
  Bell,
  FileText,
  GraduationCap,
  Image,
  LayoutDashboard,
  Loader2,
  LogOut,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useSiteConfig } from "../../hooks/useSiteConfig";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/etudiants", label: "Etudiants", icon: Users },
  { to: "/admin/scolarite", label: "Scolarite", icon: GraduationCap },
  { to: "/admin/comptabilite", label: "Comptabilite", icon: Receipt },
  { to: "/admin/statistiques", label: "Statistiques", icon: ShieldCheck },
  { to: "/admin/mediatheque", label: "Mediatheque", icon: Image },
  { to: "/admin/actualites", label: "Actualites", icon: FileText },
  { to: "/admin/parametres", label: "Parametres", icon: Settings2 },
];

const AdminOutletFallback = () => (
  <div className="flex min-h-[320px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
      <Loader2 size={18} className="animate-spin text-secondary" />
      Chargement du module...
    </div>
  </div>
);

const AdminPortalLayout = () => {
  const { user, logout } = useAuth();
  const { data: site } = useSiteConfig();
  const roleBadgeClass =
    user?.role === "admin"
      ? "bg-secondary/20 text-secondary"
      : user?.role === "direction"
        ? "bg-primary/30 text-dark"
        : "bg-white/10 text-white";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1720px] lg:grid-cols-[260px_1fr]">
        <aside className="bg-dark px-5 py-6 text-white">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="space-y-4">
              {site?.logoUrl ? (
                <div className="rounded-[28px] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                  <img src={site.logoUrl} alt={site.logoAlt} className="h-auto w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary font-display text-2xl font-bold text-dark">
                  E
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Portail EMSP</p>
                <p className="mt-2 font-display text-xl font-bold">{site?.siteName || "EMSP"}</p>
                <p className="text-sm text-white/60">{site?.slogan || "Dashboard Direction"}</p>
              </div>
            </div>
            <div className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${roleBadgeClass}`}>
              {user?.role || "admin"}
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-secondary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="search"
                  placeholder="Recherche globale..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600">
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 font-semibold text-secondary">
                    {user?.firstName?.[0] || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark">{user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}</p>
                    <p className="text-xs text-slate-500">{user?.role || "admin"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">
            <Suspense fallback={<AdminOutletFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalLayout;
