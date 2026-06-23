<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">医生审核</h2>
        <p class="th-subtitle">审核医生提交的资料。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows">
      <el-table-column label="医生 ID" width="110">
        <template #default="{ row }">{{ row.id || row.doctorId }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="用户 ID" width="110" />
      <el-table-column prop="realName" label="姓名" width="140" />
      <el-table-column prop="title" label="职称" width="160" />
      <el-table-column prop="specialty" label="擅长方向" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" width="130">
        <template #default="{ row }"><StatusTag :status="row.reviewStatus" /></template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="approve(row.id || row.doctorId)">通过</el-button>
          <el-button link type="danger" @click="reject(row.id || row.doctorId)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { StatusTag, adminApi } from "@tongue/shared";

const rows = ref<Record<string, any>[]>([]);

async function load() {
  rows.value = (await adminApi.doctors()) as unknown as Record<string, any>[];
}

async function approve(id: number) {
  await adminApi.approveDoctor(id);
  ElMessage.success("已通过");
  await load();
}

async function reject(id: number) {
  await adminApi.rejectDoctor(id);
  ElMessage.success("已拒绝");
  await load();
}

onMounted(load);
</script>
