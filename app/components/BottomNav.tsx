"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUtente } from "@/lib/utente";

function IcoHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#a8a29e"} strokeWidth={active ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}

function IcoCompass({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#a8a29e"} strokeWidth={active ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IcoUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#a8a29e"} strokeWidth={active ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [loggato, setLoggato] = useState(false);

  useEffect(() => {
    const aggiorna = () => setLoggato(!!getUtente());
    aggiorna();
    window.addEventListener("utente-aggiornato", aggiorna);
    window.addEventListener("storage", aggiorna);
    return () => {
      window.removeEventListener("utente-aggiornato", aggiorna);
      window.removeEventListener("storage", aggiorna);
    };
  }, []);

  const tabs = [
    { href: "/",            label: "Eventi",      icon: (a: boolean) => <IcoHome active={a} />,    match: (p: string) => p === "/" },
    { href: "/esperienze",  label: "Esperienze",  icon: (a: boolean) => <IcoCompass active={a} />, match: (p: string) => p.startsWith("/esperienze") },
    {
      href: loggato ? "/profilo" : "/registrati",
      label: loggato ? "Profilo" : "Accedi",
      icon: (a: boolean) => <IcoUser active={a} />,
      match: (p: string) => p.startsWith("/profilo") || p.startsWith("/registrati"),
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "rgba(245,243,239,0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-opacity"
          >
            {tab.icon(active)}
            <span
              className="text-[10px] font-bold"
              style={{ color: active ? "#16a34a" : "#a8a29e" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
