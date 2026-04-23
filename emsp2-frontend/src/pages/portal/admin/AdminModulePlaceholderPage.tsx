import SurfaceCard from "../../../components/dashboard/SurfaceCard";

interface AdminModulePlaceholderPageProps {
  title: string;
  description: string;
}

const AdminModulePlaceholderPage = ({ title, description }: AdminModulePlaceholderPageProps) => {
  return (
    <SurfaceCard className="p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-secondary">Administration</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-dark">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
        Le shell de ce module est pret et sera branche sur ses CRUD/API dedies.
      </div>
    </SurfaceCard>
  );
};

export default AdminModulePlaceholderPage;
