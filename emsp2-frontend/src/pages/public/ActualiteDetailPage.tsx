import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useNews, useNewsArticle } from "../../hooks/useNews";
import { formatLongDate } from "../../utils/formatDate";

const ActualiteDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useNewsArticle(slug);
  const { data: recentArticles = [] } = useNews({ limit: 3 });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="h-[28rem] animate-pulse rounded-3xl bg-slate-100" />
      </section>
    );
  }

  if (isError || !article) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-dark">Article introuvable</h1>
        <p className="mt-4 text-slate-600">L'article demande n'est pas accessible depuis l'API publique.</p>
        <Link to="/actualites" className="mt-6 inline-flex rounded-md bg-secondary px-5 py-3 font-semibold text-white">
          Retour aux actualites
        </Link>
      </section>
    );
  }

  const related = recentArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <Link to="/actualites" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
            <ArrowLeft size={16} />
            Retour aux actualites
          </Link>
          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="h-[28rem] bg-slate-100">
              {article.coverImage ? (
                <img
                  src={article.coverImage.url}
                  alt={article.coverImage.altText || article.coverImage.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Aucune image de couverture</div>
              )}
            </div>
            <div className="p-8 sm:p-10">
              <p className="text-sm text-slate-500">Accueil / Actualites / {article.category || "Actualite"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  {article.category || "Actualite"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {formatLongDate(article.publishedAt)}
                </span>
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold text-dark">{article.title}</h1>
              <p className="mt-5 text-lg text-slate-600">{article.excerpt}</p>
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-700">
                {article.content.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                  <p key={`paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-dark">A lire aussi</h2>
            <p className="mt-2 text-slate-600">Suggestions basees sur les derniers contenus disponibles.</p>
          </div>
          <Link to="/actualites" className="rounded-md border border-secondary px-4 py-2 font-semibold text-secondary">
            Toutes les actualites
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.length > 0 ? (
            related.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-48 bg-slate-100">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage.url}
                      alt={item.coverImage.altText || item.coverImage.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-500">{formatLongDate(item.publishedAt)}</p>
                  <h3 className="mt-3 line-clamp-2 font-display text-2xl font-semibold text-dark">{item.title}</h3>
                  <Link to={`/actualites/${item.slug}`} className="mt-5 inline-flex rounded-md bg-secondary px-4 py-2 font-semibold text-white">
                    Lire
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-secondary/30 bg-slate-50 p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              D'autres contenus apparaitront ici quand de nouvelles actualites seront publiees.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActualiteDetailPage;
