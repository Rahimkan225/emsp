import axiosInstance from "./axiosConfig";
import type { Formation, PaginatedResponse } from "../types";

interface FormationApiItem {
  id: number;
  nom: string;
  code: string;
  niveau: string;
  duree: string;
  description: string;
  cover?: {
    id: number;
    url?: string;
    file?: string;
    alt_text?: string;
    title?: string;
  };
}

const normalizeLevel = (niveau: string): Formation["level"] => {
  if (niveau === "FSP") return "FSP";
  if (niveau === "MASTER") return "Master";
  if (niveau === "LICENCE") return "Licence";
  return "Certifiante";
};

const normalizeProgramType = (niveau: string): Formation["programType"] => {
  if (niveau === "FSP") return "FSP";
  if (niveau === "LICENCE" || niveau === "MASTER") return "FS-MENUM";
  return "FCQ";
};

const mapFormation = (item: FormationApiItem): Formation => ({
  id: item.id,
  name: item.nom,
  code: item.code,
  level: normalizeLevel(item.niveau),
  duration: item.duree,
  description: item.description,
  type: item.niveau,
  programType: normalizeProgramType(item.niveau),
  coverImage: item.cover?.url
    ? {
        id: item.cover.id,
        title: item.cover.title || item.nom,
        url: item.cover.url,
        type: "image",
        category: "formations",
        createdAt: "",
        altText: item.cover.alt_text,
      }
    : undefined,
});

export async function fetchFormations(params?: { type?: string; level?: string; search?: string; limit?: number }) {
  const response = await axiosInstance.get<PaginatedResponse<FormationApiItem> | FormationApiItem[]>(
    "/formations/",
    { params },
  );

  const rawItems = Array.isArray(response.data) ? response.data : response.data.results;
  return rawItems.map(mapFormation);
}

export async function fetchFormationByCode(code: string) {
  const response = await axiosInstance.get<FormationApiItem>(`/formations/${code}/`);
  return mapFormation(response.data);
}
