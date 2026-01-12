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
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface HourlyPrice {
  NOK_per_kWh: number;
  time_start: string;
  time_end: string;
}

interface SpotPriceChartProps {
  initialPrices: HourlyPrice[];
  initialAverage: number;
  priceAreaName: string;
  priceArea: string;
}

type DateOption = "yesterday" | "today" | "tomorrow";

// Constants for Norwegian electricity pricing (updated January 2026)
const STROMSTOTTE_THRESHOLD_EKS_MVA = 77; // øre/kWh eks mva
const STROMSTOTTE_THRESHOLD_INKL_MVA = 96; // øre inkl mva
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

  // NO4 (Nord-Norge) has no VAT
  const isNordNorge = priceArea === "NO4";
  const supportThreshold = isNordNorge ? STROMSTOTTE_THRESHOLD_EKS_MVA : STROMSTOTTE_THRESHOLD_INKL_MVA;

  // Fetch prices for a specific date
  const fetchPricesForDate = async (dateOption: DateOption) => {
    const today = new Date();
    const targetDate = new Date(today);
    
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
          setError("Morgendagens priser kommer ca. kl 13:00");
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
      
      const avg = data.reduce((sum, p) => sum + p.NOK_per_kWh, 0) / data.length;
      setPrices(data);
      setAverage(avg);
      if (dateOption === "tomorrow") setTomorrowAvailable(true);
    } catch (err) {
      setError("Feil ved henting av priser");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dateOption: DateOption) => {
    setSelectedDate(dateOption);
    if (dateOption === "today") {
      setPrices(initialPrices);
      setAverage(initialAverage);
      setError(null);
    } else {
      fetchPricesForDate(dateOption);
    }
  };

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

  // Calculate price after strømstøtte
  const calculatePriceAfterSupport = (priceOre: number): number => {
    if (priceOre <= supportThreshold) return priceOre;
    const excess = priceOre - supportThreshold;
    return Math.round(priceOre - excess * STROMSTOTTE_COVERAGE);
  };

  // Transform data
  const chartData = prices.map((price) => {
    const hour = new Date(price.time_start).getHours();
    const spotPrice = Math.round(price.NOK_per_kWh * 100);
    const youPay = calculatePriceAfterSupport(spotPrice);
    const support = spotPrice - youPay;
    
    return {
      hour: `${hour.toString().padStart(2, "0")}`,
      hourNum: hour,
      spotPrice,
      youPay,
      support,
      isCurrent: selectedDate === "today" && hour === currentHour,
    };
  });

  // Stats
  const currentData = chartData.find(d => d.isCurrent);
  const minYouPay = Math.min(...chartData.map(d => d.youPay));
  const maxYouPay = Math.max(...chartData.map(d => d.youPay));
  const avgYouPay = Math.round(chartData.reduce((sum, d) => sum + d.youPay, 0) / chartData.length);
  const totalSupport = chartData.reduce((sum, d) => sum + d.support, 0);
  const cheapestHour = chartData.reduce((min, d) => d.youPay < min.youPay ? d : min, chartData[0]);
  const mostExpensiveHour = chartData.reduce((max, d) => d.youPay > max.youPay ? d : max, chartData[0]);

  // Color based on price
  const getBarColor = (youPay: number, isCurrent: boolean) => {
    if (isCurrent) return "#f59e0b"; // amber for current
    if (youPay <= 60) return "#22c55e"; // green for cheap
    if (youPay >= 120) return "#ef4444"; // red for expensive
    return "#a1a1aa"; // gray for normal
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCheap = data.youPay <= 60;
      const isExpensive = data.youPay >= 120;
      
      return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Kl {data.hour}:00 {data.isCurrent && <span className="text-amber-500">• Nå</span>}
          </p>
          <p className={`text-xl font-bold ${isCheap ? "text-emerald-600" : isExpensive ? "text-red-600" : "text-zinc-900 dark:text-zinc-100"}`}>
            {data.youPay} øre
          </p>
          {data.support > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Strømstøtte: -{data.support} øre
            </p>
          )}
          <p className="text-xs text-zinc-400 mt-1">
            Spotpris: {data.spotPrice} øre
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold sm:text-base dark:text-zinc-100">
            Strømpris time for time
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {priceAreaName} • Det du faktisk betaler etter strømstøtte
          </p>
        </div>
        
        {/* Date selector */}
        <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(["yesterday", "today", "tomorrow"] as DateOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => handleDateChange(opt)}
              disabled={opt === "tomorrow" && !tomorrowAvailable}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDate === opt
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : opt === "tomorrow" && !tomorrowAvailable
                    ? "text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              {opt === "yesterday" ? "I går" : opt === "today" ? "I dag" : "I morgen"}
            </button>
          ))}
        </div>
      </div>

      {/* Quick summary for today */}
      {selectedDate === "today" && currentData && !error && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">Nå (kl {currentHour})</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{currentData.youPay}<span className="text-sm font-normal"> øre</span></p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Billigst (kl {cheapestHour.hour})</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{minYouPay}<span className="text-sm font-normal"> øre</span></p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-xs text-red-700 dark:text-red-400">Dyrest (kl {mostExpensiveHour.hour})</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{maxYouPay}<span className="text-sm font-normal"> øre</span></p>
          </div>
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Snitt i dag</p>
            <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">{avgYouPay}<span className="text-sm font-normal"> øre</span></p>
          </div>
        </div>
      )}

      {/* Strømstøtte badge if significant */}
      {totalSupport > 50 && !error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
          <span className="text-lg">💰</span>
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Du sparer ca. {Math.round(totalSupport / 100)} kr i strømstøtte i dag
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Staten dekker 90% av prisen over {supportThreshold} øre
            </p>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="relative h-[180px] w-full sm:h-[220px]">
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                domain={[0, Math.ceil(maxYouPay * 1.2)]}
                tickFormatter={(v) => `${v}`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <ReferenceLine 
                y={supportThreshold} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ value: `Støttegrense ${supportThreshold} øre`, position: 'right', fontSize: 9, fill: '#10b981' }}
              />
              <Bar dataKey="youPay" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.youPay, entry.isCurrent)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500"></span>
          <span>Billig (&lt;60 øre)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-zinc-400"></span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-500"></span>
          <span>Dyrt (&gt;120 øre)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500"></span>
          <span>Nå</span>
        </div>
      </div>

      {/* Tips for today */}
      {selectedDate === "today" && currentData && !error && (
        <div className="mt-4 space-y-2">
          {currentData.youPay > cheapestHour.youPay + 20 && cheapestHour.hourNum > currentHour && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950/30">
              <span>💡</span>
              <span className="text-blue-800 dark:text-blue-300">
                <strong>Tips:</strong> Vent til kl {cheapestHour.hour}:00 – da er strømmen {currentData.youPay - cheapestHour.youPay} øre billigere
              </span>
            </div>
          )}
        </div>
      )}

      {/* Collapsible info */}
      <details className="mt-4 group">
        <summary className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
          <span>ℹ️</span>
          <span>Slik fungerer strømstøtten</span>
          <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <p className="mb-2">Staten dekker <strong>90%</strong> av strømprisen over {STROMSTOTTE_THRESHOLD_EKS_MVA} øre/kWh (eks. mva) = {STROMSTOTTE_THRESHOLD_INKL_MVA} øre inkl. mva.</p>
          <p className="text-zinc-500">
            <strong>Eksempel:</strong> Spot 150 øre → Du betaler {supportThreshold} + 10% av ({150} - {supportThreshold}) = {supportThreshold + Math.round((150 - supportThreshold) * 0.1)} øre
          </p>
          <p className="mt-2 text-zinc-400">
            Alternativt kan du velge <strong>Norgespris</strong> (fast 50 øre/kWh) via Elhub.
          </p>
        </div>
      </details>
    </div>
  );
}
