import type { Urgency, Offer, UserContractData } from "../connectors/types";

/**
 * Policy rule evaluation result
 */
export interface RuleResult {
  passed: boolean;
  reason?: string;
  weight: number;
}

/**
 * Final switch decision from the policy engine
 */
export interface SwitchDecision {
  shouldSwitch: boolean;
  urgency: Urgency;
  reasons: string[];
  score: number;
  details: {
    savingsCheck: RuleResult;
    bindingCheck: RuleResult;
    stabilityCheck: RuleResult;
    trustCheck: RuleResult;
  };
}

/**
 * Policy configuration
 */
export interface PolicyConfig {
  // Minimum monthly savings to recommend (in NOK)
  minimumMonthlySavings: number;
  
  // Minimum yearly savings to recommend (in NOK)
  minimumYearlySavings: number;
  
  // Savings percentage thresholds for urgency
  urgencyThresholds: {
    high: number;  // percentage
    medium: number;  // percentage
  };
  
  // Prefer partners over non-partners
  preferPartners: boolean;
  
  // Weight for partner preference (0-1)
  partnerWeight: number;
  
  // Consider binding period as negative
  penalizeBinding: boolean;
  
  // Maximum acceptable binding months
  maxBindingMonths: number;
}

/**
 * Context for policy evaluation
 */
export interface PolicyContext {
  userData: UserContractData;
  currentOffer?: Offer;
  recommendedOffer: Offer;
  monthlySavings: number;
  yearlySavings: number;
  savingsPercentage: number;
}
