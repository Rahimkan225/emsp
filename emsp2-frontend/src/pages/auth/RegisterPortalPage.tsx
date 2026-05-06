import { ArrowLeft, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Ecran register style Maxton : lien vers pre-inscription EMSP (pas de compte sans dossier).
 */
const RegisterPortalPage = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-12">
        <div className="relative hidden items-center justify-center border-r border-slate-200 bg-gradient-to-br from-indigo-950 via-maxton-navy2 to-maxton-navy lg:col-span-7 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(250,204,21,0.12),transparent_55%)]" />
          <div className="relative px-10 py-12 text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/90">Pre-inscription EMSP</p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-[2.65rem]">Ouverture de dossier candidat</h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/75">
              Le compte portail est attribue apres traitement du dossier. Utilisez le formulaire officiel de candidature en ligne.
            </p>
            <div className="mx-auto mt-10 max-w-md">
              <img src="/maxton/register1.png" width={480} height={420} className="mx-auto h-auto max-w-full drop-shadow-2xl" alt="" />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center bg-white lg:col-span-5">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-secondary to-primary" />
          <div className="px-6 py-10 sm:px-10 lg:px-12">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-secondary"
            >
              <ArrowLeft size={16} />
              Retour au site public
            </Link>

            <h2 className="font-display text-2xl font-bold tracking-tight text-dark md:text-3xl">Candidature</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Les comptes etudiants et equipes sont crees par l&apos;administration apres validation. Pour deposer une candidature FSP, FS-MENUM ou FCQ, utilisez le formulaire d&apos;inscription.
            </p>

            <div className="mt-10 space-y-4">
              <Link
                to="/inscription"
                className="btn-grd-emsp flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-center text-sm font-semibold"
              >
                Aller au formulaire d&apos;inscription
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-secondary hover:bg-white hover:text-secondary"
              >
                <LogIn size={18} />
                Deja un compte ? Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPortalPage;
