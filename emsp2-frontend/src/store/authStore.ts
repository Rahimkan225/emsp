import { create } from "zustand";
import { login } from "../api/authApi";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null") as User | null,
  accessToken: localStorage.getItem("access_token"),
  isAuthenticated: Boolean(localStorage.getItem("access_token")),
  login: async (credentials) => {
    const data = await login(credentials);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user as User, accessToken: data.access as string, isAuthenticated: true });
    return data.user as User;
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  hydrate: () => {
    const user = JSON.parse(localStorage.getItem("user") || "null") as User | null;
    const accessToken = localStorage.getItem("access_token");
    set({ user, accessToken, isAuthenticated: Boolean(accessToken) });
  },
}));
