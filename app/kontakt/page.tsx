import Link from "next/link";

export default function Kontakt() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Tilbake til forsiden
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Kontakt</h1>

        <div className="mt-8 text-sm text-zinc-600 leading-relaxed dark:text-zinc-300">
          <p>
            E-post:{" "}
            <a
              href="mailto:kontakt@smartbytt.no"
              className="text-zinc-900 underline hover:no-underline dark:text-zinc-100"
            >
              kontakt@smartbytt.no
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
