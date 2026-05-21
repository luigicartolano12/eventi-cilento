import { eventi } from "@/lib/events";
import { EventiList } from "./components/EventiList";

export default function Home() {
  return (
    <main className="flex-1 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Cosa c&apos;è in programma?
          </h1>
          <p className="text-stone-500 text-sm">
            Sagre, concerti, mostre e molto altro nel Cilento e nel Vallo di
            Diano.
          </p>
        </div>
        <EventiList eventi={eventi} />
      </div>
    </main>
  );
}
