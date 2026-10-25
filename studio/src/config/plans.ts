// Note: Starting values - to be revised after measuring cost per job

export interface PlanQuotas {
  imageCredits: number;
  aiCredits: number;
  qrCodes: number;
  batchRows: number;
}

export interface PlanFeatures {
  svgExport: boolean;
  priorityQueue?: boolean;
  dedicatedSupport?: boolean;
  apiAccess?: boolean;
}

export interface PlanConfig {
  id: "free" | "starter" | "pro" | "growth" | "business";
  name: string;
  priceInrMonthly: number | null; // null for Business ("custom")
  priceInrYearly: number | null;
  maxFileMb: number;
  maxPagesPerFile: number;
  maxMegapixels: number;
  quotas: PlanQuotas;
  storageGb: number;
  retentionHours: number; // for tool outputs
  trashDays: number;
  seats: number;
  features: PlanFeatures;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    priceInrMonthly: 0,
    priceInrYearly: 0,
    maxFileMb: 25,
    maxPagesPerFile: 50,
    maxMegapixels: 12,
    quotas: {
      imageCredits: 5,
      aiCredits: 5,
      qrCodes: 20,
      batchRows: 10,
    },
    storageGb: 1,
    retentionHours: 24,
    trashDays: 30,
    seats: 1,
    features: {
      svgExport: false,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceInrMonthly: 299,
    priceInrYearly: 2990,
    maxFileMb: 50,
    maxPagesPerFile: 200,
    maxMegapixels: 24,
    quotas: {
      imageCredits: 25,
      aiCredits: 25,
      qrCodes: 100,
      batchRows: 50,
    },
    storageGb: 10,
    retentionHours: 7 * 24, // 7 days = 168 hours
    trashDays: 30,
    seats: 1,
    features: {
      svgExport: true,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceInrMonthly: 299,
    priceInrYearly: 2499,
    maxFileMb: 100,
    maxPagesPerFile: 500,
    maxMegapixels: 50,
    quotas: {
      imageCredits: 75,
      aiCredits: 75,
      qrCodes: 500,
      batchRows: 250,
    },
    storageGb: 25,
    retentionHours: 30 * 24, // 30 days = 720 hours
    trashDays: 30,
    seats: 1,
    features: {
      svgExport: true,
      priorityQueue: true,
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceInrMonthly: 1499,
    priceInrYearly: 14990,
    maxFileMb: 250,
    maxPagesPerFile: 1000,
    maxMegapixels: 100,
    quotas: {
      imageCredits: 200,
      aiCredits: 200,
      qrCodes: 2000,
      batchRows: 1000,
    },
    storageGb: 100,
    retentionHours: 90 * 24, // 90 days = 2160 hours
    trashDays: 30,
    seats: 3,
    features: {
      svgExport: true,
      priorityQueue: true,
      apiAccess: true,
    },
  },
  business: {
    id: "business",
    name: "Business",
    priceInrMonthly: null, // "custom"
    priceInrYearly: null,
    maxFileMb: 500,
    maxPagesPerFile: 2000,
    maxMegapixels: 200,
    quotas: {
      imageCredits: 600,
      aiCredits: 600,
      qrCodes: 10000,
      batchRows: 5000,
    },
    storageGb: 250,
    retentionHours: 90 * 24,
    trashDays: 30,
    seats: 5,
    features: {
      svgExport: true,
      priorityQueue: true,
      apiAccess: true,
      dedicatedSupport: true,
    },
  },
};

export function getPlan(planId?: string | null): PlanConfig {
  if (!planId || !PLANS[planId]) {
    return PLANS.free;
  }
  return PLANS[planId];
}

export function formatInrPrice(price: number | null): string {
  if (price === null) return "Custom";
  if (price === 0) return "₹0";
  return `₹${price.toLocaleString("en-IN")}`;
}
