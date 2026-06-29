export type UserRole = "USER" | "DOCTOR" | "ADMIN";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  traceId?: string;
}

export interface UserMe {
  userId: number;
  phone: string;
  role: UserRole;
  nickname?: string;
  gender?: string;
  age?: number;
  avatarFileId?: number;
  healthFocus?: string;
}

export interface SmsSendResponse {
  ttlSeconds: number;
  devCode?: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  user: UserMe;
}

export type AgentContextBindingMode = "AUTO" | "NONE" | "ACTIVE_REPORT" | "LAST_ANSWER";
export type AgentMessageStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface AgentContextBinding {
  mode: AgentContextBindingMode;
  reportId?: number;
}

export interface AgentChatV2Request {
  requestId: string;
  clientMessageId: string;
  threadId: string;
  conversationId?: string;
  message: {
    role: "user";
    contentType: "text";
    content: string;
  };
  contextBinding: AgentContextBinding;
  clientContext?: Record<string, unknown>;
}

export interface AgentReportRef {
  reportId: number;
  relation: "GENERATED" | "REFERENCED";
}

export interface AgentAssistantMessage {
  messageId: string;
  role: "assistant";
  contentType: "text" | "structured";
  content: string;
  structuredContent?: Record<string, unknown>;
  reportRef?: AgentReportRef;
  createdAt?: string;
}

export interface AgentExecutionSummary {
  status: string;
  finishReason?: string;
}

export interface AgentChatV2Response {
  status: string;
  requestId: string;
  turnId: string;
  threadId: string;
  conversationId: string;
  assistantMessage: AgentAssistantMessage;
  execution?: AgentExecutionSummary;
  traceId?: string;
}

export interface DoctorProfile {
  doctorId: number;
  userId: number;
  realName?: string;
  title?: string;
  introduction?: string;
  specialty?: string;
  reviewStatus?: string;
}

export interface AnalyzeCreateResponse {
  reportId: number;
  taskId: number;
  conversationId?: string;
  threadId?: string;
  status: string;
}

export interface TaskStatus {
  taskId: number;
  reportId: number;
  status: string;
  progress?: number;
  currentStage?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ReportListItem {
  reportId: number;
  status?: string;
  featureSummary?: string;
  analysisQualityScore?: number;
  analysisQualityLevel?: string;
  qualityVersion?: string;
  analysisQualityVersion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StructuredReport {
  schemaVersion?: string;
  comprehensiveSummary?: string;
  tongueFeatures?: Array<Record<string, unknown>>;
  recognitionEvidence?: Array<Record<string, unknown>>;
  recognitionLimits?: Array<Record<string, unknown>>;
  dimensionValues?: Array<Record<string, unknown>>;
  conditionalAnalysis?: Array<Record<string, unknown>>;
  tongueFeatureExplanation?: string;
  dietPlan?: ReportPlan;
  sleepPlan?: ReportPlan;
  exercisePlan?: ReportPlan;
  threeDayObservation?: string[];
  followupQuestions?: string[];
  healthInterpretation?: string;
  dietaryAdvice?: string[];
  exerciseAdvice?: string[];
  lifestyleAdvice?: string[];
  riskTips?: string[];
  evidenceRefs?: Array<Record<string, unknown>>;
}

export interface ReportPlan {
  goal?: string;
  actions?: string[];
  frequency?: string;
  duration?: string;
  observationMetrics?: string[];
}

export interface ReportDetail {
  reportId: number;
  taskId?: number;
  imageFileId?: number;
  threadId?: string;
  reportStatus?: string;
  summary?: string;
  featureSummary?: string;
  detectedFeatureCodes?: unknown;
  standardFeatures?: unknown;
  ragQuery?: string;
  ragGrounded?: boolean;
  ragEvidence?: unknown;
  draftReport?: unknown;
  riskDisclaimer?: string;
  structuredReport?: StructuredReport;
  analysisQualityScore?: number;
  analysisQualityLevel?: string;
  qualityMetrics?: Record<string, unknown>;
  qualityVersion?: string;
  analysisQualityVersion?: string;
}

export interface ReportVersion {
  versionId: number;
  versionNo: number;
  sourceType?: string;
  summary?: string;
  reportJson?: unknown;
  createdAt?: string;
}

export interface ReportFeature {
  featureId: number;
  featureCode: string;
  featureGroup?: string;
  confidence?: number;
}

export interface ReportEvidence {
  evidenceId: number;
  chunkId?: string;
  docId?: string;
  title?: string;
  content?: string;
  sourceUri?: string;
  finalScore?: number;
}

export interface ReviewOrder {
  reviewId: number;
  reportId: number;
  userId: number;
  doctorUserId?: number;
  status: string;
  payStatus?: string;
  priceAmount?: unknown;
  userRemark?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: number;
  userId?: number;
  type?: string;
  title?: string;
  content?: string;
  payloadJson?: unknown;
  scheduledAt?: string;
  readAt?: string;
  createdAt?: string;
}

export interface HealthPlan {
  planId: number;
  userId?: number;
  sourceReportId: number;
  status: string;
  startDate: string;
  endDate: string;
  dietGoal?: ReportPlan;
  sleepGoal?: ReportPlan;
  exerciseGoal?: ReportPlan;
  observationItems?: string[];
  todayCheckin?: DailyCheckin | null;
  nextRetakeDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyCheckin {
  checkinId: number;
  planId: number;
  checkinDate: string;
  dietDone?: boolean;
  sleepDone?: boolean;
  exerciseDone?: boolean;
  observation?: unknown;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyCheckinRequest {
  dietDone?: boolean;
  sleepDone?: boolean;
  exerciseDone?: boolean;
  observation?: unknown;
  note?: string;
}

export interface CheckinSummary {
  days: number;
  checkinCount: number;
  checkinRate: number;
  dietRate: number;
  sleepRate: number;
  exerciseRate: number;
  retakeCompleted: boolean;
}

export interface TrendOverview {
  report_count: number;
  feature_count: number;
  days: number;
  latest_report_id?: number;
}

export interface FeatureTrend {
  feature_code: string;
  featureCode?: string;
  count: number;
}

export interface TimelineItem {
  report_id: number;
  reportId?: number;
  feature_summary?: string;
  featureSummary?: string;
  created_at?: string;
  createdAt?: string;
}

export interface TrendSeriesPoint {
  report_id: number;
  reportId?: number;
  created_at?: string;
  createdAt?: string;
  feature_code: string;
  featureCode?: string;
  status: string;
  confidence?: number;
  change_type?: string;
  changeType?: string;
  supported: boolean;
}

export interface DashboardTodo {
  type: string;
  title: string;
  content?: string;
  action?: string;
  reportId?: number;
  taskId?: number;
  reviewId?: number;
}

export interface DashboardData {
  user: UserMe;
  reportCount: number;
  latestReport?: ReportListItem | null;
  trendStatus?: Record<string, unknown>;
  todos: DashboardTodo[];
  unreadNotificationCount: number;
  recentNotifications: NotificationItem[];
}

export interface ReportCompareFeature {
  featureCode: string;
  baseConfidence?: number;
  targetConfidence?: number;
  changeType?: string;
}

export interface ReportCompareResult {
  baseReportId: number;
  targetReportId: number;
  added: ReportCompareFeature[];
  removed: ReportCompareFeature[];
  persistent: ReportCompareFeature[];
  changed: ReportCompareFeature[];
  unsupported: ReportCompareFeature[];
  explanation?: string;
  observationSuggestions: string[];
  agentStatus?: string;
}

export interface NavItem {
  label: string;
  to: string;
}

export interface AdminMetric {
  [key: string]: number | string | null | undefined;
}
