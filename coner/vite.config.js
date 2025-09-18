import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      open: true,
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "firebase-core": ["@firebase/app", "@firebase/util"],
          "firebase-auth": ["@firebase/auth", "firebase/auth"],
          "firebase-store": ["@firebase/firestore", "firebase/firestore"],
          "firebase-analytics": ["@firebase/analytics"],
          router: ["react-router-dom"],
          ui: ["styled-components"],
          calendar: ["react-calendar"],
          http: ["axios"],
          icons: ["react-icons/fa", "react-icons/bs", "react-icons/md"],
        },
      },
    },
  },
}));
