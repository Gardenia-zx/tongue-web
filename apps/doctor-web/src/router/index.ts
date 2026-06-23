import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@tongue/shared";
import LoginView from "../views/LoginView.vue";
import ProfileView from "../views/ProfileView.vue";
import ReviewDetailView from "../views/ReviewDetailView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import WorkbenchView from "../views/WorkbenchView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/workbench" },
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/workbench", component: WorkbenchView, meta: { title: "医生工作台", subtitle: "审核订单概览", roles: ["DOCTOR", "ADMIN"] } },
    { path: "/reviews", component: ReviewsView, meta: { title: "审核队列", subtitle: "接单、查看和提交审核意见", roles: ["DOCTOR", "ADMIN"] } },
    { path: "/reviews/:reviewId", component: ReviewDetailView, meta: { title: "审核详情", subtitle: "查看报告并提交医生意见", roles: ["DOCTOR", "ADMIN"] } },
    { path: "/profile", component: ProfileView, meta: { title: "医生资料", subtitle: "提交或维护医生资质信息" } },
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
  const roles = to.meta.roles as string[] | undefined;
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    ElMessage.warning("请先提交医生资料并重新登录");
    return { path: "/profile" };
  }
  return true;
});

export default router;
