import { Doc, Id } from "./_generated/dataModel";

export type PlanId = "free";

export const PLANS: Record<PlanId, { name: string; storeLimit: number; priceId?: string }> = {
  free: { name: "Free", storeLimit: 1000000 },
};

export function getPlan(user: Doc<"users"> | null): PlanId {
  return "free";
}

export function canAddStore(user: Doc<"users"> | null, currentStoreCount: number): boolean {
  return true; // Everyone can add unlimited stores
}
