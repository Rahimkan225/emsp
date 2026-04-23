import { useQuery } from "@tanstack/react-query";

import { fetchNews, fetchNewsArticle, fetchNewsFeed, fetchNewsTags, type NewsQueryParams } from "../api/newsApi";

export const useNews = (params?: NewsQueryParams) => {
  return useQuery({
    queryKey: ["news", params],
    queryFn: () => fetchNews(params),
  });
};

export const useNewsFeed = (params?: NewsQueryParams) => {
  return useQuery({
    queryKey: ["news-feed", params],
    queryFn: () => fetchNewsFeed(params),
  });
};

export const useNewsArticle = (slug?: string) => {
  return useQuery({
    queryKey: ["news-article", slug],
    queryFn: () => fetchNewsArticle(slug as string),
    enabled: Boolean(slug),
  });
};

export const useNewsTags = () => {
  return useQuery({
    queryKey: ["news-tags"],
    queryFn: () => fetchNewsTags(),
    staleTime: 5 * 60 * 1000,
  });
};
