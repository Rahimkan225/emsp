import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

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
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
        return;
      }
      navigate(user.role === "etudiant" ? "/etudiant/dashboard" : "/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loggedUser = await login({ email, password });
      const nextPath = redirectTarget || (loggedUser.role === "etudiant" ? "/etudiant/dashboard" : "/admin/dashboard");
      navigate(nextPath, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Connexion impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "etudiant" ? "/etudiant/dashboard" : "/admin/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.45)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[linear-gradient(145deg,#1E293B_0%,#0F172A_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">EMSP</p>
              <h1 className="mt-6 font-display text-5xl font-bold leading-tight">
                Portail Etudiant & Dashboard Administration
              </h1>
              <p className="mt-6 max-w-md text-base leading-8 text-white/80">
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-white/50"></p>
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="font-semibold text-primary"></span> </p>
                <p><span className="font-semibold text-primary"></span> </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {site?.logoUrl ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <img src={site.logoUrl} alt={site.logoAlt} className="h-14 w-auto max-w-[220px] object-contain" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-xl font-bold text-white">E</div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-secondary">Connexion</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-dark">Acceder a votre espace</h2>
                </div>
              </div>
              <Link to="/" className="hidden items-center gap-2 text-sm font-semibold text-slate-500 hover:text-secondary sm:inline-flex">
                <ArrowLeft size={16} />
                Retour au site
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-secondary focus-within:ring-4 focus-within:ring-emerald-100">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vous@emsp.int"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Mot de passe</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-secondary focus-within:ring-4 focus-within:ring-emerald-100">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    required
                  />
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <a href="#" className="text-sm font-medium text-secondary underline-offset-4 hover:underline">
                  Mot de passe oublie ?
                </a>
                <Link to="/" className="text-sm font-medium text-slate-500 underline-offset-4 hover:underline sm:hidden">
                  Retour au site
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
