import type {
  BaseConnector,
  UserContractData,
  Offer,
  Recommendation,
  SwitchResult,
  ElectricityUserData,
  SpotPrice,
} from "../types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  fetchSpotPrices,
  type PriceArea,
} from "@/lib/api/electricity-prices";

// Postal code to price area mapping (simplified Norwegian grid)
const POSTAL_TO_PRICE_AREA: Record<string, string> = {
  // Oslo area (NO1)
  "0": "NO1",
  "1": "NO1",
  // Southern Norway (NO2)
  "4": "NO2",
  // Trondheim area (NO3)
  "7": "NO3",
  // Tromsø area (NO4)
  "9": "NO4",
  // Bergen area (NO5)
  "5": "NO5",
  // Default mappings for other areas
  "2": "NO1",
  "3": "NO2",
  "6": "NO3",
  "8": "NO4",
};

/**
 * Get price area from postal code
 */
export function getPriceAreaFromPostalCode(postalCode: string): string {
  const firstDigit = postalCode.charAt(0);
  return POSTAL_TO_PRICE_AREA[firstDigit] || "NO1";
}

/**
 * Fallback spot prices if API is unavailable (øre/kWh)
 */
const FALLBACK_SPOT_PRICES: Record<string, number> = {
  NO1: 85,  // Oslo
  NO2: 82,  // Kristiansand
  NO3: 45,  // Trondheim
  NO4: 35,  // Tromsø
  NO5: 75,  // Bergen
};

// Cache for spot prices (to avoid too many API calls)
const spotPriceCache: Map<string, { price: number; timestamp: number }> = new Map();

export class ElectricityConnector implements BaseConnector {
  readonly categorySlug = "strom" as const;
  readonly categoryName = "Strøm";

  /**
   * Validate electricity-specific user data
   */
  validateUserData(data: UserContractData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.postalCode || data.postalCode.length !== 4) {
      errors.push("Postnummer må være 4 siffer");
    }

    if (!data.yearlyConsumptionKwh || data.yearlyConsumptionKwh <= 0) {
      errors.push("Årlig forbruk må være større enn 0");
    }

    if (data.yearlyConsumptionKwh && data.yearlyConsumptionKwh > 100000) {
      errors.push("Årlig forbruk virker urimelig høyt");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Fetch electricity offers from database
   */
  async fetchOffers(data: UserContractData): Promise<Offer[]> {
    const supabase = await createSupabaseAdminClient();

    const priceArea = data.priceArea || getPriceAreaFromPostalCode(data.postalCode || "0000");

    // Get electricity category
    const categoryResult = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "strom")
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const category = categoryResult.data as any;

    if (!category) {
      return [];
    }

    // Fetch active offers with provider info
    const offersResult = await supabase
      .from("offers")
      .select(`
        *,
        provider:providers(*)
      `)
      .eq("is_active", true)
      .or(`price_area.is.null,price_area.eq.${priceArea}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offersData = offersResult.data as any[] | null;

    if (offersResult.error || !offersData) {
      console.error("Error fetching offers:", offersResult.error);
      return [];
    }

    // Map to Offer type and calculate estimated costs
    const offers: Offer[] = await Promise.all(
      offersData.map(async (offer) => {
        const mappedOffer: Offer = {
          id: offer.id,
          providerId: offer.provider_id,
          providerName: offer.provider?.name || "Ukjent",
          providerLogo: offer.provider?.logo_url || undefined,
          isPartner: offer.provider?.is_partner || false,
          name: offer.name,
          priceType: offer.price_type as "spot" | "fixed" | "variable",
          monthlyFee: Number(offer.monthly_fee),
          markupOreKwh: offer.markup_ore_kwh ? Number(offer.markup_ore_kwh) : undefined,
          bindingMonths: offer.binding_months,
          validFrom: new Date(offer.valid_from),
          validUntil: offer.valid_until ? new Date(offer.valid_until) : undefined,
          priceArea: offer.price_area || undefined,
        };

        // Calculate estimated monthly cost
        mappedOffer.estimatedMonthlyCost = await this.calculateMonthlyCost(mappedOffer, data);
        mappedOffer.estimatedYearlyCost = mappedOffer.estimatedMonthlyCost * 12;

        return mappedOffer;
      })
    );

    // Sort by estimated monthly cost
    return offers.sort((a, b) => 
      (a.estimatedMonthlyCost || 0) - (b.estimatedMonthlyCost || 0)
    );
  }

  /**
   * Calculate estimated monthly electricity cost
   */
  async calculateMonthlyCost(offer: Offer, data: UserContractData): Promise<number> {
    const yearlyKwh = data.yearlyConsumptionKwh || 16000; // Average Norwegian household
    const monthlyKwh = yearlyKwh / 12;

    const priceArea = data.priceArea || getPriceAreaFromPostalCode(data.postalCode || "0000");
    
    let energyCostKr: number;

    if (offer.priceType === "spot") {
      // Spot price + markup
      const spotPriceOre = await this.getCurrentSpotPrice(priceArea);
      const totalOrePerKwh = spotPriceOre + (offer.markupOreKwh || 0);
      energyCostKr = (monthlyKwh * totalOrePerKwh) / 100;
    } else if (offer.priceType === "fixed") {
      // Fixed price per kWh
      const fixedPriceOre = offer.pricePerUnit || 100; // Default 100 øre/kWh
      energyCostKr = (monthlyKwh * fixedPriceOre) / 100;
    } else {
      // Variable - assume similar to spot for estimation
      const spotPriceOre = await this.getCurrentSpotPrice(priceArea);
      const totalOrePerKwh = spotPriceOre + (offer.markupOreKwh || 5);
      energyCostKr = (monthlyKwh * totalOrePerKwh) / 100;
    }

    return Math.round(energyCostKr + offer.monthlyFee);
  }

  /**
   * Get current spot price for a price area
   * Fetches real data from hvakosterstrommen.no API
   */
  async getCurrentSpotPrice(priceArea: string): Promise<number> {
    const cacheKey = priceArea;
    const cached = spotPriceCache.get(cacheKey);
    
    // Use cache if less than 1 hour old
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.price;
    }

    try {
      const prices = await fetchSpotPrices(new Date(), priceArea as PriceArea);
      
      if (prices && prices.average > 0) {
        // Convert from kr/kWh to øre/kWh
        const priceOre = Math.round(prices.average * 100);
        
        // Cache the result
        spotPriceCache.set(cacheKey, {
          price: priceOre,
          timestamp: Date.now(),
        });
        
        return priceOre;
      }
    } catch (error) {
      console.error("Failed to fetch spot price, using fallback:", error);
    }

    // Fallback to static prices if API fails
    return FALLBACK_SPOT_PRICES[priceArea] || 80;
  }

  /**
   * Generate recommendations based on user data and available offers
   */
  async recommend(data: UserContractData, offers: Offer[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    if (!data.monthlyCost || offers.length === 0) {
      return recommendations;
    }

    const currentMonthlyCost = data.monthlyCost;

    // Find offers that provide savings
    for (const offer of offers) {
      if (!offer.estimatedMonthlyCost) continue;

      const monthlySavings = currentMonthlyCost - offer.estimatedMonthlyCost;
      const yearlySavings = monthlySavings * 12;

      // Only recommend if there's meaningful savings (> 50 kr/mnd)
      if (monthlySavings < 50) continue;

      // Determine urgency based on savings percentage
      const savingsPercentage = (monthlySavings / currentMonthlyCost) * 100;
      let urgency: "low" | "medium" | "high" = "low";
      if (savingsPercentage >= 20) urgency = "high";
      else if (savingsPercentage >= 10) urgency = "medium";

      // Generate reasons
      const reasons: string[] = [];
      reasons.push(`Spar ${monthlySavings} kr per måned`);
      reasons.push(`Spar ${yearlySavings} kr per år`);
      
      if (offer.bindingMonths === 0) {
        reasons.push("Ingen bindingstid");
      }
      
      if (offer.isPartner) {
        reasons.push("Partneravtale med SmartBytt");
      }

      if (offer.priceType === "spot" && data.priceType === "fixed") {
        reasons.push("Spotpris er ofte billigere over tid");
      }

      recommendations.push({
        id: `rec_${offer.id}_${Date.now()}`,
        userId: data.userId,
        userContractId: "", // Will be set when saving
        offer,
        currentMonthlyCost,
        recommendedMonthlyCost: offer.estimatedMonthlyCost,
        monthlySavings,
        yearlySavings,
        urgency,
        reasons,
        createdAt: new Date(),
      });
    }

    // Sort by monthly savings (highest first)
    return recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);
  }

  /**
   * Initiate a switch to a new electricity provider
   */
  async initiateSwitch(
    userId: string,
    recommendationId: string,
    offerId: string
  ): Promise<SwitchResult> {
    const supabase = await createSupabaseAdminClient();

    // Get the offer and provider details
    const offerResult = await supabase
      .from("offers")
      .select(`
        *,
        provider:providers(*)
      `)
      .eq("id", offerId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offer = offerResult.data as any;

    if (!offer) {
      return {
        success: false,
        errorMessage: "Tilbudet ble ikke funnet",
      };
    }

    // Get the recommendation
    const recommendationResult = await supabase
      .from("recommendations")
      .select("*")
      .eq("id", recommendationId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recommendation = recommendationResult.data as any;

    if (!recommendation) {
      return {
        success: false,
        errorMessage: "Anbefalingen ble ikke funnet",
      };
    }

    // Create switch record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const switchResult = await (supabase as any)
      .from("switches")
      .insert({
        user_id: userId,
        recommendation_id: recommendationId,
        from_provider_id: recommendation.from_provider_id,
        to_provider_id: offer.provider_id,
        to_offer_id: offerId,
        status: "initiated",
        estimated_savings: recommendation.yearly_savings,
        affiliate_click_id: `click_${Date.now()}`,
      })
      .select()
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const switchData = switchResult.data as any;

    if (switchResult.error || !switchData) {
      return {
        success: false,
        errorMessage: "Kunne ikke starte byttet",
      };
    }

    // Generate affiliate URL if partner
    let affiliateUrl: string | undefined;
    if (offer.provider?.is_partner && offer.provider?.affiliate_url) {
      affiliateUrl = `${offer.provider.affiliate_url}?ref=smartbytt&click_id=${switchData.affiliate_click_id}`;
    }

    return {
      success: true,
      switchId: switchData.id,
      affiliateUrl,
    };
  }
}

// Export helper function to get all spot prices
export async function getSpotPrices(): Promise<SpotPrice[]> {
  const now = new Date();
  const areas: PriceArea[] = ["NO1", "NO2", "NO3", "NO4", "NO5"];
  
  const results = await Promise.all(
    areas.map(async (area) => {
      try {
        const prices = await fetchSpotPrices(now, area);
        return {
          priceArea: area,
          priceOreKwh: prices ? Math.round(prices.average * 100) : FALLBACK_SPOT_PRICES[area],
          timestamp: now,
        };
      } catch {
        return {
          priceArea: area,
          priceOreKwh: FALLBACK_SPOT_PRICES[area],
          timestamp: now,
        };
      }
    })
  );

  return results;
}
