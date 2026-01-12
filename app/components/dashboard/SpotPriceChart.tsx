"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HourlyPrice {
  NOK_per_kWh: number;
  time_start: string;
  time_end: string;
}

interface DailyPrices {
  prices: HourlyPrice[];
  average: number;
  min: number;
  max: number;
  date: string;
}

interface SpotPriceChartProps {
  initialPrices: HourlyPrice[];
  initialAverage: number;
  priceAreaName: string;
  priceArea: string;
}

type DateOption = "yesterday" | "today" | "tomorrow";

// Norgespris - statlig ordning med fast pris 50 øre/kWh inkl. mva
const NORGESPRIS_ORE = 50;

export default function SpotPriceChart({ 
  initialPrices, 
  initialAverage, 
  priceAreaName,
  priceArea
}: SpotPriceChartProps) {
  const [selectedDate, setSelectedDate] = useState<DateOption>("today");
  const [prices, setPrices] = useState<HourlyPrice[]>(initialPrices);
  const [average, setAverage] = useState(initialAverage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomorrowAvailable, setTomorrowAvailable] = useState(true);
  
  const currentHour = new Date().getHours();

  // Fetch prices for a specific date
  const fetchPricesForDate = async (dateOption: DateOption) => {
    const today = new Date();
    let targetDate = new Date(today);
    
    if (dateOption === "yesterday") {
      targetDate.setDate(today.getDate() - 1);
    } else if (dateOption === "tomorrow") {
      targetDate.setDate(today.getDate() + 1);
    }
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    
    const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (dateOption === "tomorrow") {
          setTomorrowAvailable(false);
          setError("Morgendagens priser er ikke publisert ennå (kommer ca. kl 13:00)");
        } else {
          setError("Kunne ikke hente priser");
        }
        return;
      }
      
      const data: HourlyPrice[] = await response.json();
      
      if (!data || data.length === 0) {
        setError("Ingen prisdata tilgjengelig");
        return;
      }
      
      // Calculate average
      const avg = data.reduce((sum, p) => sum + p.NOK_per_kWh, 0) / data.length;
      
      setPrices(data);
      setAverage(avg);
      if (dateOption === "tomorrow") {
        setTomorrowAvailable(true);
      }
    } catch (err) {
      setError("Feil ved henting av priser");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (dateOption: DateOption) => {
    setSelectedDate(dateOption);
    
    if (dateOption === "today") {
      // Use initial data for today
      setPrices(initialPrices);
      setAverage(initialAverage);
      setError(null);
    } else {
      fetchPricesForDate(dateOption);
    }
  };

  // Check if tomorrow's prices are available on mount
  useEffect(() => {
    const checkTomorrow = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getDate()).padStart(2, "0");
      
      try {
        const response = await fetch(
          `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`,
          { method: "HEAD" }
        );
        setTomorrowAvailable(response.ok);
      } catch {
        setTomorrowAvailable(false);
      }
    };
    
    checkTomorrow();
  }, [priceArea]);

  // Transform data for the chart
  const chartData = prices.map((price) => {
    const hour = new Date(price.time_start).getHours();
    const priceOre = Math.round(price.NOK_per_kWh * 100);
    
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      hourNum: hour,
      price: priceOre,
      isCurrent: selectedDate === "today" && hour === currentHour,
    };
  });

  // Find min and max for better visualization
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 100;
  const avgOre = Math.round(average * 100);

  // Get date label
  const getDateLabel = (option: DateOption) => {
    const today = new Date();
    const targetDate = new Date(today);
    
    if (option === "yesterday") {
      targetDate.setDate(today.getDate() - 1);
    } else if (option === "tomorrow") {
      targetDate.setDate(today.getDate() + 1);
    }
    
    return targetDate.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.hour === label);
      const isCurrent = data?.isCurrent;
      const price = payload[0].value;
      const isAboveNorgespris = price > NORGESPRIS_ORE;
      const diff = Math.abs(price - NORGESPRIS_ORE);
      
      return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label} {isCurrent && "(nå)"}
          </p>
          <p className={`text-lg font-bold ${isAboveNorgespris ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {price} øre/kWh
          </p>
          <p className={`text-xs ${isAboveNorgespris ? "text-red-500" : "text-emerald-500"}`}>
            {isAboveNorgespris ? `+${diff} øre over` : price < NORGESPRIS_ORE ? `${diff} øre under` : "Lik"} Norgespris
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header with date selector */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold sm:text-base dark:text-zinc-100">Strømpris i dag</h3>
          <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            {priceAreaName} • Se når strømmen er billigst
          </p>
        </div>
        
        {/* Date tabs - scrollable on mobile */}
        <div className="flex w-full overflow-x-auto rounded-lg border border-zinc-200 p-1 sm:w-auto dark:border-zinc-700">
          <button
            onClick={() => handleDateChange("yesterday")}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDate === "yesterday"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            I går
          </button>
          <button
            onClick={() => handleDateChange("today")}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDate === "today"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            I dag
          </button>
          <button
            onClick={() => handleDateChange("tomorrow")}
            disabled={!tomorrowAvailable}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDate === "tomorrow"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : tomorrowAvailable
                  ? "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  : "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
            }`}
          >
            I morgen {!tomorrowAvailable && "🕐"}
          </button>
        </div>
      </div>

      {/* Legend - simplified */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-amber-500"></span>
          <span className="text-zinc-600 dark:text-zinc-400">Spotpris</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-blue-500"></span>
          <span className="text-zinc-600 dark:text-zinc-400">Norgespris (50 øre)</span>
        </div>
        <div className="ml-auto flex gap-3 text-zinc-500 dark:text-zinc-400">
          <span>Lavest: <strong className="text-emerald-600 dark:text-emerald-400">{minPrice}</strong></span>
          <span>Høyest: <strong className="text-red-600 dark:text-red-400">{maxPrice}</strong></span>
        </div>
      </div>
      
      {/* Chart - shorter on mobile */}
      <div className="relative h-[160px] w-full sm:h-[200px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Henter priser...
            </div>
          </div>
        )}
        
        {error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center px-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
              {selectedDate === "tomorrow" && !tomorrowAvailable && (
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Nord Pool publiserer morgendagens priser ca. kl 13:00
                </p>
              )}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 9, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                domain={[Math.floor(minPrice * 0.9), Math.ceil(maxPrice * 1.1)]}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Norgespris reference line - fixed at 50 øre/kWh */}
              <ReferenceLine 
                y={50} 
                stroke="#3b82f6" 
                strokeDasharray="6 3" 
                strokeOpacity={0.8}
                label={{ 
                  value: "Norgespris", 
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#3b82f6"
                }}
              />
              {/* Local average reference line */}
              <ReferenceLine 
                y={avgOre} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                strokeOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={payload.hour}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#f59e0b"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle key={payload.hour} cx={cx} cy={cy} r={0} />;
                }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Current hour highlight - only show for today */}
      {selectedDate === "today" && !error && (() => {
        const currentPrice = chartData.find(d => d.isCurrent)?.price || avgOre;
        const isAboveNorgespris = currentPrice > NORGESPRIS_ORE;
        const priceDiff = Math.abs(currentPrice - NORGESPRIS_ORE);
        const cheapestHour = chartData.reduce((min, d) => d.price < min.price ? d : min, chartData[0]);
        const hoursUntilCheapest = (cheapestHour.hourNum - currentHour + 24) % 24;
        
        return (
          <div className="mt-3 space-y-3 sm:mt-4">
            {/* Current price with context */}
            <div className={`flex flex-col gap-2 rounded-xl px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 ${
              isAboveNorgespris 
                ? "bg-red-50 dark:bg-red-950/30" 
                : "bg-emerald-50 dark:bg-emerald-950/30"
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  isAboveNorgespris 
                    ? "bg-red-100 dark:bg-red-900/50" 
                    : "bg-emerald-100 dark:bg-emerald-900/50"
                }`}>
                  <span className="text-base sm:text-lg">{isAboveNorgespris ? "📈" : "✅"}</span>
                </div>
                <div>
                  <p className={`text-xs font-medium sm:text-sm ${
                    isAboveNorgespris 
                      ? "text-red-900 dark:text-red-100" 
                      : "text-emerald-900 dark:text-emerald-100"
                  }`}>
                    {isAboveNorgespris 
                      ? `${priceDiff} øre dyrere enn Norgespris` 
                      : currentPrice < NORGESPRIS_ORE 
                        ? `${priceDiff} øre billigere enn Norgespris!`
                        : "Lik Norgespris"}
                  </p>
                  <p className={`text-xs ${
                    isAboveNorgespris 
                      ? "text-red-700 dark:text-red-400" 
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {isAboveNorgespris 
                      ? "Vurder å utsette strømbruk hvis mulig" 
                      : "Gunstig tidspunkt å bruke strøm"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold sm:text-2xl ${
                  isAboveNorgespris 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {currentPrice} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  kl {currentHour.toString().padStart(2, "0")}:00
                </p>
              </div>
            </div>

            {/* Tip: Best time to use electricity */}
            {isAboveNorgespris && hoursUntilCheapest > 0 && hoursUntilCheapest < 12 && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950/30">
                <span>💡</span>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Tips:</strong> Billigst kl {cheapestHour.hour} ({cheapestHour.price} øre) – om {hoursUntilCheapest} time{hoursUntilCheapest > 1 ? "r" : ""}
                </span>
              </div>
            )}

            {/* Norgespris explanation */}
            <details className="group rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>ℹ️ Hva er Norgespris?</span>
                <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                <p><strong>Norgespris</strong> er en statlig støtteordning som gir deg fast strømpris på <strong>50 øre/kWh</strong> (inkl. mva).</p>
                <p className="mt-1">Når spotprisen er over 50 øre, sparer du penger med Norgespris. Når den er under, er spotpris billigere.</p>
                <p className="mt-1 text-zinc-500 dark:text-zinc-500">Ordningen gjelder bolig og hytte med forbrukstak.</p>
              </div>
            </details>
          </div>
        );
      })()}

      {/* Tomorrow info */}
      {selectedDate === "tomorrow" && !error && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-blue-50 px-3 py-2.5 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900/50">
              <span className="text-base sm:text-lg">📅</span>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-900 sm:text-sm dark:text-blue-100">
                Morgendagens priser
              </p>
              <p className="hidden text-xs text-blue-700 sm:block dark:text-blue-400">
                Publisert i dag ca. kl 13:00
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
            <p className="text-base font-bold text-blue-600 sm:text-lg dark:text-blue-400">
              {avgOre} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-500">
              ({minPrice}–{maxPrice})
            </p>
          </div>
        </div>
      )}

      {/* Yesterday info */}
      {selectedDate === "yesterday" && !error && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-zinc-100 px-3 py-2.5 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 dark:bg-zinc-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 sm:h-10 sm:w-10 dark:bg-zinc-700">
              <span className="text-base sm:text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-700 sm:text-sm dark:text-zinc-200">
                Gårsdagens priser
              </p>
              <p className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">
                Historiske data
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
            <p className="text-base font-bold text-zinc-700 sm:text-lg dark:text-zinc-200">
              {avgOre} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ({minPrice}–{maxPrice})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
