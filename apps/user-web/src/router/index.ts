import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@tongue/shared";
import AnalysisView from "../views/AnalysisView.vue";
import DoctorsView from "../views/DoctorsView.vue";
import LoginView from "../views/LoginView.vue";
import NotificationsView from "../views/NotificationsView.vue";
import PrivacyView from "../views/PrivacyView.vue";
import ProfileView from "../views/ProfileView.vue";
import ReportDetailView from "../views/ReportDetailView.vue";
import ReportsView from "../views/ReportsView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import TrendsView from "../views/TrendsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/analysis" },
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/analysis", component: AnalysisView, meta: { title: "舌象分析", subtitle: "上传图片并生成结构化报告" } },
    { path: "/reports", component: ReportsView, meta: { title: "历史报告", subtitle: "查看和管理历次舌象报告" } },
    { path: "/reports/:reportId", component: ReportDetailView, meta: { title: "报告详情", subtitle: "查看摘要、特征和知识库依据" } },
    { path: "/trends", component: TrendsView, meta: { title: "趋势分析", subtitle: "基于历史报告观察特征变化" } },
    { path: "/reviews", component: ReviewsView, meta: { title: "医生审核", subtitle: "查看医生审核订单状态" } },
    { path: "/doctors", component: DoctorsView, meta: { title: "医生列表", subtitle: "查看可提供审核的医生" } },
    { path: "/notifications", component: NotificationsView, meta: { title: "通知", subtitle: "分析和审核状态提醒" } },
    { path: "/profile", component: ProfileView, meta: { title: "个人资料", subtitle: "维护基础资料和健康关注方向" } },
    { path: "/privacy", component: PrivacyView, meta: { title: "隐私管理", subtitle: "管理报告和账号隐私操作" } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.public) return true;
  if (!auth.token) return { path: "/login", query: { redirect: to.fullPath } };
  if (!auth.user) {
    try {
      await auth.loadMe();
    } catch {
      await auth.logout();
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }
  return true;
});

export default router;
