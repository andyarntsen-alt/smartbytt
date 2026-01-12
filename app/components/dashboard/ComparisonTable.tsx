import type { Offer } from "@/lib/connectors/types";
import Link from "next/link";

interface ComparisonTableProps {
  offers: Offer[];
  currentCost: number;
}

const PRICE_TYPE_LABELS = {
  spot: "Spotpris",
  fixed: "Fastpris",
  variable: "Variabel",
};

export default function ComparisonTable({ offers, currentCost }: ComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Leverandør
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tilbud
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Mnd. avgift
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Påslag
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Est. kostnad
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Besparelse
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Binding
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {offers.map((offer, index) => {
              const savings =
                currentCost > 0 && offer.estimatedMonthlyCost
                  ? currentCost - offer.estimatedMonthlyCost
                  : 0;
              const isBest = index === 0;

              return (
                <tr
                  key={offer.id}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    isBest ? "bg-emerald-50/50 dark:bg-emerald-950/10" : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium dark:text-zinc-100">
                        {offer.providerName}
                      </span>
                      {offer.isPartner && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                          Partner
                        </span>
                      )}
                      {isBest && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Anbefalt
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {offer.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {PRICE_TYPE_LABELS[offer.priceType]}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm dark:text-zinc-300">
                    {offer.monthlyFee} kr
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm dark:text-zinc-300">
                    {offer.markupOreKwh !== undefined ? `${offer.markupOreKwh} øre` : "–"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold dark:text-zinc-100">
                    {offer.estimatedMonthlyCost?.toLocaleString("nb-NO") || "–"} kr
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {savings > 0 ? (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        −{savings.toLocaleString("nb-NO")} kr
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">–</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {offer.bindingMonths === 0 ? "Ingen" : `${offer.bindingMonths} mnd`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/strom/bytt/${offer.id}`}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Bytt
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
