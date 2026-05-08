import axiosInstance from "./axiosConfig";
import type { AdminNewsArticle, AdminNewsPayload, NewsItem, NewsTag, PaginatedResponse } from "../types";

interface NewsApiItem {
  id: number;
  titre: string;
  extrait: string;
  contenu: string;
  slug: string;
  publie_le: string;
  cover?: {
    id: number;
    url?: string;
    alt_text?: string;
    title?: string;
    type?: "image" | "video" | "document";
    category?: string;
    created_at?: string;
    video_type?: "upload" | "youtube";
    video_url?: string;
    file_name?: string;
  };
  tags?: Array<{ nom: string }>;
  category?: string;
}

interface AdminNewsApiItem {
  id: number;
  titre: string;
  extrait: string;
  contenu: string;
  slug: string;
  publie_le: string;
  cover?: {
    id: number;
    url?: string;
    alt_text?: string;
    title?: string;
    type?: "image" | "video" | "document";
    category?: string;
    created_at?: string;
    video_type?: "upload" | "youtube";
    video_url?: string;
    file_name?: string;
  };
  status: string;
  is_published: boolean;
  author_name: string;
  updated_at: string;
  tags?: Array<string | { nom?: string }>;
}

interface NewsTagApiItem {
  id: number;
  nom: string;
  slug: string;
}

export interface NewsQueryParams {
  page?: number;
  category?: string;
  limit?: number;
  search?: string;
  tag?: string;
}

const mapNewsItem = (item: NewsApiItem): NewsItem => ({
  id: item.id,
  title: item.titre,
  excerpt: item.extrait,
  content: item.contenu,
  publishedAt: item.publie_le,
  slug: item.slug,
  category: item.category,
  tags: item.tags?.map((tag) => tag.nom) || [],
  coverImage: item.cover?.url
    ? {
        id: item.cover.id,
        title: item.cover.title || item.titre,
        url: item.cover.url,
        type: item.cover.type || "image",
        category: item.cover.category || "actualites",
        createdAt: item.cover.created_at || item.publie_le,
        altText: item.cover.alt_text,
        videoType: item.cover.video_type,
        videoUrl: item.cover.video_url,
        fileName: item.cover.file_name,
      }
    : undefined,
});

export async function fetchNews(params?: NewsQueryParams) {
  const response = await axiosInstance.get<PaginatedResponse<NewsApiItem> | NewsApiItem[]>(
    "/actualites/",
    { params },
  );

  const payload = Array.isArray(response.data) ? response.data : response.data.results;
  return payload.map(mapNewsItem);
}

export async function fetchNewsFeed(params?: NewsQueryParams): Promise<PaginatedResponse<NewsItem>> {
  const response = await axiosInstance.get<PaginatedResponse<NewsApiItem>>("/actualites/", {
    params,
  });
  return {
    ...response.data,
    results: response.data.results.map(mapNewsItem),
  };
}

export async function fetchNewsArticle(slug: string) {
  const response = await axiosInstance.get<NewsApiItem>(`/actualites/${slug}/`);
  return mapNewsItem(response.data);
}

export async function fetchNewsTags() {
  const response = await axiosInstance.get<NewsTagApiItem[]>("/actualites/tags/");
  return response.data.map<NewsTag>((item) => ({
    id: item.id,
    name: item.nom,
    slug: item.slug,
  }));
}

export async function fetchAdminNews(params?: { status?: "published" | "draft"; search?: string }) {
  const response = await axiosInstance.get<AdminNewsApiItem[]>("/actualites/admin/", {
    params,
  });
  return response.data.map<AdminNewsArticle>((item) => ({
    id: item.id,
    title: item.titre,
    excerpt: item.extrait,
    content: item.contenu,
    slug: item.slug,
    tags: (item.tags || []).map((tag) => (typeof tag === "string" ? tag : tag.nom || "")).filter(Boolean),
    status: item.status,
    isPublished: item.is_published,
    authorName: item.author_name,
    publishedAt: item.publie_le,
    updatedAt: item.updated_at,
    coverImage: item.cover?.url
      ? {
          id: item.cover.id,
          title: item.cover.title || item.titre,
          url: item.cover.url,
          type: item.cover.type || "image",
          category: item.cover.category || "actualites",
          createdAt: item.cover.created_at || item.publie_le,
          altText: item.cover.alt_text,
          videoType: item.cover.video_type,
          videoUrl: item.cover.video_url,
          fileName: item.cover.file_name,
        }
      : undefined,
  }));
}

const toArticleApiPayload = (payload: AdminNewsPayload) => ({
  titre: payload.title,
  slug: payload.slug || undefined,
  extrait: payload.excerpt,
  contenu: payload.content,
  tags: payload.tags,
  is_published: payload.isPublished,
  cover_id: payload.coverId ?? null,
});

export async function createAdminNewsArticle(payload: AdminNewsPayload) {
  const response = await axiosInstance.post<AdminNewsApiItem>("/actualites/admin/", toArticleApiPayload(payload));
  return fetchAdminNewsArticleFromRaw(response.data);
}

export async function updateAdminNewsArticle(id: number, payload: AdminNewsPayload) {
  const response = await axiosInstance.patch<AdminNewsApiItem>(`/actualites/admin/${id}/`, toArticleApiPayload(payload));
  return fetchAdminNewsArticleFromRaw(response.data);
}

export async function deleteAdminNewsArticle(id: number) {
  await axiosInstance.delete(`/actualites/admin/${id}/`);
}

const fetchAdminNewsArticleFromRaw = (item: AdminNewsApiItem): AdminNewsArticle => ({
  id: item.id,
  title: item.titre,
  excerpt: item.extrait,
  content: item.contenu,
  slug: item.slug,
  tags: (item.tags || []).map((tag) => (typeof tag === "string" ? tag : tag.nom || "")).filter(Boolean),
  status: item.status,
  isPublished: item.is_published,
  authorName: item.author_name,
  publishedAt: item.publie_le,
  updatedAt: item.updated_at,
  coverImage: item.cover?.url
    ? {
        id: item.cover.id,
        title: item.cover.title || item.titre,
        url: item.cover.url,
        type: item.cover.type || "image",
        category: item.cover.category || "actualites",
        createdAt: item.cover.created_at || item.publie_le,
        altText: item.cover.alt_text,
        videoType: item.cover.video_type,
        videoUrl: item.cover.video_url,
        fileName: item.cover.file_name,
      }
    : undefined,
});
