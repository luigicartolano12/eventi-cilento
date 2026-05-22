"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const GREETING: Message = {
  role: "assistant",
  content:
    "Ciao! Sono l'assistente di Eventi Cilento 🌿 Dimmi cosa ti piace (musica, aperitivi, natura, cucina…) e ti trovo il locale o la serata perfetta nel Cilento!",
};

function IcoClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IcoSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IcoSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function ChatWidget() {
  const [aperto, setAperto] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Ascolta toggle-chat dal BottomNav
  useEffect(() => {
    const handler = () => {
      setAperto((prev) => !prev);
    };
    window.addEventListener("toggle-chat", handler);
    return () => window.removeEventListener("toggle-chat", handler);
  }, []);

  useEffect(() => {
    if (aperto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [aperto, messages]);

  function chiudi() {
    setAperto(false);
    window.dispatchEvent(new CustomEvent("chat-closed"));
  }

  async function invia() {
    const testo = input.trim();
    if (!testo || loading) return;

    const nuoviMsg: Message[] = [...messages, { role: "user", content: testo }];
    setMessages(nuoviMsg);
    setInput("");
    setLoading(true);

    // Placeholder vuoto per lo streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nuoviMsg.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Errore API");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const aggiornati = [...prev];
          aggiornati[aggiornati.length - 1] = {
            role: "assistant",
            content: aggiornati[aggiornati.length - 1].content + chunk,
          };
          return aggiornati;
        });
      }
    } catch {
      setMessages((prev) => {
        const aggiornati = [...prev];
        aggiornati[aggiornati.length - 1] = {
          role: "assistant",
          content: "Mi dispiace, si è verificato un errore. Riprova tra poco.",
        };
        return aggiornati;
      });
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      invia();
    }
  }

  if (!aperto) return null;

  return (
    <div
      className="fixed z-50 flex flex-col overflow-hidden"
      style={{
        bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
        right: "1rem",
        left: "1rem",
        maxWidth: 360,
        marginLeft: "auto",
        height: 480,
        borderRadius: 24,
        background: "#fff",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.14)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 shrink-0"
        style={{
          background: "linear-gradient(135deg, #1a3529, #0f2318)",
          borderRadius: "24px 24px 0 0",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: "#a3e635", color: "#0f2318" }}
          >
            AI
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">Assistente Cilento</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#4ade80" }}>
              Locali · Serate · Esperienze
            </p>
          </div>
        </div>
        <button
          onClick={chiudi}
          className="text-stone-400 hover:text-white transition-colors p-1 rounded-lg"
        >
          <IcoClose />
        </button>
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? {
                      background: "#a3e635",
                      color: "#14532d",
                      borderRadius: "18px 18px 4px 18px",
                      fontWeight: 500,
                    }
                  : {
                      background: "#f5f3ef",
                      color: "#1c1c1e",
                      borderRadius: "18px 18px 18px 4px",
                    }
              }
            >
              {m.content || (
                <span className="flex items-center gap-1.5 text-stone-400">
                  <IcoSpinner />
                  <span className="text-xs">Sto pensando…</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 flex items-end gap-2 px-3 pb-3 pt-2"
        style={{ borderTop: "1px solid #f0ede8" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Scrivi qui…"
          rows={1}
          className="flex-1 resize-none rounded-2xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none leading-relaxed"
          style={{
            background: "#f5f3ef",
            maxHeight: 96,
            overflowY: "auto",
            fontSize: 16,
          }}
        />
        <button
          onClick={invia}
          disabled={!input.trim() || loading}
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{ background: "#a3e635", color: "#14532d" }}
        >
          {loading ? <IcoSpinner /> : <IcoSend />}
        </button>
      </div>
    </div>
  );
}
