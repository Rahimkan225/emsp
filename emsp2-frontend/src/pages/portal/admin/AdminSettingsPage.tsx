import { BellRing, Globe2, ImagePlus, Mail, MapPin, Phone, Save, Settings2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import AdminMetricCard from "../../../components/dashboard/AdminMetricCard";
import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useSiteConfig, useUpdateSiteConfig } from "../../../hooks/useSiteConfig";
import type { SiteConfigUpdatePayload } from "../../../types";

const buildInitialForm = (data: {
  siteName: string;
  slogan: string;
  logoAlt: string;
  phone1: string;
  phone2: string;
  emailContact: string;
  emailInfo: string;
  address: string;
  showHomepageBanner: boolean;
  homepageBannerText: string;
  aboutText: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
}): SiteConfigUpdatePayload => ({
  siteName: data.siteName,
  slogan: data.slogan,
  logoAlt: data.logoAlt,
  phone1: data.phone1,
  phone2: data.phone2,
  emailContact: data.emailContact,
  emailInfo: data.emailInfo,
  address: data.address,
  showHomepageBanner: data.showHomepageBanner,
  homepageBannerText: data.homepageBannerText,
  aboutText: data.aboutText,
  facebookUrl: data.facebookUrl,
  twitterUrl: data.twitterUrl,
  linkedinUrl: data.linkedinUrl,
  youtubeUrl: data.youtubeUrl,
  footerText: data.footerText,
  logoFile: null,
  clearLogo: false,
});

const AdminSettingsPage = () => {
  const { data, isLoading } = useSiteConfig();
  const mutation = useUpdateSiteConfig();
  const [form, setForm] = useState<SiteConfigUpdatePayload | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (data) {
      setForm(buildInitialForm(data));
    }
  }, [data]);

  if (isLoading || !data || !form) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const socials = [data.facebookUrl, data.twitterUrl, data.linkedinUrl, data.youtubeUrl].filter(Boolean).length;

  const handleChange = <K extends keyof SiteConfigUpdatePayload>(field: K, value: SiteConfigUpdatePayload[K]) => {
    setFeedback("");
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    await mutation.mutateAsync(form);
    setFeedback("Configuration enregistree avec succes.");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Parametres"
        description="Pilote ici l'identite du site, le message de la bande rouge de l'accueil et les coordonnees diffusees sur les pages publiques."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard label="Nom du site" value={data.siteName} helper="identite publique du portail" icon={Settings2} accent="text-secondary" />
        <AdminMetricCard
          label="Bandeau home"
          value={data.showHomepageBanner ? "Actif" : "Masque"}
          helper="annonce defilante en page d'accueil"
          icon={BellRing}
          accent="text-primary"
        />
        <AdminMetricCard label="Contacts" value={data.phone1 || "N/A"} helper={data.emailContact || "Sans email"} icon={Phone} accent="text-dark" />
        <AdminMetricCard label="Reseaux" value={socials} helper="liens sociaux renseignes" icon={Globe2} accent="text-secondary" />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Identite</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Logo et marque</h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Nom du site</span>
                <input
                  value={form.siteName}
                  onChange={(event) => handleChange("siteName", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Slogan</span>
                <input
                  value={form.slogan}
                  onChange={(event) => handleChange("slogan", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-dark">Texte alternatif du logo</span>
              <input
                value={form.logoAlt}
                onChange={(event) => handleChange("logoAlt", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </label>

            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-24 min-w-[220px] items-center justify-center rounded-2xl bg-white px-4 shadow-sm">
                  {!form.clearLogo && data.logoUrl ? (
                    <img src={data.logoUrl} alt={data.logoAlt} className="max-h-16 w-auto object-contain" />
                  ) : (
                    <span className="text-sm text-slate-400">Aucun logo actif</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                    <ImagePlus size={18} />
                    Charger un nouveau logo
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(event) => {
                        handleChange("clearLogo", false);
                        handleChange("logoFile", event.target.files?.[0] || null);
                      }}
                    />
                  </label>
                  <p className="mt-3 text-sm text-slate-600">
                    {form.logoFile ? form.logoFile.name : "Le logo actuel restera en place tant qu'aucun nouveau fichier n'est choisi."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("logoFile", null);
                      handleChange("clearLogo", true);
                    }}
                    className="mt-3 text-sm font-semibold text-red-600"
                  >
                    Retirer le logo actuel
                  </button>
                </div>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-dark">Texte de presentation</span>
              <textarea
                rows={5}
                value={form.aboutText}
                onChange={(event) => handleChange("aboutText", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-dark">Texte de pied de page</span>
              <textarea
                rows={4}
                value={form.footerText}
                onChange={(event) => handleChange("footerText", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </label>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Apercu</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Bande rouge et diffusion</h2>

            <label className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <div>
                <p className="font-medium text-dark">Afficher la bande rouge sur l'accueil</p>
                <p className="text-sm text-slate-500">Active ou masque le bandeau d'information react.</p>
              </div>
              <input
                type="checkbox"
                checked={form.showHomepageBanner}
                onChange={(event) => handleChange("showHomepageBanner", event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-secondary focus:ring-secondary"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-dark">Message de la bande rouge</span>
              <textarea
                rows={4}
                value={form.homepageBannerText}
                onChange={(event) => handleChange("homepageBannerText", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </label>

            <div className="mt-6 rounded-3xl bg-red-600 px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                {form.showHomepageBanner ? "Diffusion active" : "Diffusion desactivee"}
              </p>
              <p className="mt-3 text-lg font-medium">{form.homepageBannerText || "Aucun message configure."}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <Phone size={18} className="mt-1 text-secondary" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Telephones</p>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={form.phone1}
                      onChange={(event) => handleChange("phone1", event.target.value)}
                      placeholder="Telephone principal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
                    />
                    <input
                      value={form.phone2}
                      onChange={(event) => handleChange("phone2", event.target.value)}
                      placeholder="Telephone secondaire"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <Mail size={18} className="mt-1 text-secondary" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Emails</p>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={form.emailContact}
                      onChange={(event) => handleChange("emailContact", event.target.value)}
                      placeholder="Email principal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
                    />
                    <input
                      value={form.emailInfo}
                      onChange={(event) => handleChange("emailInfo", event.target.value)}
                      placeholder="Email secondaire"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MapPin size={18} className="mt-1 text-secondary" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Adresse</p>
                  <textarea
                    rows={4}
                    value={form.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
                  />
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SurfaceCard className="p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Reseaux</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Liens publics</h2>
            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Facebook</span>
                <input
                  value={form.facebookUrl}
                  onChange={(event) => handleChange("facebookUrl", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Twitter</span>
                <input
                  value={form.twitterUrl}
                  onChange={(event) => handleChange("twitterUrl", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">LinkedIn</span>
                <input
                  value={form.linkedinUrl}
                  onChange={(event) => handleChange("linkedinUrl", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">YouTube</span>
                <input
                  value={form.youtubeUrl}
                  onChange={(event) => handleChange("youtubeUrl", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-secondary"
                />
              </label>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Enregistrement</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Publier les changements</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Les modifications sont appliquees au site React, au portail admin et aux morceaux Django qui consomment la configuration globale.
            </p>

            {feedback ? (
              <div className="mt-6 rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                {feedback}
              </div>
            ) : null}
            {mutation.isError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                L'enregistrement a echoue. Verifie les champs puis reessaie.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={18} />
              {mutation.isPending ? "Enregistrement..." : "Enregistrer la configuration"}
            </button>
          </SurfaceCard>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
