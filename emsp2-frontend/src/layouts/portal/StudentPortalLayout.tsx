import {
  Briefcase,
  CalendarRange,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useEtudiantMe } from "../../hooks/useStudentPortal";

const items = [
  { to: "/etudiant/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/etudiant/notes", label: "Notes", icon: GraduationCap },
  { to: "/etudiant/edt", label: "Emploi du temps", icon: CalendarRange },
  { to: "/etudiant/paiements", label: "Paiements", icon: Wallet },
  { to: "/etudiant/documents", label: "Documents", icon: FileText },
  { to: "/etudiant/forum", label: "Forum", icon: MessageSquare },
  { to: "/etudiant/stages", label: "Stages", icon: Briefcase },
];

const StudentPortalLayout = () => {
  const { logout } = useAuth();
  const { data: profile } = useEtudiantMe();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-5 py-6">
          <div className="rounded-3xl bg-[linear-gradient(135deg,#1E293B_0%,#0F172A_100%)] p-5 text-white">
            <div className="flex items-center gap-4">
              {profile?.photo?.url || profile?.user.avatarUrl ? (
                <img
                  src={profile?.photo?.url || profile?.user.avatarUrl}
                  alt={profile?.user.firstName || "Etudiant EMSP"}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold">
                  {profile?.user.firstName?.[0] || "E"}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Portail etudiant</p>
                <h2 className="mt-2 font-display text-lg font-bold">
                  {profile ? `${profile.user.firstName} ${profile.user.lastName}` : "EMSP"}
                </h2>
                <p className="mt-1 text-sm text-white/70">{profile?.matricule || "Chargement..."}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <p className="text-white/70">Formation</p>
              <p className="mt-1 font-semibold">{profile?.formationCode || "EMSP"}</p>
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
                      isActive ? "bg-secondary text-white shadow-lg shadow-emerald-500/20" : "text-slate-600 hover:bg-slate-100"
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
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">EMSP</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-dark">Portail Etudiant</h1>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {profile?.promotion?.label || "Promotion active"} {profile?.promotion ? `• ${profile.promotion.academicYear}` : ""}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalLayout;
