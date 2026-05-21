import { eventi } from "@/lib/events";
import { EventiList } from "./components/EventiList";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <div style={{ background: "#1a3529" }} className="px-5 pt-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#86efac" }}
          >
            Cilento &amp; Vallo di Diano
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Scopri gli eventi
            <br />
            del territorio
          </h1>
          <p className="text-lg max-w-lg leading-relaxed" style={{ color: "#a7f3d0" }}>
            Sagre, concerti, mostre, sport e molto altro nel Parco Nazionale
            del Cilento.
          </p>
        </div>
      </div>

      {/* Contenuto eventi — si sovrappone leggermente all'hero */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-16">
        <EventiList eventi={eventi} />
      </div>
    </main>
  );
}
