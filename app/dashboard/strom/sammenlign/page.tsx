import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import OfferCard from "@/app/components/dashboard/OfferCard";
import SavingsCard from "@/app/components/dashboard/SavingsCard";
import ComparisonTable from "@/app/components/dashboard/ComparisonTable";
import { getConnector } from "@/lib/connectors/registry";
import { fetchSpotPrices, type PriceArea, PRICE_AREA_NAMES } from "@/lib/api/electricity-prices";

export const dynamic = "force-dynamic";

export default async function ComparisonPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's electricity contract
  type Category = { id: string };
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "strom")
    .single() as { data: Category | null; error: Error | null };

  if (categoryError) throw categoryError;

  if (!category) {
    redirect("/dashboard/strom");
  }

  type Contract = {
    id: string;
    user_id: string;
    category_id: string;
    postal_code: string | null;
    price_area: string | null;
    yearly_consumption_kwh: number | null;
    monthly_cost: number | null;
    price_type: string | null;
    provider_name: string | null;
  };
  const { data: contract, error: contractError } = await supabase
    .from("user_contracts")
    .select("*")
    .eq("user_id", user.id)
    .eq("category_id", category.id)
    .maybeSingle() as { data: Contract | null; error: Error | null };

  if (contractError) throw contractError;

  if (!contract) {
    redirect("/dashboard/strom");
  }

  // Get electricity connector and fetch offers
  const connector = getConnector("strom");
  if (!connector) {
    return <div>Kunne ikke laste tilbud</div>;
  }

  const offers = await connector.fetchOffers({
    userId: user.id,
    categorySlug: "strom",
    postalCode: contract.postal_code || "0000",
    priceArea: contract.price_area || "NO1",
    yearlyConsumptionKwh: contract.yearly_consumption_kwh || 16000,
    monthlyCost: contract.monthly_cost || undefined,
    priceType: contract.price_type as "spot" | "fixed" | "variable" | undefined,
  });

  // Get recommendations
  const recommendations = contract.monthly_cost
    ? await connector.recommend(
        {
          userId: user.id,
          categorySlug: "strom",
          postalCode: contract.postal_code || "0000",
          priceArea: contract.price_area || "NO1",
          yearlyConsumptionKwh: contract.yearly_consumption_kwh || 16000,
          monthlyCost: contract.monthly_cost,
          priceType: contract.price_type as "spot" | "fixed" | "variable" | undefined,
        },
        offers
      )
    : [];

  // Fetch real spot prices
  const priceArea = (contract.price_area || "NO1") as PriceArea;
  const spotPrices = await fetchSpotPrices(new Date(), priceArea);

  const bestOffer = offers[0];
  const currentCost = contract.monthly_cost || 0;
  const potentialSavings = bestOffer && currentCost 
    ? currentCost - (bestOffer.estimatedMonthlyCost || 0)
    : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/strom"
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tilbake
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
            Sammenlign strømtilbud
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Basert på {(contract.yearly_consumption_kwh || 0).toLocaleString("nb-NO")} kWh/år i prisområde {contract.price_area || "NO1"}
          </p>
        </div>
      </div>

      {/* Spot Price Info */}
      {spotPrices && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-xl dark:bg-amber-900/50">
                ⚡
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Spotpris nå i {PRICE_AREA_NAMES[priceArea]}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Oppdatert fra hvakosterstrommen.no
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {Math.round(spotPrices.average * 100)} <span className="text-sm font-normal">øre/kWh</span>
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Min: {Math.round(spotPrices.min * 100)} • Maks: {Math.round(spotPrices.max * 100)} øre/kWh
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Savings Summary */}
      {currentCost > 0 && potentialSavings > 0 && bestOffer && (
        <SavingsCard
          currentCost={currentCost}
          recommendedCost={bestOffer.estimatedMonthlyCost || 0}
          monthlySavings={potentialSavings}
          yearlySavings={potentialSavings * 12}
          providerName={bestOffer.providerName}
        />
      )}

      {/* Best Recommendation */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold dark:text-zinc-100">
            Anbefalt for deg
          </h2>
          <OfferCard
            offer={recommendations[0].offer}
            savings={recommendations[0].monthlySavings}
            reasons={recommendations[0].reasons}
            urgency={recommendations[0].urgency}
            isRecommended
          />
        </div>
      )}

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-lg font-semibold dark:text-zinc-100">Alle tilbud</h2>
        <div className="flex gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {offers.length} tilbud
          </span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => {
          const savings = currentCost > 0 && offer.estimatedMonthlyCost
            ? currentCost - offer.estimatedMonthlyCost
            : 0;
          
          return (
            <OfferCard
              key={offer.id}
              offer={offer}
              savings={savings > 0 ? savings : undefined}
            />
          );
        })}
      </div>

      {/* Comparison Table */}
      {offers.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold dark:text-zinc-100">
            Detaljert sammenligning
          </h2>
          <ComparisonTable
            offers={offers}
            currentCost={currentCost}
          />
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Om prisene
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li>• <strong>Spotpriser:</strong> Ekte data fra hvakosterstrommen.no (Nord Pool)</li>
          <li>• <strong>Leverandørpriser:</strong> Månedlig avgift og påslag fra leverandørenes nettsider</li>
          <li>• <strong>Estimert kostnad:</strong> Beregnet basert på ditt årlige forbruk og dagens spotpris</li>
          <li>• Prisene er veiledende og kan variere. Sjekk alltid leverandørens nettside for endelig pris.</li>
        </ul>
      </div>
    </div>
  );
}
