import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentNotes } from "../../../hooks/useStudentPortal";
import { downloadNotesReport } from "../../../utils/studentPortal";

const mentionClass = (note: number) => {
  if (note >= 16) return "bg-emerald-100 text-emerald-800";
  if (note >= 12) return "bg-blue-100 text-blue-800";
  if (note >= 10) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
};

const StudentNotesPage = () => {
  const { data: profile } = useEtudiantMe();
  const { data = [], isLoading } = useStudentNotes();
  const years = [...new Set(data.map((item) => item.academicYear))];
  const semesters = [...new Set(data.map((item) => item.semester))];
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  const currentGroup = useMemo(() => {
    const selectedYear = year || years[0];
    const selectedSemester = semester || semesters[0];
    return data.find((item) => item.academicYear === selectedYear && item.semester === selectedSemester) || data[0];
  }, [data, semester, semesters, year, years]);

  const stats = useMemo(() => {
    const notes = currentGroup?.rows.map((row) => row.note) || [];
    return {
      average: currentGroup?.totals.average || 0,
      rank: profile?.rangPromotion ? `#${profile.rangPromotion}` : "-",
      max: notes.length ? Math.max(...notes) : 0,
      min: notes.length ? Math.min(...notes) : 0,
    };
  }, [currentGroup, profile?.rangPromotion]);

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (!currentGroup) return <SurfaceCard className="p-8 text-center text-slate-500">Aucune note disponible.</SurfaceCard>;

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Academic records</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Module notes & releves</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Notes</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-dark">Resultats par semestre</h1>
            <p className="mt-2 text-sm text-slate-600">{profile ? `${profile.user.firstName} ${profile.user.lastName} - ${profile.matricule}` : "Releve etudiant"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Annee academique
              <select value={year || years[0] || ""} onChange={(event) => setYear(event.target.value)} className="emsp-panel mt-1 w-full rounded-xl px-3 py-2 font-normal">
                {years.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Semestre
              <select value={semester || semesters[0] || ""} onChange={(event) => setSemester(event.target.value)} className="emsp-panel mt-1 w-full rounded-xl px-3 py-2 font-normal">
                {semesters.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Moyenne", stats.average.toFixed(2)],
          ["Rang", stats.rank],
          ["Max", stats.max.toFixed(2)],
          ["Min", stats.min.toFixed(2)],
        ].map(([label, value]) => (
          <SurfaceCard key={label} className="emsp-panel p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-dark">{value}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="emsp-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Matiere</th>
                <th className="px-4 py-3 font-semibold">Coeff</th>
                <th className="px-4 py-3 font-semibold">Note</th>
                <th className="px-4 py-3 font-semibold">Moy. promo</th>
                <th className="px-4 py-3 font-semibold">Mention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentGroup.rows.map((row) => (
                <tr key={row.id} className={row.note < 10 ? "bg-red-50/80" : undefined}>
                  <td className="px-4 py-3 font-medium text-dark">{row.matiere}</td>
                  <td className="px-4 py-3 text-slate-600">{row.coefficient}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.note.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.moyennePromotion?.toFixed(2) || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mentionClass(row.note)}`}>{row.mention || (row.validation ? "Valide" : "Non valide")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <div className="flex justify-end">
        <button onClick={() => downloadNotesReport(currentGroup)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700">
          <Download size={18} />
          Releve PDF
        </button>
      </div>
    </div>
  );
};

export default StudentNotesPage;
