import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@tongue/shared";
import AuditLogsView from "../views/AuditLogsView.vue";
import DashboardView from "../views/DashboardView.vue";
import DoctorsView from "../views/DoctorsView.vue";
import LoginView from "../views/LoginView.vue";
import MetricsView from "../views/MetricsView.vue";
import ReportsView from "../views/ReportsView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import SystemConfigView from "../views/SystemConfigView.vue";
import TasksView from "../views/TasksView.vue";
import UsersView from "../views/UsersView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/dashboard", component: DashboardView, meta: { title: "总览", subtitle: "系统核心指标概览" } },
    { path: "/users", component: UsersView, meta: { title: "用户管理", subtitle: "查看 App 用户" } },
    { path: "/doctors", component: DoctorsView, meta: { title: "医生审核", subtitle: "审核医生资料" } },
    { path: "/reports", component: ReportsView, meta: { title: "报告管理", subtitle: "查看全部报告" } },
    { path: "/tasks", component: TasksView, meta: { title: "任务管理", subtitle: "查看分析任务状态" } },
    { path: "/reviews", component: ReviewsView, meta: { title: "审核订单", subtitle: "查看医生审核订单" } },
    { path: "/system-config", component: SystemConfigView, meta: { title: "系统配置", subtitle: "维护系统配置项" } },
    { path: "/audit-logs", component: AuditLogsView, meta: { title: "审计日志", subtitle: "查看管理员操作记录" } },
    { path: "/metrics", component: MetricsView, meta: { title: "指标", subtitle: "查看任务和错误指标" } },
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
  if (auth.user?.role !== "ADMIN") return { path: "/login" };
  return true;
});

export default router;
