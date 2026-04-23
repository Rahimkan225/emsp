import axiosInstance from "./axiosConfig";
import type { AdminFinancePaymentsData } from "../types";

export async function fetchFinanceSummary() {
  const response = await axiosInstance.get<{
    monthly_revenue: number;
    recovery_rate: number;
    pending_payments: number;
    unpaid_total: number;
    evolution: Array<{ label: string; paid: number; goal: number }>;
  }>("/comptabilite/summary/");
  return {
    monthlyRevenue: response.data.monthly_revenue,
    recoveryRate: response.data.recovery_rate,
    pendingPayments: response.data.pending_payments,
    unpaidTotal: response.data.unpaid_total,
    evolution: response.data.evolution.map((item) => ({
      label: item.label,
      paid: item.paid,
      due: item.goal,
    })),
  };
}

interface RawAdminPaymentsResponse {
  summary: {
    total_transactions: number;
    confirmed_count: number;
    pending_count: number;
    failed_count: number;
    confirmed_total: number;
  };
  results: Array<{
    id: number;
    student_name: string;
    matricule: string;
    formation_name: string;
    student_country: string;
    montant: string | number;
    operateur: "orange" | "mtn" | "wave";
    phone_number: string;
    reference: string;
    statut: "pending" | "confirmed" | "failed" | "refunded";
    status_label: string;
    description: string;
    created_at: string;
    confirmed_at?: string;
  }>;
}

export async function fetchAdminPayments(params?: {
  search?: string;
  status?: "pending" | "confirmed" | "failed" | "refunded";
  operator?: "orange" | "mtn" | "wave";
}) {
  const response = await axiosInstance.get<RawAdminPaymentsResponse>("/comptabilite/admin/paiements/", {
    params,
  });
  return {
    summary: {
      totalTransactions: response.data.summary.total_transactions,
      confirmedCount: response.data.summary.confirmed_count,
      pendingCount: response.data.summary.pending_count,
      failedCount: response.data.summary.failed_count,
      confirmedTotal: response.data.summary.confirmed_total,
    },
    results: response.data.results.map((item) => ({
      id: item.id,
      studentName: item.student_name,
      matricule: item.matricule,
      formationName: item.formation_name,
      studentCountry: item.student_country,
      montant: Number(item.montant),
      operateur: item.operateur,
      phoneNumber: item.phone_number,
      reference: item.reference,
      statut: item.statut,
      statusLabel: item.status_label,
      description: item.description,
      createdAt: item.created_at,
      confirmedAt: item.confirmed_at,
    })),
  } satisfies AdminFinancePaymentsData;
}
