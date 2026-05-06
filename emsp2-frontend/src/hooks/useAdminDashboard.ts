import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAdminApplicationDetail, fetchAdminApplications, updateAdminApplicationStatus } from "../api/inscriptionsApi";
import { fetchAdminNews } from "../api/newsApi";
import {
  createAdminStudent,
  fetchAdminDashboard,
  fetchAdminAcademicOverview,
  fetchAdminStudentOptions,
  fetchAdminStudents,
  updateAdminLegacyStudent,
  updateAdminPortalStudent,
} from "../api/portalApi";
import { createAdminMedia, fetchAdminMedia } from "../api/mediaApi";
import { fetchAdminPayments, fetchFinanceSummary } from "../api/financeApi";
import type { AdminLegacyStudentPayload, AdminMediaPayload, AdminPortalStudentPayload } from "../types";

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

export const useAdminStudentOptions = () =>
  useQuery({
    queryKey: ["admin", "student-options"],
    queryFn: fetchAdminStudentOptions,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateAdminStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminLegacyStudentPayload | AdminPortalStudentPayload) => createAdminStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useUpdateAdminLegacyStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matricule, payload }: { matricule: string; payload: AdminLegacyStudentPayload }) =>
      updateAdminLegacyStudent(matricule, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useUpdateAdminPortalStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminPortalStudentPayload }) => updateAdminPortalStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useAdminAcademicOverview = () =>
  useQuery({
    queryKey: ["admin", "academic-overview"],
    queryFn: fetchAdminAcademicOverview,
    staleTime: 60 * 1000,
  });

export const useAdminApplications = (filters: {
  status?: "submitted" | "under_review" | "accepted" | "rejected";
  search?: string;
}) =>
  useQuery({
    queryKey: ["admin", "applications", filters],
    queryFn: () => fetchAdminApplications(filters),
    staleTime: 60 * 1000,
  });

export const useAdminApplicationDetail = (applicationId?: number) =>
  useQuery({
    queryKey: ["admin", "applications", applicationId],
    queryFn: () => fetchAdminApplicationDetail(applicationId as number),
    enabled: Boolean(applicationId),
    staleTime: 60 * 1000,
  });

export const useUpdateAdminApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "submitted" | "under_review" | "accepted" | "rejected" }) =>
      updateAdminApplicationStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "applications", variables.id] });
    },
  });
};

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
