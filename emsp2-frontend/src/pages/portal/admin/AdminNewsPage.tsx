import { CheckCircle2, Clock3, FileText, Search, Tags } from "lucide-react";
import { useState } from "react";

import AdminMetricCard from "../../../components/dashboard/AdminMetricCard";
import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useAdminNews } from "../../../hooks/useAdminDashboard";
import { formatDate, formatDateTime } from "../../../utils/formatDate";

const statusClassName = (isPublished: boolean) =>
  isPublished ? "bg-secondary/10 text-secondary" : "bg-primary/40 text-dark";

const AdminNewsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "published" | "draft">("");

  const { data, isLoading } = useAdminNews({
    search: search || undefined,
    status: status || undefined,
  });

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const publishedCount = data.filter((item) => item.isPublished).length;
  const draftCount = data.filter((item) => !item.isPublished).length;
  const taggedCount = data.filter((item) => item.tags.length > 0).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Actualites"
        description="Suivi editorial des publications du site. La page recense les brouillons, les articles publies et leurs couvertures pour faciliter le pilotage des contenus."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard label="Articles visibles" value={data.length} helper="resultats selon la selection" icon={FileText} accent="text-secondary" />
        <AdminMetricCard label="Publies" value={publishedCount} helper="visibles sur le site public" icon={CheckCircle2} accent="text-dark" />
        <AdminMetricCard label="Brouillons" value={draftCount} helper="en attente de validation" icon={Clock3} accent="text-primary" />
        <AdminMetricCard label="Tagues" value={taggedCount} helper="articles relies a des thematiques" icon={Tags} accent="text-secondary" />
      </div>

      <SurfaceCard className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Rechercher un titre, un slug ou un contenu"
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | "published" | "draft")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publies</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </SurfaceCard>

      <div className="grid gap-6">
        {data.length ? (
          data.map((article) => (
            <SurfaceCard key={article.id} className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                <div className="flex min-h-[240px] items-center justify-center bg-slate-100">
                  {article.coverImage?.url ? (
                    <img src={article.coverImage.url} alt={article.coverImage.altText || article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FileText size={42} />
                      <p className="text-sm">Aucune couverture</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(article.isPublished)}`}>
                      {article.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-bold text-dark">{article.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{article.excerpt}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {article.tags.length ? (
                      article.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Sans tag</span>
                    )}
                  </div>
                  <div className="mt-6 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p>Auteur</p>
                      <p className="mt-1 font-medium text-dark">{article.authorName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p>Slug</p>
                      <p className="mt-1 font-medium text-dark">{article.slug}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p>Mise a jour</p>
                      <p className="mt-1 font-medium text-dark">{formatDateTime(article.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ))
        ) : (
          <SurfaceCard className="px-6 py-16 text-center text-sm text-slate-500">
            Aucun article ne correspond aux filtres selectionnes.
          </SurfaceCard>
        )}
      </div>
    </div>
  );
};

export default AdminNewsPage;
