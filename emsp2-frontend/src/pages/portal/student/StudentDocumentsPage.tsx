import { useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentDocuments, useStudentNotes } from "../../../hooks/useStudentPortal";
import { downloadStudentDocument } from "../../../utils/studentPortal";

const StudentDocumentsPage = () => {
  const { data: profile } = useEtudiantMe();
  const { data = [], isLoading } = useStudentDocuments();
  const { data: notes = [] } = useStudentNotes();
  const [lastGeneratedId, setLastGeneratedId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  if (!data.length) {
    return (
      <SurfaceCard className="p-8 text-center text-slate-500">
        Aucun document n'est encore disponible pour votre dossier etudiant.
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-secondary">Documents</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-dark">Pieces disponibles</h1>
      <div className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-dark">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {item.academicYear || "Annee en cours"} {item.semester ? ` - ${item.semester}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {item.isGenerated && item.downloadUrl ? (
                  <a href={item.downloadUrl} className="rounded-2xl bg-secondary px-5 py-3 font-semibold text-white" target="_blank" rel="noreferrer">
                    Telecharger
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      downloadStudentDocument(item, profile, notes);
                      setLastGeneratedId(item.id);
                    }}
                    className="rounded-2xl bg-primary px-5 py-3 font-semibold text-dark"
                  >
                    {item.isGenerated ? "Telecharger la version locale" : "Generer et telecharger"}
                  </button>
                )}
              </div>
            </div>
            {lastGeneratedId === item.id ? (
              <p className="mt-3 text-sm text-secondary">
                Une version locale du document a ete generee a partir des donnees de votre dossier.
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
};

export default StudentDocumentsPage;
