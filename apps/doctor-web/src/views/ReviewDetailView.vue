<template>
  <div class="review-detail">
    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">审核订单 {{ order?.reviewId || reviewId }}</h2>
          <p class="th-subtitle">查看 AI 报告并提交医生审核意见。</p>
        </div>
        <StatusTag :status="order?.status" />
      </div>

      <el-descriptions v-if="order" border :column="2">
        <el-descriptions-item label="报告 ID">{{ order.reportId }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ order.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户备注" :span="2">{{ order.userRemark || "-" }}</el-descriptions-item>
      </el-descriptions>

      <ReportSummary v-if="report" class="report-block" :report="report" />

      <el-form class="submit-form" label-position="top">
        <el-form-item label="审核意见">
          <el-input v-model="commentText" type="textarea" :rows="6" placeholder="填写医生审核意见和健康管理建议" />
        </el-form-item>
        <el-form-item label="修订版报告 JSON（可选）">
          <el-input v-model="revisedJson" type="textarea" :rows="6" placeholder='例如 {"summary":"..."}' />
        </el-form-item>
        <el-button type="primary" @click="submit">提交审核</el-button>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ReportSummary, StatusTag, reviewApi, tongueApi, type ReportDetail, type ReviewOrder } from "@tongue/shared";

const route = useRoute();
const router = useRouter();
const reviewId = Number(route.params.reviewId);
const order = ref<ReviewOrder | null>(null);
const report = ref<ReportDetail | null>(null);
const commentText = ref("");
const revisedJson = ref("");

async function load() {
  order.value = await reviewApi.detail(reviewId);
  report.value = await tongueApi.report(order.value.reportId);
}

async function submit() {
  let revisedReport: unknown = null;
  if (revisedJson.value.trim()) {
    revisedReport = JSON.parse(revisedJson.value);
  }
  await reviewApi.submit(reviewId, commentText.value, revisedReport);
  ElMessage.success("审核意见已提交");
  await router.push("/reviews");
}

onMounted(load);
</script>

<style scoped>
.review-detail {
  max-width: 1000px;
}

.report-block,
.submit-form {
  margin-top: 18px;
}
</style>
