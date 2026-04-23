import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchSiteConfig, updateSiteConfig } from "../api/siteConfigApi";
import type { SiteConfigUpdatePayload } from "../types";

export const useSiteConfig = () => {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSiteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SiteConfigUpdatePayload) => updateSiteConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });
};
