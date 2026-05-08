import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  envPrefix: ["VITE_", "REACT_APP_"],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("recharts")) return "vendor-charts";
          return "vendor-core";
        },
      },
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: [resolve(__dirname, "..")],
    },
  },
}));
