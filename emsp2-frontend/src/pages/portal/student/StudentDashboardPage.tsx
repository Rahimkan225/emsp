import { useQueries } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, FileText, Medal, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fetchEtudiantProfile, fetchStudentDashboard, fetchStudentDocuments, fetchStudentPayments } from "../../../api/portalApi";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";

const moneyFormatter = new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });

const numberFromMoney = (value: string) => Number(String(value).replace(/[^\d.-]/g, "")) || 0;

const SectionSkeleton = ({ className = "h-40" }: { className?: string }) => (
  <div className={`${className} animate-pulse rounded-2xl bg-white shadow-sm`} />
);

const StudentDashboardPage = () => {
  const [profileQuery, dashboardQuery, paymentsQuery, documentsQuery] = useQueries({
    queries: [
      { queryKey: ["student", "me"], queryFn: fetchEtudiantProfile, staleTime: 5 * 60 * 1000 },
      { queryKey: ["student", "dashboard"], queryFn: fetchStudentDashboard, staleTime: 60 * 1000 },
      { queryKey: ["student", "payments"], queryFn: fetchStudentPayments, staleTime: 30 * 1000 },
      { queryKey: ["student", "documents"], queryFn: fetchStudentDocuments, staleTime: 60 * 1000 },
    ],
  });

  const profile = profileQuery.data;
  const data = dashboardQuery.data;
  const payments = paymentsQuery.data;
  const remaining = payments ? numberFromMoney(payments.remainingBalance) : numberFromMoney(data?.soldeScolarite || "0");
  const recentDocuments = (documentsQuery.data || [])
    .slice()
    .sort((left, right) => new Date(right.generatedAt || 0).getTime() - new Date(left.generatedAt || 0).getTime())
    .slice(0, 5);

  const kpis = [
    {
      label: "Moyenne generale",
      value: data ? data.moyenneGenerale.toFixed(2) : "--",
      tone: data && data.moyenneGenerale < 10 ? "text-red-600" : "text-emerald-700",
      icon: TrendingUp,
      loading: dashboardQuery.isLoading,
    },
    { label: "Rang promotion", value: data ? `#${data.rangPromotion}` : "--", tone: "text-slate-900", icon: Medal, loading: dashboardQuery.isLoading },
    {
      label: "Solde du",
      value: payments ? moneyFormatter.format(remaining) : data?.soldeScolarite || "--",
      tone: remaining > 0 ? "text-red-600" : "text-emerald-700",
      icon: Wallet,
      loading: paymentsQuery.isLoading && dashboardQuery.isLoading,
    },
    { label: "Prochain examen", value: data?.prochainExamen || "Aucun", tone: "text-slate-900", icon: CalendarClock, loading: dashboardQuery.isLoading },
  ];

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Student overview</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Tableau de bord etudiant</h2>
        </div>
        <Link
          to="/etudiant/documents"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
        >
          Mes documents
        </Link>
      </section>

      {remaining > 0 ? (
        <div className="emsp-panel flex flex-col gap-3 border-red-200 bg-red-50 px-4 py-3 text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <p className="text-sm font-medium">Un solde reste a regler sur votre compte scolarite.</p>
          </div>
          <Link to="/etudiant/paiements" className="text-sm font-bold text-red-700 underline">
            Voir les paiements
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <SurfaceCard key={item.label} className="emsp-panel p-4" aria-label={item.label}>
              {item.loading ? (
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className={`mt-3 break-words font-display text-2xl font-bold ${item.tone}`}>{item.value}</p>
                  </div>
                  <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                    <Icon size={19} />
                  </span>
                </div>
              )}
            </SurfaceCard>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <SurfaceCard className="emsp-panel p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Notes</p>
            <h2 className="mt-1 font-display text-xl font-bold text-dark">Tendance du semestre</h2>
          </div>
          {dashboardQuery.isLoading ? (
            <SectionSkeleton className="h-72" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.trend || []} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis domain={[0, 20]} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}/20`, "Moyenne"]} />
                  <Line type="monotone" dataKey="average" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="emsp-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Profil</p>
          {profileQuery.isLoading ? (
            <SectionSkeleton className="mt-4 h-36" />
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-display text-2xl font-bold text-dark">{profile ? `${profile.user.firstName} ${profile.user.lastName}` : "Etudiant EMSP"}</p>
              <p className="text-slate-600">{profile?.matricule || "Matricule non renseigne"}</p>
              <p className="rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-700">{profile?.formationName || "Formation EMSP"}</p>
            </div>
          )}
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="emsp-panel p-5">
          <h2 className="font-display text-xl font-bold text-dark">5 prochains examens</h2>
          <div className="mt-4 space-y-3">
            {(data?.prochainsCours.filter((item) => item.type === "examen").slice(0, 5) || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-dark">{item.matiere}</p>
                <p className="mt-1 text-sm text-slate-600">{new Date(item.debut).toLocaleString("fr-FR")} · {item.salle}</p>
              </div>
            ))}
            {!dashboardQuery.isLoading && !data?.prochainsCours.filter((item) => item.type === "examen").length ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun examen programme.</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="emsp-panel p-5">
          <h2 className="font-display text-xl font-bold text-dark">5 derniers documents</h2>
          <div className="mt-4 space-y-3">
            {recentDocuments.map((item) => (
              <article key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <FileText className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                <div>
                  <p className="font-semibold text-dark">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.generatedAt ? new Date(item.generatedAt).toLocaleDateString("fr-FR") : item.typeDocument}</p>
                </div>
              </article>
            ))}
            {!dashboardQuery.isLoading && !recentDocuments.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun document recent.</p> : null}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
