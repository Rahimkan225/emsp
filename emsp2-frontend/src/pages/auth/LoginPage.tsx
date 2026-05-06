import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { canAccessAdminPath, getAdminHomePath } from "../../config/adminPortal";
import { useAuth } from "../../hooks/useAuth";
import { useSiteConfig } from "../../hooks/useSiteConfig";

const LoginPage = () => {
  const { data: site } = useSiteConfig();
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTarget = useMemo(() => {
    if (location.state && typeof location.state === "object" && "from" in location.state) {
      return String(location.state.from || "/");
    }
    return "";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectTarget && canAccessAdminPath(user.role, redirectTarget)) {
        navigate(redirectTarget, { replace: true });
        return;
      }
      navigate(user.role === "etudiant" ? "/etudiant/dashboard" : getAdminHomePath(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loggedUser = await login({ email, password });
      const nextPath =
        redirectTarget && canAccessAdminPath(loggedUser.role, redirectTarget)
          ? redirectTarget
          : loggedUser.role === "etudiant"
            ? "/etudiant/dashboard"
            : getAdminHomePath(loggedUser.role);
      navigate(nextPath, { replace: true });
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail || "Connexion impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "etudiant" ? "/etudiant/dashboard" : getAdminHomePath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* Maxton auth-cover — illustration */}
        <div className="relative hidden items-center justify-center border-r border-slate-200 bg-gradient-to-br from-maxton-navy2 via-indigo-950 to-maxton-navy lg:col-span-7 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.2),transparent_50%)]" />
          <div className="relative px-10 py-12 text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/90">Maxton · EMSP</p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-5xl">
              Tableau de bord direction & etudiants
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/75">
              Pilotage des effectifs, admissions et finances — meme ergonomie que le theme Maxton (nouveau_dashboard), adapte a l&apos;ecole des Metiers des Postes.
            </p>
            <div className="mx-auto mt-12 max-w-xl">
              <img src="/maxton/login1.png" width={520} height={420} className="mx-auto h-auto max-w-full drop-shadow-2xl" alt="" />
            </div>
          </div>
        </div>

        {/* Formulaire — bordure superieure type Maxton */}
        <div className="relative flex flex-col justify-center bg-white lg:col-span-5">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-indigo-600" />
          <div className="px-6 py-10 sm:px-10 lg:px-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {site?.logoUrl ? (
                  <img src={site.logoUrl} alt={site.logoAlt} className="mb-6 h-12 w-auto max-w-[200px] object-contain md:h-14" />
                ) : (
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary font-display text-xl font-bold text-white shadow-lg shadow-secondary/30">
                    E
                  </div>
                )}
                <h2 className="font-display text-2xl font-bold tracking-tight text-dark md:text-3xl">Connexion</h2>
                <p className="mt-2 text-sm text-slate-600">Identifiants EMSP (personnel ou etudiant).</p>
              </div>
              <Link
                to="/"
                className="hidden items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-secondary sm:inline-flex"
              >
                <ArrowLeft size={16} />
                Site public
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-dark">
                  E-mail
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-secondary focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@domaine.ext"
                    autoComplete="username"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-dark">
                  Mot de passe
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition focus-within:border-secondary focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Mot de passe oublie ? Contactez la scolarite.</span>
                <Link to="/" className="font-medium text-secondary underline-offset-4 hover:underline sm:hidden">
                  Retour au site
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-grd-emsp w-full rounded-xl px-5 py-3.5 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              <div className="maxton-auth-sep">
                <div className="line" />
                <p className="mb-0 shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400">ou</p>
                <div className="line" />
              </div>

              <p className="text-center text-sm text-slate-600">
                Pas encore de compte applicatif ?{" "}
                <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
                  Creer un dossier candidat
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
