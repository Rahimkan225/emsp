import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-secondary">Acces refuse</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-dark">Cette section n'est pas accessible avec votre role.</h1>
      <p className="mt-4 text-slate-600">Connectez-vous avec le bon compte ou revenez a l'accueil public.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/login" className="rounded-2xl bg-secondary px-5 py-3 font-semibold text-white">Se connecter</Link>
        <Link to="/" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Retour au site</Link>
      </div>
    </section>
  );
};

export default UnauthorizedPage;
