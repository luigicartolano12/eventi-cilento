import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Comprime le risposte per migliore performance
  compress: true,

  // Rimuove l'header X-Powered-By per sicurezza
  poweredByHeader: false,

  // Immagini esterne consentite (picsum per placeholder)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
