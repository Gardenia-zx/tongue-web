import { apiRequest } from "./client";
import type { HealthPlan } from "../types";

export interface HealthPlanReviewResult {
  status: "REASONABLE" | "NEEDS_IMPROVEMENT" | "FAILED";
  summary: string;
  issues: string[];
  suggestions: string[];
  recommendedAction?: "ACTIVATE" | "GENERATE_DETAILED" | "NONE";
}

export const healthPlanAiApi = {
  review(planId: number) {
    return apiRequest<HealthPlanReviewResult>(`/api/health-plans/${planId}/review`, {
      method: "POST",
    });
  },
  generateDetailed(planId: number) {
    return apiRequest<HealthPlan>(`/api/health-plans/${planId}/generate-detailed`, {
      method: "POST",
    });
  },
};
