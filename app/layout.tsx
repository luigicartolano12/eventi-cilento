import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BottomNav } from "./components/BottomNav";
import { ChatWidget } from "./components/ChatWidget";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Viewport separato da metadata (required by Next.js 14+) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // interactiveWidget: "resizes-content" evita che la pagina scorra
  // sotto alla tastiera iOS (sperimentale ma supportato da Safari 16+)
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Eventi Cilento — Cilento e Vallo di Diano",
  description:
    "Tutti gli eventi del Cilento e del Vallo di Diano: sagre, concerti, mostre, sport e molto altro. Scopri locali, esperienze e serate.",
  metadataBase: new URL("https://eventicilentoapp.vercel.app"),
  keywords: ["cilento", "eventi", "sagre", "vallo di diano", "campania", "serate", "concerti", "locali"],
  authors: [{ name: "Eventi Cilento" }],
  openGraph: {
    title: "Eventi Cilento — Cilento e Vallo di Diano",
    description: "Scopri sagre, concerti, mostre e serate nel Cilento. La guida agli eventi del Parco Nazionale del Cilento.",
    url: "https://eventicilentoapp.vercel.app",
    siteName: "Eventi Cilento",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eventi Cilento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventi Cilento",
    description: "Sagre, concerti, mostre e serate nel Cilento e Vallo di Diano.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-16 sm:pb-0">
        <Header />
        {children}
        <Footer />
        <BottomNav />
        <ChatWidget />
      </body>
    </html>
  );
}
