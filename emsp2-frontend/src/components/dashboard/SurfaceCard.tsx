import type { HTMLAttributes, PropsWithChildren } from "react";

interface SurfaceCardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  className?: string;
}

const SurfaceCard = ({ children, className = "", ...props }: SurfaceCardProps) => {
  return (
    <section
      {...props}
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-maxton-card ring-1 ring-slate-900/[0.03] transition duration-200 hover:shadow-maxton ${className}`}
    >
      {children}
    </section>
  );
};

export default SurfaceCard;
