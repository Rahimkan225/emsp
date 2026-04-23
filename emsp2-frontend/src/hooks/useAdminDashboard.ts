import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAdminNews } from "../api/newsApi";
import { fetchAdminDashboard, fetchAdminAcademicOverview, fetchAdminStudents } from "../api/portalApi";
import { createAdminMedia, fetchAdminMedia } from "../api/mediaApi";
import { fetchAdminPayments, fetchFinanceSummary } from "../api/financeApi";
import type { AdminMediaPayload } from "../types";

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 60 * 1000,
  });

export const useFinanceSummary = () =>
  useQuery({
    queryKey: ["admin", "finance-summary"],
    queryFn: fetchFinanceSummary,
    staleTime: 60 * 1000,
  });

export const useAdminStudents = (filters: {
  search?: string;
  status?: "active" | "inactive";
  country?: string;
  formation?: string;
}) =>
  useQuery({
    queryKey: ["admin", "students", filters],
    queryFn: () => fetchAdminStudents(filters),
    staleTime: 60 * 1000,
  });

export const useAdminAcademicOverview = () =>
  useQuery({
    queryKey: ["admin", "academic-overview"],
    queryFn: fetchAdminAcademicOverview,
    staleTime: 60 * 1000,
  });

export const useAdminPayments = (filters: {
  search?: string;
  status?: "pending" | "confirmed" | "failed" | "refunded";
  operator?: "orange" | "mtn" | "wave";
}) =>
  useQuery({
    queryKey: ["admin", "payments", filters],
    queryFn: () => fetchAdminPayments(filters),
    staleTime: 60 * 1000,
  });

export const useAdminMedia = (filters: {
  category?: string;
  type?: "image" | "video" | "document";
  search?: string;
}) =>
  useQuery({
    queryKey: ["admin", "media", filters],
    queryFn: () => fetchAdminMedia(filters),
    staleTime: 60 * 1000,
  });

export const useCreateAdminMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminMediaPayload) => createAdminMedia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useAdminNews = (filters: {
  status?: "published" | "draft";
  search?: string;
}) =>
  useQuery({
    queryKey: ["admin", "news", filters],
    queryFn: () => fetchAdminNews(filters),
    staleTime: 60 * 1000,
  });
