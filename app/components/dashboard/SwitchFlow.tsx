"use client";

import { useState } from "react";
import type { Offer } from "@/lib/connectors/types";

interface SwitchFlowProps {
  offer: Offer;
  currentCost: number;
  monthlySavings: number;
  yearlySavings: number;
  affiliateUrl?: string;
}

type Step = "details" | "terms" | "confirm" | "success";

const PRICE_TYPE_LABELS = {
  spot: "Spotpris",
  fixed: "Fastpris",
  variable: "Variabel",
};

export default function SwitchFlow({
  offer,
  currentCost,
  monthlySavings,
  yearlySavings,
  affiliateUrl,
}: SwitchFlowProps) {
  const [step, setStep] = useState<Step>("details");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProceed = () => {
    if (step === "details") {
      setStep("terms");
    } else if (step === "terms" && acceptedTerms && acceptedPrivacy) {
      setStep("confirm");
    }
  };

  const handleSwitch = async () => {
    setLoading(true);
    
    // In production, this would:
    // 1. Create a switch record in the database
    // 2. Track the affiliate click
    // 3. Redirect to the affiliate URL or show confirmation
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (affiliateUrl) {
      // Open affiliate link in new tab
      window.open(affiliateUrl, "_blank");
    }
    
    setStep("success");
    setLoading(false);
  };

  if (step === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg
            className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold dark:text-zinc-100">Flott!</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {affiliateUrl
            ? `Vi har åpnet ${offer.providerName} i et nytt vindu. Fullfør registreringen der.`
            : `Du har startet byttet til ${offer.providerName}. De vil kontakte deg for å fullføre prosessen.`}
        </p>
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Forventet besparelse: <strong>{yearlySavings.toLocaleString("nb-NO")} kr/år</strong>
          </p>
        </div>
        <a
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Tilbake til oversikten
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {(["details", "terms", "confirm"] as const).map((s, i) => {
          const stepIndex = ["details", "terms", "confirm"].indexOf(step);
          const isCompleted = stepIndex > i;
          const isCurrent = step === s;
          
          return (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isCurrent
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              {i < 2 && (
                <div className={`h-0.5 w-8 ${
                  isCompleted
                    ? "bg-emerald-400"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === "details" && (
        <div>
          <h2 className="text-lg font-semibold dark:text-zinc-100">Bekreft detaljer</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Se over tilbudet før du fortsetter
          </p>

          <div className="mt-6 space-y-4">
            {/* Savings Summary */}
            {monthlySavings > 0 && (
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">
                    Din besparelse
                  </span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {monthlySavings.toLocaleString("nb-NO")} kr/mnd
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-500">
                  Det er {yearlySavings.toLocaleString("nb-NO")} kr per år
                </p>
              </div>
            )}

            {/* Offer Details */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Leverandør</span>
                  <span className="font-medium dark:text-zinc-100">{offer.providerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Tilbud</span>
                  <span className="font-medium dark:text-zinc-100">{offer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Type</span>
                  <span className="font-medium dark:text-zinc-100">
                    {PRICE_TYPE_LABELS[offer.priceType]}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Månedlig avgift</span>
                  <span className="font-medium dark:text-zinc-100">{offer.monthlyFee} kr</span>
                </div>
                {offer.markupOreKwh !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Påslag</span>
                    <span className="font-medium dark:text-zinc-100">{offer.markupOreKwh} øre/kWh</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Binding</span>
                  <span className="font-medium dark:text-zinc-100">
                    {offer.bindingMonths === 0 ? "Ingen" : `${offer.bindingMonths} måneder`}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium dark:text-zinc-300">
                      Estimert månedskostnad
                    </span>
                    <span className="text-lg font-semibold dark:text-zinc-100">
                      {offer.estimatedMonthlyCost?.toLocaleString("nb-NO")} kr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Fortsett
          </button>
        </div>
      )}

      {step === "terms" && (
        <div>
          <h2 className="text-lg font-semibold dark:text-zinc-100">Vilkår og samtykke</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Les og godkjenn vilkårene for å fortsette
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900"
              />
              <div>
                <p className="text-sm font-medium dark:text-zinc-100">
                  Jeg godtar vilkårene
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Jeg har lest og godkjenner <a href="/vilkar" className="underline" target="_blank">vilkårene</a> for SmartBytt.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900"
              />
              <div>
                <p className="text-sm font-medium dark:text-zinc-100">
                  Jeg godtar personvernerklæringen
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Jeg forstår at mine data deles med {offer.providerName} for å fullføre byttet.
                  Les <a href="/personvern" className="underline" target="_blank">personvernerklæringen</a>.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("details")}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Tilbake
            </button>
            <button
              onClick={handleProceed}
              disabled={!acceptedTerms || !acceptedPrivacy}
              className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Fortsett
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div>
          <h2 className="text-lg font-semibold dark:text-zinc-100">Bekreft bytte</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Klar til å bytte? Du blir sendt til {offer.providerName} for å fullføre.
          </p>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Du bytter til
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-800 dark:text-emerald-300">
              {offer.providerName}
            </p>
            {monthlySavings > 0 && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500">
                og sparer {yearlySavings.toLocaleString("nb-NO")} kr/år
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("terms")}
              className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Tilbake
            </button>
            <button
              onClick={handleSwitch}
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Starter bytte..." : "Bekreft og bytt"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
