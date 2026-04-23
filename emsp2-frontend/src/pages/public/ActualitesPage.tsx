import { Search } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useNews, useNewsFeed, useNewsTags } from "../../hooks/useNews";
import { formatLongDate } from "../../utils/formatDate";

const ActualitesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || "1");
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  const { data: newsFeed, isLoading } = useNewsFeed({ page, tag, search });
  const { data: recentArticles = [] } = useNews({ limit: 3 });
  const { data: tags = [] } = useNewsTags();

  const totalPages = Math.max(1, Math.ceil((newsFeed?.count || 0) / 9));
  const articles = newsFeed?.results || [];

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    if (!updates.page) {
      next.delete("page");
    }

    setSearchParams(next);
  };

  return (
    <div className="bg-slate-50">
      <section className="bg-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm uppercase tracking-[0.28em] text-primary">Actualites</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Vie institutionnelle, annonces et contenus editoriaux</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Suivez les annonces officielles, les temps forts académiques et les informations utiles de l'EMSP dans un espace clair et facile a parcourir.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.9fr_0.9fr]">
        <div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`news-skeleton-${index}`} className="h-80 animate-pulse rounded-3xl bg-white" />
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-48 bg-slate-100">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage.url}
                        alt={article.coverImage.altText || article.coverImage.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune couverture</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                        {article.category || "Actualite"}
                      </span>
                      <span className="text-xs text-slate-500">{formatLongDate(article.publishedAt)}</span>
                    </div>
                    <h2 className="mt-4 line-clamp-2 font-display text-2xl font-semibold text-dark">{article.title}</h2>
                    <p className="mt-3 line-clamp-4 text-sm text-slate-600">{article.excerpt}</p>
                    <Link to={`/actualites/${article.slug}`} className="mt-5 inline-flex rounded-md bg-secondary px-4 py-2 font-semibold text-white">
                      Lire l'article
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-secondary/30 bg-white p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                Aucun article publie ne correspond encore a ces filtres.
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Precedent
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`h-10 w-10 rounded-full text-sm font-semibold ${
                  pageNumber === page ? "bg-secondary text-white" : "border border-slate-300 bg-white text-slate-600"
                }`}
                onClick={() => updateParams({ page: String(pageNumber) })}
              >
                {pageNumber}
              </button>
            ))}
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Suivant
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-dark">Recherche</h2>
            <form
              className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                updateParams({ search: searchValue || undefined });
              }}
            >
              <Search size={18} className="text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Titre, extrait, contenu..."
                className="w-full border-0 bg-transparent text-sm text-dark outline-none"
              />
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-dark">Filtres</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-2 text-sm font-semibold ${!tag ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"}`}
                onClick={() => updateParams({ tag: undefined })}
              >
                Tous
              </button>
              {tags.map((item) => (
                <button
                  key={item.slug}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${tag === item.slug ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"}`}
                  onClick={() => updateParams({ tag: item.slug })}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-dark">Articles recents</h2>
            <div className="mt-5 space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <Link key={article.id} to={`/actualites/${article.slug}`} className="flex gap-4 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100">
                    <div className="h-20 w-20 flex-none overflow-hidden rounded-2xl bg-slate-200">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage.url}
                          alt={article.coverImage.altText || article.coverImage.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{formatLongDate(article.publishedAt)}</p>
                      <p className="mt-2 line-clamp-3 text-sm font-semibold text-dark">{article.title}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">Les articles recents apparaitront ici des que des publications seront disponibles.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ActualitesPage;
