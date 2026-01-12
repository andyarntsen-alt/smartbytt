"use client";

import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageToggle";
import { dashboardTranslations } from "@/lib/translations";
import { PRICE_AREA_NAMES, type PriceArea } from "@/lib/api/electricity-prices";
import SpotPriceChart from "./SpotPriceChart";

interface DashboardContentProps {
  firstName: string;
  hour: number;
  hasContract: boolean;
  spotPrices: {
    average: number;
    min: number;
    max: number;
    prices: { NOK_per_kWh: number; time_start: string; time_end: string }[];
  } | null;
  priceArea: PriceArea;
  electricityContract: {
    monthly_cost: number;
    provider_name?: string;
    postal_code?: string;
    price_area?: string;
    yearly_consumption_kwh?: number;
    price_type?: string;
  } | null;
  bestOffer: {
    providerName: string;
    offerName: string;
    monthlySavings: number;
    yearlySavings: number;
    estimatedCost: number;
  } | null;
  totalPotentialSavings: number;
  bestSavingsPerMonth: number;
}

export default function DashboardContent({
  firstName,
  hour,
  hasContract,
  spotPrices,
  priceArea,
  electricityContract,
  bestOffer,
  totalPotentialSavings,
  bestSavingsPerMonth,
}: DashboardContentProps) {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  // Get greeting based on time
  let greeting = t.greeting.day;
  if (hour < 10) greeting = t.greeting.morning;
  else if (hour >= 17) greeting = t.greeting.evening;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {hasContract ? t.overview.hasContract : t.overview.noContract}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Electricity Price Card - shows what you actually pay */}
        {(() => {
          // Strømstøtte constants (Jan 2026)
          const THRESHOLD = priceArea === "NO4" ? 77 : 96; // NO4 has no VAT
          const calcAfterSupport = (ore: number) => 
            ore <= THRESHOLD ? ore : Math.round(ore - (ore - THRESHOLD) * 0.9);
          
          // Get current hour's price
          const currentHour = new Date().getHours();
          const currentHourPrice = spotPrices?.prices?.find(p => {
            const h = new Date(p.time_start).getHours();
            return h === currentHour;
          });
          
          const spotOre = currentHourPrice 
            ? Math.round(currentHourPrice.NOK_per_kWh * 100) 
            : spotPrices ? Math.round(spotPrices.average * 100) : null;
          
          const youPay = spotOre ? calcAfterSupport(spotOre) : null;
          const support = spotOre && youPay ? spotOre - youPay : 0;
          
          return (
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {language === "no" ? "Du betaler nå" : "You pay now"}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {youPay ?? "–"}
                    <span className="ml-1 text-base font-normal text-amber-700 dark:text-amber-400">øre/kWh</span>
                  </p>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                    {PRICE_AREA_NAMES[priceArea]} • kl {currentHour.toString().padStart(2, "0")}:00
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              {spotPrices && spotOre && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-amber-200 pt-3 text-xs dark:border-amber-800">
                  <span className="text-amber-700 dark:text-amber-400">
                    Spot: <strong>{spotOre}</strong> øre
                  </span>
                  {support > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      💰 Støtte: <strong>-{support}</strong> øre
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Current Cost Card */}
        {hasContract && electricityContract ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t.monthlyCost.title}
                </p>
                <p className="mt-1 text-3xl font-bold dark:text-zinc-100">
                  {electricityContract.monthly_cost.toLocaleString("nb-NO")}
                  <span className="ml-1 text-base font-normal text-zinc-500 dark:text-zinc-400">kr</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {electricityContract.provider_name || (language === "no" ? "Strøm" : "Electricity")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            href="/dashboard/strom"
            className="group rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-5 transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {t.monthlyCost.title}
                </p>
                <p className="mt-1 text-lg font-medium text-zinc-600 group-hover:text-emerald-700 dark:text-zinc-400 dark:group-hover:text-emerald-400">
                  {t.monthlyCost.addContract}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/40">
                <span className="text-2xl">➕</span>
              </div>
            </div>
          </Link>
        )}

        {/* Savings Potential Card */}
        <div className={`rounded-2xl border p-5 ${
          totalPotentialSavings > 0 
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t.savingsPotential.title}
              </p>
              <p className={`mt-1 text-3xl font-bold ${
                totalPotentialSavings > 0 
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-600"
              }`}>
                {hasContract 
                  ? `${Math.round(bestSavingsPerMonth).toLocaleString("nb-NO")}`
                  : "?"}
                <span className={`ml-1 text-base font-normal ${
                  totalPotentialSavings > 0 
                    ? "text-emerald-600/70 dark:text-emerald-400/70"
                    : "text-zinc-400 dark:text-zinc-600"
                }`}>{t.savingsPotential.perMonth}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                {totalPotentialSavings > 0 
                  ? `${totalPotentialSavings.toLocaleString("nb-NO")} ${t.savingsPotential.perYear}`
                  : hasContract ? t.savingsPotential.goodDeal : t.savingsPotential.addFirst}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              totalPotentialSavings > 0 
                ? "bg-emerald-100 dark:bg-emerald-900/40"
                : "bg-zinc-100 dark:bg-zinc-800"
            }`}>
              <span className="text-2xl">{totalPotentialSavings > 0 ? "💰" : "✓"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Card - Show recommendation or onboarding */}
      {bestOffer ? (
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-white shadow-lg shadow-emerald-100 dark:border-emerald-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3">
            <p className="font-medium text-white">
              🎉 {t.recommendation.found}
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900/50">
                  ⚡
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-zinc-100">
                    {bestOffer.providerName}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {bestOffer.offerName} • {t.recommendation.spot}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {t.recommendation.estimated}: <strong className="text-zinc-900 dark:text-zinc-100">{Math.round(bestOffer.estimatedCost).toLocaleString("nb-NO")} kr/{language === "no" ? "mnd" : "mo"}</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-start gap-4 lg:items-end">
                <div className="text-left lg:text-right">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.recommendation.youSave}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(bestOffer.monthlySavings).toLocaleString("nb-NO")} kr/{language === "no" ? "mnd" : "mo"}
                  </p>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                    = {bestOffer.yearlySavings.toLocaleString("nb-NO")} kr/{language === "no" ? "år" : "year"}
                  </p>
                </div>
                <Link
                  href="/dashboard/strom/sammenlign"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                >
                  {t.recommendation.seeOffers}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : !hasContract ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 px-6 py-3 dark:from-zinc-700 dark:to-zinc-600">
            <p className="font-medium text-white">
              🚀 {t.onboarding.title}
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                  1
                </div>
                <div>
                  <h4 className="font-medium dark:text-zinc-100">{t.onboarding.step1Title}</h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {t.onboarding.step1Desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-400 dark:bg-zinc-800">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-zinc-400 dark:text-zinc-500">{t.onboarding.step2Title}</h4>
                  <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
                    {t.onboarding.step2Desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-400 dark:bg-zinc-800">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-zinc-400 dark:text-zinc-500">{t.onboarding.step3Title}</h4>
                  <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-600">
                    {t.onboarding.step3Desc}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href="/dashboard/strom"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t.onboarding.startNow}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                {t.recommendation.goodDealTitle}
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {t.recommendation.goodDealDesc}
              </p>
            </div>
            <Link
              href="/dashboard/strom/sammenlign"
              className="ml-auto rounded-xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              {t.recommendation.seeAllOffers}
            </Link>
          </div>
        </div>
      )}

      {/* Spot Price Chart */}
      {spotPrices && spotPrices.prices && spotPrices.prices.length > 0 && (
        <div className="mb-8">
          <SpotPriceChart 
            initialPrices={spotPrices.prices}
            initialAverage={spotPrices.average}
            priceAreaName={PRICE_AREA_NAMES[priceArea]}
            priceArea={priceArea}
          />
        </div>
      )}

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold dark:text-zinc-100">
          {t.services.title}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Electricity - Active */}
          <Link
            href="/dashboard/strom"
            className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl transition-transform group-hover:scale-110 dark:bg-amber-900/40">
                ⚡
              </div>
              {electricityContract && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  {t.services.active}
                </span>
              )}
            </div>
            <h3 className="mt-4 font-semibold dark:text-zinc-100">{t.services.electricity}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t.services.electricityDesc}
            </p>
            {electricityContract && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                {electricityContract.provider_name || (language === "no" ? "Avtale registrert" : "Contract registered")}
              </p>
            )}
          </Link>

          {/* Mobile - Coming Soon */}
          <div className="cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-50 p-5 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-2xl dark:bg-zinc-800">
                📱
              </div>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                {t.services.comingSoon}
              </span>
            </div>
            <h3 className="mt-4 font-semibold dark:text-zinc-100">{t.services.mobile}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t.services.mobileDesc}
            </p>
          </div>

          {/* Broadband - Coming Soon */}
          <div className="cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-50 p-5 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-2xl dark:bg-zinc-800">
                🌐
              </div>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                {t.services.comingSoon}
              </span>
            </div>
            <h3 className="mt-4 font-semibold dark:text-zinc-100">{t.services.broadband}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t.services.broadbandDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
          💡 {t.footer.info}{" "}
          <a href="https://hvakosterstrommen.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
            {t.footer.source}
          </a>
          {" "}{t.footer.note}
        </p>
      </div>
    </div>
  );
}
