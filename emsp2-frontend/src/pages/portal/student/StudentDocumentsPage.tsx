import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { downloadAuthenticatedBlob } from "../../../api/portalApi";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentDocuments, useStudentNotes } from "../../../hooks/useStudentPortal";
import { downloadBlob, downloadStudentDocument } from "../../../utils/studentPortal";

const categories = ["Cours", "TD", "Examens", "Administratif", "Autres"];

const categoryFor = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("cours")) return "Cours";
  if (normalized.includes("td")) return "TD";
  if (normalized.includes("examen") || normalized.includes("releve")) return "Examens";
  if (normalized.includes("admin") || normalized.includes("certificat") || normalized.includes("attestation")) return "Administratif";
  return "Autres";
};

const isNew = (date?: string) => {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
};

const StudentDocumentsPage = () => {
  const { data: profile } = useEtudiantMe();
  const { data = [], isLoading } = useStudentDocuments();
  const { data: notes = [] } = useStudentNotes();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      data
        .filter((item) => categoryFor(item.typeDocument) === activeCategory)
        .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
        .sort((left, right) => new Date(right.generatedAt || 0).getTime() - new Date(left.generatedAt || 0).getTime()),
    [activeCategory, data, search],
  );

  const downloadSecure = async (item: (typeof data)[number]) => {
    if (item.downloadUrl) {
      const blob = await downloadAuthenticatedBlob(item.downloadUrl);
      downloadBlob(blob, `${item.title.replace(/[^a-z0-9-]+/gi, "-")}.pdf`);
      return;
    }
    downloadStudentDocument(item, profile, notes);
  };

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Document center</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Bibliotheque etudiante</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Documents</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-dark">Bibliotheque etudiante</h1>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button key={item} onClick={() => setActiveCategory(item)} className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${activeCategory === item ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                {item}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un titre" className="emsp-panel w-full rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" />
          </label>
        </div>
      </SurfaceCard>

      <div className="space-y-3">
        {filtered.map((item) => (
          <SurfaceCard key={item.id} className="emsp-panel p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-dark">{item.title}</h2>
                  {isNew(item.generatedAt) ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">Nouveau</span> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.academicYear || "Annee en cours"} {item.semester ? `· ${item.semester}` : ""}</p>
              </div>
              <button onClick={() => void downloadSecure(item)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">
                <Download size={18} />
                Telecharger
              </button>
            </div>
          </SurfaceCard>
        ))}
        {!filtered.length ? <SurfaceCard className="emsp-panel p-8 text-center text-slate-500">Aucun document dans cette categorie.</SurfaceCard> : null}
      </div>
    </div>
  );
};

export default StudentDocumentsPage;
