import { createClient } from "@supabase/supabase-js";

// Check if Supabase is configured (support both variable naming conventions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseKey;

const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

async function getStats() {
  // Return empty stats if Supabase is not configured
  if (!supabase) {
    return {
      totalWaitlist: 0,
      todaySignups: 0,
      weekSignups: 0,
      sourceBreakdown: {},
      dailySignups: {},
      isConfigured: false,
    };
  }

  // Get total waitlist count
  const { count: totalWaitlist } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  // Get signups today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todaySignups } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Get signups this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weekSignups } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Get signups by source
  const { data: sourceData } = await supabase
    .from("waitlist")
    .select("source");
  
  const sourceBreakdown: Record<string, number> = {};
  sourceData?.forEach((item) => {
    sourceBreakdown[item.source] = (sourceBreakdown[item.source] || 0) + 1;
  });

  // Get daily signups for the past 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const { data: dailyData } = await supabase
    .from("waitlist")
    .select("created_at")
    .gte("created_at", twoWeeksAgo.toISOString())
    .order("created_at", { ascending: true });

  const dailySignups: Record<string, number> = {};
  dailyData?.forEach((item) => {
    const date = new Date(item.created_at).toISOString().split("T")[0];
    dailySignups[date] = (dailySignups[date] || 0) + 1;
  });

  return {
    totalWaitlist: totalWaitlist || 0,
    todaySignups: todaySignups || 0,
    weekSignups: weekSignups || 0,
    sourceBreakdown,
    dailySignups,
    isConfigured: true,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  // Show setup message if Supabase is not configured
  if (!stats.isConfigured) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Oversikt over SmartBytt-statistikk
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
          <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
            ⚠️ Supabase er ikke konfigurert
          </h2>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            For å se statistikk trenger du å konfigurere Supabase. Legg til følgende i din <code className="rounded bg-amber-200 px-1 dark:bg-amber-900">.env.local</code>:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100">
{`NEXT_PUBLIC_SUPABASE_URL=https://din-prosjekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
SUPABASE_SERVICE_ROLE_KEY=din-service-role-key`}
          </pre>
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            Du finner disse verdiene i Supabase Dashboard → Settings → API
          </p>
        </div>

        {/* Quick actions that work without Supabase */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a
            href="/"
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Se nettstedet
            </p>
            <p className="mt-1 text-lg font-semibold dark:text-zinc-100">
              Gå til landing page →
            </p>
          </a>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Konfigurer database
            </p>
            <p className="mt-1 text-lg font-semibold dark:text-zinc-100">
              Åpne Supabase Dashboard →
            </p>
          </a>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total påmeldte",
      value: stats.totalWaitlist,
      icon: "👥",
    },
    {
      title: "Påmeldt i dag",
      value: stats.todaySignups,
      icon: "📅",
    },
    {
      title: "Siste 7 dager",
      value: stats.weekSignups,
      icon: "📈",
    },
  ];

  // Get last 14 days for chart
  const chartDays: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    chartDays.push({
      date: dateStr,
      count: stats.dailySignups[dateStr] || 0,
    });
  }

  const maxCount = Math.max(...chartDays.map((d) => d.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Oversikt over SmartBytt-statistikk
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.title}
              </p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold dark:text-zinc-100">
              {stat.value.toLocaleString("nb-NO")}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold dark:text-zinc-100">
          Påmeldinger siste 14 dager
        </h2>
        <div className="mt-6 flex h-48 items-end gap-2">
          {chartDays.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-emerald-500 transition-all dark:bg-emerald-600"
                style={{
                  height: `${(day.count / maxCount) * 100}%`,
                  minHeight: day.count > 0 ? "8px" : "2px",
                }}
                title={`${day.date}: ${day.count} påmeldinger`}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Dato (dag i måneden)
        </p>
      </div>

      {/* Source Breakdown */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold dark:text-zinc-100">
          Kilder
        </h2>
        <div className="mt-4 space-y-3">
          {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {source}
              </span>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-600"
                    style={{
                      width: `${(count / stats.totalWaitlist) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium dark:text-zinc-300">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
