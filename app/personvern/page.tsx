import Link from "next/link";

export default function Personvern() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Tilbake til forsiden
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Personvern</h1>

        <div className="mt-8 space-y-4 text-sm text-zinc-600 leading-relaxed">
          <p>SmartBytt samler kun inn e-postadresse via ventelisten.</p>
          <p>E-post brukes kun til produktoppdateringer og tidlig tilgang.</p>
          <p>Ingen data selges eller deles med tredjeparter.</p>
          <p>Bruker kan be om sletting ved å kontakte oss på e-post.</p>
        </div>

        <p className="mt-12 text-xs text-zinc-400">
          Kontakt: kontakt@smartbytt.no
        </p>
      </div>
    </main>
  );
}
