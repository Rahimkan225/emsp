import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_"],
  base: "/",
  server: {
    port: 3000,
  },
}));
