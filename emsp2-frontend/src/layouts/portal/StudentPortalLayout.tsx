import {
  Briefcase,
  CalendarRange,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
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
  const { data: profile, isError: profileError } = useEtudiantMe();
  const externalStudentLink = "https://emsp.k12net.com";

  return (
    <div className="maxton-portal-shell">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[288px_1fr]">
        <aside className="maxton-sidebar-student border-r border-white/5 px-4 py-6 text-white lg:min-h-screen lg:px-5">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 to-emerald-950/80 p-4 shadow-xl ring-1 ring-white/5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-secondary/25 blur-2xl" />
            <div className="relative flex items-center gap-3">
              {profile?.photo?.url || profile?.user.avatarUrl ? (
                <img
                  src={profile?.photo?.url || profile?.user.avatarUrl}
                  alt={profile?.user.firstName || "Etudiant EMSP"}
                  className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/25"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-lg font-bold ring-1 ring-white/20">
                  {profile?.user.firstName?.[0] || "E"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-200/90">Portail etudiant</p>
                <h2 className="truncate font-display text-base font-bold">
                  {profile ? `${profile.user.firstName} ${profile.user.lastName}` : "EMSP"}
                </h2>
                <p className="truncate text-xs text-white/70">{profile?.matricule || "..."}</p>
              </div>
            </div>
            <div className="relative mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm backdrop-blur-sm">
              <p className="text-[11px] text-white/60">Formation</p>
              <p className="font-semibold">{profile?.formationCode || "EMSP"}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.to} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.035 }}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-secondary text-white shadow-lg shadow-emerald-900/30"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Icon size={17} />
                    </span>
                    {item.label}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          <a
            href={externalStudentLink}
            onClick={(event) => {
              if (!externalStudentLink) event.preventDefault();
            }}
            target={externalStudentLink ? "_blank" : undefined}
            rel={externalStudentLink ? "noreferrer" : undefined}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/15 px-3 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-secondary hover:text-white"
          >
            <ExternalLink size={17} />
            K12 / externe
          </a>

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/12"
          >
            <LogOut size={17} />
            Deconnexion
          </button>
        </aside>

        <div className="flex min-h-screen flex-col bg-transparent">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 px-4 py-4 backdrop-blur-lg md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-secondary">EMSP · Suivi</p>
                <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-dark md:text-2xl">Espace numerique etudiant</h1>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right text-sm shadow-sm">
                <span className="font-medium text-dark">{profile?.promotion?.label || "Promotion"}</span>
                {profile?.promotion ? <span className="block text-xs text-slate-500">{profile.promotion.academicYear}</span> : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6">
            {profileError ? (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                Profil etudiant non charge. Verifiez que ce compte possede un dossier valide.
              </div>
            ) : null}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalLayout;
