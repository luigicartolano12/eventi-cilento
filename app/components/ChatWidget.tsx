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

function IcoMic({ pulsing }: { pulsing?: boolean }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={pulsing ? "animate-pulse" : ""}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function ChatWidget() {
  const [aperto, setAperto] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Controlla supporto microfono (solo client)
  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setMicSupported(!!SR);
  }, []);

  // Ascolta toggle-chat dal BottomNav
  useEffect(() => {
    const handler = () => setAperto((prev) => !prev);
    window.addEventListener("toggle-chat", handler);
    return () => window.removeEventListener("toggle-chat", handler);
  }, []);

  useEffect(() => {
    if (aperto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [aperto, messages]);

  // Stop registrazione quando la chat si chiude
  useEffect(() => {
    if (!aperto && recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    }
  }, [aperto, recording]);

  function chiudi() {
    recognitionRef.current?.stop();
    setRecording(false);
    setAperto(false);
    window.dispatchEvent(new CustomEvent("chat-closed"));
  }

  /** Avvia o ferma la registrazione vocale */
  function toggleMic() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setRecording(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<SpeechRecognitionResult>)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => {
      setRecording(false);
      // Focus textarea dopo fine registrazione
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function invia() {
    // Se sta registrando, ferma prima la registrazione
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    }

    const testo = input.trim();
    if (!testo || loading) return;

    const nuoviMsg: Message[] = [...messages, { role: "user", content: testo }];
    setMessages(nuoviMsg);
    setInput("");
    setLoading(true);
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

  return (
    <div
      className="fixed z-50 flex flex-col overflow-hidden"
      style={{
        bottom: "calc(3.75rem + env(safe-area-inset-bottom, 0px))",
        right: "1rem",
        left: "1rem",
        maxWidth: 400,
        marginLeft: "auto",
        height: aperto ? "min(520px, calc(100dvh - 5rem))" : 0,
        borderRadius: 24,
        background: "#fff",
        boxShadow: aperto
          ? "0 4px 24px rgba(0,0,0,0.14), 0 24px 64px rgba(0,0,0,0.16)"
          : "none",
        opacity: aperto ? 1 : 0,
        pointerEvents: aperto ? "auto" : "none",
        transition: "height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
        transform: "translateZ(0)",
        willChange: "height, opacity",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
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

      {/* ── Banner registrazione ── */}
      {recording && (
        <div
          className="shrink-0 flex items-center gap-2.5 px-4 py-2.5"
          style={{ background: "#fef2f2", borderBottom: "1px solid #fee2e2" }}
        >
          {/* Pallino pulsante */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{ background: "#dc2626" }}
          />
          <p className="text-xs font-bold flex-1" style={{ color: "#dc2626" }}>
            Registrazione in corso… parla ora
          </p>
          <button
            onClick={toggleMic}
            className="text-xs font-black px-2.5 py-1 rounded-full border-0 cursor-pointer"
            style={{ background: "#dc2626", color: "white" }}
          >
            Stop
          </button>
        </div>
      )}

      {/* ── Messaggi ── */}
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

      {/* ── Input area ── */}
      <div
        className="shrink-0 flex items-end gap-2 px-3 pb-3 pt-2"
        style={{ borderTop: "1px solid #f0ede8" }}
      >
        {/* Bottone microfono */}
        {micSupported && (
          <button
            onClick={toggleMic}
            title={recording ? "Ferma registrazione" : "Registra voce (italiano)"}
            className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all border-0 cursor-pointer"
            style={
              recording
                ? { background: "#dc2626", color: "white", boxShadow: "0 0 0 3px rgba(220,38,38,0.25)" }
                : { background: "#f5f3ef", color: "#78716c" }
            }
          >
            <IcoMic pulsing={recording} />
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={recording ? "In ascolto…" : "Scrivi o usa il microfono…"}
          rows={1}
          className="flex-1 resize-none rounded-2xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none leading-relaxed"
          style={{
            background: recording ? "#fff0f0" : "#f5f3ef",
            maxHeight: 96,
            overflowY: "auto",
            fontSize: 16,
            transition: "background 0.2s",
          }}
        />

        {/* Bottone invia */}
        <button
          onClick={invia}
          disabled={(!input.trim() && !recording) || loading}
          className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-opacity disabled:opacity-40 border-0 cursor-pointer"
          style={{ background: "#a3e635", color: "#14532d" }}
        >
          {loading ? <IcoSpinner /> : <IcoSend />}
        </button>
      </div>
    </div>
  );
}
