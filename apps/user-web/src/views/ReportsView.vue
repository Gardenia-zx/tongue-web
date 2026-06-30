<template>
  <section class="reports-page">
    <header class="reports-hero">
      <div class="hero-copy">
        <span class="page-kicker">HEALTH ARCHIVE</span>
        <h1>留住记录，<span>看见每一次健康变化</span></h1>
        <p>按时间管理舌象分析报告，持续回顾特征摘要、分析质量与医生复核相关信息。</p>

        <div class="hero-actions">
          <RouterLink class="primary-action" to="/analysis">
            <ScanLine :size="17" />
            开始新的分析
            <ArrowRight :size="16" />
          </RouterLink>
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新报告
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

        <div class="archive-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="archive-glass">
            <div class="archive-symbol">
              <Archive :size="64" :stroke-width="1.65" />
            </div>
            <span class="report-orbit"><FileText :size="21" /></span>
          </div>
        </div>
      </div>
    </header>

    <section class="report-overview" aria-label="报告概览">
      <article class="overview-card overview-total">
        <span class="overview-icon"><Archive :size="21" /></span>
        <span class="overview-copy">
          <small>全部报告</small>
          <strong>{{ reports.length }}<em>份</em></strong>
          <span>当前账号下的健康记录</span>
        </span>
      </article>

      <article class="overview-card overview-completed">
        <span class="overview-icon"><CircleCheck2 :size="21" /></span>
        <span class="overview-copy">
          <small>已完成分析</small>
          <strong>{{ completedCount }}<em>份</em></strong>
          <span>可查看完整分析内容</span>
        </span>
      </article>

      <article class="overview-card overview-processing">
        <span class="overview-icon"><Clock3 :size="21" /></span>
        <span class="overview-copy">
          <small>处理中</small>
          <strong>{{ processingCount }}<em>份</em></strong>
          <span>正在生成或整理报告</span>
        </span>
      </article>

      <article class="overview-card overview-latest">
        <span class="overview-icon"><CalendarDays :size="21" /></span>
        <span class="overview-copy">
          <small>最近更新</small>
          <strong class="latest-value">{{ latestDate }}</strong>
          <span>{{ latestReport ? `报告 #${latestReport.reportId}` : "暂无报告" }}</span>
        </span>
      </article>
    </section>

    <section class="archive-guide">
      <span class="guide-icon"><ShieldCheck :size="23" /></span>
      <div class="guide-copy">
        <span class="page-kicker">YOUR HEALTH DATA</span>
        <strong>报告如何帮助长期观察？</strong>
        <p>保持相似拍摄条件并定期记录，有助于回顾舌象特征和健康计划的连续变化。</p>
      </div>
      <div class="guide-steps" aria-label="健康档案使用流程">
        <span><b>01</b>完成分析</span>
        <i />
        <span><b>02</b>保存报告</span>
        <i />
        <span><b>03</b>持续观察</span>
      </div>
      <RouterLink class="guide-link" to="/trends">
        查看趋势
        <ArrowRight :size="15" />
      </RouterLink>
    </section>

    <section class="archive-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">REPORT LIBRARY</span>
          <h2>历史报告</h2>
          <p>筛选报告状态或搜索报告编号、特征摘要，按月份查看健康记录。</p>
        </div>
        <span class="result-count">{{ filteredReports.length }} 份结果</span>
      </div>

      <div class="report-toolbar">
        <div class="filter-tabs" role="tablist" aria-label="报告状态筛选">
          <button
            v-for="item in filterOptions"
            :key="item.value"
            type="button"
            :class="{ active: activeFilter === item.value }"
            role="tab"
            :aria-selected="activeFilter === item.value"
            @click="activeFilter = item.value"
          >
            {{ item.label }}
            <span>{{ item.count }}</span>
          </button>
        </div>

        <label class="search-box">
          <Search :size="17" />
          <input v-model="keyword" placeholder="搜索报告编号或特征摘要" />
          <button v-if="keyword" type="button" aria-label="清除搜索" @click="keyword = ''">
            <X :size="14" />
          </button>
        </label>
      </div>

      <div v-if="loading && reports.length === 0" class="report-skeleton-list" aria-label="正在加载报告">
        <article v-for="index in 3" :key="index" class="report-skeleton">
          <span class="skeleton-date" />
          <span class="skeleton-copy">
            <span />
            <span />
            <span />
          </span>
          <span class="skeleton-score" />
          <span class="skeleton-action" />
        </article>
      </div>

      <div v-else-if="groupedReports.length === 0" class="empty-report-state">
        <div class="empty-visual" aria-hidden="true">
          <span class="empty-halo" />
          <span class="empty-orbit orbit-a" />
          <span class="empty-orbit orbit-b" />
          <div class="empty-icon"><FileSearch :size="40" :stroke-width="1.65" /></div>
        </div>
        <span class="page-kicker">BUILD YOUR ARCHIVE</span>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyDescription }}</p>
        <div class="empty-actions">
          <RouterLink class="empty-primary" to="/analysis">
            开始舌象分析
            <ArrowRight :size="15" />
          </RouterLink>
          <button v-if="keyword || activeFilter !== 'ALL'" class="empty-secondary" type="button" @click="resetFilters">
            重置筛选
          </button>
        </div>
      </div>

      <div v-else class="report-groups">
        <section v-for="group in groupedReports" :key="group.key" class="report-group">
          <div class="group-heading">
            <div>
              <span class="month-dot" />
              <h3>{{ group.label }}</h3>
            </div>
            <small>{{ group.items.length }} 份报告</small>
          </div>

          <div class="report-list">
            <article
              v-for="(row, index) in group.items"
              :key="row.reportId"
              :class="[ 'report-card', `state-${statusKind(row.status)}` ]"
              :style="{ animationDelay: `${Math.min(index, 8) * 50}ms` }"
            >
              <div class="date-tile">
                <span>{{ formatMonthShort(row.createdAt) }}</span>
                <strong>{{ formatDay(row.createdAt) }}</strong>
                <small>{{ formatYear(row.createdAt) }}</small>
              </div>

              <div class="report-content">
                <header class="report-title-row">
                  <div>
                    <span class="report-eyebrow">REPORT #{{ row.reportId }}</span>
                    <h4>舌象分析报告</h4>
                  </div>
                  <StatusTag :status="row.status" />
                </header>

                <p>{{ row.featureSummary || fallbackSummary(row.status) }}</p>

                <div class="report-tags">
                  <span><ScanLine :size="13" /> AI 舌象分析</span>
                  <span v-if="row.analysisQualityLevel"><Sparkles :size="13" /> {{ qualityLevelText(row.analysisQualityLevel) }}</span>
                  <span v-if="row.status === 'COMPLETED'"><MessageCircle :size="13" /> 可继续追问</span>
                  <span v-else><Clock3 :size="13" /> {{ statusDescription(row.status) }}</span>
                </div>
              </div>

              <div class="quality-panel">
                <div
                  :class="[ 'score-ring', { empty: qualityScore(row) === '--' } ]"
                  :style="{ '--score-angle': scoreAngle(row) }"
                >
                  <span><strong>{{ qualityScore(row) }}</strong><small v-if="qualityScore(row) !== '--'">分</small></span>
                </div>
                <p>分析质量</p>
                <small>{{ qualityHint(row) }}</small>
              </div>

              <div class="report-actions">
                <button class="open-button" type="button" @click="open(row.reportId)">
                  查看完整报告
                  <ArrowUpRight :size="15" />
                </button>
                <button
                  class="delete-button"
                  type="button"
                  :disabled="deletingId === row.reportId"
                  @click="remove(row.reportId)"
                >
                  <Trash2 :size="15" />
                  {{ deletingId === row.reportId ? "删除中" : "删除报告" }}
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <footer class="archive-note">
      <ShieldCheck :size="15" />
      <span>报告用于健康记录和日常观察，不构成疾病诊断；删除操作执行后用户端将不再显示该报告。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleCheck2,
  Clock3,
  FileSearch,
  FileText,
  MessageCircle,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-vue-next";
import { StatusTag, tongueApi, type ReportListItem } from "@tongue/shared";

type FilterValue = "ALL" | "COMPLETED" | "PROCESSING";

const router = useRouter();
const loading = ref(false);
const deletingId = ref<number | null>(null);
const reports = ref<ReportListItem[]>([]);
const keyword = ref("");
const activeFilter = ref<FilterValue>("ALL");

const sortedReports = computed(() => [...reports.value].sort((left, right) => (
  timestampOf(right.createdAt) - timestampOf(left.createdAt)
)));

const latestReport = computed(() => sortedReports.value[0] || null);
const completedCount = computed(() => reports.value.filter((item) => statusKind(item.status) === "completed").length);
const processingCount = computed(() => reports.value.filter((item) => statusKind(item.status) === "processing").length);
const latestDate = computed(() => (latestReport.value ? formatMonthDay(latestReport.value.createdAt) : "--"));

const filterOptions = computed(() => [
  { label: "全部", value: "ALL" as const, count: reports.value.length },
  { label: "已完成", value: "COMPLETED" as const, count: completedCount.value },
  { label: "处理中", value: "PROCESSING" as const, count: processingCount.value },
]);

const filteredReports = computed(() => {
  const normalized = keyword.value.trim().toLowerCase();

  return sortedReports.value.filter((item) => {
    const kind = statusKind(item.status);
    const statusMatched = activeFilter.value === "ALL"
      || (activeFilter.value === "COMPLETED" && kind === "completed")
      || (activeFilter.value === "PROCESSING" && kind === "processing");
    const keywordMatched = !normalized
      || String(item.reportId).includes(normalized)
      || String(item.featureSummary || "").toLowerCase().includes(normalized)
      || String(item.analysisQualityLevel || "").toLowerCase().includes(normalized);

    return statusMatched && keywordMatched;
  });
});

const groupedReports = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: ReportListItem[] }>();

  for (const report of filteredReports.value) {
    const date = safeDate(report.createdAt);
    const key = date ? `${date.getFullYear()}-${date.getMonth() + 1}` : "unknown";
    const label = date ? `${date.getFullYear()}年 ${date.getMonth() + 1}月` : "日期未知";
    const group = groups.get(key) || { key, label, items: [] };
    group.items.push(report);
    groups.set(key, group);
  }

  return [...groups.values()];
});

const emptyTitle = computed(() => {
  if (keyword.value.trim()) return "没有找到匹配的报告";
  if (activeFilter.value === "COMPLETED") return "还没有已完成的报告";
  if (activeFilter.value === "PROCESSING") return "当前没有处理中的报告";
  return "从第一份报告开始建立健康档案";
});

const emptyDescription = computed(() => {
  if (keyword.value.trim()) return "可以调整搜索关键词，或清除筛选条件后再次查看。";
  if (activeFilter.value !== "ALL") return "切换到其他状态，或完成一次新的舌象分析。";
  return "完成舌象分析后，报告会按时间保存于此，帮助您持续回顾特征和健康建议。";
});

async function load(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    reports.value = await tongueApi.reports();
    if (showSuccess) ElMessage.success("报告数据已刷新");
  } catch (error) {
    console.error("load reports failed", error);
    ElMessage.error("报告加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

function open(reportId: number) {
  router.push(`/reports/${reportId}`);
}

async function remove(reportId: number) {
  if (deletingId.value !== null) return;

  try {
    await ElMessageBox.confirm(
      "删除后，该报告将不再显示在用户端健康档案中。确认继续吗？",
      "删除健康报告",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "保留报告",
      },
    );
  } catch {
    return;
  }

  deletingId.value = reportId;

  try {
    await tongueApi.deleteReport(reportId);
    reports.value = reports.value.filter((item) => item.reportId !== reportId);
    ElMessage.success("报告已删除");
  } catch (error) {
    console.error("delete report failed", error);
    ElMessage.error("报告删除失败，请稍后重试");
  } finally {
    deletingId.value = null;
  }
}

function resetFilters() {
  keyword.value = "";
  activeFilter.value = "ALL";
}

function statusKind(status?: string) {
  const value = String(status || "").toUpperCase();
  if (["COMPLETED", "FINAL", "FINISHED", "SUCCESS"].includes(value)) return "completed";
  if (["FAILED", "ERROR", "CANCELLED", "CANCELED"].includes(value)) return "failed";
  return "processing";
}

function statusDescription(status?: string) {
  const kind = statusKind(status);
  if (kind === "failed") return "分析未完成";
  if (kind === "completed") return "分析已完成";
  return "报告生成中";
}

function fallbackSummary(status?: string) {
  const kind = statusKind(status);
  if (kind === "completed") return "本次报告已完成舌象特征识别与健康参考分析。";
  if (kind === "failed") return "本次分析未能完成，可以重新发起一次舌象分析。";
  return "报告正在生成和整理中，完成后可查看舌象特征与健康参考内容。";
}

function qualityScore(row: ReportListItem) {
  if (typeof row.analysisQualityScore !== "number") return "--";
  return String(Math.max(0, Math.min(100, Math.round(row.analysisQualityScore))));
}

function scoreAngle(row: ReportListItem) {
  const score = typeof row.analysisQualityScore === "number"
    ? Math.max(0, Math.min(100, row.analysisQualityScore))
    : 0;
  return `${score * 3.6}deg`;
}

function qualityLevelText(level?: string) {
  const map: Record<string, string> = {
    EXCELLENT: "质量优秀",
    GOOD: "质量良好",
    FAIR: "质量一般",
    POOR: "建议重拍",
    HIGH: "高质量",
    MEDIUM: "中等质量",
    LOW: "较低质量",
  };
  const normalized = String(level || "").toUpperCase();
  return map[normalized] || String(level || "分析质量");
}

function qualityHint(row: ReportListItem) {
  if (typeof row.analysisQualityScore !== "number") return "暂未评分";
  if (row.analysisQualityScore >= 90) return "图像与结果较完整";
  if (row.analysisQualityScore >= 75) return "分析条件基本良好";
  if (row.analysisQualityScore >= 60) return "建议结合说明查看";
  return "建议保持光线后重拍";
}

function safeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function timestampOf(value?: string) {
  return safeDate(value)?.getTime() || 0;
}

function formatDay(value?: string) {
  const date = safeDate(value);
  return date ? String(date.getDate()).padStart(2, "0") : "--";
}

function formatMonthShort(value?: string) {
  const date = safeDate(value);
  return date ? `${date.getMonth() + 1}月` : "日期";
}

function formatYear(value?: string) {
  const date = safeDate(value);
  return date ? String(date.getFullYear()) : "未知";
}

function formatMonthDay(value?: string) {
  const date = safeDate(value);
  return date ? `${date.getMonth() + 1}月${date.getDate()}日` : "--";
}

onMounted(() => load());
</script>

<style scoped>
.reports-page {
  --archive-ink: #182820;
  --archive-muted: #79857d;
  --archive-line: rgba(137, 155, 143, 0.22);
  --archive-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.reports-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 39px 44px;
  border: 1px solid var(--archive-line);
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

.reports-hero h1 {
  margin: 13px 0 0;
  color: var(--archive-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(39px, 4.1vw, 56px);
  font-weight: 520;
  line-height: 1.17;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.reports-hero h1 span {
  color: var(--archive-green);
}

.reports-hero p {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--archive-muted);
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

.archive-stage {
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

.archive-glass {
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

.archive-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.archive-glass::after {
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

.archive-symbol {
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

.report-orbit {
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

.report-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 116px;
  padding: 19px 20px;
  overflow: hidden;
  border: 1px solid var(--archive-line);
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

.overview-total .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-total::after { background: #edf7ef; }
.overview-completed .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-completed::after { background: #edf4f8; }
.overview-processing .overview-icon { background: #fbefd8; color: #ad7412; }
.overview-processing::after { background: #fcf4e4; }
.overview-latest .overview-icon { background: #f0ecf7; color: #746097; }
.overview-latest::after { background: #f5f0fa; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 9px; }
.overview-copy strong { margin-top: 5px; color: #21342a; font-size: 25px; font-weight: 700; line-height: 1; }
.overview-copy em { margin-left: 4px; font-size: 9px; font-style: normal; font-weight: 520; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.overview-copy .latest-value { font-size: 21px; }

.archive-guide {
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

.archive-panel {
  padding: 26px 27px;
  border: 1px solid var(--archive-line);
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

.report-toolbar {
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr);
  align-items: center;
  gap: 16px;
  margin-top: 21px;
  padding: 15px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 17px;
  background: #f7f9f7;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  padding: 5px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 14px;
  background: #f0f4f1;
}

.filter-tabs button {
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

.filter-tabs button > span {
  display: grid;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  place-items: center;
  border-radius: 999px;
  background: rgba(119, 130, 122, 0.09);
  font-size: 8px;
}

.filter-tabs button.active {
  background: white;
  color: #267e50;
  box-shadow: 0 6px 16px rgba(35, 66, 47, 0.08);
}

.filter-tabs button.active > span { background: #e7f2e9; color: #267e50; }

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
}

.report-groups {
  display: grid;
  gap: 24px;
  margin-top: 23px;
}

.group-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 11px;
}

.group-heading > div {
  display: flex;
  align-items: center;
  gap: 9px;
}

.month-dot {
  width: 9px;
  height: 9px;
  border: 2px solid #eaf4ec;
  border-radius: 50%;
  background: #358b5b;
  box-shadow: 0 0 0 1px #358b5b;
}

.group-heading h3 { margin: 0; color: #42584b; font-size: 12px; }
.group-heading small { color: #98a19b; font-size: 9px; }

.report-list {
  display: grid;
  gap: 12px;
  padding-left: 13px;
  border-left: 1px solid #e0e8e2;
}

.report-card {
  position: relative;
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 130px 155px;
  align-items: stretch;
  gap: 20px;
  overflow: hidden;
  padding: 20px;
  border: 1px solid rgba(145, 162, 151, 0.22);
  border-radius: 20px;
  background: #fffefa;
  box-shadow: 0 11px 27px rgba(35, 66, 47, 0.04);
  animation: card-enter 430ms ease-out both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.report-card::after {
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

.report-card:hover {
  border-color: rgba(55, 139, 86, 0.31);
  box-shadow: 0 18px 40px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.state-processing { border-color: rgba(181, 132, 53, 0.2); }
.state-failed { border-color: rgba(181, 84, 75, 0.18); background: #fffbfa; }

.date-tile {
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 105px;
  border: 1px solid rgba(77, 139, 96, 0.12);
  border-radius: 17px;
  background: linear-gradient(155deg, #f4f9f5, #e6f1e9);
  color: #315e43;
}

.date-tile span { font-size: 9px; }
.date-tile strong { margin-top: 5px; font-family: "Noto Serif SC", "Source Han Serif SC", serif; font-size: 27px; line-height: 1; }
.date-tile small { margin-top: 6px; color: #7b8980; font-size: 8px; }

.report-content {
  align-self: center;
  min-width: 0;
}

.report-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 13px;
}

.report-eyebrow {
  color: #518269;
  font-size: 8px;
  font-weight: 740;
  letter-spacing: 0.12em;
}

.report-title-row h4 {
  margin: 5px 0 0;
  color: #293b31;
  font-size: 17px;
  font-weight: 710;
}

.report-content > p {
  display: -webkit-box;
  max-width: 650px;
  margin: 11px 0 0;
  overflow: hidden;
  color: #768078;
  font-size: 10px;
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.report-tags span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 25px;
  padding: 0 8px;
  border: 1px solid rgba(63, 122, 84, 0.08);
  border-radius: 999px;
  background: #eaf2eb;
  color: #426c52;
  font-size: 8px;
}

.quality-panel {
  position: relative;
  z-index: 2;
  display: grid;
  align-content: center;
  justify-items: center;
  padding-inline: 16px;
  border-left: 1px solid #e5e9e5;
  border-right: 1px solid #e5e9e5;
  text-align: center;
}

.score-ring {
  --score-angle: 0deg;
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#348b5a var(--score-angle), #e8eee9 0deg);
  box-shadow: 0 8px 16px rgba(49, 127, 82, 0.08);
}

.score-ring > span {
  display: flex;
  align-items: baseline;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fffefa;
}

.score-ring strong { align-self: center; color: #2f754d; font-size: 19px; }
.score-ring small { align-self: center; margin-left: 2px; color: #819087; font-size: 7px; }
.score-ring.empty { background: #e8eee9; }
.quality-panel > p { margin: 8px 0 0; color: #4f6658; font-size: 9px; font-weight: 680; }
.quality-panel > small { margin-top: 4px; color: #929b95; font-size: 7px; }

.report-actions {
  position: relative;
  z-index: 2;
  display: grid;
  align-content: center;
  gap: 9px;
}

.open-button,
.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 11px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 680;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.open-button {
  border: 1px solid #286f49;
  background: linear-gradient(150deg, #398d5e, #246b46);
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.delete-button {
  border: 1px solid rgba(177, 76, 67, 0.16);
  background: #fff5f3;
  color: #b34f47;
}

.open-button:hover,
.delete-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.delete-button:disabled { cursor: wait; opacity: 0.55; }

.empty-report-state {
  display: grid;
  min-height: 390px;
  margin-top: 22px;
  place-items: center;
  align-content: center;
  padding: 38px 20px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 30%, rgba(218, 238, 222, 0.5), transparent 27%),
    linear-gradient(180deg, #fffefa, #fbfdfb);
  text-align: center;
}

.empty-report-state h3 { margin: 12px 0 0; color: #293b31; font-size: 20px; }
.empty-report-state > p { max-width: 520px; margin: 9px 0 0; color: #7c8780; font-size: 10px; line-height: 1.7; }

.empty-visual { position: relative; width: 148px; height: 120px; margin-bottom: 9px; }
.empty-halo { position: absolute; top: 10px; left: 50%; width: 100px; height: 100px; border-radius: 50%; background: rgba(72, 169, 103, 0.15); filter: blur(23px); transform: translateX(-50%); }
.empty-orbit { position: absolute; left: 50%; border: 1px dashed rgba(56, 145, 86, 0.22); border-radius: 50%; transform: translateX(-50%); }
.orbit-a { bottom: 10px; width: 142px; height: 45px; animation: empty-orbit 6s ease-in-out infinite; }
.orbit-b { bottom: 17px; width: 105px; height: 29px; animation: empty-orbit 7s 0.8s ease-in-out infinite reverse; }
.empty-icon { position: absolute; top: 8px; left: 50%; z-index: 2; display: grid; width: 76px; height: 84px; place-items: center; border: 1px solid rgba(64, 149, 91, 0.18); border-radius: 27px 27px 22px 22px; background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(224, 242, 228, 0.86)); color: #357f55; box-shadow: 0 14px 25px rgba(43, 125, 75, 0.13); transform: translateX(-50%); animation: empty-float 4.8s ease-in-out infinite; }

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
  border: 1px solid #286f49;
  background: #28774d;
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.empty-secondary {
  border: 1px solid rgba(70, 98, 82, 0.17);
  background: #fffefa;
  color: #52655a;
  cursor: pointer;
}

.report-skeleton-list {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.report-skeleton {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 130px 155px;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 20px;
}

.skeleton-date,
.skeleton-copy span,
.skeleton-score,
.skeleton-action {
  background: linear-gradient(90deg, #edf1ed 25%, #f8faf8 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.skeleton-date { width: 76px; height: 105px; border-radius: 17px; }
.skeleton-copy { display: grid; gap: 10px; }
.skeleton-copy span { height: 9px; border-radius: 999px; }
.skeleton-copy span:nth-child(1) { width: 32%; }
.skeleton-copy span:nth-child(2) { width: 74%; }
.skeleton-copy span:nth-child(3) { width: 52%; }
.skeleton-score { width: 70px; height: 70px; justify-self: center; border-radius: 50%; }
.skeleton-action { height: 86px; border-radius: 12px; }

.archive-note {
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

@media (max-width: 1120px) {
  .reports-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .reports-hero h1 { font-size: clamp(36px, 3.8vw, 48px); }
  .archive-stage { right: 3%; }
  .report-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .report-card,
  .report-skeleton {
    grid-template-columns: 76px minmax(0, 1fr) 125px;
  }

  .report-actions,
  .skeleton-action {
    grid-column: 2 / -1;
  }

  .report-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .reports-hero {
    grid-template-columns: 1fr;
    min-height: 235px;
  }

  .reports-hero h1 { white-space: normal; }
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

  .archive-guide {
    grid-template-columns: 50px minmax(0, 1fr) auto;
  }

  .guide-steps { display: none; }

  .report-toolbar {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    width: max-content;
    max-width: 100%;
  }

  .report-card,
  .report-skeleton {
    grid-template-columns: 70px minmax(0, 1fr);
  }

  .quality-panel {
    grid-column: 1 / -1;
    grid-template-columns: 68px auto auto;
    justify-content: start;
    gap: 13px;
    padding: 14px 0;
    border: 0;
    border-top: 1px solid #e5e9e5;
    border-bottom: 1px solid #e5e9e5;
    text-align: left;
  }

  .quality-panel > p,
  .quality-panel > small {
    align-self: center;
    margin: 0;
  }

  .report-actions,
  .skeleton-action {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .reports-page { gap: 14px; }

  .reports-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .reports-hero h1 { font-size: clamp(34px, 10vw, 47px); }
  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }
  .report-overview { grid-template-columns: 1fr; }

  .archive-guide {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 18px;
  }

  .guide-link { grid-column: 2; }

  .archive-panel {
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

  .filter-tabs button {
    flex: 1;
    justify-content: center;
    white-space: nowrap;
  }

  .report-list {
    padding-left: 8px;
  }
}

@media (max-width: 520px) {
  .reports-hero { padding: 26px 20px; }
  .reports-hero p { font-size: 13px; }
  .hero-actions a,
  .hero-actions button { flex: 1; }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 17px;
  }

  .overview-icon { width: 44px; height: 44px; }
  .archive-panel { padding: 18px 15px; }

  .report-card {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .date-tile {
    grid-template-columns: auto auto auto;
    align-items: baseline;
    justify-content: start;
    gap: 6px;
    min-height: 48px;
    padding: 0 13px;
  }

  .date-tile strong { margin: 0; font-size: 21px; }
  .date-tile small { margin: 0; }

  .report-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .quality-panel {
    grid-column: 1;
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .score-ring { width: 58px; height: 58px; }
  .score-ring > span { width: 46px; height: 46px; }
  .quality-panel > small { grid-column: 2; margin-top: -20px; }

  .report-actions {
    grid-column: 1;
    grid-template-columns: 1fr;
  }

  .empty-actions {
    width: 100%;
    flex-direction: column;
  }

  .report-skeleton {
    grid-template-columns: 1fr;
  }

  .skeleton-date,
  .skeleton-score,
  .skeleton-action {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reports-hero,
  .overview-card,
  .archive-guide,
  .archive-panel,
  .report-card,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .visual-spark,
  .archive-stage,
  .archive-glass::after,
  .empty-icon,
  .empty-orbit,
  .skeleton-date,
  .skeleton-copy span,
  .skeleton-score,
  .skeleton-action,
  .spinning {
    animation: none;
  }

  .primary-action,
  .ghost-action,
  .filter-tabs button,
  .report-card,
  .open-button,
  .delete-button {
    transition: none;
  }

  .primary-action:hover,
  .ghost-action:hover,
  .report-card:hover,
  .open-button:hover,
  .delete-button:hover {
    transform: none;
  }
}
</style>
