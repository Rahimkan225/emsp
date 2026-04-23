import { FormEvent, useMemo, useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useCreateForumPost, useStudentForum } from "../../../hooks/useStudentPortal";

const StudentForumPage = () => {
  const { data, isLoading } = useStudentForum();
  const createMutation = useCreateForumPost();
  const [activeCategory, setActiveCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const discussions = useMemo(() => {
    if (!data) return [];
    return activeCategory === "all" ? data.discussions : data.discussions.filter((item) => item.category === activeCategory);
  }, [activeCategory, data]);

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await createMutation.mutateAsync({ category: activeCategory === "all" ? "general" : activeCategory, title, content });
    setTitle("");
    setContent("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">Forum</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-dark">Creer une discussion</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-dark">Categorie</span>
            <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none">
              <option value="all">Toutes</option>
              {data.categories.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-dark">Titre</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-dark">Message</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" required />
          </label>
          <button type="submit" disabled={createMutation.isPending} className="w-full rounded-2xl bg-secondary px-5 py-3 font-semibold text-white disabled:opacity-70">
            {createMutation.isPending ? "Publication..." : "Poster"}
          </button>
        </form>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeCategory === "all" ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"}`}
          >
            Toutes
          </button>
          {data.categories.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveCategory(item.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeCategory === item.key ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {discussions.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-dark">{item.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                  {item.repliesCount} reponses
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>{item.authorName}</span>
                <span>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
};

export default StudentForumPage;
