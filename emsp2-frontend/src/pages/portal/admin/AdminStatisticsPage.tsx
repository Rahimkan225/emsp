import { BarChart3, Globe2, GraduationCap, TrendingUp, Users } from "lucide-react";

import AdminMetricCard from "../../../components/dashboard/AdminMetricCard";
import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { AreaComparisonChart, DonutBreakdown, HorizontalBars, MiniLineChart } from "../../../components/dashboard/SvgCharts";
import { useAdminDashboard, useFinanceSummary } from "../../../hooks/useAdminDashboard";
import { formatCurrency } from "../../../utils/formatDate";

const AdminStatisticsPage = () => {
  const { data, isLoading } = useAdminDashboard();
  const { data: finance } = useFinanceSummary();

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const topCountry = [...data.countryDistribution].sort((a, b) => b.total - a.total)[0];
  const topFormation = [...data.formationDistribution].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Statistiques"
        description="Lecture analytique des effectifs, des filieres et des flux financiers. Cette page privilegie les tendances et les signaux de pilotage pour la direction."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard label="Etudiants" value={data.kpis.totalStudents} helper="population suivie" icon={Users} accent="text-secondary" />
        <AdminMetricCard
          label="Taux de reussite"
          value={`${data.kpis.successRate.toFixed(1)}%`}
          helper="etudiants a moyenne validee"
          icon={TrendingUp}
          accent="text-dark"
        />
        <AdminMetricCard
          label="Pays leader"
          value={topCountry?.pays || "N/A"}
          helper={`${topCountry?.total || 0} etudiants dans la cohorte`}
          icon={Globe2}
          accent="text-primary"
        />
        <AdminMetricCard
          label="Filiere leader"
          value={topFormation?.formationName || "N/A"}
          helper={`${topFormation?.total || 0} inscriptions`}
          icon={GraduationCap}
          accent="text-secondary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Admissions</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Evolution annuelle</h2>
          <div className="mt-6">
            <MiniLineChart data={data.yearlyEnrolments.map((item) => ({ label: item.year, value: item.total }))} />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Finances</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Recouvrement et objectifs</h2>
          <div className="mt-6">
            <AreaComparisonChart data={finance?.evolution || data.monthlyFinance} />
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Geographie</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Pays membres</h2>
          <div className="mt-6">
            <HorizontalBars data={data.countryDistribution.map((item) => ({ label: item.pays, value: item.total }))} />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Offre de formation</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Poids des filieres</h2>
          <div className="mt-6">
            <DonutBreakdown data={data.formationDistribution.map((item) => ({ label: item.formationName, value: item.total }))} />
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Inscriptions</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Derniers mouvements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nom</th>
                  <th className="px-5 py-4 font-semibold">Pays</th>
                  <th className="px-5 py-4 font-semibold">Formation</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.latestInscriptions.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-dark">{item.name}</td>
                    <td className="px-5 py-4 text-slate-600">{item.country}</td>
                    <td className="px-5 py-4 text-slate-600">{item.formation}</td>
                    <td className="px-5 py-4 text-slate-600">{item.date}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-secondary">Synthese</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-dark">Points saillants</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Recettes confirmees</p>
              <p className="mt-2 font-display text-2xl font-bold text-dark">{formatCurrency(finance?.monthlyRevenue || 0)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Inscriptions en attente</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">{data.kpis.pendingApplications}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Nombre de pays actifs</p>
              <p className="mt-2 font-display text-2xl font-bold text-secondary">{data.countryDistribution.length}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;
