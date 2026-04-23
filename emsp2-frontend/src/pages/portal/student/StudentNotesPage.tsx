import { useMemo, useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useStudentNotes } from "../../../hooks/useStudentPortal";

const StudentNotesPage = () => {
  const { data = [], isLoading } = useStudentNotes();
  const [activeKey, setActiveKey] = useState("");

  const currentGroup = useMemo(() => {
    const group = data.find((item) => item.key === activeKey);
    return group || data[0];
  }, [activeKey, data]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  if (!currentGroup) {
    return <SurfaceCard className="p-8 text-center text-slate-500">Aucune note disponible.</SurfaceCard>;
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">Notes</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-dark">Resultats par semestre</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          {data.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveKey(item.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                item.key === currentGroup.key ? "bg-secondary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Matiere</th>
                <th className="px-5 py-4 font-semibold">Coefficient</th>
                <th className="px-5 py-4 font-semibold">Note</th>
                <th className="px-5 py-4 font-semibold">Mention</th>
                <th className="px-5 py-4 font-semibold">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentGroup.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-dark">{row.matiere}</td>
                  <td className="px-5 py-4 text-slate-600">{row.coefficient}</td>
                  <td className="px-5 py-4 text-slate-600">{row.note.toFixed(2)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.mention}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.validation ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-500"}`}>
                      {row.validation ? "OUI" : "NON"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr className="text-dark">
                <td className="px-5 py-4 font-semibold">Totaux</td>
                <td className="px-5 py-4 font-semibold">-</td>
                <td className="px-5 py-4 font-semibold">{currentGroup.totals.average.toFixed(2)}</td>
                <td className="px-5 py-4 font-semibold">{currentGroup.totals.credits} credits</td>
                <td className="px-5 py-4 font-semibold">{currentGroup.totals.result}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SurfaceCard>

      <div className="flex justify-end">
        <button className="rounded-2xl bg-secondary px-5 py-3 font-semibold text-white">
          Telecharger le releve de notes
        </button>
      </div>
    </div>
  );
};

export default StudentNotesPage;
