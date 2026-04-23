import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createForumPost,
  fetchEtudiantProfile,
  fetchStudentDashboard,
  fetchStudentDocuments,
  fetchStudentForum,
  fetchStudentNotes,
  fetchStudentPayments,
  fetchStudentSchedule,
  initiateStudentPayment,
} from "../api/portalApi";

export const useEtudiantMe = () =>
  useQuery({
    queryKey: ["student", "me"],
    queryFn: fetchEtudiantProfile,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentDashboard = () =>
  useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: fetchStudentDashboard,
    staleTime: 60 * 1000,
  });

export const useStudentNotes = () =>
  useQuery({
    queryKey: ["student", "notes"],
    queryFn: fetchStudentNotes,
    staleTime: 60 * 1000,
  });

export const useStudentSchedule = (limit?: number) =>
  useQuery({
    queryKey: ["student", "schedule", limit],
    queryFn: () => fetchStudentSchedule(limit),
    staleTime: 60 * 1000,
  });

export const useStudentDocuments = () =>
  useQuery({
    queryKey: ["student", "documents"],
    queryFn: fetchStudentDocuments,
    staleTime: 60 * 1000,
  });

export const useStudentForum = () =>
  useQuery({
    queryKey: ["student", "forum"],
    queryFn: fetchStudentForum,
    staleTime: 30 * 1000,
  });

export const useStudentPayments = () =>
  useQuery({
    queryKey: ["student", "payments"],
    queryFn: fetchStudentPayments,
    staleTime: 30 * 1000,
  });

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "forum"] });
    },
  });
};

export const useInitiateStudentPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiateStudentPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "payments"] });
    },
  });
};
