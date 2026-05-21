import Link from "next/link";

export function Header() {
  return (
    <header className="bg-green-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <Link href="/" className="flex flex-col gap-0.5 w-fit">
          <span className="text-2xl font-bold tracking-tight">
            Eventi Cilento
          </span>
          <span className="text-green-200 text-sm">
            Cilento e Vallo di Diano — tutto in un posto
          </span>
        </Link>
      </div>
    </header>
  );
}
