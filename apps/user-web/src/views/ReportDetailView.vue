<template>
  <div class="detail-layout">
    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">报告 {{ report?.reportId || reportId }}</h2>
          <p class="th-subtitle">AI 报告用于一般健康知识说明和健康管理参考。</p>
        </div>
        <el-button type="primary" @click="reviewDialog = true">申请医生审核</el-button>
      </div>

      <el-skeleton v-if="loading" :rows="8" animated />
      <template v-else-if="report">
        <ReportSummary :report="report" />

        <section class="detail-section">
          <h3>识别特征</h3>
          <div class="feature-tags">
            <el-tag v-for="item in features" :key="item.featureId" effect="light">
              {{ featureLabel(item.featureCode) }}
              <span v-if="item.confidence"> · {{ Math.round(item.confidence * 100) }}%</span>
            </el-tag>
          </div>
          <p v-if="features.length === 0" class="th-muted">暂无结构化特征。</p>
        </section>

        <section class="detail-section">
          <h3>知识库检索</h3>
          <p class="rag-query">{{ report.ragQuery || "暂无检索语句" }}</p>
          <div class="evidence-list">
            <article v-for="item in evidence" :key="item.evidenceId">
              <strong>{{ item.title || item.docId || item.chunkId }}</strong>
              <p>{{ item.content }}</p>
              <span>相关度 {{ formatScore(item.finalScore) }}</span>
            </article>
          </div>
        </section>

        <section class="detail-section">
          <h3>报告版本</h3>
          <el-timeline>
            <el-timeline-item v-for="item in versions" :key="item.versionId" :timestamp="formatDateTime(item.createdAt)">
              v{{ item.versionNo }} · {{ item.sourceType || "AI" }} · {{ item.summary || "报告版本" }}
            </el-timeline-item>
          </el-timeline>
        </section>

        <el-alert v-if="report.riskDisclaimer" type="warning" :title="report.riskDisclaimer" show-icon :closable="false" />

        <details class="raw-json">
          <summary>查看原始报告 JSON</summary>
          <pre>{{ JSON.stringify(report.draftReport || report, null, 2) }}</pre>
        </details>
      </template>
    </section>

    <el-dialog v-model="reviewDialog" title="申请医生审核" width="520px">
      <el-input v-model="reviewRemark" type="textarea" :rows="5" placeholder="可以补充希望医生重点查看的问题" />
      <template #footer>
        <el-button @click="reviewDialog = false">取消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="createReview">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ReportSummary,
  featureLabel,
  formatDateTime,
  reviewApi,
  tongueApi,
  type ReportDetail,
  type ReportEvidence,
  type ReportFeature,
  type ReportVersion,
} from "@tongue/shared";

const route = useRoute();
const router = useRouter();
const reportId = Number(route.params.reportId);
const loading = ref(false);
const report = ref<ReportDetail | null>(null);
const versions = ref<ReportVersion[]>([]);
const features = ref<ReportFeature[]>([]);
const evidence = ref<ReportEvidence[]>([]);
const reviewDialog = ref(false);
const reviewRemark = ref("");
const reviewSubmitting = ref(false);

async function load() {
  loading.value = true;
  try {
    const [detail, versionList, featureList, evidenceList] = await Promise.all([
      tongueApi.report(reportId),
      tongueApi.versions(reportId),
      tongueApi.features(reportId),
      tongueApi.evidence(reportId),
    ]);
    report.value = detail;
    versions.value = versionList;
    features.value = featureList;
    evidence.value = evidenceList;
  } finally {
    loading.value = false;
  }
}

async function createReview() {
  reviewSubmitting.value = true;
  try {
    await reviewApi.create(reportId, reviewRemark.value);
    ElMessage.success("已提交医生审核申请");
    reviewDialog.value = false;
    reviewRemark.value = "";
    await router.push("/reviews");
  } catch (error) {
    console.error("create review failed", error);
    ElMessage.error(error instanceof Error ? error.message : "提交医生审核失败");
  } finally {
    reviewSubmitting.value = false;
  }
}

function formatScore(score?: number) {
  return typeof score === "number" ? score.toFixed(3) : "-";
}

onMounted(load);
</script>

<style scoped>
.detail-layout {
  max-width: 1120px;
}

.detail-section {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--th-border);
}

.detail-section h3 {
  margin: 0 0 12px;
  font-size: 17px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rag-query {
  margin: 0 0 12px;
  color: var(--th-text-muted);
}

.evidence-list {
  display: grid;
  gap: 10px;
}

.evidence-list article {
  padding: 14px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
  background: var(--th-surface-soft);
}

.evidence-list p {
  margin: 8px 0;
  color: var(--th-text-muted);
  line-height: 1.7;
}

.evidence-list span {
  color: var(--th-primary);
  font-size: 13px;
}

.raw-json {
  margin-top: 18px;
}

.raw-json pre {
  overflow: auto;
  max-height: 360px;
  padding: 14px;
  border-radius: var(--th-radius);
  background: #0f172a;
  color: #e5edf5;
}
</style>
