import type {
  SwitchDecision,
  PolicyConfig,
  PolicyContext,
  RuleResult,
} from "./types";
import type { Urgency } from "../connectors/types";

/**
 * Default policy configuration
 */
const DEFAULT_CONFIG: PolicyConfig = {
  minimumMonthlySavings: 50, // 50 kr/mnd
  minimumYearlySavings: 500, // 500 kr/år
  urgencyThresholds: {
    high: 20,    // 20% or more savings
    medium: 10,  // 10% or more savings
  },
  preferPartners: true,
  partnerWeight: 0.1,
  penalizeBinding: true,
  maxBindingMonths: 12,
};

/**
 * SmartBytt Policy Engine
 * 
 * Evaluates whether a switch recommendation should be made based on
 * various rules and thresholds.
 */
export class PolicyEngine {
  private config: PolicyConfig;

  constructor(config: Partial<PolicyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evaluate whether to recommend a switch
   */
  evaluateSwitch(context: PolicyContext): SwitchDecision {
    const savingsCheck = this.checkSavingsThreshold(context);
    const bindingCheck = this.checkBindingPeriod(context);
    const stabilityCheck = this.checkStability(context);
    const trustCheck = this.checkTrustFactors(context);

    // Calculate overall score (0-100)
    const score = this.calculateScore([
      { result: savingsCheck, importance: 0.5 },
      { result: bindingCheck, importance: 0.2 },
      { result: stabilityCheck, importance: 0.15 },
      { result: trustCheck, importance: 0.15 },
    ]);

    // Determine if we should recommend
    const shouldSwitch = savingsCheck.passed && bindingCheck.passed && score >= 50;

    // Determine urgency
    const urgency = this.determineUrgency(context, score);

    // Collect reasons
    const reasons = this.collectReasons({
      savingsCheck,
      bindingCheck,
      stabilityCheck,
      trustCheck,
    });

    return {
      shouldSwitch,
      urgency,
      reasons,
      score,
      details: {
        savingsCheck,
        bindingCheck,
        stabilityCheck,
        trustCheck,
      },
    };
  }

  /**
   * Check if savings meet minimum threshold
   */
  private checkSavingsThreshold(context: PolicyContext): RuleResult {
    const { monthlySavings, yearlySavings } = context;

    if (monthlySavings < this.config.minimumMonthlySavings) {
      return {
        passed: false,
        reason: `Besparelsen (${monthlySavings} kr/mnd) er under minstekravet på ${this.config.minimumMonthlySavings} kr/mnd`,
        weight: 0,
      };
    }

    if (yearlySavings < this.config.minimumYearlySavings) {
      return {
        passed: false,
        reason: `Årlig besparelse (${yearlySavings} kr) er under minstekravet på ${this.config.minimumYearlySavings} kr`,
        weight: 0,
      };
    }

    // Calculate weight based on how much above threshold
    const savingsRatio = monthlySavings / this.config.minimumMonthlySavings;
    const weight = Math.min(savingsRatio / 3, 1); // Max weight at 3x threshold

    return {
      passed: true,
      reason: `Spar ${monthlySavings} kr per måned (${yearlySavings} kr/år)`,
      weight,
    };
  }

  /**
   * Check binding period constraints
   */
  private checkBindingPeriod(context: PolicyContext): RuleResult {
    const { recommendedOffer, userData } = context;

    // Check if user has existing binding
    if (userData.bindingUntil) {
      const now = new Date();
      const bindingEnd = new Date(userData.bindingUntil);
      
      if (bindingEnd > now) {
        const monthsRemaining = Math.ceil(
          (bindingEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        
        return {
          passed: false,
          reason: `Du har ${monthsRemaining} måneder igjen av bindingstiden`,
          weight: 0,
        };
      }
    }

    // Check new offer binding
    if (recommendedOffer.bindingMonths > this.config.maxBindingMonths) {
      return {
        passed: false,
        reason: `Tilbudet har ${recommendedOffer.bindingMonths} måneders binding (maks ${this.config.maxBindingMonths})`,
        weight: 0,
      };
    }

    if (recommendedOffer.bindingMonths === 0) {
      return {
        passed: true,
        reason: "Ingen bindingstid på nytt tilbud",
        weight: 1,
      };
    }

    // Partial weight for shorter binding periods
    const bindingPenalty = recommendedOffer.bindingMonths / this.config.maxBindingMonths;
    
    return {
      passed: true,
      reason: `${recommendedOffer.bindingMonths} måneders bindingstid`,
      weight: 1 - bindingPenalty * 0.5,
    };
  }

  /**
   * Check stability factors (provider reliability, etc.)
   */
  private checkStability(context: PolicyContext): RuleResult {
    const { recommendedOffer } = context;

    // For now, basic stability check
    // In production, this could check provider history, reviews, etc.
    
    let weight = 0.7; // Base stability score
    const reasons: string[] = [];

    // Partners are generally more reliable
    if (recommendedOffer.isPartner) {
      weight += 0.2;
      reasons.push("Verifisert SmartBytt-partner");
    }

    // Known providers get a boost
    const knownProviders = ["tibber", "fjordkraft", "motkraft", "norgesenergi"];
    if (knownProviders.some(p => 
      recommendedOffer.providerName.toLowerCase().includes(p)
    )) {
      weight += 0.1;
      reasons.push("Etablert leverandør");
    }

    return {
      passed: true,
      reason: reasons.join(", ") || "Leverandør vurdert",
      weight: Math.min(weight, 1),
    };
  }

  /**
   * Check trust factors
   */
  private checkTrustFactors(context: PolicyContext): RuleResult {
    const { recommendedOffer } = context;

    let weight = 0.5;
    const reasons: string[] = [];

    // Partner preference
    if (this.config.preferPartners && recommendedOffer.isPartner) {
      weight += this.config.partnerWeight;
      reasons.push("SmartBytt-partner");
    }

    // Valid offer dates
    const now = new Date();
    if (recommendedOffer.validFrom <= now) {
      weight += 0.2;
    }

    if (!recommendedOffer.validUntil || recommendedOffer.validUntil > now) {
      weight += 0.2;
    } else {
      reasons.push("Tilbudet utløper snart");
    }

    return {
      passed: true,
      reason: reasons.join(", ") || "Tilbud validert",
      weight: Math.min(weight, 1),
    };
  }

  /**
   * Calculate overall score
   */
  private calculateScore(
    results: { result: RuleResult; importance: number }[]
  ): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const { result, importance } of results) {
      weightedSum += result.weight * importance * 100;
      totalWeight += importance;
    }

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Determine urgency level based on context and score
   */
  private determineUrgency(context: PolicyContext, score: number): Urgency {
    const { savingsPercentage } = context;

    if (savingsPercentage >= this.config.urgencyThresholds.high && score >= 80) {
      return "high";
    }

    if (savingsPercentage >= this.config.urgencyThresholds.medium && score >= 60) {
      return "medium";
    }

    return "low";
  }

  /**
   * Collect positive reasons for the recommendation
   */
  private collectReasons(details: {
    savingsCheck: RuleResult;
    bindingCheck: RuleResult;
    stabilityCheck: RuleResult;
    trustCheck: RuleResult;
  }): string[] {
    const reasons: string[] = [];

    for (const [, result] of Object.entries(details)) {
      if (result.passed && result.reason) {
        reasons.push(result.reason);
      }
    }

    return reasons;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PolicyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PolicyConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const policyEngine = new PolicyEngine();

// Export convenience function
export function evaluateSwitch(context: PolicyContext): SwitchDecision {
  return policyEngine.evaluateSwitch(context);
}
