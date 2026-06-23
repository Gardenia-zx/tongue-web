<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">历史报告</h2>
        <p class="th-subtitle">按生成时间倒序展示当前账号的舌象报告。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <EmptyState v-if="!loading && reports.length === 0" title="暂无历史报告" description="完成一次舌象分析后，报告会出现在这里。" />
    <el-table v-else v-loading="loading" :data="reports" class="report-table">
      <el-table-column prop="reportId" label="报告 ID" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="featureSummary" label="特征摘要" min-width="260" show-overflow-tooltip />
      <el-table-column label="创建时间" width="190">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/reports/${row.reportId}`)">查看</el-button>
          <el-button link type="danger" @click="remove(row.reportId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { EmptyState, StatusTag, formatDateTime, tongueApi, type ReportListItem } from "@tongue/shared";

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

async function remove(reportId: number) {
  await ElMessageBox.confirm("删除后用户端将不再显示该报告，确认删除吗？", "删除报告", { type: "warning" });
  await tongueApi.deleteReport(reportId);
  ElMessage.success("报告已删除");
  await load();
}

onMounted(load);
</script>
