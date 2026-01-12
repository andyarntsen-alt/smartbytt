import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SwitchesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's switches
  const switchesResult = await supabase
    .from("switches")
    .select(`
      *,
      recommendation:recommendations(*),
      to_offer:offers(
        *,
        provider:providers(*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const switches = switchesResult.data as any[] | null;

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    initiated: { label: "Startet", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    pending: { label: "Venter", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
    completed: { label: "Fullført", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    cancelled: { label: "Avbrutt", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300" },
    failed: { label: "Feilet", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
        Mine bytter
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Oversikt over dine leverandørbytter
      </p>

      {switches && switches.length > 0 ? (
        <div className="mt-8 space-y-4">
          {switches.map((sw) => (
            <div
              key={sw.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-800">
                    ⚡
                  </div>
                  <div>
                    <p className="font-medium dark:text-zinc-100">
                      {sw.to_offer?.provider?.name} - {sw.to_offer?.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(sw.created_at).toLocaleDateString("nb-NO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_LABELS[sw.status]?.color}`}>
                  {STATUS_LABELS[sw.status]?.label}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Estimert besparelse</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {sw.estimated_savings?.toLocaleString("nb-NO")} kr/år
                  </p>
                </div>
                {sw.status === "initiated" && (
                  <Link
                    href={`/dashboard/strom/bytt/${sw.to_offer_id}`}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Fullfør bytte
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <svg
              className="h-8 w-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold dark:text-zinc-100">Ingen bytter ennå</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Når du bytter leverandør gjennom SmartBytt, vil de vises her
          </p>
          <Link
            href="/dashboard/strom/sammenlign"
            className="mt-4 inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Se tilbud
          </Link>
        </div>
      )}
    </div>
  );
}
