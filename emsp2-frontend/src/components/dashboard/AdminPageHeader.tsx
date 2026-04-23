import type { PropsWithChildren } from "react";

interface AdminPageHeaderProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
}

const AdminPageHeader = ({ eyebrow, title, description, children }: AdminPageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-dark">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </div>
  );
};

export default AdminPageHeader;
