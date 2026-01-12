interface SavingsCardProps {
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  yearlySavings: number;
  providerName: string;
}

export default function SavingsCard({
  currentCost,
  recommendedCost,
  monthlySavings,
  yearlySavings,
  providerName,
}: SavingsCardProps) {
  const savingsPercentage = Math.round((monthlySavings / currentCost) * 100);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/30 dark:to-zinc-900">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Potensielt sparepotensial
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {monthlySavings.toLocaleString("nb-NO")} kr
              </span>
              <span className="text-lg text-emerald-600/70 dark:text-emerald-400/70">
                per måned
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-600/80 dark:text-emerald-400/80">
              Det er {yearlySavings.toLocaleString("nb-NO")} kr per år ({savingsPercentage}% lavere)
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <span className="text-3xl">💰</span>
          </div>
        </div>

        {/* Comparison Bar */}
        <div className="mt-6 space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Din nåværende kostnad</span>
              <span className="font-medium dark:text-zinc-300">{currentCost.toLocaleString("nb-NO")} kr/mnd</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500" style={{ width: "100%" }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Med {providerName}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {recommendedCost.toLocaleString("nb-NO")} kr/mnd
              </span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(recommendedCost / currentCost) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          <strong>Tips:</strong> Ved å bytte til {providerName} kan du spare hele{" "}
          {yearlySavings.toLocaleString("nb-NO")} kr i året. Ingen binding og enkelt å bytte!
        </p>
      </div>
    </div>
  );
}
