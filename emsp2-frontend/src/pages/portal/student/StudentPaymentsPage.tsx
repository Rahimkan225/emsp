import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useInitiateStudentPayment, usePollingStudentPayments } from "../../../hooks/useStudentPortal";
import type { PaymentTransaction } from "../../../types";
import { downloadBlob } from "../../../utils/studentPortal";

const moneyFormatter = new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });
const operatorLabels: Record<PaymentTransaction["operateur"], string> = { orange: "Orange Money", mtn: "MTN MoMo", moov: "Moov Money", wave: "Wave" };

const schema = z.object({
  operateur: z.enum(["mtn", "orange", "moov"], { message: "Choisissez un operateur." }),
  phone: z.string().min(8, "Le numero doit contenir au moins 8 chiffres."),
  montant: z.number().min(1000, "Le montant minimum est 1 000 FCFA."),
});

type PaymentForm = z.infer<typeof schema>;

const parseAmount = (value: string) => Number(String(value).replace(/[^\d.-]/g, "")) || 0;

const downloadReceipt = (transaction: PaymentTransaction) => {
  const html = `<html lang="fr"><meta charset="utf-8"><body style="font-family:Arial;padding:32px;color:#0f172a"><h1>Recu EMSP</h1><p><strong>Reference:</strong> ${transaction.reference || "-"}</p><p><strong>Montant:</strong> ${moneyFormatter.format(transaction.montant)}</p><p><strong>Operateur:</strong> ${operatorLabels[transaction.operateur]}</p><p><strong>Statut:</strong> ${transaction.statut}</p><p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString("fr-FR")}</p></body></html>`;
  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `recu-${transaction.reference || transaction.id}.html`);
};

const StudentPaymentsPage = () => {
  const [open, setOpen] = useState(false);
  const [pollingUntil, setPollingUntil] = useState<number | null>(null);
  const pollingActive = Boolean(pollingUntil && Date.now() < pollingUntil);
  const { data, isLoading } = usePollingStudentPayments(pollingActive);
  const paymentMutation = useInitiateStudentPayment();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentForm>({
    resolver: zodResolver(schema),
    defaultValues: { operateur: "mtn", montant: 50000, phone: "" },
  });

  useEffect(() => {
    if (!pollingUntil) return undefined;
    const timer = window.setInterval(() => {
      if (Date.now() >= pollingUntil) setPollingUntil(null);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pollingUntil]);

  const summary = useMemo(() => {
    const due = parseAmount(data?.amountDue || "0");
    const paid = parseAmount(data?.amountPaid || "0");
    const remaining = parseAmount(data?.remainingBalance || "0");
    const progress = due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 100;
    return { due, paid, remaining, progress };
  }, [data]);

  const submitPayment = handleSubmit(async (values) => {
    await paymentMutation.mutateAsync({ ...values, description: "Reglement scolarite EMSP" });
    setPollingUntil(Date.now() + 2 * 60 * 1000);
    reset({ operateur: values.operateur, montant: values.montant, phone: values.phone });
    setOpen(false);
  });

  if (isLoading || !data) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Finance student</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Paiements & transactions</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Paiements</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-dark">Situation financiere</h1>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${summary.progress}%` }} />
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">
            <Plus size={18} />
            Payer
          </button>
        </div>
      </SurfaceCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total du", summary.due],
          ["Paye", summary.paid],
          ["Restant", summary.remaining],
        ].map(([label, value]) => (
          <SurfaceCard key={label} className="emsp-panel p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${label === "Restant" && Number(value) > 0 ? "text-red-600" : "text-dark"}`}>{moneyFormatter.format(Number(value))}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="emsp-panel overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-display text-xl font-bold text-dark">Historique</h2>
          {pollingActive ? <p className="mt-1 text-sm text-emerald-700">Verification du statut toutes les 10 secondes.</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[780px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Operateur</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Recu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.transactions.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(item.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 font-semibold text-dark">{moneyFormatter.format(item.montant)}</td>
                  <td className="px-4 py-3 text-slate-600">{operatorLabels[item.operateur]}</td>
                  <td className="px-4 py-3 text-slate-600">{item.reference || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statut === "confirmed" ? "bg-emerald-100 text-emerald-800" : item.statut === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>
                      {item.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => downloadReceipt(item)} className="cursor-pointer rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" aria-label="Telecharger le recu">
                      <Download size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="emsp-panel w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-dark">Mobile Money</h2>
              <button onClick={() => setOpen(false)} className="cursor-pointer rounded-xl bg-slate-100 p-2 text-slate-600" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitPayment} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-dark">
                Operateur
                <select {...register("operateur")} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal">
                  <option value="mtn">MTN</option>
                  <option value="orange">Orange</option>
                  <option value="moov">Moov</option>
                </select>
                {errors.operateur ? <span className="mt-1 block text-xs text-red-600">{errors.operateur.message}</span> : null}
              </label>
              <label className="block text-sm font-semibold text-dark">
                Numero
                <input {...register("phone")} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal" />
                {errors.phone ? <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span> : null}
              </label>
              <label className="block text-sm font-semibold text-dark">
                Montant
                <input type="number" {...register("montant", { valueAsNumber: true })} className="emsp-panel mt-1 w-full rounded-xl px-3 py-3 font-normal" />
                {errors.montant ? <span className="mt-1 block text-xs text-red-600">{errors.montant.message}</span> : null}
              </label>
              <button type="submit" disabled={paymentMutation.isPending} className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-70">
                {paymentMutation.isPending ? "Envoi..." : "Lancer le paiement"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentPaymentsPage;
