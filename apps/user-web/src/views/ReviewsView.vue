<template>
  <section class="reviews-page">
    <header class="reviews-hero">
      <div class="hero-copy">
        <span class="page-kicker">DOCTOR REVIEW</span>
        <h1>清晰掌握，<span>每一份复核进展</span></h1>
        <p>从提交申请到医生完成复核，集中查看订单状态、报告信息和后续处理。</p>

        <div class="hero-actions">
          <RouterLink class="primary-action" to="/reports">
            <FileCheck2 :size="17" />
            选择报告申请复核
            <ArrowRight :size="16" />
          </RouterLink>
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新订单
          </button>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="visual-spark spark-one" />
        <span class="visual-spark spark-two" />

        <div class="review-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="review-glass">
            <div class="review-symbol">
              <FileCheck2 :size="65" :stroke-width="1.65" />
            </div>
            <span class="doctor-orbit"><Stethoscope :size="21" /></span>
          </div>
        </div>
      </div>
    </header>

    <section class="review-overview" aria-label="审核订单概览">
      <article class="overview-card overview-total">
        <span class="overview-icon"><FileText :size="21" /></span>
        <span class="overview-copy">
          <small>全部订单</small>
          <strong>{{ totalCount }}</strong>
          <span>当前账号提交的复核申请</span>
        </span>
      </article>

      <article class="overview-card overview-active">
        <span class="overview-icon"><Clock3 :size="21" /></span>
        <span class="overview-copy">
          <small>处理中</small>
          <strong>{{ activeCount }}</strong>
          <span>{{ activeCount ? "医生正在处理或等待接单" : "当前没有进行中的订单" }}</span>
        </span>
      </article>

      <article class="overview-card overview-completed">
        <span class="overview-icon"><CircleCheckBig :size="21" /></span>
        <span class="overview-copy">
          <small>已完成</small>
          <strong>{{ completedCount }}</strong>
          <span>已获得医生复核意见</span>
        </span>
      </article>
    </section>

    <section class="review-guide">
      <span class="guide-icon"><ShieldCheck :size="23" /></span>
      <div class="guide-copy">
        <span class="page-kicker">REVIEW PROCESS</span>
        <strong>医生复核流程</strong>
        <p>提交订单后，平台会分配医生进行人工复核；完成后可回到报告详情查看补充意见。</p>
      </div>
      <div class="guide-steps" aria-label="医生复核流程">
        <span><b>01</b>提交申请</span>
        <i />
        <span><b>02</b>医生复核</span>
        <i />
        <span><b>03</b>查看意见</span>
      </div>
      <RouterLink class="guide-link" to="/doctors">
        查看医生
        <ArrowRight :size="15" />
      </RouterLink>
    </section>

    <section class="orders-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">REVIEW ORDERS</span>
          <h2>我的审核订单</h2>
          <p>按状态筛选订单，查看医生复核的当前阶段与关联报告。</p>
        </div>
        <span class="result-count">{{ filteredOrders.length }} 条结果</span>
      </div>

      <div class="order-toolbar">
        <label class="search-box">
          <Search :size="17" />
          <input v-model="keyword" placeholder="搜索订单号、报告号或备注" />
          <button v-if="keyword" type="button" aria-label="清除搜索" @click="keyword = ''">×</button>
        </label>

        <div class="filter-tabs" role="tablist" aria-label="审核订单筛选">
          <button
            v-for="item in filters"
            :key="item.key"
            type="button"
            :class="[ 'filter-tab', { active: activeFilter === item.key } ]"
            role="tab"
            :aria-selected="activeFilter === item.key"
            @click="activeFilter = item.key"
          >
            {{ item.label }}
            <span>{{ item.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading && orders.length === 0" class="skeleton-list" aria-label="正在加载审核订单">
        <article v-for="index in 3" :key="index" class="order-skeleton">
          <span class="skeleton-icon" />
          <span class="skeleton-copy">
            <span />
            <span />
            <span />
          </span>
          <span class="skeleton-progress" />
        </article>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="empty-review-state">
        <div class="empty-visual" aria-hidden="true">
          <span class="empty-halo" />
          <span class="empty-ring ring-a" />
          <span class="empty-ring ring-b" />
          <div class="empty-icon"><FileSearch :size="40" :stroke-width="1.65" /></div>
        </div>
        <span class="page-kicker">NO REVIEW ORDERS</span>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyDescription }}</p>
        <div class="empty-actions">
          <RouterLink class="empty-primary" to="/reports">
            选择报告
            <ArrowRight :size="15" />
          </RouterLink>
          <RouterLink class="empty-secondary" to="/doctors">查看医生</RouterLink>
        </div>
      </div>

      <div v-else class="order-list">
        <article
          v-for="(order, index) in filteredOrders"
          :key="order.reviewId"
          :class="[ 'order-card', `state-${statusMeta(order.status).kind}` ]"
          :style="{ animationDelay: `${Math.min(index, 8) * 50}ms` }"
        >
          <header class="order-card-head">
            <div class="order-title-group">
              <span class="order-icon">
                <component :is="statusMeta(order.status).icon" :size="21" :stroke-width="1.8" />
              </span>
              <div>
                <span class="order-eyebrow">REVIEW #{{ order.reviewId }}</span>
                <h3>报告 #{{ order.reportId }} 的医生复核</h3>
              </div>
            </div>

            <div class="order-status-group">
              <StatusTag :status="order.status" />
              <time :title="formatDateTime(order.createdAt)">{{ relativeTime(order.createdAt) }}</time>
            </div>
          </header>

          <div class="order-body">
            <div class="order-description">
              <span class="status-label">{{ statusMeta(order.status).title }}</span>
              <p>{{ statusMeta(order.status).description }}</p>

              <div class="remark-box">
                <span><MessageSquareText :size="15" /> 提交备注</span>
                <p>{{ order.userRemark || "未填写特别关注的问题，医生将根据完整报告进行复核。" }}</p>
              </div>
            </div>

            <div class="order-progress">
              <div class="progress-line" :style="{ '--progress': `${statusMeta(order.status).progress}%` }">
                <span />
              </div>
              <div class="progress-steps">
                <span
                  v-for="step in progressSteps"
                  :key="step.key"
                  :class="{
                    complete: statusMeta(order.status).stage >= step.stage,
                    current: statusMeta(order.status).stage === step.stage,
                    cancelled: statusMeta(order.status).kind === 'cancelled',
                  }"
                >
                  <i><Check v-if="statusMeta(order.status).stage > step.stage" :size="11" /><b v-else>{{ step.stage }}</b></i>
                  <small>{{ step.label }}</small>
                </span>
              </div>
            </div>
          </div>

          <footer class="order-footer">
            <div class="order-meta">
              <span><Hash :size="14" /> 订单 {{ order.reviewId }}</span>
              <span><FileText :size="14" /> 报告 {{ order.reportId }}</span>
              <span><Clock3 :size="14" /> {{ formatDateTime(order.createdAt) }}</span>
            </div>

            <div class="order-actions">
              <button class="report-action" type="button" @click="goReport(order.reportId)">
                查看关联报告
                <ArrowRight :size="15" />
              </button>
              <button
                v-if="canCancel(order.status)"
                class="cancel-action"
                type="button"
                :disabled="cancelingId === order.reviewId"
                @click="cancel(order.reviewId)"
              >
                <XCircle :size="15" />
                {{ cancelingId === order.reviewId ? "取消中" : "取消订单" }}
              </button>
            </div>
          </footer>
        </article>
      </div>
    </section>

    <footer class="review-note">
      <ShieldCheck :size="15" />
      <span>医生复核用于补充专业意见，不替代线下诊断、检查与紧急医疗服务。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  Clock3,
  FileCheck2,
  FileSearch,
  FileText,
  Hash,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from "lucide-vue-next";
import { StatusTag, formatDateTime, reviewApi, type ReviewOrder } from "@tongue/shared";

type FilterKey = "all" | "active" | "completed" | "cancelled";
type ReviewKind = "submitted" | "assigned" | "reviewing" | "completed" | "cancelled";

const router = useRouter();
const orders = ref<ReviewOrder[]>([]);
const loading = ref(false);
const cancelingId = ref<number | null>(null);
const keyword = ref("");
const activeFilter = ref<FilterKey>("all");

const progressSteps = [
  { key: "submitted", stage: 1, label: "已提交" },
  { key: "assigned", stage: 2, label: "已分配" },
  { key: "reviewing", stage: 3, label: "复核中" },
  { key: "completed", stage: 4, label: "已完成" },
];

const totalCount = computed(() => orders.value.length);
const activeCount = computed(() => orders.value.filter((order) => isActive(order.status)).length);
const completedCount = computed(() => orders.value.filter((order) => statusMeta(order.status).kind === "completed").length);
const cancelledCount = computed(() => orders.value.filter((order) => statusMeta(order.status).kind === "cancelled").length);

const filters = computed(() => [
  { key: "all" as const, label: "全部", count: totalCount.value },
  { key: "active" as const, label: "处理中", count: activeCount.value },
  { key: "completed" as const, label: "已完成", count: completedCount.value },
  { key: "cancelled" as const, label: "已取消", count: cancelledCount.value },
]);

const filteredOrders = computed(() => {
  const normalized = keyword.value.trim().toLowerCase();

  return [...orders.value]
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
    .filter((order) => {
      const meta = statusMeta(order.status);
      const filterMatched = activeFilter.value === "all"
        || (activeFilter.value === "active" && isActive(order.status))
        || (activeFilter.value === "completed" && meta.kind === "completed")
        || (activeFilter.value === "cancelled" && meta.kind === "cancelled");

      const keywordMatched = !normalized || [
        order.reviewId,
        order.reportId,
        order.status,
        order.userRemark,
        meta.title,
      ].some((value) => String(value || "").toLowerCase().includes(normalized));

      return filterMatched && keywordMatched;
    });
});

const emptyTitle = computed(() => {
  if (keyword.value.trim()) return "没有找到匹配的审核订单";
  if (activeFilter.value === "active") return "当前没有处理中的订单";
  if (activeFilter.value === "completed") return "还没有已完成的复核";
  if (activeFilter.value === "cancelled") return "没有已取消的订单";
  return "暂无审核订单";
});

const emptyDescription = computed(() => {
  if (keyword.value.trim()) return "可以调整搜索关键词或切换订单状态后再次查看。";
  if (activeFilter.value !== "all") return "切换到其他状态，或从报告详情发起新的医生复核申请。";
  return "在报告详情页选择医生并提交复核申请后，订单会显示在这里。";
});

async function load(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    orders.value = await reviewApi.my();
    if (showSuccess) ElMessage.success("审核订单已刷新");
  } catch (error) {
    console.error("load review orders failed", error);
    ElMessage.error("审核订单加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

async function cancel(reviewId: number) {
  if (cancelingId.value !== null) return;

  try {
    await ElMessageBox.confirm(
      "取消后，该订单将停止后续分配或复核流程。确认继续吗？",
      "取消审核订单",
      { type: "warning", confirmButtonText: "确认取消", cancelButtonText: "保留订单" },
    );
  } catch {
    return;
  }

  cancelingId.value = reviewId;

  try {
    await reviewApi.cancel(reviewId);
    ElMessage.success("审核订单已取消");
    await load();
  } catch (error) {
    console.error("cancel review order failed", error);
    ElMessage.error("订单取消失败，请稍后重试");
  } finally {
    cancelingId.value = null;
  }
}

function goReport(reportId: number) {
  router.push(`/reports/${reportId}`);
}

function isActive(status?: string) {
  return ["submitted", "assigned", "reviewing"].includes(statusMeta(status).kind);
}

function canCancel(status?: string) {
  return ["SUBMITTED", "ASSIGNED"].includes(String(status || "").toUpperCase());
}

function statusMeta(status?: string): {
  kind: ReviewKind;
  title: string;
  description: string;
  stage: number;
  progress: number;
  icon: typeof FileCheck2;
} {
  const value = String(status || "").toUpperCase();

  if (["COMPLETED", "APPROVED", "FINISHED"].includes(value)) {
    return {
      kind: "completed",
      title: "医生复核已完成",
      description: "医生已经完成报告复核，可以进入关联报告查看补充意见与建议。",
      stage: 4,
      progress: 100,
      icon: CircleCheckBig,
    };
  }

  if (["IN_REVIEW", "REVIEWING", "PROCESSING"].includes(value)) {
    return {
      kind: "reviewing",
      title: "医生正在复核",
      description: "医生正在阅读报告和您提交的关注问题，请耐心等待复核结果。",
      stage: 3,
      progress: 72,
      icon: Stethoscope,
    };
  }

  if (value === "ASSIGNED") {
    return {
      kind: "assigned",
      title: "医生已经接单",
      description: "订单已分配给医生，接下来将进入正式的报告复核环节。",
      stage: 2,
      progress: 46,
      icon: ShieldCheck,
    };
  }

  if (["CANCELLED", "CANCELED", "REJECTED"].includes(value)) {
    return {
      kind: "cancelled",
      title: value === "REJECTED" ? "订单未能继续处理" : "订单已取消",
      description: "该订单已停止后续处理。如仍需复核，可以重新选择报告和医生提交申请。",
      stage: 0,
      progress: 0,
      icon: XCircle,
    };
  }

  return {
    kind: "submitted",
    title: "复核申请已提交",
    description: "平台已收到您的复核申请，正在等待医生接单或系统完成分配。",
    stage: 1,
    progress: 20,
    icon: FileCheck2,
  };
}

function relativeTime(value?: string) {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "时间未知";

  const elapsed = Date.now() - timestamp;
  if (elapsed < 60_000) return "刚刚";
  if (elapsed < 3_600_000) return `${Math.max(1, Math.floor(elapsed / 60_000))} 分钟前`;
  if (elapsed < 86_400_000) return `${Math.max(1, Math.floor(elapsed / 3_600_000))} 小时前`;
  if (elapsed < 604_800_000) return `${Math.max(1, Math.floor(elapsed / 86_400_000))} 天前`;
  return formatDateTime(value || "");
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

onMounted(() => load());
</script>

<style scoped>
.reviews-page {
  --review-ink: #182820;
  --review-muted: #7a867e;
  --review-line: rgba(137, 155, 143, 0.22);
  --review-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.reviews-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 246px;
  overflow: hidden;
  padding: 39px 44px;
  border: 1px solid var(--review-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 28%, rgba(179, 226, 191, 0.31), transparent 29%),
    radial-gradient(circle at 97% 95%, rgba(211, 237, 212, 0.72), transparent 34%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #eef8ef 100%);
  box-shadow: 0 22px 52px rgba(37, 71, 49, 0.07);
  animation: reveal-up 520ms ease-out both;
}

.hero-copy {
  position: relative;
  z-index: 3;
  min-width: 0;
}

.page-kicker {
  display: block;
  color: #43805f;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.reviews-hero h1 {
  margin: 13px 0 0;
  color: var(--review-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(40px, 4.25vw, 58px);
  font-weight: 520;
  line-height: 1.17;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.reviews-hero h1 span {
  color: var(--review-green);
}

.reviews-hero p {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--review-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.primary-action,
.ghost-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 41px;
  padding: 0 15px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.primary-action {
  border: 1px solid #267c50;
  background: linear-gradient(150deg, #3d9364, #276f4c);
  color: white;
  box-shadow: 0 10px 20px rgba(38, 124, 80, 0.2);
}

.ghost-action {
  border: 1px solid rgba(72, 116, 88, 0.18);
  background: rgba(255, 255, 255, 0.74);
  color: #526d5e;
  box-shadow: 0 7px 18px rgba(39, 74, 51, 0.04);
}

.primary-action:hover,
.ghost-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.ghost-action:disabled {
  cursor: wait;
  opacity: 0.55;
}

.hero-visual {
  position: relative;
  min-height: 192px;
}

.visual-grid {
  position: absolute;
  inset: -48px -54px -48px 3%;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 24%);
  animation: grid-drift 18s linear infinite alternate;
}

.visual-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(53, 142, 84, 0.2);
  border-radius: 50%;
  transform-origin: center;
}

.orbit-one {
  width: 306px;
  height: 132px;
  animation: orbit-one 9s ease-in-out infinite;
}

.orbit-two {
  width: 250px;
  height: 178px;
  animation: orbit-two 11s ease-in-out infinite;
}

.visual-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one { top: 24px; left: 23px; }
.dot-two { right: 17px; bottom: 32px; animation-delay: 1.1s; }

.visual-spark {
  position: absolute;
  width: 17px;
  height: 17px;
}

.visual-spark::before,
.visual-spark::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999px;
  background: rgba(74, 151, 98, 0.3);
  content: "";
  transform: translate(-50%, -50%);
}

.visual-spark::before { width: 3px; height: 17px; }
.visual-spark::after { width: 17px; height: 3px; }
.spark-one { top: 31px; right: 36px; animation: sparkle 4s ease-in-out infinite; }
.spark-two { bottom: 29px; left: 32px; animation: sparkle 4.6s 1.1s ease-in-out infinite; }

.review-stage {
  position: absolute;
  top: 8px;
  right: 10%;
  width: 270px;
  height: 190px;
  animation: stage-float 5.7s ease-in-out infinite;
}

.stage-halo {
  position: absolute;
  top: 21px;
  left: 50%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.18);
  filter: blur(30px);
  transform: translateX(-50%);
}

.stage-platform {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  transform: translateX(-50%);
}

.platform-back {
  bottom: 5px;
  width: 252px;
  height: 69px;
  border: 1px solid rgba(68, 155, 94, 0.22);
  background: linear-gradient(180deg, rgba(250, 253, 250, 0.86), rgba(225, 242, 227, 0.9));
  box-shadow: inset 0 10px 20px rgba(87, 166, 106, 0.1);
}

.platform-front {
  bottom: 18px;
  width: 205px;
  height: 39px;
  border: 1px solid rgba(68, 155, 94, 0.17);
  background: rgba(255, 255, 255, 0.68);
}

.review-glass {
  position: absolute;
  top: 2px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 145px;
  height: 165px;
  place-items: center;
  overflow: visible;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 54px 54px 39px 39px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.review-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.review-glass::after {
  position: absolute;
  top: -45%;
  left: -75%;
  width: 48%;
  height: 195%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.62), transparent);
  content: "";
  transform: rotate(18deg);
  animation: glass-shine 4.8s ease-in-out infinite;
}

.review-symbol {
  position: relative;
  z-index: 2;
  display: grid;
  width: 88px;
  height: 88px;
  place-items: center;
  border-radius: 30px;
  background: linear-gradient(155deg, #52b978, #248653);
  color: white;
  box-shadow:
    0 14px 22px rgba(38, 135, 74, 0.25),
    inset 10px 10px 15px rgba(255, 255, 255, 0.15),
    inset -12px -13px 18px rgba(17, 97, 52, 0.28);
}

.doctor-orbit {
  position: absolute;
  right: -10px;
  bottom: 25px;
  z-index: 4;
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 4px solid rgba(245, 251, 246, 0.95);
  border-radius: 50%;
  background: #fffefa;
  color: #288653;
  box-shadow: 0 8px 17px rgba(39, 115, 68, 0.17);
}

.review-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: center;
  gap: 15px;
  min-height: 116px;
  padding: 20px 22px;
  overflow: hidden;
  border: 1px solid var(--review-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 140ms; }

.overview-card::after {
  position: absolute;
  right: -28px;
  bottom: -44px;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  content: "";
  opacity: 0.55;
}

.overview-icon {
  position: relative;
  z-index: 2;
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 17px;
}

.overview-total .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-total::after { background: #edf7ef; }
.overview-active .overview-icon { background: #fbefd8; color: #ad7412; }
.overview-active::after { background: #fcf4e4; }
.overview-completed .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-completed::after { background: #edf4f8; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 10px; }
.overview-copy strong { margin-top: 4px; color: #21342a; font-size: 26px; font-weight: 700; line-height: 1; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }

.review-guide {
  display: grid;
  grid-template-columns: 50px minmax(250px, 1fr) auto auto;
  align-items: center;
  gap: 17px;
  padding: 20px 22px;
  border: 1px solid rgba(92, 161, 113, 0.28);
  border-radius: 20px;
  background: linear-gradient(120deg, #edf6ef, #f9fcf8 64%, #f2f8f1);
  box-shadow: 0 10px 26px rgba(35, 77, 49, 0.035);
  animation: reveal-up 560ms 160ms ease-out both;
}

.guide-icon {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border-radius: 16px;
  background: #dceee2;
  color: #2c8554;
}

.guide-copy strong { display: block; margin-top: 6px; color: #2d4838; font-size: 14px; }
.guide-copy p { margin: 5px 0 0; color: #758179; font-size: 10px; line-height: 1.6; }

.guide-steps {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-steps span {
  display: grid;
  gap: 3px;
  color: #5f7366;
  font-size: 9px;
  text-align: center;
  white-space: nowrap;
}

.guide-steps b { color: #2f8a58; font-size: 10px; }
.guide-steps i { width: 25px; height: 1px; background: #bed6c5; }

.guide-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2d7e50;
  font-size: 11px;
  font-weight: 680;
  text-decoration: none;
  white-space: nowrap;
}

.orders-panel {
  padding: 26px 27px;
  border: 1px solid var(--review-line);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
  animation: reveal-up 560ms 200ms ease-out both;
}

.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.panel-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.panel-heading p { margin: 7px 0 0; color: #89938d; font-size: 10px; }
.result-count { flex: none; color: #89938d; font-size: 10px; }

.order-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin-top: 21px;
  padding: 15px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 17px;
  background: #f7f9f7;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(147, 164, 153, 0.25);
  border-radius: 13px;
  background: white;
  color: #829087;
  box-shadow: 0 6px 15px rgba(38, 67, 48, 0.035);
}

.search-box:focus-within {
  border-color: rgba(43, 137, 83, 0.42);
  box-shadow: 0 0 0 3px rgba(48, 143, 88, 0.08);
}

.search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #33423a;
  font-size: 12px;
}

.search-box button {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #edf2ee;
  color: #718078;
  cursor: pointer;
  font-size: 16px;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  padding: 5px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 14px;
  background: #f0f4f1;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 11px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #77827a;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background 180ms ease, box-shadow 180ms ease, color 180ms ease;
}

.filter-tab span {
  display: grid;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  place-items: center;
  border-radius: 999px;
  background: rgba(119, 130, 122, 0.09);
  font-size: 8px;
}

.filter-tab.active {
  background: white;
  color: #267e50;
  box-shadow: 0 6px 16px rgba(35, 66, 47, 0.08);
}

.filter-tab.active span { background: #e7f2e9; color: #267e50; }

.order-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.order-card {
  position: relative;
  overflow: hidden;
  padding: 21px;
  border: 1px solid rgba(145, 162, 151, 0.22);
  border-radius: 20px;
  background: #fffefa;
  box-shadow: 0 11px 27px rgba(35, 66, 47, 0.04);
  animation: card-enter 430ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.order-card::after {
  position: absolute;
  top: -55px;
  right: -60px;
  width: 155px;
  height: 155px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(205, 233, 210, 0.4), transparent 70%);
  content: "";
  pointer-events: none;
}

.order-card:hover {
  border-color: rgba(55, 139, 86, 0.31);
  box-shadow: 0 18px 40px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.state-completed { border-color: rgba(80, 139, 166, 0.24); }
.state-cancelled { background: #fffbfa; border-color: rgba(177, 91, 83, 0.18); }

.order-card-head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.order-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.order-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: none;
  place-items: center;
  border-radius: 15px;
  background: #eaf4ec;
  color: #2f8757;
}

.state-assigned .order-icon,
.state-reviewing .order-icon { background: #fbefd8; color: #a66d10; }
.state-completed .order-icon { background: #eaf1f7; color: #4d7998; }
.state-cancelled .order-icon { background: #f9e5e2; color: #b34f47; }

.order-eyebrow {
  color: #518269;
  font-size: 8px;
  font-weight: 740;
  letter-spacing: 0.12em;
}

.order-title-group h3 {
  margin: 5px 0 0;
  color: #293b31;
  font-size: 17px;
  font-weight: 710;
}

.order-status-group {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-status-group time {
  color: #929b95;
  font-size: 9px;
  white-space: nowrap;
}

.order-body {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(360px, 1.1fr);
  gap: 28px;
  margin-top: 18px;
  padding: 18px 0;
  border-top: 1px solid #e7ebe7;
  border-bottom: 1px solid #e7ebe7;
}

.status-label {
  color: #315741;
  font-size: 12px;
  font-weight: 700;
}

.order-description > p {
  margin: 7px 0 0;
  color: #77827a;
  font-size: 10px;
  line-height: 1.7;
}

.remark-box {
  margin-top: 14px;
  padding: 13px 14px;
  border: 1px solid rgba(137, 155, 143, 0.16);
  border-radius: 13px;
  background: #f8faf8;
}

.remark-box > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4b6d59;
  font-size: 9px;
  font-weight: 680;
}

.remark-box p {
  margin: 7px 0 0;
  color: #7d8780;
  font-size: 10px;
  line-height: 1.65;
}

.order-progress {
  display: grid;
  align-content: center;
  padding: 4px 2px;
}

.progress-line {
  --progress: 0%;
  position: relative;
  height: 4px;
  margin: 0 32px;
  border-radius: 999px;
  background: #e8ede9;
}

.progress-line > span {
  display: block;
  width: var(--progress);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #58ad76, #2e8958);
  transition: width 400ms ease;
}

.state-cancelled .progress-line > span { background: #d9847d; }

.progress-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: -12px;
}

.progress-steps > span {
  display: grid;
  justify-items: center;
  gap: 7px;
  color: #9ba49e;
}

.progress-steps i {
  position: relative;
  z-index: 2;
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 3px solid #fffefa;
  border-radius: 50%;
  background: #e8ede9;
  color: #8f9a92;
  box-shadow: 0 0 0 1px #dfe6e0;
  font-style: normal;
}

.progress-steps b { font-size: 8px; }
.progress-steps small { font-size: 8px; }

.progress-steps > span.complete i,
.progress-steps > span.current i {
  background: #328b5a;
  color: white;
  box-shadow: 0 0 0 1px #328b5a, 0 5px 10px rgba(50, 139, 90, 0.16);
}

.progress-steps > span.current i {
  animation: current-pulse 2.4s ease-in-out infinite;
}

.progress-steps > span.complete small,
.progress-steps > span.current small {
  color: #3f6b50;
  font-weight: 680;
}

.progress-steps > span.cancelled i {
  background: #f2deda;
  color: #b65b51;
  box-shadow: 0 0 0 1px #eccdc8;
}

.order-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-top: 17px;
}

.order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.order-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #909a93;
  font-size: 9px;
}

.order-actions {
  display: flex;
  gap: 9px;
}

.report-action,
.cancel-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 37px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 680;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.report-action {
  border: 1px solid #286f49;
  background: linear-gradient(150deg, #398d5e, #246b46);
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.cancel-action {
  border: 1px solid rgba(177, 76, 67, 0.18);
  background: #fff5f3;
  color: #b34f47;
}

.report-action:hover,
.cancel-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.cancel-action:disabled { cursor: wait; opacity: 0.55; }

.empty-review-state {
  position: relative;
  display: grid;
  min-height: 390px;
  margin-top: 18px;
  place-items: center;
  align-content: center;
  padding: 38px 20px;
  overflow: hidden;
  border: 1px solid rgba(137, 155, 143, 0.2);
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 32%, rgba(218, 238, 222, 0.54), transparent 25%),
    linear-gradient(180deg, #fffefa, #fbfdfb);
  text-align: center;
}

.empty-review-state h3 {
  margin: 13px 0 0;
  color: #293b31;
  font-size: 20px;
}

.empty-review-state > p {
  max-width: 500px;
  margin: 9px 0 0;
  color: #7c8780;
  font-size: 11px;
  line-height: 1.7;
}

.empty-visual {
  position: relative;
  width: 150px;
  height: 125px;
  margin-bottom: 9px;
}

.empty-halo {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(72, 169, 103, 0.15);
  filter: blur(23px);
  transform: translateX(-50%);
}

.empty-ring {
  position: absolute;
  left: 50%;
  border: 1px dashed rgba(56, 145, 86, 0.22);
  border-radius: 50%;
  transform: translateX(-50%);
}

.ring-a { bottom: 10px; width: 142px; height: 45px; animation: empty-orbit 6s ease-in-out infinite; }
.ring-b { bottom: 17px; width: 105px; height: 29px; animation: empty-orbit 7s 0.8s ease-in-out infinite reverse; }

.empty-icon {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 2;
  display: grid;
  width: 76px;
  height: 84px;
  place-items: center;
  border: 1px solid rgba(64, 149, 91, 0.18);
  border-radius: 27px 27px 22px 22px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(224, 242, 228, 0.86));
  color: #357f55;
  box-shadow: 0 14px 25px rgba(43, 125, 75, 0.13);
  transform: translateX(-50%);
  animation: empty-float 4.8s ease-in-out infinite;
}

.empty-actions {
  display: flex;
  gap: 9px;
  margin-top: 19px;
}

.empty-primary,
.empty-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
}

.empty-primary {
  background: #28774d;
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.empty-secondary {
  border: 1px solid rgba(70, 98, 82, 0.17);
  background: #fffefa;
  color: #52655a;
}

.skeleton-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.order-skeleton {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 300px;
  align-items: center;
  gap: 18px;
  padding: 21px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 20px;
}

.skeleton-icon,
.skeleton-copy span,
.skeleton-progress {
  background: linear-gradient(90deg, #edf1ed 25%, #f7f9f7 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.skeleton-icon { width: 48px; height: 48px; border-radius: 15px; }
.skeleton-copy { display: grid; gap: 9px; }
.skeleton-copy span { height: 9px; border-radius: 999px; }
.skeleton-copy span:nth-child(1) { width: 32%; }
.skeleton-copy span:nth-child(2) { width: 64%; }
.skeleton-copy span:nth-child(3) { width: 48%; }
.skeleton-progress { height: 48px; border-radius: 14px; }

.review-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  color: #849088;
  font-size: 10px;
  text-align: center;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stage-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes glass-shine {
  0%, 58% { left: -75%; opacity: 0; }
  66% { opacity: 1; }
  83%, 100% { left: 135%; opacity: 0; }
}

@keyframes orbit-one {
  0%, 100% { transform: translate(-50%, -50%) rotate(11deg); }
  50% { transform: translate(-50%, -54%) rotate(16deg); }
}

@keyframes orbit-two {
  0%, 100% { transform: translate(-50%, -50%) rotate(-18deg); }
  50% { transform: translate(-50%, -46%) rotate(-23deg); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(0.72) rotate(0deg); }
  50% { opacity: 0.42; transform: scale(1) rotate(45deg); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@keyframes current-pulse {
  0%, 100% { box-shadow: 0 0 0 1px #328b5a, 0 0 0 0 rgba(50, 139, 90, 0.18); }
  50% { box-shadow: 0 0 0 1px #328b5a, 0 0 0 7px rgba(50, 139, 90, 0); }
}

@keyframes empty-orbit {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(8deg) scale(1.04); }
}

@keyframes empty-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

@keyframes skeleton {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .reviews-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .reviews-hero h1 { font-size: clamp(38px, 4vw, 50px); }
  .review-stage { right: 3%; }

  .order-toolbar {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    width: max-content;
    max-width: 100%;
  }
}

@media (max-width: 900px) {
  .reviews-hero {
    grid-template-columns: 1fr;
    min-height: 235px;
  }

  .reviews-hero h1 { white-space: normal; }
  .hero-copy { max-width: 76%; }

  .hero-visual {
    position: absolute;
    right: -30px;
    bottom: -35px;
    width: 330px;
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.8);
  }

  .review-guide {
    grid-template-columns: 50px minmax(0, 1fr) auto;
  }

  .guide-steps { display: none; }

  .order-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .reviews-page { gap: 14px; }

  .reviews-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .reviews-hero h1 { font-size: clamp(34px, 10vw, 47px); }
  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .review-overview { grid-template-columns: 1fr; }

  .review-guide {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 18px;
  }

  .guide-link { grid-column: 2; }

  .orders-panel {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .filter-tab {
    flex: 1;
    justify-content: center;
    white-space: nowrap;
  }

  .order-card-head,
  .order-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-status-group {
    width: 100%;
    justify-content: space-between;
  }

  .order-actions {
    width: 100%;
  }

  .report-action,
  .cancel-action {
    flex: 1;
  }
}

@media (max-width: 560px) {
  .reviews-hero { padding: 26px 20px; }
  .reviews-hero p { font-size: 13px; }
  .hero-actions a,
  .hero-actions button { flex: 1; }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 17px;
  }

  .overview-icon { width: 44px; height: 44px; }

  .order-title-group {
    align-items: flex-start;
  }

  .order-icon {
    width: 43px;
    height: 43px;
  }

  .order-title-group h3 {
    font-size: 15px;
  }

  .order-body {
    gap: 20px;
  }

  .progress-line {
    margin: 0 20px;
  }

  .progress-steps small {
    font-size: 7px;
  }

  .order-meta {
    display: grid;
    gap: 8px;
  }

  .order-actions {
    flex-direction: column;
  }

  .empty-actions {
    width: 100%;
    flex-direction: column;
  }

  .order-skeleton {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .skeleton-progress {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reviews-hero,
  .overview-card,
  .review-guide,
  .orders-panel,
  .order-card,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .visual-spark,
  .review-stage,
  .review-glass::after,
  .progress-steps > span.current i,
  .empty-ring,
  .empty-icon,
  .skeleton-icon,
  .skeleton-copy span,
  .skeleton-progress,
  .spinning {
    animation: none;
  }

  .primary-action,
  .ghost-action,
  .filter-tab,
  .order-card,
  .report-action,
  .cancel-action {
    transition: none;
  }

  .primary-action:hover,
  .ghost-action:hover,
  .order-card:hover,
  .report-action:hover,
  .cancel-action:hover {
    transform: none;
  }
}
</style>
