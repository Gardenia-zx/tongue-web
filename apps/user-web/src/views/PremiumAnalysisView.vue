<template>
  <section class="health-home-dashboard">
    <header class="home-hero">
      <div class="hero-copy">
        <span class="page-kicker">AI HEALTH COMPANION</span>
        <p class="greeting">{{ greeting }}，{{ displayName }}</p>
        <h1>从一张清晰舌象，<span>开始理解身体的连续变化</span></h1>
        <p class="hero-description">完成舌象识别、结构化报告、健康计划和长期趋势观察，让每一次记录都能被清晰理解和持续追踪。</p>

        <div class="hero-actions">
          <button class="primary-action" type="button" @click="startAnalysis">
            <Camera :size="17" />
            开始舌象分析
            <ArrowRight :size="16" />
          </button>
          <button class="secondary-action" type="button" :disabled="loading" @click="loadDashboard(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新首页
          </button>
        </div>

        <div class="hero-trust">
          <span><ShieldCheck :size="14" /> 健康数据受保护</span>
          <span><Sparkles :size="14" /> 支持连续追问</span>
          <span><History :size="14" /> 保留趋势记录</span>
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

        <div class="scan-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="scan-glass">
            <div class="scan-symbol">
              <ScanLine :size="66" :stroke-width="1.55" />
            </div>
            <span class="camera-orbit"><Camera :size="21" /></span>
            <span class="scan-beam" />
          </div>
        </div>
      </div>
    </header>

    <section v-if="loading && !dashboard" class="overview-skeleton" aria-label="正在加载首页数据">
      <span v-for="index in 4" :key="index" />
    </section>

    <section v-else class="home-overview" aria-label="健康空间概览">
      <article class="overview-card overview-reports">
        <span class="overview-icon"><FileText :size="21" /></span>
        <span class="overview-copy">
          <small>历史报告</small>
          <strong>{{ reportCount }}<em>份</em></strong>
          <span>{{ reportCount ? "持续积累健康档案" : "完成首次分析后开始记录" }}</span>
        </span>
        <RouterLink to="/reports" aria-label="查看历史报告"><ArrowUpRight :size="15" /></RouterLink>
      </article>

      <article class="overview-card overview-latest">
        <span class="overview-icon"><HeartPulse :size="21" /></span>
        <span class="overview-copy">
          <small>最近状态</small>
          <strong class="status-value">{{ latestReport ? "已更新" : "待分析" }}</strong>
          <span>{{ latestReport ? formatDate(latestReport.createdAt) : "上传一张舌象照片" }}</span>
        </span>
        <button v-if="latestReport" type="button" aria-label="查看最近报告" @click="openLatestReport"><ArrowUpRight :size="15" /></button>
      </article>

      <article class="overview-card overview-trend">
        <span class="overview-icon"><TrendingUp :size="21" /></span>
        <span class="overview-copy">
          <small>趋势观察</small>
          <strong class="status-value">{{ trendReady ? "可查看" : "积累中" }}</strong>
          <span>{{ trendMessage }}</span>
        </span>
        <RouterLink to="/trends" aria-label="查看趋势分析"><ArrowUpRight :size="15" /></RouterLink>
      </article>

      <article class="overview-card overview-notice">
        <span class="overview-icon"><MessagesSquare :size="21" /></span>
        <span class="overview-copy">
          <small>待查看通知</small>
          <strong>{{ unreadNotificationCount }}<em>条</em></strong>
          <span>{{ unreadNotificationCount ? "有新的分析或审核动态" : "暂无未读提醒" }}</span>
        </span>
        <RouterLink to="/notifications" aria-label="查看通知中心"><ArrowUpRight :size="15" /></RouterLink>
      </article>
    </section>

    <section class="health-command-center">
      <div class="section-heading">
        <div>
          <span class="page-kicker">HEALTH COMMAND CENTER</span>
          <h2>今天，从最重要的一件事开始</h2>
          <p>系统根据最近报告、健康计划和待办状态，为您整理当前最值得关注的内容。</p>
        </div>
        <span class="online-badge"><i /> 数据已同步</span>
      </div>

      <div class="command-grid">
        <article class="latest-report-card">
          <header>
            <div>
              <span class="card-kicker">LATEST REPORT</span>
              <h3>最近一次舌象报告</h3>
            </div>
            <span :class="[ 'report-state', { ready: latestReport } ]">
              {{ latestReport ? "可查看" : "等待分析" }}
            </span>
          </header>

          <template v-if="latestReport">
            <div class="report-main">
              <div class="score-ring" :style="{ '--score-angle': `${latestScore * 3.6}deg` }">
                <span><strong>{{ healthScoreText }}</strong><small>质量分</small></span>
              </div>
              <div class="report-copy">
                <time>{{ formatFullDate(latestReport.createdAt) }}</time>
                <h4>{{ latestReport.featureSummary || "本次舌象状态已完成分析" }}</h4>
                <p>进入报告可查看特征解释、健康建议、追问记录和医生复核入口。</p>
              </div>
            </div>

            <div class="report-actions">
              <button type="button" @click="openLatestReport">
                查看完整报告
                <ArrowRight :size="15" />
              </button>
              <button class="outline-action" type="button" @click="focusAssistant('请结合我最近的舌象报告，详细解释主要特征和需要注意的地方。')">
                结合报告提问
              </button>
            </div>
          </template>

          <div v-else class="report-empty">
            <span><FileText :size="27" /></span>
            <div>
              <strong>还没有舌象报告</strong>
              <p>完成第一次分析后，这里会展示最近报告、质量评分和特征摘要。</p>
            </div>
            <button type="button" @click="startAnalysis">立即开始</button>
          </div>
        </article>

        <article class="plan-card">
          <header>
            <div>
              <span class="card-kicker">DAILY CARE</span>
              <h3>今日健康计划</h3>
            </div>
            <span class="plan-icon"><Target :size="21" /></span>
          </header>

          <template v-if="currentPlan">
            <div class="plan-status">
              <span :class="{ complete: Boolean(currentPlan.todayCheckin) }">
                <Check v-if="currentPlan.todayCheckin" :size="15" />
                <Clock3 v-else :size="15" />
              </span>
              <div>
                <strong>{{ currentPlan.todayCheckin ? "今天已经完成记录" : "今天还有计划待执行" }}</strong>
                <p>计划来自报告 #{{ currentPlan.sourceReportId }}</p>
              </div>
            </div>

            <div class="plan-facts">
              <span><CalendarDays :size="15" /> {{ formatDate(currentPlan.startDate) }} - {{ formatDate(currentPlan.endDate) }}</span>
              <span><Camera :size="15" /> 下次复拍：{{ currentPlan.nextRetakeDate ? formatDate(currentPlan.nextRetakeDate) : "已完成" }}</span>
            </div>

            <RouterLink class="plan-link" to="/health-plan">
              查看今日计划
              <ArrowRight :size="15" />
            </RouterLink>
          </template>

          <div v-else class="plan-empty">
            <span><Target :size="26" /></span>
            <strong>暂无进行中的健康计划</strong>
            <p>在新版报告中生成 7 天计划，把建议拆解成可执行的每日行动。</p>
            <RouterLink to="/reports">从报告生成计划</RouterLink>
          </div>
        </article>

        <article class="todo-card">
          <header>
            <div>
              <span class="card-kicker">NEXT ACTIONS</span>
              <h3>待处理事项</h3>
            </div>
            <span class="todo-count">{{ todos.length }}</span>
          </header>

          <div v-if="todos.length" class="todo-list">
            <button v-for="item in todos.slice(0, 3)" :key="`${item.type}-${item.reportId || item.reviewId || item.taskId || item.title}`" type="button" @click="openTodo(item)">
              <span class="todo-icon"><component :is="todoIcon(item.type)" :size="17" /></span>
              <span class="todo-copy">
                <strong>{{ item.title }}</strong>
                <small>{{ item.content || todoFallback(item.type) }}</small>
              </span>
              <ArrowRight :size="15" />
            </button>
          </div>

          <div v-else class="todo-empty">
            <span><Check :size="24" /></span>
            <strong>当前没有待处理事项</strong>
            <p>新的分析、打卡或医生复核任务会出现在这里。</p>
          </div>
        </article>
      </div>
    </section>

    <section class="quick-services">
      <div class="section-heading">
        <div>
          <span class="page-kicker">QUICK SERVICES</span>
          <h2>常用健康服务</h2>
          <p>快速进入报告、趋势、计划和医生复核等核心功能。</p>
        </div>
      </div>

      <div class="service-grid">
        <RouterLink v-for="service in services" :key="service.to" :to="service.to" class="service-card">
          <span :class="[ 'service-icon', service.kind ]"><component :is="service.icon" :size="22" /></span>
          <div>
            <strong>{{ service.title }}</strong>
            <p>{{ service.description }}</p>
          </div>
          <ArrowUpRight :size="16" />
        </RouterLink>
      </div>
    </section>

    <section class="question-panel">
      <div class="question-copy">
        <span class="question-icon"><Sparkles :size="22" /></span>
        <div>
          <span class="page-kicker">SUGGESTED QUESTIONS</span>
          <h2>不知道如何开始？试试这些问题</h2>
          <p>点击问题后会自动定位到下方健康助手，并填入对应内容。</p>
        </div>
      </div>

      <div class="question-list">
        <button v-for="item in quickQuestions" :key="item" type="button" @click="focusAssistant(item)">
          <span>{{ item }}</span>
          <ArrowRight :size="14" />
        </button>
      </div>
    </section>

    <section v-if="showAssistant" ref="assistantSectionRef" class="assistant-shell">
      <div class="assistant-heading">
        <div>
          <span class="card-kicker">健康助手</span>
          <h2>继续提问或上传新的舌象照片</h2>
        </div>
        <span class="assistant-status"><i />在线</span>
      </div>
      <AnalysisV2View />
    </section>

    <p v-if="loadError" class="load-error">
      <ShieldCheck :size="15" />部分首页数据暂时未能加载，可以刷新后重试。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  FileText,
  HeartPulse,
  History,
  MessagesSquare,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-vue-next";
import {
  healthPlanApi,
  tongueApi,
  useAuthStore,
  type DashboardData,
  type DashboardTodo,
  type HealthPlan,
  type ReportListItem,
} from "@tongue/shared";
import AnalysisV2View from "./AnalysisV2View.vue";

const auth = useAuthStore();
const router = useRouter();
const props = withDefaults(defineProps<{ showAssistant?: boolean }>(), { showAssistant: true });
const dashboard = ref<DashboardData | null>(null);
const currentPlan = ref<HealthPlan | null>(null);
const assistantSectionRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const loadError = ref(false);

const quickQuestions = [
  "请解释我最近一次舌象报告中的主要特征。",
  "根据我的情况，饮食上最需要注意什么？",
  "我适合安排哪些温和、可持续的运动？",
  "睡眠状态可能会怎样影响舌象变化？",
];

const services = [
  { title: "历史报告", description: "查看历次分析与特征摘要", to: "/reports", icon: FileText, kind: "green" },
  { title: "趋势分析", description: "观察多次报告中的连续变化", to: "/trends", icon: TrendingUp, kind: "blue" },
  { title: "健康计划", description: "完成每日饮食、睡眠和运动任务", to: "/health-plan", icon: Target, kind: "orange" },
  { title: "医生复核", description: "申请专业医生补充复核意见", to: "/doctors", icon: HeartPulse, kind: "purple" },
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
const healthScoreText = computed(() => typeof latestReport.value?.analysisQualityScore === "number"
  ? Math.round(latestReport.value.analysisQualityScore)
  : "--");
const latestScore = computed(() => typeof latestReport.value?.analysisQualityScore === "number"
  ? Math.max(0, Math.min(100, latestReport.value.analysisQualityScore))
  : 0);
const trendReady = computed(() => dashboard.value?.trendStatus?.status === "READY");
const trendMessage = computed(() => String(dashboard.value?.trendStatus?.message || "至少需要 2 份报告"));
const unreadNotificationCount = computed(() => dashboard.value?.unreadNotificationCount || 0);
const todos = computed(() => dashboard.value?.todos || []);

onMounted(() => loadDashboard());

async function loadDashboard(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;
  loadError.value = false;

  try {
    const [dashboardData, planData] = await Promise.all([
      tongueApi.dashboard(),
      healthPlanApi.current(),
    ]);
    dashboard.value = dashboardData;
    currentPlan.value = planData;
    if (showSuccess) ElMessage.success("首页数据已刷新");
  } catch (error) {
    console.error("load dashboard failed", error);
    loadError.value = true;
    if (showSuccess) ElMessage.error("首页数据刷新失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

function formatDate(value?: string) {
  if (!value) return "最近完成";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(date);
}

function formatFullDate(value?: string) {
  if (!value) return "时间未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function openLatestReport() {
  if (latestReport.value) router.push(`/reports/${latestReport.value.reportId}`);
}

function assistantRoot() {
  return assistantSectionRef.value || document.querySelector<HTMLElement>(".replacement-assistant");
}

function scrollToAssistant() {
  assistantRoot()?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startAnalysis() {
  scrollToAssistant();
  window.setTimeout(() => {
    const root = assistantRoot() || document;
    root.querySelector<HTMLButtonElement>(".image-upload-button")?.click();
  }, 430);
}

function focusAssistant(question: string) {
  scrollToAssistant();
  window.setTimeout(() => {
    const root = assistantRoot() || document;
    const textarea = root.querySelector<HTMLTextAreaElement>("textarea");
    if (!textarea) return;
    textarea.value = question;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  }, 380);
}

function todoIcon(type?: string) {
  const value = String(type || "").toUpperCase();
  if (value.includes("PLAN") || value.includes("CHECKIN")) return Target;
  if (value.includes("REVIEW") || value.includes("DOCTOR")) return HeartPulse;
  if (value.includes("REPORT") || value.includes("ANALYSIS")) return FileText;
  return Activity;
}

function todoFallback(type?: string) {
  const value = String(type || "").toUpperCase();
  if (value.includes("PLAN") || value.includes("CHECKIN")) return "完成今天的健康计划记录。";
  if (value.includes("REVIEW") || value.includes("DOCTOR")) return "查看医生复核的最新状态。";
  if (value.includes("REPORT") || value.includes("ANALYSIS")) return "查看最新舌象分析内容。";
  return "查看当前需要处理的健康事项。";
}

function openTodo(item: DashboardTodo) {
  const action = String(item.action || "").toLowerCase();
  if (action.startsWith("/")) {
    router.push(action);
    return;
  }
  if (item.reportId) {
    router.push(`/reports/${item.reportId}`);
    return;
  }
  if (item.reviewId) {
    router.push("/reviews");
    return;
  }
  if (String(item.type || "").toUpperCase().includes("PLAN")) {
    router.push("/health-plan");
    return;
  }
  router.push("/analysis");
}
</script>

<style scoped>
.health-home-dashboard {
  --home-ink: #182820;
  --home-muted: #79857d;
  --home-line: rgba(137, 155, 143, 0.22);
  --home-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
}

.home-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 64%) minmax(290px, 36%);
  align-items: center;
  min-height: 334px;
  overflow: hidden;
  padding: 42px 44px;
  border: 1px solid var(--home-line);
  border-radius: 29px;
  background:
    radial-gradient(circle at 83% 26%, rgba(179, 226, 191, 0.34), transparent 29%),
    radial-gradient(circle at 98% 100%, rgba(211, 237, 212, 0.76), transparent 35%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #edf8ee 100%);
  box-shadow: 0 23px 55px rgba(37, 71, 49, 0.075);
  animation: reveal-up 520ms ease-out both;
}

.hero-copy {
  position: relative;
  z-index: 3;
}

.page-kicker,
.card-kicker {
  display: block;
  color: #43805f;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.greeting {
  margin: 14px 0 0;
  color: #4f6658;
  font-size: 14px;
  font-weight: 650;
}

.home-hero h1 {
  max-width: 790px;
  margin: 8px 0 0;
  color: var(--home-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(40px, 4.25vw, 58px);
  font-weight: 520;
  line-height: 1.2;
  letter-spacing: -0.055em;
}

.home-hero h1 span {
  color: var(--home-green);
}

.hero-description {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--home-muted);
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
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 15px;
  border-radius: 13px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 680;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.primary-action {
  border: 1px solid #267c50;
  background: linear-gradient(150deg, #3d9364, #276f4c);
  color: white;
  box-shadow: 0 10px 20px rgba(38, 124, 80, 0.2);
}

.secondary-action {
  border: 1px solid rgba(72, 116, 88, 0.18);
  background: rgba(255, 255, 255, 0.75);
  color: #526d5e;
}

.primary-action:hover,
.secondary-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.secondary-action:disabled { cursor: wait; opacity: 0.55; }

.hero-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.hero-trust span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 29px;
  padding: 0 9px;
  border: 1px solid rgba(70, 120, 87, 0.13);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: #607267;
  font-size: 8px;
}

.hero-visual {
  position: relative;
  min-height: 230px;
}

.visual-grid {
  position: absolute;
  inset: -60px -60px -60px 0;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 23%);
  animation: grid-drift 18s linear infinite alternate;
}

.visual-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(53, 142, 84, 0.2);
  border-radius: 50%;
}

.orbit-one { width: 320px; height: 138px; animation: orbit-one 9s ease-in-out infinite; }
.orbit-two { width: 258px; height: 185px; animation: orbit-two 11s ease-in-out infinite; }

.visual-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one { top: 29px; left: 24px; }
.dot-two { right: 17px; bottom: 36px; animation-delay: 1.1s; }

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
.spark-one { top: 36px; right: 39px; animation: sparkle 4s ease-in-out infinite; }
.spark-two { bottom: 32px; left: 36px; animation: sparkle 4.6s 1.1s ease-in-out infinite; }

.scan-stage {
  position: absolute;
  top: 11px;
  right: 8%;
  width: 285px;
  height: 215px;
  animation: stage-float 5.7s ease-in-out infinite;
}

.stage-halo {
  position: absolute;
  top: 25px;
  left: 50%;
  width: 175px;
  height: 175px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.2);
  filter: blur(31px);
  transform: translateX(-50%);
}

.stage-platform {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  transform: translateX(-50%);
}

.platform-back {
  bottom: 4px;
  width: 270px;
  height: 73px;
  border: 1px solid rgba(68, 155, 94, 0.22);
  background: linear-gradient(180deg, rgba(250, 253, 250, 0.86), rgba(225, 242, 227, 0.9));
  box-shadow: inset 0 10px 20px rgba(87, 166, 106, 0.1);
}

.platform-front {
  bottom: 18px;
  width: 215px;
  height: 42px;
  border: 1px solid rgba(68, 155, 94, 0.17);
  background: rgba(255, 255, 255, 0.68);
}

.scan-glass {
  position: absolute;
  top: 1px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 154px;
  height: 181px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 57px 57px 42px 42px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.scan-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 47px 47px 34px 34px;
  content: "";
}

.scan-glass::after {
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

.scan-symbol {
  position: relative;
  z-index: 2;
  display: grid;
  width: 93px;
  height: 102px;
  place-items: center;
  border-radius: 33px 33px 29px 29px;
  background: linear-gradient(155deg, #52b978, #248653);
  color: white;
  box-shadow:
    0 14px 22px rgba(38, 135, 74, 0.25),
    inset 10px 10px 15px rgba(255, 255, 255, 0.15),
    inset -12px -13px 18px rgba(17, 97, 52, 0.28);
}

.camera-orbit {
  position: absolute;
  right: -3px;
  bottom: 24px;
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

.scan-beam {
  position: absolute;
  z-index: 3;
  width: 104px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(190, 255, 209, 0.95), transparent);
  box-shadow: 0 0 12px rgba(151, 238, 179, 0.7);
  animation: scan-beam 3.6s ease-in-out infinite;
}

.home-overview,
.overview-skeleton {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 13px;
  min-height: 116px;
  padding: 19px;
  overflow: hidden;
  border: 1px solid var(--home-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 130ms; }
.overview-card:nth-child(4) { animation-delay: 190ms; }

.overview-card::after {
  position: absolute;
  right: -28px;
  bottom: -44px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  content: "";
  opacity: 0.55;
}

.overview-icon {
  position: relative;
  z-index: 2;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
}

.overview-reports .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-reports::after { background: #edf7ef; }
.overview-latest .overview-icon { background: #f8eadf; color: #a96745; }
.overview-latest::after { background: #fbefe6; }
.overview-trend .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-trend::after { background: #edf4f8; }
.overview-notice .overview-icon { background: #f0ecf7; color: #746097; }
.overview-notice::after { background: #f5f0fa; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 9px; }
.overview-copy strong { margin-top: 5px; color: #21342a; font-size: 25px; font-weight: 700; line-height: 1; }
.overview-copy .status-value { font-size: 18px; }
.overview-copy em { margin-left: 4px; font-size: 8px; font-style: normal; font-weight: 520; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }

.overview-card > a,
.overview-card > button {
  position: relative;
  z-index: 3;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.62);
  color: #5e7566;
  cursor: pointer;
}

.overview-skeleton span {
  height: 116px;
  border-radius: 19px;
  background: linear-gradient(90deg, #edf1ed 25%, #f8faf8 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.health-command-center,
.quick-services,
.question-panel,
.assistant-shell {
  padding: 26px 27px;
  border: 1px solid var(--home-line);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
}

.health-command-center { animation: reveal-up 560ms 190ms ease-out both; }
.quick-services { animation: reveal-up 560ms 235ms ease-out both; }
.question-panel { animation: reveal-up 560ms 275ms ease-out both; }

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2,
.question-copy h2,
.assistant-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.section-heading p,
.question-copy p {
  margin: 7px 0 0;
  color: #89938d;
  font-size: 10px;
  line-height: 1.65;
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #4b735c;
  font-size: 9px;
}

.online-badge i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #42a66d;
  box-shadow: 0 0 0 5px rgba(66, 166, 109, 0.12);
}

.command-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.72fr) minmax(260px, 0.72fr);
  gap: 14px;
  margin-top: 21px;
}

.latest-report-card,
.plan-card,
.todo-card {
  position: relative;
  overflow: hidden;
  padding: 20px;
  border: 1px solid rgba(145, 162, 151, 0.19);
  border-radius: 20px;
  background: #fffefa;
  box-shadow: 0 10px 25px rgba(35, 66, 47, 0.035);
}

.latest-report-card::after,
.plan-card::after,
.todo-card::after {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 155px;
  height: 155px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(205, 233, 210, 0.42), transparent 70%);
  content: "";
  pointer-events: none;
}

.latest-report-card > header,
.plan-card > header,
.todo-card > header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px;
}

.latest-report-card h3,
.plan-card h3,
.todo-card h3 {
  margin: 6px 0 0;
  color: #2b3e33;
  font-size: 16px;
}

.report-state,
.todo-count {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0 9px;
  border-radius: 999px;
  background: #f0f3f1;
  color: #849087;
  font-size: 8px;
}

.report-state.ready { background: #e5f1e8; color: #317451; }
.todo-count { min-width: 26px; padding: 0; background: #e6f1e9; color: #2f7a50; font-weight: 700; }

.report-main {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  margin-top: 21px;
}

.score-ring {
  --score-angle: 0deg;
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#348b5a var(--score-angle), #e8eee9 0deg);
  box-shadow: 0 10px 20px rgba(49, 127, 82, 0.09);
}

.score-ring > span {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  background: #fffefa;
}

.score-ring strong { color: #2f754d; font-size: 24px; }
.score-ring small { color: #87938b; font-size: 7px; }

.report-copy time { color: #5a8068; font-size: 8px; }
.report-copy h4 { margin: 7px 0 0; color: #2e4136; font-size: 14px; line-height: 1.45; }
.report-copy p { margin: 8px 0 0; color: #7b867f; font-size: 9px; line-height: 1.65; }

.report-actions {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.report-actions button,
.report-empty button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 37px;
  padding: 0 12px;
  border: 1px solid #286f49;
  border-radius: 10px;
  background: linear-gradient(150deg, #398d5e, #246b46);
  color: white;
  cursor: pointer;
  font-size: 9px;
  font-weight: 680;
}

.report-actions .outline-action {
  border-color: rgba(70, 98, 82, 0.17);
  background: #f8faf8;
  color: #52655a;
}

.report-empty,
.plan-empty,
.todo-empty {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: center;
  align-content: center;
  min-height: 192px;
  text-align: center;
}

.report-empty > span,
.plan-empty > span,
.todo-empty > span,
.plan-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #e8f2ea;
  color: #347b53;
}

.report-empty strong,
.plan-empty strong,
.todo-empty strong { margin-top: 11px; color: #344a3d; font-size: 11px; }
.report-empty p,
.plan-empty p,
.todo-empty p { max-width: 310px; margin: 7px 0 0; color: #7c8780; font-size: 9px; line-height: 1.6; }
.report-empty button { margin-top: 13px; }
.plan-empty a { margin-top: 13px; color: #2e7d50; font-size: 9px; font-weight: 680; text-decoration: none; }

.plan-status {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 11px;
  margin-top: 22px;
  padding: 13px;
  border-radius: 14px;
  background: #f5f8f5;
}

.plan-status > span {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  background: #f7ead7;
  color: #9a6c35;
}

.plan-status > span.complete { background: #dfeee2; color: #2f8052; }
.plan-status strong { color: #344a3d; font-size: 10px; }
.plan-status p { margin: 5px 0 0; color: #879189; font-size: 8px; }

.plan-facts {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.plan-facts span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #708078;
  font-size: 8px;
}

.plan-link {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 37px;
  margin-top: 18px;
  padding: 0 11px;
  border-radius: 10px;
  background: #2d7850;
  color: white;
  font-size: 9px;
  font-weight: 680;
  text-decoration: none;
}

.todo-list {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 8px;
  margin-top: 17px;
}

.todo-list button {
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 9px;
  min-height: 61px;
  padding: 9px;
  border: 1px solid rgba(145, 162, 151, 0.15);
  border-radius: 13px;
  background: #fafcf9;
  cursor: pointer;
  text-align: left;
  transition: border-color 180ms ease, transform 180ms ease;
}

.todo-list button:hover {
  border-color: rgba(51, 133, 81, 0.28);
  transform: translateX(3px);
}

.todo-icon {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 11px;
  background: #e9f2eb;
  color: #3a8056;
}

.todo-copy { display: grid; min-width: 0; gap: 4px; }
.todo-copy strong { overflow: hidden; color: #3b5043; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.todo-copy small { overflow: hidden; color: #879189; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.todo-list button > svg { color: #718079; }

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 21px;
}

.service-card {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
  min-height: 100px;
  padding: 16px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 17px;
  background: #fffefa;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(35, 66, 47, 0.03);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.service-card:hover {
  border-color: rgba(52, 138, 83, 0.3);
  box-shadow: 0 14px 28px rgba(35, 66, 47, 0.07);
  transform: translateY(-3px);
}

.service-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
}

.service-icon.green { background: #e8f3eb; color: #347d54; }
.service-icon.blue { background: #e8f0f6; color: #4b7895; }
.service-icon.orange { background: #f9ecd9; color: #a36d30; }
.service-icon.purple { background: #eeeaf6; color: #746494; }
.service-card strong { color: #34483c; font-size: 11px; }
.service-card p { margin: 5px 0 0; color: #879189; font-size: 8px; line-height: 1.55; }
.service-card > svg { color: #718079; }

.question-panel {
  display: grid;
  grid-template-columns: minmax(280px, 0.75fr) minmax(0, 1.25fr);
  align-items: center;
  gap: 24px;
  background:
    radial-gradient(circle at 0% 100%, rgba(221, 240, 225, 0.55), transparent 34%),
    rgba(255, 255, 253, 0.96);
}

.question-copy {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
}

.question-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #e6f1e9;
  color: #347d54;
}

.question-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.question-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 45px;
  padding: 0 12px;
  border: 1px solid rgba(145, 162, 151, 0.17);
  border-radius: 12px;
  background: white;
  color: #506359;
  cursor: pointer;
  font-size: 9px;
  text-align: left;
  transition: border-color 180ms ease, transform 180ms ease;
}

.question-list button:hover {
  border-color: rgba(50, 135, 81, 0.3);
  transform: translateX(3px);
}

.assistant-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.assistant-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #4e725d;
  font-size: 9px;
}

.assistant-status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #42a66d;
  box-shadow: 0 0 0 5px rgba(66, 166, 109, 0.12);
}

.load-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0;
  color: #9a6b4c;
  font-size: 9px;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
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

@keyframes scan-beam {
  0%, 100% { top: 46px; opacity: 0.4; }
  50% { top: 132px; opacity: 1; }
}

@keyframes skeleton {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1120px) {
  .home-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .home-hero h1 { font-size: clamp(37px, 3.9vw, 50px); }
  .scan-stage { right: 1%; }
  .home-overview,
  .overview-skeleton { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .command-grid { grid-template-columns: 1fr 1fr; }
  .latest-report-card { grid-column: 1 / -1; }
  .service-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .home-hero {
    grid-template-columns: 1fr;
    min-height: 295px;
  }

  .hero-copy { max-width: 76%; }

  .hero-visual {
    position: absolute;
    right: -35px;
    bottom: -35px;
    width: 340px;
    opacity: 0.42;
    pointer-events: none;
    transform: scale(0.8);
  }

  .question-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .health-home-dashboard { gap: 14px; }

  .home-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .home-hero h1 { font-size: clamp(34px, 10vw, 47px); }
  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .home-overview,
  .overview-skeleton { grid-template-columns: 1fr; }

  .health-command-center,
  .quick-services,
  .question-panel,
  .assistant-shell {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .command-grid,
  .service-grid,
  .question-list {
    grid-template-columns: 1fr;
  }

  .latest-report-card { grid-column: auto; }

  .report-main {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .score-ring { width: 76px; height: 76px; }
  .score-ring > span { width: 60px; height: 60px; }
  .score-ring strong { font-size: 20px; }
}

@media (max-width: 520px) {
  .home-hero { padding: 26px 20px; }
  .hero-actions button { flex: 1; }
  .hero-trust { display: grid; }

  .overview-card {
    grid-template-columns: 44px minmax(0, 1fr) 26px;
    padding: 16px;
  }

  .overview-icon { width: 44px; height: 44px; }
  .report-main { grid-template-columns: 1fr; }
  .score-ring { justify-self: center; }
  .report-actions { flex-direction: column; }
  .question-copy { grid-template-columns: 42px minmax(0, 1fr); }
  .question-icon { width: 42px; height: 42px; }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero,
  .overview-card,
  .health-command-center,
  .quick-services,
  .question-panel,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .visual-spark,
  .scan-stage,
  .scan-glass::after,
  .scan-beam,
  .overview-skeleton span,
  .spinning {
    animation: none;
  }

  .primary-action,
  .secondary-action,
  .todo-list button,
  .service-card,
  .question-list button {
    transition: none;
  }

  .primary-action:hover,
  .secondary-action:hover,
  .todo-list button:hover,
  .service-card:hover,
  .question-list button:hover {
    transform: none;
  }
}
</style>
