<template>
  <div class="metrics-page">
    <section class="metrics-row">
      <MetricCard label="任务总数" :value="taskMetrics.task_count || 0" :icon="Activity" />
      <MetricCard label="报告总数" :value="taskMetrics.report_count || 0" :icon="FileText" />
      <MetricCard label="审核总数" :value="taskMetrics.review_count || 0" :icon="ClipboardCheck" />
      <MetricCard label="失败任务" :value="errorMetrics.failed_task_count || 0" :icon="AlertTriangle" />
    </section>

    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">指标 JSON</h2>
          <p class="th-subtitle">后续可以接入更完整的性能日志和错误分布。</p>
        </div>
        <el-button @click="load">刷新</el-button>
      </div>
      <pre>{{ JSON.stringify({ taskMetrics, errorMetrics }, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Activity, AlertTriangle, ClipboardCheck, FileText } from "lucide-vue-next";
import { MetricCard, adminApi, type AdminMetric } from "@tongue/shared";

const taskMetrics = ref<AdminMetric>({});
const errorMetrics = ref<AdminMetric>({});

async function load() {
  const [taskData, errorData] = await Promise.all([adminApi.taskMetrics(), adminApi.errorMetrics()]);
  taskMetrics.value = taskData;
  errorMetrics.value = errorData;
}

onMounted(load);
</script>

<style scoped>
.metrics-page {
  display: grid;
  gap: 18px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

pre {
  overflow: auto;
  padding: 14px;
  border-radius: var(--th-radius);
  background: #0f172a;
  color: #e5edf5;
}

@media (max-width: 1100px) {
  .metrics-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
