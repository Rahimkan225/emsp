import { useQuery } from "@tanstack/react-query";

import { fetchMedia, fetchMediaById } from "../api/mediaApi";

export const useMedia = (category?: string, type?: "image" | "video" | "document", limit?: number) => {
  return useQuery({
    queryKey: ["media", category, type, limit],
    queryFn: () => fetchMedia({ category, type, limit }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMediaItem = (id?: number) => {
  return useQuery({
    queryKey: ["media-item", id],
    queryFn: () => fetchMediaById(id as number),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};
