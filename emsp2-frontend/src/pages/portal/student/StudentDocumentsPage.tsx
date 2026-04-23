import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useStudentDocuments } from "../../../hooks/useStudentPortal";

const StudentDocumentsPage = () => {
  const { data = [], isLoading } = useStudentDocuments();

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-secondary">Documents</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-dark">Pieces disponibles</h1>
      <div className="mt-6 space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-dark">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {item.academicYear || "Annee en cours"} {item.semester ? `• ${item.semester}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {item.isGenerated && item.downloadUrl ? (
                <a href={item.downloadUrl} className="rounded-2xl bg-secondary px-5 py-3 font-semibold text-white">
                  Telecharger
                </a>
              ) : (
                <button className="rounded-2xl bg-primary px-5 py-3 font-semibold text-dark">
                  Generer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
};

export default StudentDocumentsPage;
