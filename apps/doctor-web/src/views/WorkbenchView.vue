<template>
  <div class="workbench">
    <section class="metrics-row">
      <MetricCard label="待接单" :value="pending" :icon="Inbox" />
      <MetricCard label="审核中" :value="inReview" :icon="ClipboardCheck" />
      <MetricCard label="已完成" :value="completed" :icon="CheckCircle2" />
    </section>

    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">最近审核订单</h2>
          <p class="th-subtitle">优先处理已分配或审核中的订单。</p>
        </div>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="orders.slice(0, 8)">
        <el-table-column prop="reviewId" label="订单 ID" width="120" />
        <el-table-column prop="reportId" label="报告 ID" width="120" />
        <el-table-column label="状态" width="140">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="userRemark" label="用户备注" min-width="260" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/reviews/${row.reviewId}`)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CheckCircle2, ClipboardCheck, Inbox } from "lucide-vue-next";
import { MetricCard, StatusTag, reviewApi, type ReviewOrder } from "@tongue/shared";

const orders = ref<ReviewOrder[]>([]);
const pending = computed(() => orders.value.filter((item) => ["SUBMITTED", "ASSIGNED"].includes(item.status)).length);
const inReview = computed(() => orders.value.filter((item) => item.status === "IN_REVIEW").length);
const completed = computed(() => orders.value.filter((item) => item.status === "COMPLETED").length);

async function load() {
  orders.value = await reviewApi.doctorQueue();
}

onMounted(load);
</script>

<style scoped>
.workbench {
  display: grid;
  gap: 18px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 900px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>
