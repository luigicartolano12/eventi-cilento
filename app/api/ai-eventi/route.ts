import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PROMPT_SISTEMA = `Sei un assistente specializzato nell'individuare eventi pubblici nel territorio del Cilento e Vallo di Diano (Campania, Italia).
Cerca eventi futuri: sagre, concerti, mostre, feste religiose, mercati, eventi sportivi, eventi naturalistici.
Comunali di riferimento: Agropoli, Capaccio-Paestum, Castellabate, Centola-Palinuro, Camerota, Pisciotta, Vallo della Lucania, Teggiano, Ascea, Pollica, Sapri, Novi Velia.`;

const FORMATO_JSON = `
Restituisci SOLO un array JSON valido, senza testo prima o dopo, in questo formato:
[
  {
    "titolo": "Nome evento",
    "data": "YYYY-MM-DD",
    "dataFine": "YYYY-MM-DD",
    "comune": "Nome comune",
    "categoria": "Sagra" | "Musica" | "Cultura" | "Sport" | "Religioso" | "Mercato" | "Natura",
    "descrizione": "Descrizione 2-3 frasi",
    "orario": "HH:MM",
    "luogo": "Nome luogo specifico",
    "gratuito": true,
    "sorgente": "https://url-fonte.it"
  }
]
Ometti i campi facoltativi se non disponibili. Se non trovi eventi, rispondi con [].`;

export async function POST(req: Request) {
  const { query } = (await req.json()) as { query?: string };
  const oggi = new Date().toISOString().split("T")[0];

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      }

      try {
        send({ tipo: "status", msg: "Avvio ricerca web eventi Cilento…" });

        const domanda = query
          ? `Cerca eventi nel Cilento: "${query}". Data di oggi: ${oggi}.`
          : `Cerca eventi pubblici nel Cilento e Vallo di Diano da oggi (${oggi}) in poi. Usa la ricerca web per trovare eventi reali e aggiornati.`;

        // Prova con il tool web_search (richiede accesso beta Anthropic)
        let testo = "";
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const risposta = await (client.messages.create as any)({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: PROMPT_SISTEMA,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [
              {
                role: "user",
                content: domanda + "\n\n" + FORMATO_JSON,
              },
            ],
          });

          send({ tipo: "status", msg: "Analisi risultati ricerca…" });

          // Estrai blocchi di testo dalla risposta (ignora tool_use e tool_result)
          for (const block of risposta.content) {
            if (block.type === "text") testo += block.text;
          }
        } catch (errWeb) {
          // Fallback: usa Claude senza web search ma con contesto del territorio
          send({ tipo: "status", msg: "Ricerca web non disponibile, uso conoscenza interna…" });
          const errMsg = errWeb instanceof Error ? errWeb.message : String(errWeb);
          send({ tipo: "avviso", msg: `(${errMsg.slice(0, 80)})` });

          const risposta = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: PROMPT_SISTEMA,
            messages: [
              {
                role: "user",
                content: `Basandoti sulla tua conoscenza del territorio cilentano e degli eventi tipici che si svolgono in questa zona, genera una lista di eventi plausibili e realistici per il periodo da ${oggi} in poi. Includi eventi tipici della stagione. Non inventare date specifiche: usa date verosimili.

${FORMATO_JSON}`,
              },
            ],
          });

          for (const block of risposta.content) {
            if (block.type === "text") testo += block.text;
          }
        }

        send({ tipo: "status", msg: "Strutturazione eventi…" });

        // Estrai l'array JSON dalla risposta
        const match = testo.match(/\[[\s\S]*\]/);
        if (!match) {
          send({ tipo: "errore", msg: "Nessun evento trovato nel formato atteso." });
          controller.close();
          return;
        }

        let eventi: object[] = [];
        try {
          eventi = JSON.parse(match[0]);
        } catch {
          send({ tipo: "errore", msg: "Errore nel parsing degli eventi." });
          controller.close();
          return;
        }

        send({ tipo: "eventi", eventi, totale: eventi.length });
      } catch (err) {
        send({
          tipo: "errore",
          msg: err instanceof Error ? err.message : "Errore imprevisto",
        });
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
