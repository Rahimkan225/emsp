import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquarePlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useCreateForumPost, useStudentForum } from "../../../hooks/useStudentPortal";

const schema = z.object({
  category: z.string().min(1, "Choisissez une categorie."),
  title: z.string().min(4, "Le titre doit contenir au moins 4 caracteres."),
  content: z.string().min(12, "Le message doit contenir au moins 12 caracteres."),
});

type ForumForm = z.infer<typeof schema>;

const StudentForumPage = () => {
  const { data, isLoading } = useStudentForum();
  const createMutation = useCreateForumPost();
  const [activeCategory, setActiveCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ForumForm>({
    resolver: zodResolver(schema),
    defaultValues: { category: "general", title: "", content: "" },
  });

  const discussions = useMemo(() => {
    if (!data) return [];
    return activeCategory === "all" ? data.discussions : data.discussions.filter((item) => item.category === activeCategory);
  }, [activeCategory, data]);

  const internships = useMemo(() => {
    const values = data?.discussions.filter((item) => item.category === "stages") || [];
    return values.filter((item) => {
      const haystack = `${item.title} ${item.content}`.toLowerCase();
      return (!sector || haystack.includes(sector.toLowerCase())) && (!location || haystack.includes(location.toLowerCase())) && (!duration || haystack.includes(duration.toLowerCase()));
    });
  }, [data, duration, location, sector]);

  const submit = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    reset({ category: values.category, title: "", content: "" });
    setOpen(false);
  });

  if (isLoading || !data) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Community hub</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Forum et stages</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Communaute</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-dark">Forum et stages</h1>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">
            <MessageSquarePlus size={18} />
            Publier
          </button>
        </div>
      </SurfaceCard>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <SurfaceCard className="emsp-panel p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setActiveCategory("all")} className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold ${activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>Toutes</button>
            {data.categories.map((item) => (
              <button key={item.key} onClick={() => setActiveCategory(item.key)} className={`shrink-0 cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold ${activeCategory === item.key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                {item.label} ({item.count})
              </button>
            ))}
          </div>
          <div className="mt-5 max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {discussions.map((item) => (
              <article key={item.id} className="emsp-panel rounded-xl p-4">
                <h2 className="font-display text-lg font-bold text-dark">{item.title}</h2>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{item.content}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <span>{item.authorName}</span>
                  <span>{item.repliesCount} reponses</span>
                </div>
              </article>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="emsp-panel p-5">
          <h2 className="font-display text-xl font-bold text-dark">Flux stages</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Secteur" className="emsp-panel rounded-xl px-3 py-2 text-sm" />
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Lieu" className="emsp-panel rounded-xl px-3 py-2 text-sm" />
            <input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Duree" className="emsp-panel rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {internships.map((item) => (
              <article key={item.id} className="rounded-xl bg-slate-50 p-4">
                <h3 className="font-semibold text-dark">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.content}</p>
              </article>
            ))}
            {!internships.length ? <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Aucune annonce ne correspond aux filtres.</p> : null}
          </div>
        </SurfaceCard>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="emsp-panel w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-dark">Nouvelle publication</h2>
              <button onClick={() => setOpen(false)} className="cursor-pointer rounded-xl bg-slate-100 p-2 text-slate-600" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-dark">
                Categorie
                <select {...register("category")} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal">
                  {data.categories.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
                {errors.category ? <span className="mt-1 block text-xs text-red-600">{errors.category.message}</span> : null}
              </label>
              <label className="block text-sm font-semibold text-dark">
                Titre
                <input {...register("title")} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal" />
                {errors.title ? <span className="mt-1 block text-xs text-red-600">{errors.title.message}</span> : null}
              </label>
              <label className="block text-sm font-semibold text-dark">
                Message
                <textarea rows={5} {...register("content")} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal" />
                {errors.content ? <span className="mt-1 block text-xs text-red-600">{errors.content.message}</span> : null}
              </label>
              <button type="submit" disabled={createMutation.isPending} className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-70">
                {createMutation.isPending ? "Publication..." : "Publier"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentForumPage;
