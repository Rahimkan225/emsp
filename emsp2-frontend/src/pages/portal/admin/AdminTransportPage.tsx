import { Plus, Trash2, BusFront, CreditCard } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import axiosInstance from "../../../api/axiosConfig";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { formatDateTime } from "../../../utils/formatDate";

type TransportCar = {
  id: number;
  label: string;
  places: number;
  description: string;
  is_active: boolean;
  created_at: string;
};

type TransportPayment = {
  id: number;
  car: TransportCar;
  tarif: string;
  paid_at: string;
  expires_at?: string | null;
  reference: string;
};

const AdminTransportPage = () => {
  const [cars, setCars] = useState<TransportCar[]>([]);
  const [payments, setPayments] = useState<TransportPayment[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newCar, setNewCar] = useState({ label: "", places: 0, description: "" });
  const [newPayment, setNewPayment] = useState({ carId: 0, tarif: "", expiresAt: "", reference: "" });

  const reload = async () => {
    const response = await axiosInstance.get<{ cars: TransportCar[]; payments: TransportPayment[] }>("/scolarite/me/transport/");
    setCars(response.data.cars);
    setPayments(response.data.payments);
    setNewPayment((current) => ({
      ...current,
      carId: current.carId || response.data.cars[0]?.id || 0,
    }));
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        setError("");
        await reload();
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Impossible de charger la gestion transport.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddCar = async (event: FormEvent) => {
    event.preventDefault();
    if (!newCar.label.trim()) {
      setError("Renseignez le libelle du car.");
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      await axiosInstance.post("/scolarite/me/transport/cars/", {
        label: newCar.label.trim(),
        places: Number(newCar.places) || 0,
        description: newCar.description.trim(),
      });
      setNewCar({ label: "", places: 0, description: "" });
      await reload();
    } catch (e) {
      console.error(e);
      setError("Echec lors de l'ajout du car.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCar = async (id: number) => {
    try {
      setIsSaving(true);
      setError("");
      await axiosInstance.delete(`/scolarite/me/transport/cars/${id}/`);
      await reload();
    } catch (e) {
      console.error(e);
      setError("Echec lors de la suppression du car.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!newPayment.carId || !String(newPayment.tarif).trim()) {
      setError("Selectionnez un car et un tarif.");
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      await axiosInstance.post("/scolarite/me/transport/payments/", {
        car_id: newPayment.carId,
        tarif: newPayment.tarif,
        expires_at: newPayment.expiresAt ? newPayment.expiresAt : null,
        reference: newPayment.reference.trim(),
      });
      setNewPayment((current) => ({ ...current, tarif: "", expiresAt: "", reference: "" }));
      await reload();
    } catch (e) {
      console.error(e);
      setError("Echec lors de l'enregistrement du paiement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-secondary">Portail admin</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-dark md:text-3xl">Gestion transport</h1>
          <p className="mt-2 text-sm text-slate-600">Gestion des cars et suivi des paiements/expirations.</p>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      {isLoading ? (
        <SurfaceCard className="p-6 text-sm text-slate-500">Chargement...</SurfaceCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SurfaceCard className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                <BusFront size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Cars</p>
                <h2 className="mt-1 font-display text-xl font-bold text-dark">Liste des cars</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {cars.length ? (
                cars.map((car) => (
                  <div key={car.id} className="flex items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-dark">{car.label}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Places: <span className="font-medium">{car.places}</span>
                      </p>
                      {car.description ? <p className="mt-2 text-sm text-slate-500">{car.description}</p> : null}
                      <p className="mt-2 text-xs text-slate-400">Cree le {formatDateTime(car.created_at)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => void handleDeleteCar(car.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucun car enregistre.</p>
              )}
            </div>

            <form onSubmit={handleAddCar} className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-dark">Libelle</span>
                <input
                  value={newCar.label}
                  onChange={(e) => setNewCar((c) => ({ ...c, label: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Nombre de places</span>
                <input
                  type="number"
                  min={0}
                  value={newCar.places}
                  onChange={(e) => setNewCar((c) => ({ ...c, places: Number(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Description</span>
                <input
                  value={newCar.description}
                  onChange={(e) => setNewCar((c) => ({ ...c, description: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  <Plus size={18} />
                  Ajouter un car
                </button>
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/30 p-3 text-dark">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Paiements</p>
                <h2 className="mt-1 font-display text-xl font-bold text-dark">Tarifs & expiration</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {payments.length ? (
                payments.map((p) => (
                  <div key={p.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-dark">{p.car.label}</p>
                      <p className="text-sm font-semibold text-secondary">{Number(p.tarif).toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Paye le {formatDateTime(p.paid_at)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Expiration: <span className="font-medium">{p.expires_at || "Non definie"}</span>
                    </p>
                    {p.reference ? <p className="mt-1 text-xs text-slate-500">Ref: {p.reference}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucun paiement transport.</p>
              )}
            </div>

            <form onSubmit={handleAddPayment} className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-dark">Car</span>
                <select
                  value={newPayment.carId}
                  onChange={(e) => setNewPayment((c) => ({ ...c, carId: Number(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                >
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Tarif (FCFA)</span>
                <input
                  value={newPayment.tarif}
                  onChange={(e) => setNewPayment((c) => ({ ...c, tarif: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Ex: 15000"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Date d'expiration</span>
                <input
                  type="date"
                  value={newPayment.expiresAt}
                  onChange={(e) => setNewPayment((c) => ({ ...c, expiresAt: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-dark">Reference (optionnel)</span>
                <input
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment((c) => ({ ...c, reference: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  <Plus size={18} />
                  Enregistrer le paiement
                </button>
              </div>
            </form>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
};

export default AdminTransportPage;
