import { apiRequest } from "./client";
import type { HealthPlan } from "../types";
import type { HealthPlanReviewResult } from "../health-plan-review";

export const healthPlanReviewApi = {
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
