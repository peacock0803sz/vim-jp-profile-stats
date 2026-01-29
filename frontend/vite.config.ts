import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  envDir: resolve(__dirname, ".."),
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    allowedHosts: ["localhost", ".tail2121a.ts.net"],
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
