<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">任务管理</h2>
        <p class="th-subtitle">查看异步分析任务状态和失败原因。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column prop="id" label="任务 ID" width="110" />
      <el-table-column prop="reportId" label="报告 ID" width="110" />
      <el-table-column prop="userId" label="用户 ID" width="110" />
      <el-table-column label="状态" width="140">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="currentStage" label="阶段" width="160" />
      <el-table-column prop="errorCode" label="错误码" width="140" />
      <el-table-column prop="errorMessage" label="错误信息" min-width="260" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { StatusTag, adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.tasks()) as Record<string, any>[];
}

onMounted(load);
</script>
