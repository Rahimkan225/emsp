import axiosInstance from "./axiosConfig";
import type { ContactMessagePayload } from "../types";

export async function submitContactMessage(payload: ContactMessagePayload) {
  const response = await axiosInstance.post<{ detail: string }>("/contact/", {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone || "",
    subject: payload.subject,
    message: payload.message,
    honeypot: payload.honeypot || "",
  });
  return response.data;
}
