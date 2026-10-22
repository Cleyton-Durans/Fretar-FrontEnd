import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy compartilhado entre dev server e preview:
//   /api      -> API Laravel (mesma origem, elimina CORS e torna a URL
//                aleatoria do tunel cloudflared irrelevante)
//   /geocode  -> Nominatim (geocodificacao / reverse geocoding)
const apiProxy = {
  "/api": {
    target: process.env.API_PROXY_TARGET || "http://localhost:8000",
    changeOrigin: true,
  },
};

const geocodeProxy = {
  "/geocode": {
    target: "https://nominatim.openstreetmap.org",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/geocode/, ""),
    headers: {
      "User-Agent": "fretar-app/1.0",
    },
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
    proxy: {
      ...apiProxy,
      ...geocodeProxy,
    },
  },
  preview: {
    allowedHosts: true,
    host: true,
    proxy: {
      ...apiProxy,
      ...geocodeProxy,
    },
  },
});