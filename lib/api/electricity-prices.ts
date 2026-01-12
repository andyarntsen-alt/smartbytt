/**
 * Electricity Price API Integration
 * Uses hvakosterstrommen.no free API for real Norwegian spot prices
 */

export interface HourlyPrice {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number; // Exchange rate
  time_start: string;
  time_end: string;
}

export interface DailyPrices {
  prices: HourlyPrice[];
  average: number;
  min: number;
  max: number;
  priceArea: string;
  date: string;
}

// Norwegian price areas
export type PriceArea = "NO1" | "NO2" | "NO3" | "NO4" | "NO5";

export const PRICE_AREA_NAMES: Record<PriceArea, string> = {
  NO1: "Oslo / Øst-Norge",
  NO2: "Kristiansand / Sør-Norge",
  NO3: "Trondheim / Midt-Norge",
  NO4: "Tromsø / Nord-Norge",
  NO5: "Bergen / Vest-Norge",
};

/**
 * Fetch spot prices from hvakosterstrommen.no
 * @param date - Date to fetch prices for (defaults to today)
 * @param priceArea - Norwegian price area (NO1-NO5)
 */
export async function fetchSpotPrices(
  date: Date = new Date(),
  priceArea: PriceArea = "NO1"
): Promise<DailyPrices | null> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch prices: ${response.status}`);
      return null;
    }

    const prices: HourlyPrice[] = await response.json();

    if (!prices || prices.length === 0) {
      return null;
    }

    // Calculate statistics
    const nokPrices = prices.map((p) => p.NOK_per_kWh);
    const average = nokPrices.reduce((a, b) => a + b, 0) / nokPrices.length;
    const min = Math.min(...nokPrices);
    const max = Math.max(...nokPrices);

    return {
      prices,
      average,
      min,
      max,
      priceArea,
      date: `${year}-${month}-${day}`,
    };
  } catch (error) {
    console.error("Error fetching spot prices:", error);
    return null;
  }
}

/**
 * Get current spot price (current hour)
 */
export async function getCurrentSpotPrice(
  priceArea: PriceArea = "NO1"
): Promise<number | null> {
  const prices = await fetchSpotPrices(new Date(), priceArea);
  
  if (!prices) return null;

  const now = new Date();
  const currentHour = now.getHours();

  const currentPrice = prices.prices.find((p) => {
    const priceHour = new Date(p.time_start).getHours();
    return priceHour === currentHour;
  });

  return currentPrice?.NOK_per_kWh ?? prices.average;
}

/**
 * Calculate estimated monthly cost for a provider
 * @param yearlyConsumptionKwh - User's yearly consumption
 * @param monthlyFee - Provider's monthly fee (kr)
 * @param markupOreKwh - Provider's markup (øre/kWh)
 * @param averageSpotPrice - Average spot price (kr/kWh)
 */
export function calculateMonthlyCost(
  yearlyConsumptionKwh: number,
  monthlyFee: number,
  markupOreKwh: number,
  averageSpotPrice: number
): number {
  const monthlyConsumption = yearlyConsumptionKwh / 12;
  const markupKrKwh = markupOreKwh / 100; // Convert øre to kr
  
  // Total price per kWh = spot price + markup
  const totalPricePerKwh = averageSpotPrice + markupKrKwh;
  
  // Monthly cost = (consumption × price) + monthly fee
  const monthlyCost = monthlyConsumption * totalPricePerKwh + monthlyFee;
  
  return Math.round(monthlyCost);
}

/**
 * Fetch prices for multiple days (for averaging)
 */
export async function fetchAverageSpotPrice(
  priceArea: PriceArea = "NO1",
  days: number = 30
): Promise<number | null> {
  // For simplicity, just get today's average
  // In production, you might want to cache historical data
  const today = await fetchSpotPrices(new Date(), priceArea);
  
  if (!today) return null;
  
  return today.average;
}
