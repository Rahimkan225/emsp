import type { PropsWithChildren } from "react";

interface SurfaceCardProps extends PropsWithChildren {
  className?: string;
}

/** Carte type Maxton (rounded-4, ombre douce) — fond zone principale claire. */
const SurfaceCard = ({ children, className = "" }: SurfaceCardProps) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-maxton-card ring-1 ring-slate-900/[0.03] transition duration-200 hover:shadow-maxton ${className}`}
    >
      {children}
    </section>
  );
};

export default SurfaceCard;
