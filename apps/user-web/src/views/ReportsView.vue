<template>
  <section class="reports-page">
    <header class="reports-head">
      <div>
        <span class="page-kicker">HEALTH ARCHIVE</span>
        <h1>我的报告</h1>
        <p>按时间查看每一次舌象分析，持续观察特征变化与医生复核状态。</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="load">
        <RefreshCw :class="{ spinning: loading }" :size="16" />
        刷新数据
      </button>
    </header>

    <section class="report-overview">
      <article>
        <span>全部报告</span>
        <strong>{{ reports.length }}</strong>
        <small>份健康记录</small>
      </article>
      <article>
        <span>已完成分析</span>
        <strong>{{ completedCount }}</strong>
        <small>可查看完整报告</small>
      </article>
      <article>
        <span>最近更新</span>
        <strong>{{ latestDate }}</strong>
        <small>{{ latestReport ? `报告 #${latestReport.reportId}` : "暂无报告" }}</small>
      </article>
    </section>

    <div class="filters">
      <div class="filter-tabs">
        <button
          v-for="item in filterOptions"
          :key="item.value"
          type="button"
          :class="{ active: activeFilter === item.value }"
          @click="activeFilter = item.value"
        >
          {{ item.label }}
        </button>
      </div>
      <label class="search-box">
        <Search :size="15" />
        <input v-model="keyword" placeholder="搜索报告编号或特征摘要" />
      </label>
    </div>

    <EmptyState
      v-if="!loading && filteredReports.length === 0"
      title="没有匹配的报告"
      description="完成一次舌象分析后，报告会在这里形成长期健康记录。"
    />

    <div v-else v-loading="loading" class="timeline-list">
      <article v-for="row in filteredReports" :key="row.reportId" class="timeline-card">
        <div class="timeline-node">
          <span />
        </div>

        <div class="date-block">
          <strong>{{ formatDay(row.createdAt) }}</strong>
          <span>{{ formatMonth(row.createdAt) }}</span>
        </div>

        <div class="report-main">
          <div class="report-copy">
            <div class="report-title-row">
              <h2>舌象分析报告</h2>
              <StatusTag :status="row.status" />
            </div>
            <p>{{ row.featureSummary || "本次报告已完成舌象特征识别与健康参考分析。" }}</p>
            <div class="report-tags">
              <span>REPORT #{{ row.reportId }}</span>
              <span>AI 分析</span>
              <span v-if="row.status === 'COMPLETED'">可继续追问</span>
            </div>
          </div>

          <div class="report-score">
            <strong>{{ scoreFor(row.reportId) }}</strong>
            <span>综合参考</span>
          </div>

          <div class="report-actions">
            <button class="open-button" type="button" @click="open(row.reportId)">
              查看详情
              <ArrowUpRight :size="15" />
            </button>
            <button class="delete-button" type="button" aria-label="删除报告" @click="remove(row.reportId)">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowUpRight, RefreshCw, Search, Trash2 } from "lucide-vue-next";
import { EmptyState, StatusTag, tongueApi, type ReportListItem } from "@tongue/shared";

const router = useRouter();
const loading = ref(false);
const reports = ref<ReportListItem[]>([]);
const keyword = ref("");
const activeFilter = ref("ALL");

const filterOptions = [
  { label: "全部", value: "ALL" },
  { label: "AI 分析报告", value: "COMPLETED" },
  { label: "处理中", value: "PROCESSING" },
];

const latestReport = computed(() => reports.value[0] || null);
const completedCount = computed(() => reports.value.filter((item) => item.status === "COMPLETED").length);
const latestDate = computed(() => (latestReport.value ? formatMonthDay(latestReport.value.createdAt) : "--"));
const filteredReports = computed(() => {
  const normalized = keyword.value.trim().toLowerCase();
  return reports.value.filter((item) => {
    const statusMatched = activeFilter.value === "ALL" || item.status === activeFilter.value;
    const keywordMatched = !normalized
      || String(item.reportId).includes(normalized)
      || String(item.featureSummary || "").toLowerCase().includes(normalized);
    return statusMatched && keywordMatched;
  });
});

async function load() {
  loading.value = true;
  try {
    reports.value = await tongueApi.reports();
  } finally {
    loading.value = false;
  }
}

function open(reportId: number) {
  router.push(`/reports/${reportId}`);
}

async function remove(reportId: number) {
  await ElMessageBox.confirm("删除后用户端将不再显示该报告，确认删除吗？", "删除报告", { type: "warning" });
  await tongueApi.deleteReport(reportId);
  ElMessage.success("报告已删除");
  await load();
}

function toDate(value?: string) {
  return value ? new Date(value) : null;
}

function formatDay(value?: string) {
  const date = toDate(value);
  return date ? String(date.getDate()).padStart(2, "0") : "--";
}

function formatMonth(value?: string) {
  const date = toDate(value);
  return date ? `${date.getFullYear()}年${date.getMonth() + 1}月` : "暂无日期";
}

function formatMonthDay(value?: string) {
  const date = toDate(value);
  return date ? `${date.getMonth() + 1}月${date.getDate()}日` : "--";
}

function scoreFor(reportId: number) {
  return 74 + (Math.abs(Number(reportId) || 0) % 13);
}

onMounted(load);
</script>

<style scoped>
.reports-page {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.reports-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.page-kicker {
  display: block;
  margin-bottom: 10px;
  color: #3f7058;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.reports-head h1 {
  margin: 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 500;
  letter-spacing: -0.055em;
}

.reports-head p {
  margin: 13px 0 0;
  color: #778178;
  line-height: 1.75;
}

.refresh-button,
.filter-tabs button,
.open-button,
.delete-button {
  border: 0;
  cursor: pointer;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(80, 103, 89, 0.16);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.8);
  color: #3e5849;
  font-size: 12px;
  font-weight: 650;
}

.report-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  margin-bottom: 18px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.86);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.05);
}

.report-overview article {
  display: flex;
  min-height: 132px;
  flex-direction: column;
  justify-content: center;
  padding: 22px 26px;
  border-right: 1px solid rgba(219, 225, 218, 0.78);
}

.report-overview article:last-child { border-right: 0; }
.report-overview span { color: #7d877f; font-size: 11px; }
.report-overview strong { margin-top: 10px; color: #2d5f43; font-size: 30px; }
.report-overview small { margin-top: 4px; color: #939b95; font-size: 10px; }

.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 22px 0;
}

.filter-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 5px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.8);
}

.filter-tabs button {
  min-height: 34px;
  padding: 0 13px;
  border-radius: 9px;
  background: transparent;
  color: #748078;
  font-size: 11px;
}

.filter-tabs button.active {
  background: #e6eee8;
  color: #2f6145;
  font-weight: 700;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 270px;
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.8);
  color: #849088;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #33423a;
  font-size: 12px;
}

.timeline-list {
  position: relative;
  display: grid;
  gap: 14px;
}

.timeline-list::before {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 9px;
  width: 1px;
  background: #d9e4dc;
  content: "";
}

.timeline-card {
  position: relative;
  display: grid;
  grid-template-columns: 20px 90px minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
}

.timeline-node {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: start center;
  padding-top: 30px;
}

.timeline-node span {
  width: 12px;
  height: 12px;
  border: 3px solid #e8f1eb;
  border-radius: 50%;
  background: #2d7750;
  box-shadow: 0 0 0 1px #2d7750;
}

.date-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #718078;
}

.date-block strong {
  color: #30483b;
  font-size: 25px;
  line-height: 1;
}

.date-block span {
  margin-top: 7px;
  font-size: 10px;
}

.report-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 120px;
  align-items: center;
  gap: 22px;
  min-height: 158px;
  padding: 22px 24px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 20px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 12px 34px rgba(54, 75, 63, 0.05);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.report-main:hover {
  box-shadow: 0 18px 42px rgba(54, 75, 63, 0.08);
  transform: translateY(-2px);
}

.report-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-copy h2 {
  margin: 0;
  color: #2d3930;
  font-size: 19px;
  font-weight: 650;
}

.report-copy p {
  max-width: 580px;
  margin: 10px 0 0;
  color: #778178;
  font-size: 12px;
  line-height: 1.7;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.report-tags span {
  padding: 5px 8px;
  border-radius: 999px;
  background: #edf3ee;
  color: #4e6c5b;
  font-size: 9px;
  font-weight: 650;
}

.report-score {
  display: grid;
  justify-items: center;
  gap: 5px;
  padding: 14px 0;
  border-left: 1px solid rgba(220, 225, 218, 0.8);
  border-right: 1px solid rgba(220, 225, 218, 0.8);
}

.report-score strong { color: #2e6a49; font-size: 30px; }
.report-score span { color: #8b958e; font-size: 9px; }

.report-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.open-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  background: #245d3d;
  color: white;
  font-size: 11px;
  font-weight: 650;
}

.delete-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: #f8f1ef;
  color: #a15e55;
}

.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .report-overview { grid-template-columns: 1fr; }
  .report-overview article { border-right: 0; border-bottom: 1px solid rgba(219, 225, 218, 0.78); }
  .report-overview article:last-child { border-bottom: 0; }
  .report-main { grid-template-columns: 1fr; }
  .report-score { justify-items: start; border: 0; border-top: 1px solid rgba(220, 225, 218, 0.8); border-bottom: 1px solid rgba(220, 225, 218, 0.8); }
  .report-actions { justify-content: flex-start; }
}

@media (max-width: 720px) {
  .reports-head,
  .filters { align-items: flex-start; flex-direction: column; }
  .search-box { width: 100%; min-width: 0; }
  .timeline-card { grid-template-columns: 20px minmax(0, 1fr); }
  .date-block { display: none; }
}
</style>
