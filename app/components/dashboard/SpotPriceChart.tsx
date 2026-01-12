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
  Line,
  ComposedChart,
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

// Constants for Norwegian electricity pricing
const MVA_RATE = 1.25; // 25% VAT
const STROMSTOTTE_THRESHOLD_EKS_MVA = 70; // øre/kWh eks mva
const STROMSTOTTE_THRESHOLD_INKL_MVA = Math.round(STROMSTOTTE_THRESHOLD_EKS_MVA * MVA_RATE); // 87.5 øre inkl mva
const STROMSTOTTE_COVERAGE = 0.90; // 90% coverage above threshold

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

  // Calculate price after strømstøtte (government support)
  // If price > 70 øre eks mva (87.5 øre inkl mva), government pays 90% of the excess
  const calculatePriceAfterSupport = (priceInklMva: number): number => {
    if (priceInklMva <= STROMSTOTTE_THRESHOLD_INKL_MVA) {
      return priceInklMva;
    }
    const excess = priceInklMva - STROMSTOTTE_THRESHOLD_INKL_MVA;
    const support = excess * STROMSTOTTE_COVERAGE;
    return Math.round(priceInklMva - support);
  };

  // Transform data for the chart - NOW WITH MVA (25%)
  const chartData = prices.map((price) => {
    const hour = new Date(price.time_start).getHours();
    const priceEksMva = Math.round(price.NOK_per_kWh * 100); // øre eks mva
    const priceInklMva = Math.round(priceEksMva * MVA_RATE); // øre inkl mva
    const priceAfterSupport = calculatePriceAfterSupport(priceInklMva);
    const hasSupport = priceInklMva > STROMSTOTTE_THRESHOLD_INKL_MVA;
    
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      hourNum: hour,
      price: priceInklMva, // Spot price WITH VAT
      priceAfterSupport, // What you actually pay after strømstøtte
      isCurrent: selectedDate === "today" && hour === currentHour,
      isExpensive: priceInklMva > STROMSTOTTE_THRESHOLD_INKL_MVA * 1.5, // Over 130 øre
      isCheap: priceInklMva < STROMSTOTTE_THRESHOLD_INKL_MVA * 0.7, // Under 60 øre
      hasSupport,
    };
  });

  // Find min and max for better visualization (using price with VAT)
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 100;
  const minPriceAfterSupport = chartData.length > 0 ? Math.min(...chartData.map(d => d.priceAfterSupport)) : 0;
  const maxPriceAfterSupport = chartData.length > 0 ? Math.max(...chartData.map(d => d.priceAfterSupport)) : 100;
  const avgOre = Math.round(average * 100 * MVA_RATE); // Average WITH VAT
  const avgAfterSupport = calculatePriceAfterSupport(avgOre);

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
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.hour === label);
      if (!data) return null;
      
      const isCurrent = data.isCurrent;
      const spotPrice = data.price;
      const afterSupport = data.priceAfterSupport;
      const hasSupport = data.hasSupport;
      const savings = spotPrice - afterSupport;
      
      return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label} {isCurrent && <span className="text-amber-600">(nå)</span>}
          </p>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Spot: <span className={spotPrice > 150 ? "text-red-500" : "text-zinc-700 dark:text-zinc-300"}>{spotPrice} øre</span>
            </p>
            <p className={`text-lg font-bold ${afterSupport < 80 ? "text-emerald-600 dark:text-emerald-400" : afterSupport > 120 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
              {afterSupport} øre/kWh
            </p>
            {hasSupport && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                💰 Strømstøtte: -{savings} øre
              </p>
            )}
          </div>
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
          <h3 className="text-sm font-semibold sm:text-base dark:text-zinc-100">Strømpris inkl. mva og strømstøtte</h3>
          <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            {priceAreaName} • Se hva du faktisk betaler
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

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-zinc-400"></span>
          <span className="text-zinc-600 dark:text-zinc-400">Spotpris inkl. mva</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-amber-500"></span>
          <span className="text-zinc-600 dark:text-zinc-400">Etter strømstøtte</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500"></span>
          <span className="text-zinc-600 dark:text-zinc-400">Støttegrense (87 øre)</span>
        </div>
        <div className="ml-auto flex gap-3 text-zinc-500 dark:text-zinc-400">
          <span>Du betaler: <strong className="text-emerald-600 dark:text-emerald-400">{minPriceAfterSupport}–{maxPriceAfterSupport}</strong> øre</span>
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
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="supportGradient" x1="0" y1="0" x2="0" y2="1">
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
                domain={[
                  Math.min(Math.floor(minPriceAfterSupport * 0.8), 20), 
                  Math.ceil(maxPrice * 1.1)
                ]}
                tickFormatter={(value) => `${value}`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Strømstøtte threshold - 87 øre inkl mva */}
              <ReferenceLine 
                y={STROMSTOTTE_THRESHOLD_INKL_MVA} 
                stroke="#10b981" 
                strokeDasharray="8 4" 
                strokeWidth={2}
                strokeOpacity={0.7}
              />
              {/* Spot price line (gray) */}
              <Line
                type="stepAfter"
                dataKey="price"
                stroke="#a1a1aa"
                strokeWidth={1.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isExpensive = payload.price > STROMSTOTTE_THRESHOLD_INKL_MVA * 1.3;
                  const isCheap = payload.price < STROMSTOTTE_THRESHOLD_INKL_MVA * 0.7;
                  
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={`spot-${payload.hour}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={isExpensive ? "#ef4444" : isCheap ? "#22c55e" : "#a1a1aa"}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={`spot-${payload.hour}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={isExpensive ? "#ef4444" : isCheap ? "#22c55e" : "#a1a1aa"}
                    />
                  );
                }}
                activeDot={{ r: 5, fill: "#71717a", stroke: "#fff", strokeWidth: 2 }}
              />
              {/* Price after support (amber) - what you actually pay */}
              <Area
                type="stepAfter"
                dataKey="priceAfterSupport"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#supportGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isCurrent) {
                    return (
                      <circle
                        key={`support-${payload.hour}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#f59e0b"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle key={`support-${payload.hour}`} cx={cx} cy={cy} r={0} />;
                }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Current hour highlight - only show for today */}
      {selectedDate === "today" && !error && (() => {
        const currentData = chartData.find(d => d.isCurrent);
        const spotPrice = currentData?.price || avgOre;
        const priceAfterSupport = currentData?.priceAfterSupport || avgAfterSupport;
        const hasSupport = currentData?.hasSupport || false;
        const savings = spotPrice - priceAfterSupport;
        
        const isExpensive = priceAfterSupport > 100;
        const isCheap = priceAfterSupport < 60;
        
        const cheapestHour = chartData.reduce((min, d) => d.priceAfterSupport < min.priceAfterSupport ? d : min, chartData[0]);
        const hoursUntilCheapest = (cheapestHour.hourNum - currentHour + 24) % 24;
        
        return (
          <div className="mt-3 space-y-3 sm:mt-4">
            {/* Current price with context */}
            <div className={`flex flex-col gap-2 rounded-xl px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 ${
              isExpensive 
                ? "bg-red-50 dark:bg-red-950/30" 
                : isCheap 
                  ? "bg-emerald-50 dark:bg-emerald-950/30"
                  : "bg-amber-50 dark:bg-amber-950/30"
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  isExpensive 
                    ? "bg-red-100 dark:bg-red-900/50" 
                    : isCheap
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : "bg-amber-100 dark:bg-amber-900/50"
                }`}>
                  <span className="text-base sm:text-lg">{isExpensive ? "📈" : isCheap ? "✅" : "⚡"}</span>
                </div>
                <div>
                  <p className={`text-xs font-medium sm:text-sm ${
                    isExpensive 
                      ? "text-red-900 dark:text-red-100" 
                      : isCheap
                        ? "text-emerald-900 dark:text-emerald-100"
                        : "text-amber-900 dark:text-amber-100"
                  }`}>
                    {isExpensive 
                      ? "Høy strømpris nå" 
                      : isCheap 
                        ? "Lav strømpris nå"
                        : "Normal strømpris"}
                  </p>
                  <p className={`text-xs ${
                    isExpensive 
                      ? "text-red-700 dark:text-red-400" 
                      : isCheap
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400"
                  }`}>
                    Spot: {spotPrice} øre {hasSupport && <span className="text-emerald-600 dark:text-emerald-400">• Støtte: -{savings} øre</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold sm:text-2xl ${
                  isExpensive 
                    ? "text-red-600 dark:text-red-400" 
                    : isCheap
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                }`}>
                  {priceAfterSupport} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  kl {currentHour.toString().padStart(2, "0")}:00 • inkl. mva
                </p>
              </div>
            </div>

            {/* Tip: Best time to use electricity */}
            {isExpensive && hoursUntilCheapest > 0 && hoursUntilCheapest < 12 && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950/30">
                <span>💡</span>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Tips:</strong> Billigst kl {cheapestHour.hour} ({cheapestHour.priceAfterSupport} øre) – om {hoursUntilCheapest} time{hoursUntilCheapest > 1 ? "r" : ""}
                </span>
              </div>
            )}

            {/* Strømstøtte explanation */}
            <details className="group rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>ℹ️ Hva er strømstøtten?</span>
                <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600 space-y-2 dark:border-zinc-700 dark:text-zinc-400">
                <p><strong>Strømstøtten</strong> er en statlig ordning der staten dekker <strong>90%</strong> av strømprisen over 70 øre/kWh (eks. mva).</p>
                
                <p><strong>Slik beregnes det:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-500">
                  <li>Grense: 70 øre eks. mva = {STROMSTOTTE_THRESHOLD_INKL_MVA} øre inkl. mva</li>
                  <li>Over grensen: Staten betaler 90% av overskytende</li>
                  <li>Under grensen: Du betaler full pris</li>
                </ul>

                <p className="pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <strong>Eksempel:</strong> Spot på 200 øre → Du betaler {STROMSTOTTE_THRESHOLD_INKL_MVA} + 10% av ({200} - {STROMSTOTTE_THRESHOLD_INKL_MVA}) = <strong>{STROMSTOTTE_THRESHOLD_INKL_MVA + Math.round((200 - STROMSTOTTE_THRESHOLD_INKL_MVA) * 0.1)} øre</strong>
                </p>

                <p className="text-zinc-400 dark:text-zinc-500">
                  Gjelder automatisk for alle husholdninger via nettleien.
                </p>
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
                Morgendagens priser (inkl. mva)
              </p>
              <p className="hidden text-xs text-blue-700 sm:block dark:text-blue-400">
                Spot: {minPrice}–{maxPrice} øre • Etter støtte: {minPriceAfterSupport}–{maxPriceAfterSupport} øre
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
            <p className="text-base font-bold text-blue-600 sm:text-lg dark:text-blue-400">
              ~{avgAfterSupport} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-500">
              etter strømstøtte
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
                Gårsdagens priser (inkl. mva)
              </p>
              <p className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">
                Spot: {minPrice}–{maxPrice} øre • Etter støtte: {minPriceAfterSupport}–{maxPriceAfterSupport} øre
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
            <p className="text-base font-bold text-zinc-700 sm:text-lg dark:text-zinc-200">
              ~{avgAfterSupport} <span className="text-xs font-normal sm:text-sm">øre/kWh</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              etter strømstøtte
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
