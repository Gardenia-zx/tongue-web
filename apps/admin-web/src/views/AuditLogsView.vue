<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">审计日志</h2>
        <p class="th-subtitle">记录管理员关键操作。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="adminUserId" label="管理员" width="120" />
      <el-table-column prop="action" label="操作" width="180" />
      <el-table-column prop="targetType" label="对象类型" width="160" />
      <el-table-column prop="targetId" label="对象 ID" width="120" />
      <el-table-column prop="detailJson" label="详情" min-width="260" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="180" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.auditLogs()) as Record<string, any>[];
}

onMounted(load);
</script>
