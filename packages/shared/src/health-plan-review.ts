export type HealthPlanReviewStatus = "REASONABLE" | "NEEDS_IMPROVEMENT" | "FAILED";
export type HealthPlanRecommendedAction = "ACTIVATE" | "GENERATE_DETAILED";

export interface HealthPlanReviewResult {
  status: HealthPlanReviewStatus;
  summary: string;
  issues: string[];
  suggestions: string[];
  recommendedAction?: HealthPlanRecommendedAction;
}
