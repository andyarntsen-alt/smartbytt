import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getConnector } from "@/lib/connectors/registry";
import { fetchSpotPrices, type PriceArea } from "@/lib/api/electricity-prices";
import DashboardContent from "@/app/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile for greeting
  const profileResult = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileResult.data as any;

  // Get user's contracts
  const contractsResult = await supabase
    .from("user_contracts")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contracts = contractsResult.data as any[] | null;

  // Calculate real-time savings potential for electricity contracts
  let totalPotentialSavings = 0;
  let bestSavingsPerMonth = 0;
  let bestOffer: { 
    providerName: string; 
    offerName: string; 
    monthlySavings: number; 
    yearlySavings: number;
    estimatedCost: number;
  } | null = null;
  
  const electricityContract = contracts?.find(c => c.category?.slug === "strom");
  
  if (electricityContract && electricityContract.monthly_cost) {
    const connector = getConnector("strom");
    if (connector) {
      const offers = await connector.fetchOffers({
        userId: user.id,
        categorySlug: "strom",
        postalCode: electricityContract.postal_code || "0000",
        priceArea: electricityContract.price_area || "NO1",
        yearlyConsumptionKwh: electricityContract.yearly_consumption_kwh || 16000,
        monthlyCost: electricityContract.monthly_cost,
        priceType: electricityContract.price_type as "spot" | "fixed" | "variable" | undefined,
      });
      
      // Find the best offer
      if (offers.length > 0 && offers[0].estimatedMonthlyCost) {
        const currentCost = electricityContract.monthly_cost;
        const bestOfferCost = offers[0].estimatedMonthlyCost;
        const monthlySavings = currentCost - bestOfferCost;
        
        if (monthlySavings > 0) {
          bestSavingsPerMonth = monthlySavings;
          totalPotentialSavings = monthlySavings * 12;
          bestOffer = {
            providerName: offers[0].providerName,
            offerName: offers[0].name,
            monthlySavings,
            yearlySavings: monthlySavings * 12,
            estimatedCost: bestOfferCost,
          };
        }
      }
    }
  }

  // Fetch real spot prices
  const priceArea = (electricityContract?.price_area || "NO1") as PriceArea;
  const spotPrices = await fetchSpotPrices(new Date(), priceArea);

  const hour = new Date().getHours();
  const firstName = profile?.full_name?.split(" ")[0] || "der";
  const hasContract = !!(electricityContract && electricityContract.monthly_cost);

  return (
    <DashboardContent
      firstName={firstName}
      hour={hour}
      hasContract={hasContract}
      spotPrices={spotPrices}
      priceArea={priceArea}
      electricityContract={electricityContract ? {
        monthly_cost: electricityContract.monthly_cost,
        provider_name: electricityContract.provider_name,
        postal_code: electricityContract.postal_code,
        price_area: electricityContract.price_area,
        yearly_consumption_kwh: electricityContract.yearly_consumption_kwh,
        price_type: electricityContract.price_type,
      } : null}
      bestOffer={bestOffer}
      totalPotentialSavings={totalPotentialSavings}
      bestSavingsPerMonth={bestSavingsPerMonth}
    />
  );
}
