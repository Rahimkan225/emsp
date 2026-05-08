import {
  BookOpen,
  CalendarRange,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Sun,
  UserRound,
  Wallet,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import Breadcrumbs from "../../components/common/Breadcrumbs";
import { useAuth } from "../../hooks/useAuth";
import { usePortalTheme } from "../../hooks/usePortalTheme";
import { useEtudiantMe } from "../../hooks/useStudentPortal";

const sidebarItems = [
  { to: "/etudiant/dashboard", label: "Accueil", icon: Home },
  { to: "/etudiant/notes", label: "Notes", icon: GraduationCap },
  { to: "/etudiant/edt", label: "EDT", icon: CalendarRange },
  { to: "/etudiant/paiements", label: "Paiements", icon: Wallet },
  { to: "/etudiant/documents", label: "Documents", icon: FileText },
  { to: "/etudiant/communaute", label: "Communaute", icon: MessageSquare },
  { to: "/etudiant/stages", label: "Stages", icon: BookOpen },
  { to: "/etudiant/profil", label: "Profil", icon: UserRound },
];

const bottomItems = sidebarItems.filter((item) =>
  ["/etudiant/dashboard", "/etudiant/notes", "/etudiant/edt", "/etudiant/paiements", "/etudiant/profil"].includes(item.to),
);

const StudentPortalLayout = () => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = usePortalTheme();
  const { data: profile, isError: profileError } = useEtudiantMe();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  return (
    <div className="maxton-portal-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1420px]">
        <aside className="maxton-sidebar-student hidden min-h-screen w-[220px] shrink-0 border-r border-white/10 px-3 py-5 text-white sm:block">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <div className="flex items-center gap-3">
              {profile?.photo?.url || profile?.user.avatarUrl ? (
                <img
                  src={profile?.photo?.url || profile?.user.avatarUrl}
                  alt={profile?.user.firstName || "Etudiant EMSP"}
                  className="h-11 w-11 rounded-xl object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold">
                  {profile?.user.firstName?.[0] || "E"}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{profile ? `${profile.user.firstName} ${profile.user.lastName}` : "EMSP"}</p>
                <p className="truncate text-xs text-white/65">{profile?.matricule || "Portail etudiant"}</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 space-y-1" aria-label="Navigation etudiant">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-emerald-500 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
          >
            <LogOut size={17} />
            Deconnexion
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 sm:pb-0">
          <header className="emsp-topbar sticky top-0 z-30 px-4 py-3">
            <div className="mx-auto max-w-[1200px]">
              <div className="hidden sm:block">
                <Breadcrumbs className="mb-2" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-600">EMSP</p>
                  <h1 className="truncate font-display text-lg font-bold text-dark sm:text-2xl">Espace etudiant</h1>
                </div>
                <div className="flex items-center gap-2">
                  {!isOnline ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      <WifiOff size={14} />
                      Hors ligne
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="emsp-panel rounded-xl p-2.5 text-slate-600 shadow-sm transition hover:border-secondary hover:text-secondary"
                    aria-label={isDark ? "Activer le theme clair" : "Activer le theme sombre"}
                    title={isDark ? "Theme clair" : "Theme sombre"}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <div className="emsp-panel rounded-xl px-3 py-2 text-right text-xs shadow-sm">
                    <span className="block font-semibold text-dark">{profile?.promotion?.label || "Promotion"}</span>
                    <span className="text-slate-500">{profile?.formationCode || "EMSP"}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5">
            <div className="mx-auto max-w-[1200px]">
              {profileError ? (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                  Profil etudiant non charge. Les donnees en cache restent consultables si elles existent.
                </div>
              ) : null}
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-2xl backdrop-blur sm:hidden" aria-label="Navigation mobile etudiant">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-[58px] flex-col items-center justify-center rounded-xl text-[11px] font-semibold transition-colors ${
                    isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
                  }`
                }
                aria-label={item.label}
              >
                <Icon size={20} />
                <span className="mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default StudentPortalLayout;
