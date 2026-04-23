import axiosInstance from "./axiosConfig";

export async function fetchEtudiantProfile() {
  const response = await axiosInstance.get("/scolarite/me/");
  return response.data;
}
