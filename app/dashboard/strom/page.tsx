import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import ElectricityForm from "@/app/components/forms/ElectricityForm";
import InvoiceUpload from "@/app/components/forms/InvoiceUpload";

export const dynamic = "force-dynamic";

export default async function ElectricityPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's electricity contract
  const categoriesResult = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "strom")
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = categoriesResult.data as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contract: any = null;
  if (user && categories) {
    const contractResult = await supabase
      .from("user_contracts")
      .select("*")
      .eq("user_id", user.id)
      .eq("category_id", categories.id)
      .maybeSingle();

    contract = contractResult.data;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
          Strøm
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sammenlign strømleverandører og finn beste pris
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Current Contract Summary */}
        {contract && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Din nåværende avtale
                </p>
                <p className="mt-1 text-xl font-semibold dark:text-zinc-100">
                  {contract.provider_name || "Ukjent leverandør"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Månedlig kostnad</p>
                <p className="text-2xl font-semibold dark:text-zinc-100">
                  {contract.monthly_cost?.toLocaleString("nb-NO") || "–"} kr
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href="/dashboard/strom/sammenlign"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sammenlign tilbud
              </Link>
              <button className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Rediger info
              </button>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold dark:text-zinc-100">
            Legg inn manuelt
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Fyll inn informasjon om din strømavtale
          </p>
          <div className="mt-6">
            <ElectricityForm existingContract={contract} />
          </div>
        </div>

        {/* Invoice Upload */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold dark:text-zinc-100">
            Last opp faktura
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Vi leser automatisk ut informasjon fra fakturaen din
          </p>
          <div className="mt-6">
            <InvoiceUpload categorySlug="strom" />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="font-semibold dark:text-zinc-100">Slik fungerer det</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold dark:bg-zinc-700">
              1
            </span>
            <div>
              <p className="text-sm font-medium dark:text-zinc-100">Legg inn info</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Fyll inn skjemaet eller last opp en faktura
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold dark:bg-zinc-700">
              2
            </span>
            <div>
              <p className="text-sm font-medium dark:text-zinc-100">Sammenlign</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Vi finner de beste tilbudene for deg
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold dark:bg-zinc-700">
              3
            </span>
            <div>
              <p className="text-sm font-medium dark:text-zinc-100">Bytt</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Du bestemmer selv om du vil bytte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
