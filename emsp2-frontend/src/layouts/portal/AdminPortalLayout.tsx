import {
  Bell,
  Loader2,
  LogOut,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { getVisibleAdminPortalItems } from "../../config/adminPortal";
import { useAuth } from "../../hooks/useAuth";
import { usePortalTheme } from "../../hooks/usePortalTheme";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const AdminOutletFallback = () => (
  <div className="flex min-h-[320px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-maxton">
      <Loader2 size={18} className="animate-spin text-secondary" />
      Chargement du module...
    </div>
  </div>
);

const AdminPortalLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = usePortalTheme();
  const { data: site } = useSiteConfig();
  const items = getVisibleAdminPortalItems(user?.role);
  const roleBadgeClass =
    user?.role === "admin"
      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
      : user?.role === "direction"
        ? "bg-primary/25 text-amber-100 ring-1 ring-primary/35"
        : "bg-white/10 text-white ring-1 ring-white/15";

  return (
    <div className="maxton-portal-shell">
      <div className="mx-auto grid min-h-screen max-w-[1760px] lg:grid-cols-[280px_1fr]">
        <aside className="maxton-sidebar flex flex-col px-4 py-6 text-white lg:min-h-screen lg:px-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
            <div className="space-y-3">
              {site?.logoUrl ? (
                <div className="rounded-2xl bg-white px-3 py-3 shadow-inner ring-1 ring-black/5">
                  <img src={site.logoUrl} alt={site.logoAlt} className="mx-auto h-auto max-h-14 w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-400 font-display text-xl font-bold text-maxton-navy shadow-lg">
                  E
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-200/90">Maxton · EMSP</p>
                <p className="mt-1 font-display text-lg font-bold leading-snug">{site?.siteName || "EMSP"}</p>
                <p className="mt-1 text-xs leading-snug text-white/65">{site?.slogan || "Pilotage institutionnel"}</p>
              </div>
            </div>
            <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${roleBadgeClass}`}>
              {user?.role || "admin"}
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/90 to-secondary/90 text-white shadow-lg shadow-emerald-900/25"
                          : "text-white/72 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10 transition group-hover:bg-white/15`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/12"
          >
            <LogOut size={17} />
            Deconnexion
          </button>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="emsp-topbar sticky top-0 z-30 px-4 py-3 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="w-full">
                <Breadcrumbs className="mb-3" />
              </div>
              <div className="emsp-panel flex min-w-[200px] flex-1 items-center gap-2 rounded-full bg-slate-50/90 px-4 py-2.5 shadow-sm md:min-w-[280px]">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  type="search"
                  placeholder="Rechercher etudiants, dossiers, formations..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="emsp-panel relative rounded-full p-2.5 text-slate-600 shadow-sm transition hover:border-secondary hover:text-secondary"
                  aria-label={isDark ? "Activer le theme clair" : "Activer le theme sombre"}
                  title={isDark ? "Theme clair" : "Theme sombre"}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  type="button"
                  className="emsp-panel relative rounded-full p-2.5 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="emsp-panel flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary/25 to-secondary/5 text-sm font-bold text-secondary ring-1 ring-secondary/20">
                    {user?.firstName?.[0] || "A"}
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-semibold text-dark">{user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}</p>
                    <p className="text-[11px] capitalize text-slate-500">{user?.role || "admin"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6">
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
