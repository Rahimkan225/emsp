import { ArrowRight, CalendarClock, Medal, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { GradeRadialGauge, MiniLineChart } from "../../../components/dashboard/SvgCharts";
import { useEtudiantMe, useStudentDashboard } from "../../../hooks/useStudentPortal";

const StudentDashboardPage = () => {
  const { data: profile } = useEtudiantMe();
  const { data, isLoading, isError } = useStudentDashboard();

  if (isLoading || !data) {
    if (isError) {
      return (
        <SurfaceCard className="p-8 text-center text-slate-500">
          Impossible de charger le tableau de bord etudiant pour le moment.
        </SurfaceCard>
      );
    }

    return <div className="h-96 animate-pulse rounded-2xl bg-white shadow-maxton" />;
  }

  const kpis = [
    {
      label: "Moyenne generale",
      value: data.moyenneGenerale.toFixed(2),
      accent: data.moyenneGenerale >= 10 ? "text-secondary" : "text-red-500",
      icon: TrendingUp,
    },
    {
      label: "Rang promotion",
      value: `#${data.rangPromotion}`,
      accent: "text-dark",
      icon: Medal,
    },
    {
      label: "Prochain examen",
      value: data.prochainExamen || "Aucun",
      accent: "text-dark",
      icon: CalendarClock,
    },
    {
      label: "Solde scolarite",
      value: data.soldeScolarite,
      accent: "text-primary",
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-secondary">Profil · widget Maxton</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-center">
          <GradeRadialGauge average={data.moyenneGenerale} max={20} />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-sm text-slate-500">Etudiant</p>
              <p className="mt-2 font-display text-xl font-bold text-dark">
                {profile ? `${profile.user.firstName} ${profile.user.lastName}` : "EMSP"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-sm text-slate-500">Matricule</p>
              <p className="mt-2 font-display text-xl font-bold text-dark">{profile?.matricule || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-sm text-slate-500">Formation</p>
              <p className="mt-2 font-display text-xl font-bold text-dark">{profile?.formationCode || "EMSP"}</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <SurfaceCard key={item.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className={`mt-4 font-display text-3xl font-bold ${item.accent}`}>{item.value}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-secondary">
                  <Icon size={20} />
                </div>
              </div>
            </SurfaceCard>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SurfaceCard className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-secondary">Performance</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-dark">Evolution des moyennes</h2>
            </div>
          </div>
          <MiniLineChart data={data.trend.map((item) => ({ label: item.label, value: item.average }))} />
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Cours a venir</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Les 3 prochains cours</h2>
          <div className="mt-6 space-y-4">
            {data.prochainsCours.length ? (
              data.prochainsCours.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-dark">{item.matiere}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.enseignant || "Equipe pedagogique"}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: item.color }}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    {new Date(item.debut).toLocaleString("fr-FR", {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                    {" - "}
                    {item.salle}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Aucun cours n'est encore programme pour votre promotion.
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Vie EMSP</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Dernieres actualites</h2>
          </div>
          <Link to="/actualites" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
            Tout voir
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.actualites.length ? (
            data.actualites.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="h-44 bg-slate-100">
                  {item.coverImage ? (
                    <img src={item.coverImage.url} alt={item.coverImage.altText || item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune couverture</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.category || "Actualite"}</p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-dark">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Aucune actualite n'est disponible pour le moment.
            </div>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
};

export default StudentDashboardPage;
