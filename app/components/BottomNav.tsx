"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

function IcoMoon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#a8a29e"} strokeWidth={active ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IcoChat({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#a8a29e"} strokeWidth={active ? 2.2 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [chatAperto, setChatAperto] = useState(false);

  useEffect(() => {
    const handler = () => setChatAperto(false);
    window.addEventListener("chat-closed", handler);
    return () => window.removeEventListener("chat-closed", handler);
  }, []);

  function toggleChat() {
    setChatAperto((prev) => !prev);
    window.dispatchEvent(new CustomEvent("toggle-chat"));
  }

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "rgba(245,243,239,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        /* Forza layer GPU separato → evita salti durante lo scroll */
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Home */}
      <Link
        href="/"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-opacity"
      >
        <IcoHome active={pathname === "/"} />
        <span className="text-[10px] font-bold" style={{ color: pathname === "/" ? "#16a34a" : "#a8a29e" }}>
          Home
        </span>
      </Link>

      {/* Esperienze */}
      <Link
        href="/esperienze"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-opacity"
      >
        <IcoCompass active={pathname.startsWith("/esperienze")} />
        <span className="text-[10px] font-bold" style={{ color: pathname.startsWith("/esperienze") ? "#16a34a" : "#a8a29e" }}>
          Esperienze
        </span>
      </Link>

      {/* Notte */}
      <Link
        href="/notte"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-opacity"
      >
        <IcoMoon active={pathname.startsWith("/notte") || pathname.startsWith("/locali")} />
        <span className="text-[10px] font-bold" style={{ color: (pathname.startsWith("/notte") || pathname.startsWith("/locali")) ? "#16a34a" : "#a8a29e" }}>
          Notte
        </span>
      </Link>

      {/* Chat */}
      <button
        onClick={toggleChat}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-opacity border-0 bg-transparent cursor-pointer"
      >
        <IcoChat active={chatAperto} />
        <span className="text-[10px] font-bold" style={{ color: chatAperto ? "#16a34a" : "#a8a29e" }}>
          Chat
        </span>
      </button>
    </nav>
  );
}
