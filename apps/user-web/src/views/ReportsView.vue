<template>
  <section class="reports-page">
    <header class="reports-head">
      <div>
        <span class="page-kicker">健康档案</span>
        <h2>历史报告</h2>
        <p>按时间查看每一次舌象分析，持续观察特征变化。</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="load">
        <RefreshCw :class="{ spinning: loading }" :size="17" :stroke-width="1.7" />
        <span>刷新</span>
      </button>
    </header>

    <EmptyState
      v-if="!loading && reports.length === 0"
      title="还没有历史报告"
      description="完成一次舌象分析后，报告会在这里形成你的长期健康记录。"
    />

    <div v-else v-loading="loading" class="report-grid">
      <article v-for="row in reports" :key="row.reportId" class="report-card">
        <div class="card-top">
          <span class="report-icon" aria-hidden="true"><FileText :size="19" :stroke-width="1.7" /></span>
          <StatusTag :status="row.status" />
        </div>

        <div class="card-copy">
          <span class="report-number">REPORT #{{ row.reportId }}</span>
          <h3>{{ row.featureSummary || "舌象分析报告" }}</h3>
          <p>查看本次识别特征、健康说明与知识库依据。</p>
        </div>

        <div class="card-meta">
          <CalendarDays :size="15" :stroke-width="1.7" />
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </div>

        <footer class="card-actions">
          <button class="open-button" type="button" @click="open(row.reportId)">
            <span>查看报告</span>
            <ArrowUpRight :size="16" :stroke-width="1.7" />
          </button>
          <button class="delete-button" type="button" aria-label="删除报告" title="删除报告" @click="remove(row.reportId)">
            <Trash2 :size="16" :stroke-width="1.7" />
          </button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowUpRight, CalendarDays, FileText, RefreshCw, Trash2 } from "lucide-vue-next";
import { EmptyState, StatusTag, formatDateTime, tongueApi, type ReportListItem } from "@tongue/shared";

const router = useRouter();
const loading = ref(false);
const reports = ref<ReportListItem[]>([]);

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
  gap: 22px;
  margin-bottom: 26px;
}

.page-kicker {
  display: block;
  margin-bottom: 9px;
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 740;
  letter-spacing: 0.14em;
}

.reports-head h2 {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 590;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.reports-head p {
  margin: 12px 0 0;
  color: var(--th-text-muted);
  line-height: 1.7;
}

.refresh-button,
.open-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  transition: background var(--th-transition), color var(--th-transition), transform var(--th-transition);
}

.refresh-button {
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--th-border);
  border-radius: 12px;
  background: rgba(255, 254, 253, 0.72);
  color: var(--th-text-soft, #46534b);
  font-size: 13px;
  font-weight: 620;
}

.refresh-button:hover:not(:disabled) {
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.report-card {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  padding: 22px;
  border: 1px solid rgba(185, 194, 184, 0.7);
  border-radius: 22px;
  background:
    radial-gradient(circle at 100% 0, rgba(226, 235, 229, 0.8), transparent 20rem),
    rgba(255, 254, 253, 0.88);
  box-shadow: var(--th-shadow-sm);
  transition: border-color var(--th-transition), box-shadow var(--th-transition), transform var(--th-transition);
}

.report-card:hover {
  border-color: rgba(63, 101, 82, 0.35);
  box-shadow: var(--th-shadow);
  transform: translateY(-3px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.report-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.card-copy {
  margin: 29px 0 24px;
}

.report-number {
  display: block;
  margin-bottom: 9px;
  color: var(--th-accent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.card-copy h3 {
  margin: 0;
  font-size: clamp(21px, 2vw, 27px);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 1.28;
  text-wrap: balance;
}

.card-copy p {
  margin: 11px 0 0;
  color: var(--th-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  color: var(--th-text-muted);
  font-size: 12px;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid var(--th-border);
}

.open-button {
  gap: 8px;
  min-height: 38px;
  padding: 0 2px;
  background: transparent;
  color: var(--th-primary-dark);
  font-size: 13px;
  font-weight: 660;
}

.open-button:hover {
  color: var(--th-primary);
  transform: translateX(2px);
}

.delete-button {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: transparent;
  color: var(--th-text-muted);
}

.delete-button:hover {
  background: rgba(157, 81, 76, 0.09);
  color: var(--th-danger);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 760px) {
  .reports-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }

  .report-card {
    min-height: 270px;
  }
}
</style>
