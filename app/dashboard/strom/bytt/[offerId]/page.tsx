import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SwitchFlow from "@/app/components/dashboard/SwitchFlow";

interface PageProps {
  params: Promise<{ offerId: string }>;
}

export default async function SwitchPage({ params }: PageProps) {
  const { offerId } = await params;
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the offer with provider
  const offerResult = await supabase
    .from("offers")
    .select(`
      *,
      provider:providers(*)
    `)
    .eq("id", offerId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offer = offerResult.data as any;

  if (!offer) {
    notFound();
  }

  // Get user's current contract
  const categoryResult = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "strom")
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const category = categoryResult.data as any;

  const contractResult = await supabase
    .from("user_contracts")
    .select("*")
    .eq("user_id", user.id)
    .eq("category_id", category?.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = contractResult.data as any;

  // Calculate estimated savings
  const currentCost = contract?.monthly_cost || 0;
  const yearlyKwh = contract?.yearly_consumption_kwh || 16000;
  const monthlyKwh = yearlyKwh / 12;
  
  // Simple estimation (in production, use connector)
  const spotPrice = 80; // øre/kWh average
  const estimatedCost = offer.price_type === "spot"
    ? Math.round(((monthlyKwh * (spotPrice + (offer.markup_ore_kwh || 0))) / 100) + Number(offer.monthly_fee))
    : Math.round(((monthlyKwh * 100) / 100) + Number(offer.monthly_fee));
  
  const monthlySavings = currentCost - estimatedCost;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard/strom/sammenlign"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Tilbake til sammenligning
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-800">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
              Bytt til {offer.provider?.name}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {offer.name}
            </p>
          </div>
        </div>

        <SwitchFlow
          offer={{
            id: offer.id,
            providerId: offer.provider_id,
            providerName: offer.provider?.name || "Ukjent",
            providerLogo: offer.provider?.logo_url || undefined,
            isPartner: offer.provider?.is_partner || false,
            name: offer.name,
            priceType: offer.price_type as "spot" | "fixed" | "variable",
            monthlyFee: Number(offer.monthly_fee),
            markupOreKwh: offer.markup_ore_kwh ? Number(offer.markup_ore_kwh) : undefined,
            bindingMonths: offer.binding_months,
            validFrom: new Date(offer.valid_from),
            estimatedMonthlyCost: estimatedCost,
          }}
          currentCost={currentCost}
          monthlySavings={monthlySavings > 0 ? monthlySavings : 0}
          yearlySavings={monthlySavings > 0 ? monthlySavings * 12 : 0}
          affiliateUrl={offer.provider?.is_partner 
            ? `${offer.provider.affiliate_url || offer.provider.website_url}?ref=smartbytt`
            : offer.provider?.website_url || undefined
          }
        />
      </div>
    </div>
  );
}
