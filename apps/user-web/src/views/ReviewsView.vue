<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">我的审核订单</h2>
        <p class="th-subtitle">AI 报告生成后，可以申请医生进行人工审核。</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <EmptyState v-if="orders.length === 0" title="暂无审核订单" description="在报告详情页点击申请医生审核后，订单会显示在这里。" />
    <el-table v-else :data="orders">
      <el-table-column prop="reviewId" label="订单 ID" width="120" />
      <el-table-column prop="reportId" label="报告 ID" width="120" />
      <el-table-column label="状态" width="140">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="userRemark" label="备注" min-width="240" show-overflow-tooltip />
      <el-table-column label="创建时间" width="190">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/reports/${row.reportId}`)">看报告</el-button>
          <el-button v-if="['SUBMITTED', 'ASSIGNED'].includes(row.status)" link type="danger" @click="cancel(row.reviewId)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { EmptyState, StatusTag, formatDateTime, reviewApi, type ReviewOrder } from "@tongue/shared";

const orders = ref<ReviewOrder[]>([]);

async function load() {
  orders.value = await reviewApi.my();
}

async function cancel(reviewId: number) {
  await reviewApi.cancel(reviewId);
  ElMessage.success("审核订单已取消");
  await load();
}

onMounted(load);
</script>
