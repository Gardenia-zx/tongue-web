<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">审核队列</h2>
        <p class="th-subtitle">查看用户提交的医生审核申请。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table :data="orders">
      <el-table-column prop="reviewId" label="订单 ID" width="120" />
      <el-table-column prop="reportId" label="报告 ID" width="120" />
      <el-table-column label="状态" width="140">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="userRemark" label="用户备注" min-width="260" show-overflow-tooltip />
      <el-table-column label="创建时间" width="190">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'SUBMITTED'" link type="primary" @click="accept(row.reviewId)">接单</el-button>
          <el-button link type="primary" @click="$router.push(`/reviews/${row.reviewId}`)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { StatusTag, formatDateTime, reviewApi, type ReviewOrder } from "@tongue/shared";

const orders = ref<ReviewOrder[]>([]);

async function load() {
  orders.value = await reviewApi.doctorQueue();
}

async function accept(reviewId: number) {
  await reviewApi.accept(reviewId);
  ElMessage.success("已接单");
  await load();
}

onMounted(load);
</script>
