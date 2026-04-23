import { CheckCircle2, GraduationCap, Search, ShieldAlert, Users, Wallet } from "lucide-react";
import { useState } from "react";

import AdminMetricCard from "../../../components/dashboard/AdminMetricCard";
import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { HorizontalBars } from "../../../components/dashboard/SvgCharts";
import { useAdminStudents } from "../../../hooks/useAdminDashboard";
import { formatCurrency, formatDate } from "../../../utils/formatDate";

const statusClassName = (isActive: boolean) =>
  isActive ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-600";

const AdminStudentsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [country, setCountry] = useState("");
  const [formation, setFormation] = useState("");

  const { data, isLoading } = useAdminStudents({
    search: search || undefined,
    status: status || undefined,
    country: country || undefined,
    formation: formation || undefined,
  });

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const isLegacyDataset = data.results.some((item) => item.source === "emsp_legacy");

  const countriesMap: Record<string, { label: string; value: number }> = {};
  const formationsMap: Record<string, number> = {};
  const genderMap: Record<string, number> = {};
  const ageMap: Record<string, number> = {};

  for (const item of data.results) {
    if (!countriesMap[item.country]) {
      countriesMap[item.country] = { label: item.countryLabel, value: 0 };
    }
    countriesMap[item.country].value += 1;
    formationsMap[item.formationCode] = (formationsMap[item.formationCode] || 0) + 1;

    if (item.genderLabel) {
      genderMap[item.genderLabel] = (genderMap[item.genderLabel] || 0) + 1;
    }

    if (typeof item.age === "number") {
      const bucket =
        item.age <= 18
          ? "18 ans et moins"
          : item.age <= 21
            ? "19 - 21 ans"
            : item.age <= 24
              ? "22 - 24 ans"
              : "25 ans et plus";
      ageMap[bucket] = (ageMap[bucket] || 0) + 1;
    }
  }

  const countryStats = Object.values(countriesMap).sort((a, b) => b.value - a.value);
  const formationStats = Object.entries(formationsMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const genderStats = Object.entries(genderMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const ageStats = Object.entries(ageMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const countryOptions = Array.from(new Set(data.results.map((item) => item.country)))
    .sort()
    .map((code) => data.results.find((item) => item.country === code))
    .filter(Boolean);

  const formationOptions = Array.from(new Set(data.results.map((item) => item.formationCode)))
    .sort()
    .map((code) => data.results.find((item) => item.formationCode === code))
    .filter(Boolean);

  const primaryChartData = isLegacyDataset ? genderStats : countryStats;
  const secondaryChartData = isLegacyDataset ? ageStats : formationStats;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Etudiants"
        description={
          isLegacyDataset
            ? "La liste est alimentee directement par les donnees reelles de la table MySQL `etudiant` de la base emsp."
            : "Suivi des effectifs, des promotions et des situations administratives. Les filtres ci-dessous permettent d'isoler rapidement une cohorte ou un pays membre."
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard label="Effectif total" value={data.summary.total} helper="etudiants visibles dans la selection" icon={Users} accent="text-secondary" />
        <AdminMetricCard label="Actifs" value={data.summary.active} helper="dossiers disponibles" icon={CheckCircle2} accent="text-dark" />
        <AdminMetricCard label="Suspendus" value={data.summary.inactive} helper="a regulariser" icon={ShieldAlert} accent="text-red-500" />
        <AdminMetricCard
          label="Solde cumule"
          value={formatCurrency(data.summary.outstandingBalance)}
          helper={`${data.summary.promotions} promotions concernees`}
          icon={Wallet}
          accent="text-primary"
        />
      </div>

      <SurfaceCard className="p-5">
        <div className={`grid gap-4 ${isLegacyDataset ? "lg:grid-cols-[1.6fr_1fr]" : "lg:grid-cols-[1.6fr_repeat(3,1fr)]"}`}>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder={isLegacyDataset ? "Rechercher un nom, contact, hobby ou matricule" : "Rechercher un nom, email ou matricule"}
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | "active" | "inactive")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Suspendus</option>
          </select>
          {!isLegacyDataset ? (
            <>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
              >
                <option value="">Tous les pays</option>
                {countryOptions.map((item) => (
                  <option key={item?.country} value={item?.country}>
                    {item?.countryLabel}
                  </option>
                ))}
              </select>
              <select
                value={formation}
                onChange={(event) => setFormation(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
              >
                <option value="">Toutes les filieres</option>
                {formationOptions.map((item) => (
                  <option key={item?.formationCode} value={item?.formationCode}>
                    {item?.formationCode} - {item?.formationName}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      </SurfaceCard>

      <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Liste officielle</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">{isLegacyDataset ? "Etudiants de la base emsp" : "Cohortes et dossiers"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Etudiant</th>
                  <th className="px-5 py-4 font-semibold">{isLegacyDataset ? "Contact" : "Formation"}</th>
                  <th className="px-5 py-4 font-semibold">{isLegacyDataset ? "Profil" : "Promotion"}</th>
                  <th className="px-5 py-4 font-semibold">{isLegacyDataset ? "Hobbies" : "Pays"}</th>
                  <th className="px-5 py-4 font-semibold">{isLegacyDataset ? "Age" : "Rang"}</th>
                  <th className="px-5 py-4 font-semibold">{isLegacyDataset ? "Source" : "Solde"}</th>
                  <th className="px-5 py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.length ? (
                  data.results.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.photoUrl ? (
                            <img src={item.photoUrl} alt={item.fullName} className="h-11 w-11 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 font-semibold text-secondary">
                              {item.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-dark">{item.fullName}</p>
                            <p className="text-xs text-slate-500">{item.matricule}</p>
                            {item.enrolledAt ? <p className="text-xs text-slate-400">Inscrit le {formatDate(item.enrolledAt)}</p> : null}
                          </div>
                        </div>
                      </td>

                      {isLegacyDataset ? (
                        <>
                          <td className="px-5 py-4 text-slate-600">
                            <p className="font-medium text-dark">{item.phone || "Non renseigne"}</p>
                            <p className="text-xs text-slate-500">Contact issu de la base emsp</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <p className="font-medium text-dark">{item.genderLabel || "Non renseigne"}</p>
                            <p className="text-xs text-slate-500">{typeof item.age === "number" ? `${item.age} ans` : "Age non renseigne"}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <p className="max-w-[18rem] whitespace-pre-line text-sm">{item.hobbies || "Non renseignes"}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{typeof item.age === "number" ? `${item.age} ans` : "N/A"}</td>
                          <td className="px-5 py-4 font-medium text-dark">Table etudiant (EMSP)</td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 text-slate-600">
                            <p className="font-medium text-dark">{item.formationCode}</p>
                            <p className="text-xs text-slate-500">{item.formationName}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <p>{item.promotionLabel || "Non affecte"}</p>
                            <p className="text-xs text-slate-500">{item.academicYear || "Sans annee"}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">{item.countryLabel}</td>
                          <td className="px-5 py-4 text-slate-600">#{item.rank}</td>
                          <td className="px-5 py-4 font-medium text-dark">{item.balanceLabel}</td>
                        </>
                      )}

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(item.isActive)}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                      Aucun etudiant ne correspond aux filtres selectionnes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Repartition</p>
                <h2 className="mt-1 font-display text-xl font-bold text-dark">{isLegacyDataset ? "Par sexe" : "Par pays membres"}</h2>
              </div>
            </div>
            {primaryChartData.length ? (
              <HorizontalBars data={primaryChartData} />
            ) : (
              <p className="text-sm text-slate-500">Aucune repartition disponible.</p>
            )}
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/40 p-3 text-dark">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">{isLegacyDataset ? "Profils" : "Programmes"}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-dark">{isLegacyDataset ? "Tranches d'age" : "Par filiere"}</h2>
              </div>
            </div>
            {secondaryChartData.length ? (
              <HorizontalBars data={secondaryChartData} color="#1E293B" />
            ) : (
              <p className="text-sm text-slate-500">Aucune repartition disponible.</p>
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentsPage;
