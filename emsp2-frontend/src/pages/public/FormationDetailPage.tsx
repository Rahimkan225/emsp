import { ArrowLeft, Clock3, GraduationCap, Layers3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import FormationVisualFallback from "../../components/public/FormationVisualFallback";
import { useFormation, useFormations } from "../../hooks/useFormations";
import { getFormationPath, getProgramLabel } from "../../utils/formations";

const FormationDetailPage = () => {
  const { code } = useParams<{ code: string }>();
  const { data: formation, isLoading, isError } = useFormation(code);
  const { data: relatedFormations = [] } = useFormations(
    formation ? { type: formation.programType, limit: 3 } : undefined,
  );

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />
      </section>
    );
  }

  if (isError || !formation) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-dark">Formation introuvable</h1>
        <p className="mt-4 text-slate-600">La fiche demandee n'est pas encore disponible dans l'API publique.</p>
        <Link to="/formations" className="mt-6 inline-flex rounded-md bg-secondary px-5 py-3 font-semibold text-white">
          Retour au catalogue
        </Link>
      </section>
    );
  }

  const related = relatedFormations.filter((item) => item.code !== formation.code).slice(0, 3);

  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Link to="/formations" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
            <ArrowLeft size={16} />
            Retour au catalogue
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
              {formation.coverImage ? (
                <img
                  src={formation.coverImage.url}
                  alt={formation.coverImage.altText || formation.coverImage.title}
                  className="h-full min-h-80 w-full object-cover"
                />
              ) : (
                <FormationVisualFallback formation={formation} className="min-h-80" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Accueil / Formations / {getProgramLabel(formation.programType)} / {formation.code}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{formation.programType}</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-dark">{formation.level}</span>
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold text-dark">
                {formation.code} - {formation.name}
              </h1>
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{formation.description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Clock3 className="text-secondary" size={22} />
                  <p className="mt-3 text-sm text-slate-500">Duree</p>
                  <p className="mt-1 font-semibold text-dark">{formation.duration}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Layers3 className="text-secondary" size={22} />
                  <p className="mt-3 text-sm text-slate-500">Categorie</p>
                  <p className="mt-1 font-semibold text-dark">{getProgramLabel(formation.programType)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <GraduationCap className="text-secondary" size={22} />
                  <p className="mt-3 text-sm text-slate-500">Niveau</p>
                  <p className="mt-1 font-semibold text-dark">{formation.level}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/inscription" className="rounded-md bg-primary px-5 py-3 font-semibold text-dark">
                  Demarrer une inscription
                </Link>
                <Link to={`/formations?type=${formation.programType}`} className="rounded-md border border-secondary px-5 py-3 font-semibold text-secondary">
                  Voir des formations similaires
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-dark">Autres programmes proches</h2>
            <p className="mt-2 text-slate-600">Pour garder la migration simple, la recommandation s'appuie sur la meme famille de formation.</p>
          </div>
          <Link to="/formations" className="rounded-md border border-secondary px-4 py-2 font-semibold text-secondary">
            Voir tout
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.length > 0 ? (
            related.map((item) => (
              <article key={item.code} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-48 bg-slate-100">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage.url}
                      alt={item.coverImage.altText || item.coverImage.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FormationVisualFallback formation={item} />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-semibold text-dark">{item.code}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.name}</p>
                  <Link to={getFormationPath(item)} className="mt-5 inline-flex rounded-md bg-secondary px-4 py-2 font-semibold text-white">
                    Ouvrir
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-secondary/30 bg-slate-50 p-10 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              D'autres formations apparaitront ici des que le catalogue sera alimente.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FormationDetailPage;
