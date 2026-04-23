import type { LucideIcon } from "lucide-react";

import SurfaceCard from "./SurfaceCard";

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  accent?: string;
}

const AdminMetricCard = ({ label, value, helper, icon: Icon, accent = "text-dark" }: AdminMetricCardProps) => {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`mt-4 font-display text-3xl font-bold ${accent}`}>{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-secondary">
          <Icon size={20} />
        </div>
      </div>
    </SurfaceCard>
  );
};

export default AdminMetricCard;
