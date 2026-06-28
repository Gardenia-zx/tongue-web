import { apiRequest } from "./client";
import type {
  AdminMetric,
  AnalyzeCreateResponse,
  AuthLoginResponse,
  DoctorProfile,
  DashboardData,
  FeatureTrend,
  NotificationItem,
  ReportCompareResult,
  ReportDetail,
  ReportEvidence,
  ReportFeature,
  ReportListItem,
  ReportVersion,
  ReviewOrder,
  SmsSendResponse,
  TaskStatus,
  TimelineItem,
  TrendSeriesPoint,
  TrendOverview,
  UserMe,
} from "../types";

export const authApi = {
  sendSms(phone: string) {
    return apiRequest<SmsSendResponse>("/api/auth/sms/send", {
      method: "POST",
      auth: false,
      body: { phone },
    });
  },
  login(phone: string, code: string) {
    return apiRequest<AuthLoginResponse>("/api/auth/sms/login", {
      method: "POST",
      auth: false,
      body: { phone, code },
    });
  },
  adminLogin(username: string, password: string) {
    return apiRequest<AuthLoginResponse>("/api/admin/auth/login", {
      method: "POST",
      auth: false,
      body: { username, password },
    });
  },
  logout() {
    return apiRequest<null>("/api/auth/logout", { method: "POST" });
  },
  me() {
    return apiRequest<UserMe>("/api/users/me");
  },
  updateProfile(body: Partial<UserMe>) {
    return apiRequest<UserMe>("/api/users/me/profile", { method: "PUT", body });
  },
};

export const doctorApi = {
  list() {
    return apiRequest<DoctorProfile[]>("/api/doctors", { auth: false });
  },
  detail(doctorId: number) {
    return apiRequest<DoctorProfile>(`/api/doctors/${doctorId}`, { auth: false });
  },
  upsertMyProfile(body: Partial<DoctorProfile>) {
    return apiRequest<DoctorProfile>("/api/doctors/me/profile", { method: "PUT", body });
  },
};

export const tongueApi = {
  analyze(
    file: File,
    options: {
      conversationId?: string;
      threadId?: string;
      clientTraceId?: string;
      userDescription?: string;
    } = {},
  ) {
    const form = new FormData();
    form.append("image", file);
    if (options.conversationId) form.append("conversationId", options.conversationId);
    if (options.threadId) form.append("threadId", options.threadId);
    if (options.clientTraceId) form.append("clientTraceId", options.clientTraceId);
    if (options.userDescription?.trim()) form.append("userDescription", options.userDescription.trim());
    return apiRequest<AnalyzeCreateResponse>("/api/tongue/analyze", { method: "POST", body: form });
  },
  task(taskId: number) {
    return apiRequest<TaskStatus>(`/api/tongue/tasks/${taskId}`);
  },
  retry(taskId: number) {
    return apiRequest<TaskStatus>(`/api/tongue/tasks/${taskId}/retry`, { method: "POST" });
  },
  reports() {
    return apiRequest<ReportListItem[]>("/api/tongue/reports");
  },
  dashboard() {
    return apiRequest<DashboardData>("/api/tongue/dashboard");
  },
  report(reportId: number) {
    return apiRequest<ReportDetail>(`/api/tongue/reports/${reportId}`);
  },
  compareReports(baseReportId: number, targetReportId: number) {
    return apiRequest<ReportCompareResult>("/api/tongue/reports/compare", {
      method: "POST",
      body: { base_report_id: baseReportId, target_report_id: targetReportId },
    });
  },
  versions(reportId: number) {
    return apiRequest<ReportVersion[]>(`/api/tongue/reports/${reportId}/versions`);
  },
  features(reportId: number) {
    return apiRequest<ReportFeature[]>(`/api/tongue/reports/${reportId}/features`);
  },
  evidence(reportId: number) {
    return apiRequest<ReportEvidence[]>(`/api/tongue/reports/${reportId}/evidence`);
  },
  deleteReport(reportId: number) {
    return apiRequest<null>(`/api/tongue/reports/${reportId}`, { method: "DELETE" });
  },
};

export const reviewApi = {
  create(reportId: number, userRemark: string) {
    return apiRequest<ReviewOrder>("/api/reviews", {
      method: "POST",
      body: { report_id: reportId, user_remark: userRemark },
    });
  },
  detail(reviewId: number) {
    return apiRequest<ReviewOrder>(`/api/reviews/${reviewId}`);
  },
  my() {
    return apiRequest<ReviewOrder[]>("/api/reviews/my");
  },
  cancel(reviewId: number) {
    return apiRequest<ReviewOrder>(`/api/reviews/${reviewId}/cancel`, { method: "POST" });
  },
  doctorQueue() {
    return apiRequest<ReviewOrder[]>("/api/doctor/reviews");
  },
  accept(reviewId: number) {
    return apiRequest<ReviewOrder>(`/api/doctor/reviews/${reviewId}/accept`, { method: "POST" });
  },
  submit(reviewId: number, commentText: string, revisedReport: unknown) {
    return apiRequest<ReviewOrder>(`/api/doctor/reviews/${reviewId}/submit`, {
      method: "POST",
      body: { comment_text: commentText, revised_report: revisedReport },
    });
  },
};

export const trendApi = {
  overview(days = 30) {
    return apiRequest<TrendOverview>(`/api/tongue/trends/overview?days=${days}`);
  },
  features(days = 90) {
    return apiRequest<FeatureTrend[]>(`/api/tongue/trends/features?days=${days}`);
  },
  timeline() {
    return apiRequest<TimelineItem[]>("/api/tongue/trends/timeline");
  },
  series(days = 90) {
    return apiRequest<TrendSeriesPoint[]>(`/api/tongue/trends/series?days=${days}`);
  },
};

export const notificationApi = {
  list() {
    return apiRequest<NotificationItem[]>("/api/notifications");
  },
  read(notificationId: number) {
    return apiRequest<NotificationItem>(`/api/notifications/${notificationId}/read`, { method: "POST" });
  },
  readAll() {
    return apiRequest<null>("/api/notifications/read-all", { method: "POST" });
  },
};

export const privacyApi = {
  deleteReports() {
    return apiRequest<null>("/api/privacy/delete-reports", { method: "POST" });
  },
  deleteAccount() {
    return apiRequest<null>("/api/privacy/delete-account", { method: "POST" });
  },
};

export const adminApi = {
  users() {
    return apiRequest<unknown[]>("/api/admin/users");
  },
  doctors() {
    return apiRequest<DoctorProfile[]>("/api/admin/doctors");
  },
  approveDoctor(doctorId: number) {
    return apiRequest<DoctorProfile>(`/api/admin/doctors/${doctorId}/approve`, { method: "POST" });
  },
  rejectDoctor(doctorId: number) {
    return apiRequest<DoctorProfile>(`/api/admin/doctors/${doctorId}/reject`, { method: "POST" });
  },
  reports() {
    return apiRequest<unknown[]>("/api/admin/reports");
  },
  tasks() {
    return apiRequest<unknown[]>("/api/admin/tasks");
  },
  reviews() {
    return apiRequest<unknown[]>("/api/admin/reviews");
  },
  configs() {
    return apiRequest<unknown[]>("/api/admin/system/config");
  },
  upsertConfig(body: { key: string; value: string; group?: string }) {
    return apiRequest<unknown>("/api/admin/system/config", { method: "PUT", body });
  },
  auditLogs() {
    return apiRequest<unknown[]>("/api/admin/audit-logs");
  },
  taskMetrics() {
    return apiRequest<AdminMetric>("/api/admin/metrics/tasks");
  },
  errorMetrics() {
    return apiRequest<AdminMetric>("/api/admin/metrics/errors");
  },
};
