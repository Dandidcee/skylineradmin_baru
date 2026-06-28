import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Pisahkan vendor libraries agar browser bisa cache lebih lama
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // Radix UI (kumpulan komponen besar)
          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }
          // Lucide icons
          if (id.includes("lucide-react")) {
            return "vendor-lucide";
          }
          // Date/Calendar libraries
          if (id.includes("date-fns") || id.includes("react-big-calendar") || id.includes("react-calendar")) {
            return "vendor-calendar";
          }
          // Framer motion
          if (id.includes("framer-motion")) {
            return "vendor-framer";
          }
        },
      },
    },
    // Naikkan batas warning chunk (opsional, untuk mengurangi noise di build log)
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5081,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5080',
        changeOrigin: true,
      }
    }
  },
});
