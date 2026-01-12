/**
 * Base types for the SmartBytt connector system
 */

export type CategorySlug = "strom" | "mobil" | "bredband";
export type PriceType = "spot" | "fixed" | "variable";
export type Urgency = "low" | "medium" | "high";

/**
 * User data collected for comparison
 */
export interface UserContractData {
  userId: string;
  categorySlug: CategorySlug;
  providerId?: string;
  providerName?: string;
  priceType?: PriceType;
  monthlyCost?: number;
  
  // Electricity specific
  yearlyConsumptionKwh?: number;
  postalCode?: string;
  priceArea?: string;
  
  // Mobile specific
  dataAmountGb?: number;
  
  // Broadband specific
  speedMbps?: number;
  address?: string;
  
  // Contract details
  bindingUntil?: Date;
}

/**
 * An offer from a provider
 */
export interface Offer {
  id: string;
  providerId: string;
  providerName: string;
  providerLogo?: string;
  isPartner: boolean;
  
  name: string;
  priceType: PriceType;
  monthlyFee: number;
  
  // Electricity specific
  markupOreKwh?: number;
  
  // Mobile specific
  dataAmountGb?: number;
  pricePerUnit?: number;
  
  // Broadband specific
  speedMbps?: number;
  
  bindingMonths: number;
  validFrom: Date;
  validUntil?: Date;
  priceArea?: string;
  
  // Calculated fields
  estimatedMonthlyCost?: number;
  estimatedYearlyCost?: number;
}

/**
 * A recommendation for the user
 */
export interface Recommendation {
  id: string;
  userId: string;
  userContractId: string;
  offer: Offer;
  
  currentMonthlyCost: number;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  yearlySavings: number;
  
  urgency: Urgency;
  reasons: string[];
  
  createdAt: Date;
}

/**
 * Result of initiating a switch
 */
export interface SwitchResult {
  success: boolean;
  switchId?: string;
  affiliateUrl?: string;
  errorMessage?: string;
}

/**
 * Policy decision for whether to recommend a switch
 */
export interface SwitchDecision {
  shouldSwitch: boolean;
  urgency: Urgency;
  reasons: string[];
  minimumSavingsThreshold: number;
}

/**
 * Spot price data for electricity
 */
export interface SpotPrice {
  priceArea: string;
  priceOreKwh: number;
  timestamp: Date;
}

/**
 * Base interface that all connectors must implement
 */
export interface BaseConnector {
  /**
   * Unique identifier for this connector category
   */
  readonly categorySlug: CategorySlug;
  
  /**
   * Human-readable name for the category
   */
  readonly categoryName: string;
  
  /**
   * Validate user input data before processing
   */
  validateUserData(data: UserContractData): { valid: boolean; errors: string[] };
  
  /**
   * Fetch available offers based on user data
   */
  fetchOffers(data: UserContractData): Promise<Offer[]>;
  
  /**
   * Calculate estimated monthly cost for an offer based on user data
   */
  calculateMonthlyCost(offer: Offer, data: UserContractData): Promise<number>;
  
  /**
   * Generate recommendations for the user
   */
  recommend(data: UserContractData, offers: Offer[]): Promise<Recommendation[]>;
  
  /**
   * Initiate a switch to a new provider
   */
  initiateSwitch(
    userId: string,
    recommendationId: string,
    offerId: string
  ): Promise<SwitchResult>;
}

/**
 * Electricity-specific connector data
 */
export interface ElectricityUserData extends UserContractData {
  categorySlug: "strom";
  yearlyConsumptionKwh: number;
  postalCode: string;
  priceArea: string;
}

/**
 * Mobile-specific connector data
 */
export interface MobileUserData extends UserContractData {
  categorySlug: "mobil";
  dataAmountGb: number;
}

/**
 * Broadband-specific connector data
 */
export interface BroadbandUserData extends UserContractData {
  categorySlug: "bredband";
  speedMbps: number;
  address: string;
}
