import SurfaceCard from "../../../components/dashboard/SurfaceCard";

const StudentStagesPage = () => {
  return (
    <SurfaceCard className="p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-secondary">Stages</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-dark">Offres & opportunites</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
        Cette section est prete dans le portail et sera alimentee par les offres stages/emplois et les conventions partenaires. En attendant, le forum vous permet deja de suivre les opportunites publiees.
      </p>
      <div className="mt-8 rounded-[32px] border border-dashed border-secondary/40 bg-slate-50 px-6 py-12 text-center text-slate-500">
        Aucune offre disponible pour le moment.
      </div>
    </SurfaceCard>
  );
};

export default StudentStagesPage;
