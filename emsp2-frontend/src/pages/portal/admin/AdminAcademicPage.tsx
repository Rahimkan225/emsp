import { CalendarDays, FileBadge2, GraduationCap, Medal, TimerReset } from "lucide-react";

import AdminMetricCard from "../../../components/dashboard/AdminMetricCard";
import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { HorizontalBars } from "../../../components/dashboard/SvgCharts";
import { useAdminAcademicOverview } from "../../../hooks/useAdminDashboard";
import { formatDateTime } from "../../../utils/formatDate";

const courseTypeClassName: Record<string, string> = {
  cours: "bg-secondary/10 text-secondary",
  td: "bg-primary/40 text-dark",
  examen: "bg-red-50 text-red-600",
  ferie: "bg-slate-100 text-slate-600",
};

const documentStatusClassName = (isGenerated: boolean) =>
  isGenerated ? "bg-secondary/10 text-secondary" : "bg-primary/40 text-dark";

const AdminAcademicPage = () => {
  const { data, isError, isLoading } = useAdminAcademicOverview();

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-8 text-sm text-red-700">
        Impossible de charger les donnees de scolarite pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Scolarite"
        description="Pilotage des promotions, des emplois du temps, des documents generes et des performances academiques. Cette vue concentre les flux essentiels du module scolarite."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard label="Promotions actives" value={data.summary.promotions} helper="cohortes actuellement suivies" icon={GraduationCap} accent="text-secondary" />
        <AdminMetricCard label="Cours planifies" value={data.summary.scheduledCourses} helper="seances et examens recenses" icon={CalendarDays} accent="text-dark" />
        <AdminMetricCard label="Documents generes" value={data.summary.generatedDocuments} helper="attestations et releves disponibles" icon={FileBadge2} accent="text-primary" />
        <AdminMetricCard label="Moyenne globale" value={data.summary.averageScore.toFixed(2)} helper="tendance generale des notes" icon={TimerReset} accent="text-secondary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Promotions</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Effectifs par promotion</h2>
          <div className="mt-6">
            <HorizontalBars
              data={data.promotions.map((item) => ({
                label: `${item.formationCode} • ${item.academicYear}`,
                value: item.studentsCount,
              }))}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/40 p-3 text-dark">
              <Medal size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-secondary">Performance</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-dark">Top etudiants</h2>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {data.topStudents.length ? (
              data.topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                  <div>
                    <p className="font-medium text-dark">
                      #{index + 1} {student.fullName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {student.matricule} • {student.formationName}
                    </p>
                    <p className="text-xs text-slate-400">{student.promotionLabel || "Sans promotion"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-secondary">{student.average.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">rang #{student.rank}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Aucune note consolidee n'est encore disponible.
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Planning</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Cours et examens a venir</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Matiere</th>
                <th className="px-5 py-4 font-semibold">Promotion</th>
                <th className="px-5 py-4 font-semibold">Intervenant</th>
                <th className="px-5 py-4 font-semibold">Salle</th>
                <th className="px-5 py-4 font-semibold">Debut</th>
                <th className="px-5 py-4 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.upcomingCourses.length ? (
                data.upcomingCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-5 py-4 font-medium text-dark">{course.matiere}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{course.promotionLabel}</p>
                      <p className="text-xs text-slate-500">{course.formationName}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{course.enseignant || "A affecter"}</td>
                    <td className="px-5 py-4 text-slate-600">{course.salle || "A definir"}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(course.debut)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${courseTypeClassName[course.type] || courseTypeClassName.cours}`}>
                        {course.type}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    Aucun cours ou examen n'est programme pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm uppercase tracking-[0.24em] text-secondary">Documents</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-dark">Dernieres productions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Document</th>
                <th className="px-5 py-4 font-semibold">Etudiant</th>
                <th className="px-5 py-4 font-semibold">Promotion</th>
                <th className="px-5 py-4 font-semibold">Periode</th>
                <th className="px-5 py-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentDocuments.length ? (
                data.recentDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-medium text-dark">{document.title}</p>
                      <p className="text-xs text-slate-500">{document.typeDocument}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{document.studentName}</p>
                      <p className="text-xs text-slate-500">{document.matricule}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{document.promotionLabel || "Sans promotion"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{document.academicYear || "N/A"}</p>
                      <p className="text-xs text-slate-500">{document.semester || "Periode generale"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${documentStatusClassName(document.isGenerated)}`}>
                        {document.isGenerated ? "Genere" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    Aucun document de scolarite n'a encore ete recense.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
};

export default AdminAcademicPage;
