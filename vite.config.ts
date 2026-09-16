import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Emit .gz alongside every asset > 10KB. Nginx serves them via
    // `gzip_static on;` (already configured in tomoh-Infra's
    // nginx-ssl.conf). No brotli pass: nothing in the infra repo enables
    // `brotli_static`, so .br files would never be served.
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Stricter than the Vite default (500KB). Informational only — it will
    // not fail the build, it just surfaces a ballooning bundle early.
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // Keep the rarely-changing vendor code in its own cache-isolated
        // chunks so an app update does not invalidate them.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
