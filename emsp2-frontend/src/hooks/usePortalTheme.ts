import { useEffect, useState } from "react";

type PortalTheme = "light" | "dark";

const STORAGE_KEY = "emsp_portal_theme";
const DARK_CLASS = "emsp-theme-dark";

const getInitialTheme = (): PortalTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
};

export const usePortalTheme = () => {
  const [theme, setTheme] = useState<PortalTheme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
};
