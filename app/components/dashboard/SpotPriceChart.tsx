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

interface SpotPriceChartProps {
  initialPrices: HourlyPrice[];
  initialAverage: number;
  priceAreaName: string;
  priceArea: string;
}

type DateOption = "yesterday" | "today" | "tomorrow";

// Constants for Norwegian electricity pricing (January 2026)
// API from hvakosterstrommen.no gives prices EXCLUDING VAT
// Strømstøtte threshold: 77 øre eks mva = 96.25 øre inkl mva
const MVA_RATE = 1.25; // 25% VAT
const STROMSTOTTE_THRESHOLD_EKS_MVA = 77; // øre/kWh for NO4 (no VAT)
const STROMSTOTTE_THRESHOLD_INKL_MVA = 96.25; // øre/kWh for other areas
const STROMSTOTTE_COVERAGE = 0.90; // 90% coverage above threshold
const NORGESPRIS = 50; // Fixed price alternative (50 øre inkl mva, 40 øre for NO4)

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
  const isNordNorge = priceArea === "NO4";
  const supportThreshold = isNordNorge ? STROMSTOTTE_THRESHOLD_EKS_MVA : STROMSTOTTE_THRESHOLD_INKL_MVA;

  // Fetch prices
  const fetchPricesForDate = async (dateOption: DateOption) => {
    const today = new Date();
    const targetDate = new Date(today);
    
    if (dateOption === "yesterday") targetDate.setDate(today.getDate() - 1);
    else if (dateOption === "tomorrow") targetDate.setDate(today.getDate() + 1);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`);
      
      if (!response.ok) {
        setError(dateOption === "tomorrow" ? "Kommer ca. kl 13:00" : "Kunne ikke hente priser");
        if (dateOption === "tomorrow") setTomorrowAvailable(false);
        return;
      }
      
      const data: HourlyPrice[] = await response.json();
      if (!data?.length) { setError("Ingen data"); return; }
      
      setPrices(data);
      setAverage(data.reduce((sum, p) => sum + p.NOK_per_kWh, 0) / data.length);
      if (dateOption === "tomorrow") setTomorrowAvailable(true);
    } catch { setError("Feil ved henting"); }
    finally { setLoading(false); }
  };

  const handleDateChange = (opt: DateOption) => {
    setSelectedDate(opt);
    if (opt === "today") { setPrices(initialPrices); setAverage(initialAverage); setError(null); }
    else fetchPricesForDate(opt);
  };

  useEffect(() => {
    const check = async () => {
      const d = new Date(); d.setDate(d.getDate() + 1);
      try {
        const r = await fetch(`https://www.hvakosterstrommen.no/api/v1/prices/${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}_${priceArea}.json`, { method: "HEAD" });
        setTomorrowAvailable(r.ok);
      } catch { setTomorrowAvailable(false); }
    };
    check();
  }, [priceArea]);

  // Calculate price after strømstøtte
  // Formula: støtte = (pris_inkl_mva - 96.25) × 0.90 for non-NO4
  // For NO4 (no VAT): støtte = (pris_eks_mva - 77) × 0.90
  const calcAfterSupport = (oreInklMva: number) => {
    if (oreInklMva <= supportThreshold) return oreInklMva;
    const support = (oreInklMva - supportThreshold) * STROMSTOTTE_COVERAGE;
    return Math.round((oreInklMva - support) * 10) / 10; // Round to 1 decimal
  };

  // Transform data - API prices are EXCLUDING VAT
  const chartData = prices.map((p) => {
    const hour = new Date(p.time_start).getHours();
    const priceEksMva = p.NOK_per_kWh * 100; // Convert to øre
    // Add 25% VAT for non-NO4 areas, NO4 has 0% VAT
    const spot = Math.round(isNordNorge ? priceEksMva : priceEksMva * MVA_RATE);
    const youPay = Math.round(calcAfterSupport(spot));
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      hourNum: hour,
      spot,
      youPay,
      support: spot - youPay,
      isCurrent: selectedDate === "today" && hour === currentHour,
    };
  });

  // Stats
  const current = chartData.find(d => d.isCurrent);
  const cheapest = chartData.reduce((min, d) => d.youPay < min.youPay ? d : min, chartData[0]);
  const expensive = chartData.reduce((max, d) => d.youPay > max.youPay ? d : max, chartData[0]);
  const avg = Math.round(chartData.reduce((s, d) => s + d.youPay, 0) / chartData.length);
  const totalSupport = chartData.reduce((s, d) => s + d.support, 0);
  const maxSpot = Math.max(...chartData.map(d => d.spot));
  const minYouPay = Math.min(...chartData.map(d => d.youPay));
  
  // Norgespris comparison (50 øre inkl mva, 40 øre for NO4)
  const norgesprisRate = isNordNorge ? 40 : NORGESPRIS;
  const norgesprisDiff = avg - norgesprisRate; // Positive = Norgespris is cheaper

  // Tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Kl {d.hour} {d.isCurrent && <span className="text-amber-500 font-medium">• Nå</span>}
        </p>
        <div className="mt-1 space-y-1">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Spotpris: <span className="text-zinc-600 dark:text-zinc-300">{d.spot} øre</span>
          </p>
          <p className={`text-lg font-bold ${d.youPay < 100 ? "text-emerald-600" : d.youPay > 115 ? "text-red-600" : "text-amber-600"}`}>
            Du betaler: {d.youPay} øre
          </p>
          {d.support > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              💰 Strømstøtte: -{d.support} øre
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold sm:text-base dark:text-zinc-100">Strømpris i dag</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{priceAreaName}</p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(["yesterday", "today", "tomorrow"] as const).map((opt) => (
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

      {/* Summary cards - only for today */}
      {selectedDate === "today" && current && !error && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/40">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wide">Nå</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-xl">{current.youPay}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/40">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Billigst</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-xl">{cheapest.youPay}</p>
          </div>
          <div className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-950/40">
            <p className="text-[10px] text-red-600 dark:text-red-400 uppercase tracking-wide">Dyrest</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 sm:text-xl">{expensive.youPay}</p>
          </div>
          <div className="rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Snitt</p>
            <p className="text-lg font-bold text-zinc-700 dark:text-zinc-200 sm:text-xl">{avg}</p>
          </div>
        </div>
      )}

      {/* Strømstøtte savings + Norgespris comparison */}
      {selectedDate === "today" && !error && (
        <div className="mb-4 flex flex-wrap gap-2">
          {totalSupport > 100 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
              <span>💰</span>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Strømstøtte: <strong>~{Math.round(totalSupport / 100)} kr</strong> spart i dag
              </p>
            </div>
          )}
          <div className={`flex-1 flex items-center gap-2 rounded-lg border-2 px-3 py-2 ${
            norgesprisDiff > 10 
              ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30" 
              : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
          }`}>
            <span className="text-lg">🇳🇴</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                norgesprisDiff > 10 
                  ? "text-blue-700 dark:text-blue-300" 
                  : "text-zinc-700 dark:text-zinc-300"
              }`}>
                Norgespris: {norgesprisRate} øre/kWh fast
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {norgesprisDiff > 5 
                  ? `✓ ${norgesprisDiff} øre billigere enn snitt i dag`
                  : norgesprisDiff < -5 
                    ? `${Math.abs(norgesprisDiff)} øre dyrere enn snitt i dag`
                    : "Omtrent likt som snitt i dag"
                }
              </p>
            </div>
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
            </div>
          </div>
        )}
        
        {error ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="youPayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#71717a' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis 
                tick={{ fontSize: 9, fill: '#71717a' }} 
                tickLine={false} 
                axisLine={false} 
                domain={[Math.min(NORGESPRIS - 5, Math.floor(minYouPay * 0.85)), Math.ceil(maxSpot * 1.05)]}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Norgespris - prominent blue line at 50 øre */}
              <ReferenceLine 
                y={isNordNorge ? 40 : NORGESPRIS} 
                stroke="#2563eb" 
                strokeWidth={2.5}
                strokeOpacity={0.9}
                label={{
                  value: `🇳🇴 ${isNordNorge ? 40 : NORGESPRIS} øre`,
                  position: "right",
                  fill: "#2563eb",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              
              {/* Strømstøtte threshold - subtle */}
              <ReferenceLine 
                y={supportThreshold} 
                stroke="#10b981" 
                strokeDasharray="6 3" 
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              
              {/* Spotpris - gray line */}
              <Line
                type="monotone"
                dataKey="spot"
                stroke="#a1a1aa"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: "#a1a1aa", stroke: "#fff", strokeWidth: 2 }}
              />
              
              {/* Du betaler - amber filled area */}
              <Area
                type="monotone"
                dataKey="youPay"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#youPayGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.isCurrent) return <circle key={payload.hourNum} r={0} />;
                  return <circle key={payload.hourNum} cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />;
                }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <span className="h-0.5 w-4 bg-zinc-400"></span> Spotpris
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <span className="h-1.5 w-4 rounded bg-amber-400"></span> Du betaler
        </span>
        <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
          <span className="h-0.5 w-5 bg-blue-600 dark:bg-blue-400"></span> 🇳🇴 Norgespris
        </span>
      </div>

      {/* Tips */}
      {selectedDate === "today" && current && !error && cheapest.hourNum > currentHour && current.youPay - cheapest.youPay > 10 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950/30">
          <span>💡</span>
          <span className="text-blue-700 dark:text-blue-300">
            Kl {cheapest.hour} er {current.youPay - cheapest.youPay} øre billigere
          </span>
        </div>
      )}

      {/* Info (collapsed) */}
      <details className="mt-3 group">
        <summary className="flex cursor-pointer items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <span>ℹ️ Om strømstøtten</span>
        </summary>
        <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          Staten dekker 90% over {STROMSTOTTE_THRESHOLD_EKS_MVA} øre (eks. mva) = {STROMSTOTTE_THRESHOLD_INKL_MVA} øre (inkl. mva).
          {isNordNorge && " Nord-Norge har mva-fritak."} Alternativ: Norgespris (fast 50 øre/kWh) via Elhub.
        </p>
      </details>
    </div>
  );
}
