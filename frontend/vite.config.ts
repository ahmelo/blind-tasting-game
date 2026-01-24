import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "logo_app.png",
        "icon-192.png",
        "icon-512.png"
      ],
      manifest: {
        name: "Degustação às Cegas",
        short_name: "Degustação",
        description: "Jogo de degustação às cegas de vinhos - Savoir Vin",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#6b0f1a",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
