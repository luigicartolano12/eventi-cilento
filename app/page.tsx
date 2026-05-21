import { eventi } from "@/lib/events";
import { HomeContent } from "./HomeContent";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeContent eventi={eventi} />
    </main>
  );
}
