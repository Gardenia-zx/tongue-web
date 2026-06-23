<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">审核订单</h2>
        <p class="th-subtitle">查看用户申请的医生审核订单。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column prop="id" label="订单 ID" width="110" />
      <el-table-column prop="reportId" label="报告 ID" width="110" />
      <el-table-column prop="userId" label="用户 ID" width="110" />
      <el-table-column prop="doctorUserId" label="医生用户 ID" width="140" />
      <el-table-column label="状态" width="140">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="userRemark" label="用户备注" min-width="260" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { StatusTag, adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.reviews()) as Record<string, any>[];
}

onMounted(load);
</script>
