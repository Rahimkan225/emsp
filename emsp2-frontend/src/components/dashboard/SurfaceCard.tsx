import type { PropsWithChildren } from "react";

interface SurfaceCardProps extends PropsWithChildren {
  className?: string;
}

const SurfaceCard = ({ children, className = "" }: SurfaceCardProps) => {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] ${className}`}>
      {children}
    </section>
  );
};

export default SurfaceCard;
