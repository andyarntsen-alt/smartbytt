import Link from "next/link";
import type { Offer, Urgency } from "@/lib/connectors/types";

interface OfferCardProps {
  offer: Offer;
  savings?: number;
  reasons?: string[];
  urgency?: Urgency;
  isRecommended?: boolean;
}

const URGENCY_STYLES = {
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const PRICE_TYPE_LABELS = {
  spot: "Spotpris",
  fixed: "Fastpris",
  variable: "Variabel",
};

export default function OfferCard({
  offer,
  savings,
  reasons,
  urgency,
  isRecommended,
}: OfferCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-shadow hover:shadow-md ${
        isRecommended
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/20 dark:to-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold dark:text-zinc-100">{offer.providerName}</h3>
            {offer.isPartner && (
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                Partner
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{offer.name}</p>
        </div>
        {urgency && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${URGENCY_STYLES[urgency]}`}>
            {urgency === "high" ? "Anbefalt" : urgency === "medium" ? "God" : "OK"}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold dark:text-zinc-100">
            {offer.estimatedMonthlyCost?.toLocaleString("nb-NO") || "–"}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">kr/mnd</span>
        </div>
        {savings && savings > 0 && (
          <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Spar {savings.toLocaleString("nb-NO")} kr/mnd
          </p>
        )}
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Type</span>
          <span className="font-medium dark:text-zinc-300">
            {PRICE_TYPE_LABELS[offer.priceType]}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Månedlig avgift</span>
          <span className="font-medium dark:text-zinc-300">{offer.monthlyFee} kr</span>
        </div>
        {offer.markupOreKwh !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Påslag</span>
            <span className="font-medium dark:text-zinc-300">{offer.markupOreKwh} øre/kWh</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Binding</span>
          <span className="font-medium dark:text-zinc-300">
            {offer.bindingMonths === 0 ? "Ingen" : `${offer.bindingMonths} mnd`}
          </span>
        </div>
      </div>

      {/* Reasons */}
      {reasons && reasons.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {reasons.slice(0, 3).map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <svg
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
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
              {reason}
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <Link
        href={`/dashboard/strom/bytt/${offer.id}`}
        className={`mt-4 block w-full rounded-xl py-2.5 text-center text-sm font-medium ${
          isRecommended
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        }`}
      >
        Bytt til {offer.providerName}
      </Link>
    </div>
  );
}
