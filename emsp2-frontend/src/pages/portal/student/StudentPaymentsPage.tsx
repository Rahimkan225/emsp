import { X } from "lucide-react";
import { FormEvent, useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useInitiateStudentPayment, useStudentPayments } from "../../../hooks/useStudentPortal";

const StudentPaymentsPage = () => {
  const { data, isLoading } = useStudentPayments();
  const paymentMutation = useInitiateStudentPayment();
  const [open, setOpen] = useState(false);
  const [operateur, setOperateur] = useState<"orange" | "mtn" | "wave">("orange");
  const [phone, setPhone] = useState("");
  const [montant, setMontant] = useState("50000");

  if (isLoading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    await paymentMutation.mutateAsync({
      operateur,
      phone,
      montant: Number(montant),
      description: "Reglement scolarite EMSP",
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "Montant du", value: data.amountDue },
          { label: "Montant paye", value: data.amountPaid },
          { label: "Solde restant", value: data.remainingBalance },
        ].map((item) => (
          <SurfaceCard key={item.label} className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-4 font-display text-3xl font-bold text-dark">{item.value}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Paiements</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-dark">Historique des transactions</h1>
          </div>
          <button onClick={() => setOpen(true)} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-dark">
            Payer maintenant
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Montant</th>
                <th className="px-5 py-4 font-semibold">Operateur</th>
                <th className="px-5 py-4 font-semibold">Reference</th>
                <th className="px-5 py-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.transactions.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 text-slate-600">{new Date(item.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-5 py-4 font-medium text-dark">{item.montant.toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-5 py-4 text-slate-600">{item.operateur}</td>
                  <td className="px-5 py-4 text-slate-600">{item.reference || "-"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.statut === "confirmed"
                          ? "bg-secondary/10 text-secondary"
                          : item.statut === "pending"
                            ? "bg-primary/30 text-dark"
                            : "bg-red-50 text-red-500"
                      }`}
                    >
                      {item.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-secondary">Mobile Money</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-dark">Confirmer un paiement</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-2xl bg-slate-100 p-2 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitPayment} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Operateur</span>
                <select value={operateur} onChange={(event) => setOperateur(event.target.value as typeof operateur)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none">
                  <option value="orange">Orange Money</option>
                  <option value="mtn">MTN MoMo</option>
                  <option value="wave">Wave</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Numero de telephone</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Montant</span>
                <input value={montant} onChange={(event) => setMontant(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" required />
              </label>

              {paymentMutation.isSuccess ? (
                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                  Paiement lance. Confirme sur ton telephone pour finaliser l'operation.
                </div>
              ) : null}

              <button type="submit" disabled={paymentMutation.isPending} className="w-full rounded-2xl bg-primary px-5 py-3 font-semibold text-dark disabled:opacity-70">
                {paymentMutation.isPending ? "Confirmation..." : "Confirmer"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentPaymentsPage;
