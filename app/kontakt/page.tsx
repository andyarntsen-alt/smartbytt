import Link from "next/link";

export default function Kontakt() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Tilbake til forsiden
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Kontakt</h1>

        <div className="mt-8 text-sm text-zinc-600 leading-relaxed">
          <p>
            E-post:{" "}
            <a
              href="mailto:kontakt@smartbytt.no"
              className="text-zinc-900 underline hover:no-underline"
            >
              kontakt@smartbytt.no
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
