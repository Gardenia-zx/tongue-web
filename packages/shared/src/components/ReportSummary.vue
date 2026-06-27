<template>
  <section class="report-summary">
    <div class="summary-mark" aria-hidden="true">
      <FileText :size="20" :stroke-width="1.7" />
    </div>
    <div class="summary-content">
      <header>
        <div>
          <span class="summary-label">报告 #{{ reportId }}</span>
          <h3>{{ title }}</h3>
        </div>
        <StatusTag :status="status" />
      </header>
      <p>{{ summary }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FileText } from "lucide-vue-next";
import StatusTag from "./StatusTag.vue";

const props = defineProps<{
  report: {
    id?: number;
    reportId?: number;
    status?: string;
    reportStatus?: string;
    summary?: string;
    featureSummary?: string;
  };
}>();

const reportId = computed(() => props.report.reportId || props.report.id || "-");
const title = computed(() => props.report.featureSummary || "舌象分析报告");
const status = computed(() => props.report.reportStatus || props.report.status);
const summary = computed(() => props.report.summary || props.report.featureSummary || "报告生成后将在这里展示核心说明。");
</script>

<style scoped>
.report-summary {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 16px;
  padding: clamp(20px, 3vw, 28px);
  border: 1px solid rgba(185, 194, 184, 0.68);
  border-radius: var(--th-radius-lg);
  background:
    radial-gradient(circle at 100% 0, rgba(226, 235, 229, 0.8), transparent 22rem),
    rgba(255, 254, 253, 0.9);
  box-shadow: var(--th-shadow-sm);
}

.summary-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.summary-content {
  min-width: 0;
}

.report-summary header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 13px;
}

.summary-label {
  display: block;
  margin-bottom: 6px;
  color: var(--th-primary);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.report-summary h3 {
  margin: 0;
  font-size: clamp(20px, 2vw, 27px);
  font-weight: 640;
  letter-spacing: -0.04em;
  line-height: 1.25;
  text-wrap: balance;
}

.report-summary p {
  max-width: 72ch;
  margin: 0;
  color: var(--th-text-muted);
  font-size: 14px;
  line-height: 1.82;
  white-space: pre-wrap;
  text-wrap: pretty;
}

@media (max-width: 640px) {
  .report-summary {
    grid-template-columns: 1fr;
  }

  .report-summary header {
    flex-direction: column;
  }
}
</style>
