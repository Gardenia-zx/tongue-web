<template>
  <section class="health-dashboard">
    <div class="dashboard-hero">
      <div class="hero-copy">
        <span class="eyebrow">AI HEALTH COMPANION</span>
        <h1>{{ greeting }}，{{ displayName }}</h1>
        <p class="hero-title">从一次清晰的舌象照片<br />开始了解身体变化</p>
        <p class="hero-description">AI 舌象识别、结构化报告与长期趋势追踪，为您提供清晰的健康参考。</p>
        <button class="primary-action" type="button" @click="startAnalysis">
          <Camera :size="18" :stroke-width="1.8" />
          开始舌象分析
        </button>
      </div>

      <div class="tongue-visual" aria-hidden="true">
        <div class="visual-ring ring-one" />
        <div class="visual-ring ring-two" />
        <div class="tongue-shape">
          <span class="tongue-line" />
          <span class="tongue-texture texture-one" />
          <span class="tongue-texture texture-two" />
          <span class="tongue-texture texture-three" />
        </div>
        <div class="scan-dot" />
        <span class="scan-label">准备识别</span>
      </div>
    </div>

    <div class="summary-grid">
      <article class="recent-report-card">
        <header>
          <div>
            <span class="card-kicker">最近一次报告</span>
            <strong>{{ latestReport ? formatDate(latestReport.createdAt) : "暂无记录" }}</strong>
          </div>
          <button v-if="latestReport" type="button" class="text-link" @click="openLatestReport">
            查看详情
            <ArrowUpRight :size="15" />
          </button>
        </header>
        <div v-if="latestReport" class="recent-report-content">
          <div class="score-orb">
            <strong>{{ healthScoreText }}</strong>
            <span>/100</span>
          </div>
          <div>
            <h3>{{ latestReport.featureSummary || "舌象状态已完成分析" }}</h3>
            <p>结合报告内容继续提问，获取更详细的饮食、作息和运动建议。</p>
          </div>
        </div>
        <div v-else class="empty-report">
          <FileText :size="22" />
          <span>完成第一次分析后，这里会展示您的最新健康摘要。</span>
        </div>
      </article>

      <article class="metric-panel">
        <div class="metric-item">
          <span>历史报告</span>
          <strong>{{ reportCount }}</strong>
          <small>份记录</small>
        </div>
        <div class="metric-item warm">
          <span>最近状态</span>
          <strong>{{ latestReport ? "已更新" : "待分析" }}</strong>
          <small>{{ latestReport ? "可继续追问" : "上传舌象照片" }}</small>
        </div>
        <div class="metric-item">
          <span>趋势观察</span>
          <strong>{{ trendReady ? "可用" : "积累中" }}</strong>
          <small>{{ trendMessage }}</small>
        </div>
      </article>
    </div>

    <section v-if="currentPlan" class="today-plan-card">
      <div>
        <span class="card-kicker">今日健康计划</span>
        <h2>{{ currentPlan.todayCheckin ? "今天已记录" : "今天还有事项待完成" }}</h2>
        <p>饮食、睡眠和运动建议来自报告 #{{ currentPlan.sourceReportId }}。</p>
      </div>
      <div class="today-actions">
        <span>下次复拍：{{ currentPlan.nextRetakeDate ? formatDate(currentPlan.nextRetakeDate) : "已完成" }}</span>
        <button class="secondary-action" type="button" @click="router.push('/health-plan')">查看计划</button>
      </div>
    </section>

    <div class="quick-panel">
      <div>
        <span class="card-kicker">为您推荐的快捷提问</span>
        <p>选择一个问题，快速开始和健康助手交流。</p>
      </div>
      <div class="quick-list">
        <button v-for="item in quickQuestions" :key="item" type="button" @click="focusAssistant(item)">
          {{ item }}
          <ArrowRight :size="14" />
        </button>
      </div>
    </div>

    <section ref="assistantSectionRef" class="assistant-shell">
      <div class="assistant-heading">
        <div>
          <span class="card-kicker">健康助手</span>
          <h2>继续提问或上传新的舌象照片</h2>
        </div>
        <span class="assistant-status"><span /> 在线</span>
      </div>
      <AnalysisV2View />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, ArrowUpRight, Camera, FileText } from "lucide-vue-next";
import { healthPlanApi, tongueApi, useAuthStore, type DashboardData, type HealthPlan, type ReportListItem } from "@tongue/shared";
import AnalysisV2View from "./AnalysisV2View.vue";

const auth = useAuthStore();
const router = useRouter();
const dashboard = ref<DashboardData | null>(null);
const currentPlan = ref<HealthPlan | null>(null);
const assistantSectionRef = ref<HTMLElement | null>(null);

const quickQuestions = [
  "这个舌象说明什么？",
  "饮食上需要注意什么？",
  "适合哪些运动？",
  "睡眠和舌象有关系吗？",
];

const displayName = computed(() => auth.user?.nickname || auth.user?.phone?.slice(-4) || "朋友");
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});
const latestReport = computed<ReportListItem | null>(() => dashboard.value?.latestReport || null);
const reportCount = computed(() => dashboard.value?.reportCount || 0);
const healthScoreText = computed(() => {
  const score = latestReport.value?.analysisQualityScore;
  return typeof score === "number" ? Math.round(score) : "--";
});
const trendReady = computed(() => dashboard.value?.trendStatus?.status === "READY");
const trendMessage = computed(() => String(dashboard.value?.trendStatus?.message || "至少需要 2 份报告"));

onMounted(async () => {
  try {
    const [dashboardData, planData] = await Promise.all([
      tongueApi.dashboard(),
      healthPlanApi.current(),
    ]);
    dashboard.value = dashboardData;
    currentPlan.value = planData;
  } catch (error) {
    console.error("load dashboard failed", error);
  }
});

function formatDate(value?: string) {
  if (!value) return "最近完成";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function openLatestReport() {
  if (latestReport.value) router.push(`/reports/${latestReport.value.reportId}`);
}

function scrollToAssistant() {
  assistantSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startAnalysis() {
  scrollToAssistant();
  window.setTimeout(() => {
    document.querySelector<HTMLButtonElement>(".assistant-shell .image-upload-button")?.click();
  }, 450);
}

function focusAssistant(question: string) {
  scrollToAssistant();
  window.setTimeout(() => {
    const textarea = document.querySelector<HTMLTextAreaElement>(".assistant-shell textarea");
    if (!textarea) return;
    textarea.value = question;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  }, 420);
}
</script>

<style scoped>
.health-dashboard {
  display: grid;
  gap: 20px;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.dashboard-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  min-height: 430px;
  overflow: hidden;
  padding: clamp(34px, 5vw, 62px);
  border: 1px solid rgba(183, 194, 184, 0.65);
  border-radius: 30px;
  background:
    radial-gradient(circle at 76% 48%, rgba(199, 225, 215, 0.58), transparent 25%),
    radial-gradient(circle at 16% 4%, rgba(255, 255, 255, 0.92), transparent 28%),
    linear-gradient(135deg, #fbfaf5 0%, #f4f7f1 52%, #eaf2ed 100%);
  box-shadow: 0 24px 70px rgba(54, 75, 63, 0.09);
}

.dashboard-hero::after {
  position: absolute;
  right: -110px;
  bottom: -190px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: rgba(230, 220, 184, 0.22);
  content: "";
  filter: blur(4px);
}

.hero-copy {
  position: relative;
  z-index: 2;
  align-self: center;
}

.eyebrow,
.card-kicker {
  display: block;
  color: #3f7058;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 18px 0 10px;
  color: #2f3a31;
  font-size: 18px;
  font-weight: 620;
}

.hero-title {
  max-width: 660px;
  margin: 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(42px, 5vw, 68px);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 1.24;
}

.hero-description {
  max-width: 560px;
  margin: 22px 0 0;
  color: #6f786f;
  font-size: 15px;
  line-height: 1.8;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  margin-top: 28px;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  background: #245d3d;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
  box-shadow: 0 12px 26px rgba(36, 93, 61, 0.2);
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.primary-action:hover {
  background: #2d6d49;
  box-shadow: 0 16px 32px rgba(36, 93, 61, 0.24);
  transform: translateY(-2px);
}

.tongue-visual {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  min-height: 320px;
}

.visual-ring {
  position: absolute;
  width: 270px;
  height: 270px;
  border-radius: 50%;
}

.ring-one {
  border: 1px solid rgba(43, 99, 71, 0.18);
  box-shadow: inset 0 0 0 18px rgba(255, 255, 255, 0.34);
}

.ring-two {
  width: 220px;
  height: 220px;
  border: 12px solid rgba(255, 255, 255, 0.54);
  box-shadow: 0 18px 48px rgba(66, 93, 78, 0.12);
}

.tongue-shape {
  position: relative;
  width: 130px;
  height: 190px;
  overflow: hidden;
  border: 6px solid rgba(255, 255, 255, 0.72);
  border-radius: 46% 46% 42% 42% / 34% 34% 62% 62%;
  background: linear-gradient(180deg, #eeb0a9 0%, #db8f8c 58%, #c97879 100%);
  box-shadow: 0 18px 42px rgba(112, 63, 64, 0.2), inset 0 0 28px rgba(255, 232, 224, 0.32);
}

.tongue-line {
  position: absolute;
  top: 28px;
  bottom: 20px;
  left: 50%;
  width: 2px;
  border-radius: 999px;
  background: rgba(137, 73, 74, 0.24);
  transform: translateX(-50%);
}

.tongue-texture {
  position: absolute;
  width: 18px;
  height: 7px;
  border-top: 1px solid rgba(137, 73, 74, 0.24);
  border-radius: 50%;
}

.texture-one { top: 62px; left: 29px; transform: rotate(18deg); }
.texture-two { top: 88px; right: 23px; transform: rotate(-20deg); }
.texture-three { bottom: 45px; left: 40px; transform: rotate(8deg); }

.scan-dot {
  position: absolute;
  top: 70px;
  right: 50px;
  width: 12px;
  height: 12px;
  border: 4px solid #dff0e7;
  border-radius: 50%;
  background: #2d7750;
  box-shadow: 0 0 0 8px rgba(45, 119, 80, 0.08);
  animation: scan-pulse 2s ease-in-out infinite;
}

.scan-label {
  position: absolute;
  bottom: 16px;
  padding: 7px 11px;
  border: 1px solid rgba(54, 91, 70, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: #50705e;
  font-size: 11px;
  backdrop-filter: blur(10px);
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 18px;
}

.recent-report-card,
.metric-panel,
.quick-panel,
.assistant-shell {
  border: 1px solid rgba(183, 194, 184, 0.64);
  border-radius: 24px;
  background: rgba(255, 254, 249, 0.86);
  box-shadow: 0 16px 42px rgba(54, 75, 63, 0.06);
}

.recent-report-card {
  min-height: 250px;
  padding: 24px;
}

.recent-report-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.recent-report-card header strong {
  display: block;
  margin-top: 7px;
  color: #2e3b31;
  font-size: 13px;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #35664b;
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
}

.recent-report-content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  margin-top: 28px;
}

.score-orb {
  display: grid;
  width: 108px;
  height: 108px;
  place-items: center;
  align-content: center;
  border: 10px solid #e2eee6;
  border-top-color: #2e7650;
  border-radius: 50%;
  background: #fbfdfb;
  color: #275a3e;
}

.score-orb strong {
  font-size: 28px;
  line-height: 1;
}

.score-orb span {
  margin-top: 4px;
  color: #8a958d;
  font-size: 10px;
}

.recent-report-content h3 {
  margin: 0;
  color: #2d3930;
  font-size: 20px;
  line-height: 1.45;
}

.recent-report-content p,
.empty-report,
.quick-panel p {
  color: #778178;
  font-size: 13px;
  line-height: 1.75;
}

.empty-report {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 150px;
}

.metric-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.metric-item {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  justify-content: center;
  padding: 22px;
  border-right: 1px solid rgba(218, 224, 217, 0.8);
}

.metric-item:last-child { border-right: 0; }
.metric-item.warm { background: rgba(246, 236, 213, 0.46); }
.metric-item span { color: #7d877f; font-size: 11px; }
.metric-item strong { margin-top: 18px; color: #2f493a; font-size: 23px; line-height: 1.2; }
.metric-item small { margin-top: 8px; color: #8d968f; font-size: 10px; line-height: 1.5; }

.quick-panel {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: center;
  gap: 28px;
  padding: 22px 24px;
}

.today-plan-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border: 1px solid rgba(183, 194, 184, 0.65);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.05);
}

.today-plan-card h2 {
  margin: 8px 0 0;
  color: #2f3a31;
  font-size: 22px;
}

.today-plan-card p {
  margin: 8px 0 0;
  color: #6f786f;
  font-size: 13px;
}

.today-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #66756d;
  font-size: 12px;
}

.secondary-action {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(72, 102, 84, 0.16);
  border-radius: 11px;
  background: #f7faf7;
  color: #35664b;
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
}

.quick-panel p { margin: 8px 0 0; }
.quick-list { display: flex; flex-wrap: wrap; gap: 9px; }
.quick-list button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(72, 102, 84, 0.16);
  border-radius: 11px;
  background: #f7faf7;
  color: #40584a;
  cursor: pointer;
  font-size: 12px;
}

.quick-list button:hover { background: #eaf2ec; }

.assistant-shell {
  overflow: hidden;
  padding: 24px 24px 0;
}

.assistant-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 8px;
}

.assistant-heading h2 {
  margin: 9px 0 0;
  font-size: 24px;
  font-weight: 590;
  letter-spacing: -0.04em;
}

.assistant-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #688071;
  font-size: 12px;
}

.assistant-status span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3c9567;
  box-shadow: 0 0 0 5px rgba(60, 149, 103, 0.1);
}

:deep(.chat-page) {
  min-height: 650px !important;
  margin: 0 -24px !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.chat-scroll) {
  height: 650px !important;
  padding: 24px 28px 170px !important;
}

:deep(.thread) { width: min(900px, 100%) !important; }
:deep(.welcome) { min-height: 320px !important; }
:deep(.welcome h1) { font-size: 32px !important; }
:deep(.composer-wrap) { padding: 32px 26px 18px !important; }

@keyframes scan-pulse {
  0%, 100% { transform: scale(0.88); opacity: 0.72; }
  50% { transform: scale(1.12); opacity: 1; }
}

@media (max-width: 980px) {
  .dashboard-hero,
  .summary-grid,
  .quick-panel {
    grid-template-columns: 1fr;
  }
  .today-plan-card,
  .today-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .tongue-visual { min-height: 300px; }
  .quick-panel { gap: 16px; }
}

@media (max-width: 720px) {
  .dashboard-hero { padding: 30px 22px; }
  .hero-title { font-size: 40px; }
  .metric-panel { grid-template-columns: 1fr; }
  .metric-item { min-height: 130px; border-right: 0; border-bottom: 1px solid rgba(218, 224, 217, 0.8); }
  .metric-item:last-child { border-bottom: 0; }
  .recent-report-content { grid-template-columns: 1fr; }
  .assistant-shell { padding: 18px 14px 0; }
  :deep(.chat-page) { margin: 0 -14px !important; }
}

@media (prefers-reduced-motion: reduce) {
  .scan-dot { animation: none; }
  .primary-action { transition: none; }
}
</style>
