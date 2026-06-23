<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">用户列表</h2>
        <p class="th-subtitle">展示 app_user 表中的账号。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="phone" label="手机号" min-width="150" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }"><el-tag>{{ row.role }}</el-tag></template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { StatusTag, adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.users()) as Record<string, any>[];
}

onMounted(load);
</script>
