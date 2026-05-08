import { useMemo } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentForum } from "../../../hooks/useStudentPortal";

const StudentStagesPage = () => {
  const { data: profile } = useEtudiantMe();
  const { data, isLoading } = useStudentForum();

  const opportunities = useMemo(
    () => data?.discussions.filter((item) => item.category === "stages") || [],
    [data],
  );

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Career path</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Stages & opportunites</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">Stages</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-dark">Offres & opportunites</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Les opportunites ci-dessous sont chargees depuis les publications reelles du forum et reliees a votre espace etudiant.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Etudiant</p>
            <p className="mt-2 font-display text-2xl font-bold text-dark">
              {profile ? `${profile.user.firstName} ${profile.user.lastName}` : "EMSP"}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Formation</p>
            <p className="mt-2 font-display text-2xl font-bold text-dark">{profile?.formationCode || "EMSP"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Rang actuel</p>
            <p className="mt-2 font-display text-2xl font-bold text-secondary">#{profile?.rangPromotion || "-"}</p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="emsp-panel p-6">
        <div className="space-y-4">
          {opportunities.length ? (
            opportunities.map((item) => (
              <article key={item.id} className="emsp-panel rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-dark">{item.title}</h2>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                    {item.repliesCount} reponses
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>{item.authorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[32px] border border-dashed border-secondary/40 bg-slate-50 px-6 py-12 text-center text-slate-500">
              Aucune offre n'a encore ete publiee dans la categorie stages.
            </div>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
};

export default StudentStagesPage;
