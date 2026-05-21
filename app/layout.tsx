import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BottomNav } from "./components/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventi Cilento — Cilento e Vallo di Diano",
  description:
    "Tutti gli eventi del Cilento e del Vallo di Diano: sagre, concerti, mostre, sport e molto altro.",
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
      </body>
    </html>
  );
}
