<template>
  <div class="dashboard">
    <section class="metrics-row">
      <MetricCard label="任务总数" :value="taskMetrics.task_count || 0" :icon="Activity" />
      <MetricCard label="报告总数" :value="taskMetrics.report_count || 0" :icon="FileText" />
      <MetricCard label="审核订单" :value="taskMetrics.review_count || 0" :icon="ClipboardCheck" />
      <MetricCard label="失败任务" :value="errorMetrics.failed_task_count || 0" :icon="AlertTriangle" />
    </section>

    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">系统状态</h2>
          <p class="th-subtitle">当前统计来自 Java 后端管理接口。</p>
        </div>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-descriptions border :column="2">
        <el-descriptions-item label="任务数">{{ taskMetrics.task_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="报告数">{{ taskMetrics.report_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="审核数">{{ taskMetrics.review_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="失败任务">{{ errorMetrics.failed_task_count || 0 }}</el-descriptions-item>
      </el-descriptions>
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
.dashboard {
  display: grid;
  gap: 18px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1100px) {
  .metrics-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>
