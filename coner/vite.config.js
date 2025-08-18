import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
  },
}));
