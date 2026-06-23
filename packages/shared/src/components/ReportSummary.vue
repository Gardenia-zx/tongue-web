<template>
  <section class="report-summary">
    <header>
      <div>
        <span>报告 ID {{ reportId }}</span>
        <h3>{{ title }}</h3>
      </div>
      <StatusTag :status="status" />
    </header>
    <p>{{ summary }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
  padding: 18px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
  background: var(--th-surface);
}

.report-summary header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.report-summary span {
  color: var(--th-text-muted);
  font-size: 13px;
}

.report-summary h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.report-summary p {
  margin: 0;
  color: var(--th-text-muted);
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
