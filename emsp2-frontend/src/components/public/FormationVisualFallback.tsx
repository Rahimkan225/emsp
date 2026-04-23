import type { Formation } from "../../types";

interface FormationVisualFallbackProps {
  formation: Pick<Formation, "code" | "name" | "programType" | "level">;
  className?: string;
}

const paletteByProgram: Record<Formation["programType"], { wrapper: string; badge: string }> = {
  FSP: {
    wrapper: "bg-[linear-gradient(145deg,#065F46_0%,#16A34A_55%,#22C55E_100%)] text-white",
    badge: "bg-white/20 text-white",
  },
  "FS-MENUM": {
    wrapper: "bg-[linear-gradient(145deg,#0F172A_0%,#1E293B_48%,#22C55E_100%)] text-white",
    badge: "bg-primary text-dark",
  },
  FCQ: {
    wrapper: "bg-[linear-gradient(145deg,#7C2D12_0%,#B45309_55%,#F59E0B_100%)] text-white",
    badge: "bg-white/20 text-white",
  },
};

const FormationVisualFallback = ({ formation, className = "" }: FormationVisualFallbackProps) => {
  const palette = paletteByProgram[formation.programType];

  return (
    <div className={`relative h-full w-full overflow-hidden ${palette.wrapper} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_45%)]" />
      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-white/15" />
      <div className="absolute -left-8 top-4 h-24 w-24 rounded-full border border-white/10" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${palette.badge}`}>
            {formation.programType}
          </span>
          <span className="text-xs uppercase tracking-[0.22em] text-white/75">{formation.level}</span>
        </div>
        <div>
          <p className="font-display text-3xl font-bold leading-none">{formation.code}</p>
          <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/90">{formation.name}</p>
        </div>
      </div>
    </div>
  );
};

export default FormationVisualFallback;
