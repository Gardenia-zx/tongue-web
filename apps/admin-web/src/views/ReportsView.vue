<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">报告管理</h2>
        <p class="th-subtitle">查看系统内全部舌象报告。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column prop="id" label="报告 ID" width="110" />
      <el-table-column prop="userId" label="用户 ID" width="110" />
      <el-table-column prop="taskId" label="任务 ID" width="110" />
      <el-table-column label="状态" width="130">
        <template #default="{ row }"><StatusTag :status="row.reportStatus" /></template>
      </el-table-column>
      <el-table-column prop="featureSummary" label="特征摘要" min-width="260" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { StatusTag, adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.reports()) as Record<string, any>[];
}

onMounted(load);
</script>
