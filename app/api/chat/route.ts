import Anthropic from "@anthropic-ai/sdk";
import { locali } from "@/lib/locali";
import { esperienze } from "@/lib/esperienze";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sei l'assistente AI di "Eventi Cilento", la guida digitale agli eventi, locali ed esperienze del Parco Nazionale del Cilento e Vallo di Diano (Campania, Italia).

Il tuo compito principale è consigliare locali, serate, esperienze ed eventi in base ai gusti dell'utente. Sei amichevole, appassionato del territorio cilentano e rispondi sempre in italiano. Sii conciso: risposte brevi e utili, non paragrafi infiniti.

LOCALI DISPONIBILI NELL'APP:
${locali.map((l) => `• ${l.nome} — ${l.categoria} — ${l.comune}\n  ${l.descrizione}\n  Serate: ${l.serate.join(" / ")}`).join("\n\n")}

ESPERIENZE DISPONIBILI NELL'APP:
${esperienze.map((e) => `• ${e.titolo} — ${e.categoria} — ${e.comune}: ${e.descrizione}`).join("\n")}

Quando consigli un locale, cita sempre: nome, comune e perché si adatta ai gusti dell'utente. Se l'utente chiede qualcosa che non è nell'app, suggerisci comunque in modo generale facendo riferimento al territorio del Cilento.`;

export async function POST(req: Request) {
  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
