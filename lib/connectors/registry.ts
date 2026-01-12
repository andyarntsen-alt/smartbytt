import type { BaseConnector, CategorySlug } from "./types";
import { ElectricityConnector } from "./electricity";

/**
 * Registry for all available connectors
 */
class ConnectorRegistry {
  private connectors: Map<CategorySlug, BaseConnector> = new Map();

  constructor() {
    // Register electricity connector
    this.register(new ElectricityConnector());
  }

  /**
   * Register a connector
   */
  register(connector: BaseConnector): void {
    this.connectors.set(connector.categorySlug, connector);
  }

  /**
   * Get a connector by category slug
   */
  getConnector(slug: CategorySlug): BaseConnector | undefined {
    return this.connectors.get(slug);
  }

  /**
   * Get all registered connectors
   */
  getAllConnectors(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Check if a connector exists for a category
   */
  hasConnector(slug: CategorySlug): boolean {
    return this.connectors.has(slug);
  }

  /**
   * Get all available category slugs
   */
  getAvailableCategories(): CategorySlug[] {
    return Array.from(this.connectors.keys());
  }
}

// Singleton instance
export const connectorRegistry = new ConnectorRegistry();

// Export helper functions
export function getConnector(slug: CategorySlug): BaseConnector | undefined {
  return connectorRegistry.getConnector(slug);
}

export function getAllConnectors(): BaseConnector[] {
  return connectorRegistry.getAllConnectors();
}

export function hasConnector(slug: CategorySlug): boolean {
  return connectorRegistry.hasConnector(slug);
}

export function getAvailableCategories(): CategorySlug[] {
  return connectorRegistry.getAvailableCategories();
}
