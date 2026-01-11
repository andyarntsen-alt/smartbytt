import Link from "next/link";

export default function Vilkar() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Tilbake til forsiden
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Vilkår</h1>

        <div className="mt-8 space-y-4 text-sm text-zinc-600 leading-relaxed">
          <p>SmartBytt er under utvikling (beta).</p>
          <p>Tjenesten leveres uten garantier.</p>
          <p>Funksjonalitet kan endres eller fjernes.</p>
          <p>SmartBytt er ikke ansvarlig for feil, tap eller nedetid.</p>
        </div>

        <p className="mt-12 text-xs text-zinc-400">
          Kontakt: kontakt@smartbytt.no
        </p>
      </div>
    </main>
  );
}
