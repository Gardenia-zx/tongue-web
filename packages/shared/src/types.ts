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

export interface AgentChatResponse {
  status: string;
  threadId?: string;
  conversationId?: string;
  content: string;
  intentResult?: unknown;
  nextAction?: unknown;
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
  createdAt?: string;
  updatedAt?: string;
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
  readAt?: string;
  createdAt?: string;
}

export interface TrendOverview {
  report_count: number;
  feature_count: number;
  days: number;
  latest_report_id?: number;
}

export interface FeatureTrend {
  feature_code: string;
  count: number;
}

export interface TimelineItem {
  report_id: number;
  feature_summary?: string;
  created_at?: string;
}

export interface NavItem {
  label: string;
  to: string;
}

export interface AdminMetric {
  [key: string]: number | string | null | undefined;
}
