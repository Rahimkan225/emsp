import { useQuery } from "@tanstack/react-query";

import { fetchFormationByCode, fetchFormations } from "../api/formationsApi";

export const useFormations = (filters?: { type?: string; level?: string; search?: string; limit?: number }) => {
  return useQuery({
    queryKey: ["formations", filters],
    queryFn: () => fetchFormations(filters),
  });
};

export const useFormation = (code?: string) => {
  return useQuery({
    queryKey: ["formation", code],
    queryFn: () => fetchFormationByCode(code as string),
    enabled: Boolean(code),
  });
};
