<template>
  <div class="report-detail-page">
    <header class="detail-head">
      <div class="head-left">
        <button class="back-button" type="button" @click="router.back()">
          <ArrowLeft :size="17" />
        </button>
        <div>
          <span class="page-kicker">TONGUE HEALTH REPORT</span>
          <h1>舌象分析报告</h1>
          <p>报告 #{{ report?.reportId || reportId }} · {{ reportDate }}</p>
        </div>
      </div>
      <div class="head-actions">
        <button class="secondary-button" type="button" @click="askAssistant">
          <MessageCircleMore :size="16" />
          向 AI 追问
        </button>
        <button class="primary-button" type="button" @click="reviewDialog = true">
          <Stethoscope :size="16" />
          申请医生审核
        </button>
      </div>
    </header>

    <el-skeleton v-if="loading" :rows="10" animated />

    <template v-else-if="report">
      <section class="kpi-strip">
        <article class="score-card">
          <div class="score-ring">
            <strong>{{ reportScore }}</strong>
            <span>/100</span>
          </div>
          <div>
            <span>AI 综合参考</span>
            <small>基于本次识别与知识库解释</small>
          </div>
        </article>
        <article>
          <strong>{{ features.length }}</strong>
          <span>识别特征</span>
          <small>结构化舌象表现</small>
        </article>
        <article class="warm">
          <strong>{{ attentionCount }}</strong>
          <span>建议关注</span>
          <small>需要持续观察的项目</small>
        </article>
        <article>
          <strong>{{ evidence.length }}</strong>
          <span>知识依据</span>
          <small>本次引用的参考内容</small>
        </article>
        <article>
          <strong>{{ versions.length }}</strong>
          <span>报告版本</span>
          <small>AI 与医生修订记录</small>
        </article>
      </section>

      <div class="detail-grid">
        <aside class="section-nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            :class="{ active: activeSection === item.id }"
            @click="scrollTo(item.id)"
          >
            <component :is="item.icon" :size="15" />
            {{ item.label }}
          </button>
        </aside>

        <main class="report-content">
          <section id="summary" class="content-section summary-section">
            <span class="section-kicker">综合摘要</span>
            <h2>{{ report.summary || "本次舌象状态已完成分析" }}</h2>
            <p>{{ report.featureSummary || "暂无详细特征摘要，请结合识别特征和知识依据查看。" }}</p>
          </section>

          <section id="features" class="content-section">
            <div class="section-heading">
              <div>
                <span class="section-kicker">舌象特征</span>
                <h2>本次识别表现</h2>
              </div>
              <small>{{ features.length }} 项结构化结果</small>
            </div>

            <div v-if="features.length" class="feature-grid">
              <article v-for="item in features" :key="item.featureId" class="feature-card">
                <div class="feature-icon"><ScanLine :size="20" /></div>
                <div>
                  <h3>{{ featureLabel(item.featureCode) }}</h3>
                  <p>{{ featureGroupLabel(item.featureGroup) }}</p>
                </div>
                <div class="confidence">
                  <strong>{{ confidencePercent(item.confidence) }}</strong>
                  <span>置信度</span>
                </div>
              </article>
            </div>
            <p v-else class="empty-copy">暂无结构化特征。</p>
          </section>

          <section id="interpretation" class="content-section">
            <div class="section-heading">
              <div>
                <span class="section-kicker">AI 综合解读</span>
                <h2>理解本次舌象状态</h2>
              </div>
            </div>
            <div class="interpretation-card">
              <Sparkles :size="21" />
              <p>{{ interpretationText }}</p>
            </div>
          </section>

          <section id="advice" class="content-section">
            <div class="section-heading">
              <div>
                <span class="section-kicker">行动建议</span>
                <h2>从日常生活开始调整</h2>
              </div>
            </div>
            <div class="advice-grid">
              <article>
                <span class="advice-icon food"><Utensils :size="18" /></span>
                <h3>饮食建议</h3>
                <ul><li v-for="item in dietaryAdvice" :key="item">{{ item }}</li></ul>
              </article>
              <article>
                <span class="advice-icon move"><Dumbbell :size="18" /></span>
                <h3>运动建议</h3>
                <ul><li v-for="item in exerciseAdvice" :key="item">{{ item }}</li></ul>
              </article>
              <article>
                <span class="advice-icon rest"><MoonStar :size="18" /></span>
                <h3>生活方式</h3>
                <ul><li v-for="item in lifestyleAdvice" :key="item">{{ item }}</li></ul>
              </article>
            </div>
          </section>

          <section id="evidence" class="content-section">
            <div class="section-heading">
              <div>
                <span class="section-kicker">知识依据</span>
                <h2>报告参考来源</h2>
              </div>
              <span class="rag-status" :class="{ grounded: report.ragGrounded }">
                {{ report.ragGrounded ? "已完成知识检索" : "一般健康说明" }}
              </span>
            </div>
            <p class="rag-query">{{ report.ragQuery || "暂无检索语句" }}</p>
            <div v-if="evidence.length" class="evidence-list">
              <article v-for="(item, index) in evidence" :key="item.evidenceId">
                <span class="evidence-index">0{{ index + 1 }}</span>
                <div>
                  <h3>{{ item.title || item.docId || item.chunkId || "知识库参考" }}</h3>
                  <p>{{ item.content }}</p>
                  <small>相关度 {{ formatScore(item.finalScore) }}</small>
                </div>
              </article>
            </div>
            <p v-else class="empty-copy">本次报告没有可展示的知识库依据。</p>
          </section>

          <section id="versions" class="content-section">
            <div class="section-heading">
              <div>
                <span class="section-kicker">版本记录</span>
                <h2>报告生成与修订时间线</h2>
              </div>
            </div>
            <div class="version-list">
              <article v-for="item in versions" :key="item.versionId">
                <span class="version-dot" />
                <div>
                  <strong>v{{ item.versionNo }} · {{ item.sourceType || "AI" }}</strong>
                  <p>{{ item.summary || "报告版本" }}</p>
                  <small>{{ formatDateTime(item.createdAt) }}</small>
                </div>
              </article>
            </div>
          </section>

          <section id="risk" class="content-section risk-section">
            <ShieldAlert :size="22" />
            <div>
              <span class="section-kicker">风险提示</span>
              <h2>一般健康参考，不替代专业诊断</h2>
              <p>{{ riskText }}</p>
            </div>
          </section>
        </main>
      </div>
    </template>

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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Activity,
  ArrowLeft,
  BookOpenText,
  Dumbbell,
  FileClock,
  MessageCircleMore,
  MoonStar,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Utensils,
} from "lucide-vue-next";
import {
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
const activeSection = ref("summary");

const navItems = [
  { id: "summary", label: "综合摘要", icon: Activity },
  { id: "features", label: "舌象特征", icon: ScanLine },
  { id: "interpretation", label: "健康解读", icon: Sparkles },
  { id: "advice", label: "行动建议", icon: Utensils },
  { id: "evidence", label: "知识依据", icon: BookOpenText },
  { id: "versions", label: "版本记录", icon: FileClock },
  { id: "risk", label: "风险提示", icon: ShieldAlert },
];

const reportDate = computed(() => {
  const value = versions.value[0]?.createdAt;
  return value ? formatDateTime(value) : "最近生成";
});
const reportScore = computed(() => {
  const score = report.value?.analysisQualityScore;
  return typeof score === "number" ? Math.round(score) : "--";
});
const attentionCount = computed(() => features.value.filter((item) => (item.confidence || 0) >= 0.75).length);
const structured = computed<Record<string, unknown>>(() => {
  const value = report.value?.structuredReport;
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
});
const interpretationText = computed(() => pickText(
  structured.value.healthInterpretation,
  structured.value.comprehensiveSummary,
  report.value?.summary,
  report.value?.featureSummary,
) || "本次报告已完成舌象特征识别。建议结合连续记录和生活状态综合观察，不宜仅凭单次结果下结论。");
const dietaryAdvice = computed(() => pickList(
  structured.value.dietaryAdvice,
  structured.value.dietary_advice,
  ["保持饮食规律，避免短期内过度生冷或油腻。", "结合自身耐受情况记录饮食与身体感受。"],
));
const exerciseAdvice = computed(() => pickList(
  structured.value.exerciseAdvice,
  structured.value.exercise_advice,
  ["选择中等强度、可长期坚持的运动。", "运动后关注疲劳、睡眠和恢复情况。"],
));
const lifestyleAdvice = computed(() => pickList(
  structured.value.lifestyleAdvice,
  structured.value.lifestyle_advice,
  ["保持规律作息，避免长期熬夜。", "建议在相似光线和时间条件下进行后续复拍。"],
));
const riskText = computed(() => {
  const tips = pickList(
    structured.value.riskTips,
    report.value?.riskDisclaimer,
    ["舌象分析结果仅用于日常健康管理参考。如有持续不适或明显症状，请及时咨询专业医生。"],
  );
  return tips.join(" ");
});

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

function askAssistant() {
  router.push({ path: "/analysis", query: { reportId: String(reportId) } });
}

function scrollTo(id: string) {
  activeSection.value = id;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function confidencePercent(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function featureGroupLabel(value?: string) {
  if (!value) return "舌象特征";
  const labels: Record<string, string> = {
    color: "舌色表现",
    coating: "舌苔表现",
    shape: "舌形表现",
    texture: "纹理表现",
  };
  return labels[value.toLowerCase()] || value;
}

function formatScore(score?: number) {
  return typeof score === "number" ? score.toFixed(3) : "-";
}

function pickText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      for (const key of ["content", "text", "summary"]) {
        if (typeof record[key] === "string" && String(record[key]).trim()) return String(record[key]).trim();
      }
    }
  }
  return "";
}

function pickList(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const result = value.map((item) => pickText(item)).filter(Boolean);
      if (result.length) return result;
    }
    if (typeof value === "string" && value.trim()) {
      const result = value.split(/[；;\n]/).map((item) => item.trim()).filter(Boolean);
      if (result.length) return result;
    }
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (Array.isArray(record.items)) {
        const result = record.items.map((item) => pickText(item)).filter(Boolean);
        if (result.length) return result;
      }
      const text = pickText(record);
      if (text) return [text];
    }
  }
  return [];
}

onMounted(load);
</script>

<style scoped>
.report-detail-page {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.detail-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 22px;
}

.head-left,
.head-actions,
.section-heading,
.score-card {
  display: flex;
  align-items: center;
}

.head-left { gap: 14px; }
.head-actions { gap: 10px; }
.back-button,
.secondary-button,
.primary-button {
  border: 0;
  cursor: pointer;
}
.back-button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(75, 101, 86, 0.15);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.8);
  color: #385544;
}
.page-kicker,
.section-kicker {
  display: block;
  color: #3f7058;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.15em;
}
.detail-head h1 {
  margin: 7px 0 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 500;
  letter-spacing: -0.05em;
}
.detail-head p { margin: 8px 0 0; color: #7e8881; font-size: 11px; }
.secondary-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 650;
}
.secondary-button { border: 1px solid rgba(75, 101, 86, 0.17); background: #fffef9; color: #365643; }
.primary-button { background: #245d3d; color: white; }

.kpi-strip {
  display: grid;
  grid-template-columns: 1.45fr repeat(4, minmax(0, 1fr));
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.05);
}
.kpi-strip article {
  display: flex;
  min-height: 128px;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  border-right: 1px solid rgba(219, 225, 218, 0.8);
}
.kpi-strip article:last-child { border-right: 0; }
.kpi-strip article.warm { background: rgba(248, 235, 214, 0.5); }
.kpi-strip article > strong { color: #2d6a48; font-size: 30px; }
.kpi-strip article > span { margin-top: 7px; color: #4e5d54; font-size: 12px; font-weight: 650; }
.kpi-strip article > small { margin-top: 5px; color: #929b95; font-size: 9px; }
.score-card { flex-direction: row !important; gap: 15px; }
.score-ring {
  display: grid;
  width: 78px;
  height: 78px;
  place-items: center;
  align-content: center;
  flex: 0 0 auto;
  border: 8px solid #e4eee7;
  border-top-color: #2f7952;
  border-radius: 50%;
}
.score-ring strong { color: #276143; font-size: 23px; line-height: 1; }
.score-ring span { color: #8d9790; font-size: 8px; }
.score-card > div:last-child { display: grid; gap: 5px; }
.score-card > div:last-child span { color: #31483b; font-size: 12px; font-weight: 650; }
.score-card > div:last-child small { color: #909991; font-size: 9px; line-height: 1.5; }

.detail-grid {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.section-nav {
  position: sticky;
  top: 22px;
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 18px;
  background: rgba(255, 254, 249, 0.84);
}
.section-nav button {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 40px;
  padding: 0 11px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #748078;
  cursor: pointer;
  font-size: 11px;
  text-align: left;
}
.section-nav button.active,
.section-nav button:hover { background: #e9f0eb; color: #2f6145; font-weight: 650; }

.report-content { display: grid; gap: 16px; }
.content-section {
  scroll-margin-top: 24px;
  padding: 28px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 12px 34px rgba(54, 75, 63, 0.045);
}
.summary-section {
  background:
    radial-gradient(circle at 100% 0, rgba(215, 232, 221, 0.65), transparent 42%),
    rgba(255, 254, 249, 0.9);
}
.summary-section h2,
.section-heading h2,
.risk-section h2 {
  margin: 8px 0 0;
  color: #2c3830;
  font-size: 24px;
  font-weight: 620;
  letter-spacing: -0.035em;
}
.summary-section p { max-width: 780px; margin: 16px 0 0; color: #6e7971; line-height: 1.85; }
.section-heading { justify-content: space-between; gap: 18px; margin-bottom: 20px; }
.section-heading small { color: #8a948d; font-size: 10px; }

.feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.feature-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(201, 210, 202, 0.75);
  border-radius: 15px;
  background: #fbfcf9;
}
.feature-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; background: #f4e7e4; color: #ad6e69; }
.feature-card h3 { margin: 0; font-size: 14px; }
.feature-card p { margin: 5px 0 0; color: #8a938d; font-size: 10px; }
.confidence { display: grid; justify-items: end; gap: 3px; }
.confidence strong { color: #38684f; font-size: 16px; }
.confidence span { color: #929b95; font-size: 8px; }

.interpretation-card { display: flex; gap: 14px; padding: 20px; border-radius: 16px; background: #eef4ef; color: #315943; }
.interpretation-card p { margin: 0; color: #52675a; line-height: 1.85; }
.advice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.advice-grid article { padding: 18px; border: 1px solid rgba(201, 210, 202, 0.75); border-radius: 16px; background: #fbfcf9; }
.advice-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; }
.advice-icon.food { background: #f7eadb; color: #a86d35; }
.advice-icon.move { background: #e5f0e9; color: #3e7756; }
.advice-icon.rest { background: #e9e7f3; color: #6d6590; }
.advice-grid h3 { margin: 14px 0 10px; font-size: 14px; }
.advice-grid ul { display: grid; gap: 7px; margin: 0; padding-left: 18px; color: #727d75; font-size: 11px; line-height: 1.65; }

.rag-status { padding: 6px 9px; border-radius: 999px; background: #f1f3ef; color: #7a857d; font-size: 9px; }
.rag-status.grounded { background: #e6f1e9; color: #34734f; }
.rag-query { margin: 0 0 16px; padding: 9px 11px; border-radius: 10px; background: #f2f5f1; color: #778178; font-family: Consolas, monospace; font-size: 10px; }
.evidence-list { display: grid; gap: 10px; }
.evidence-list article { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 12px; padding: 16px; border: 1px solid rgba(201, 210, 202, 0.72); border-radius: 14px; background: #fbfcf9; }
.evidence-index { color: #3c7655; font-family: Consolas, monospace; font-size: 11px; }
.evidence-list h3 { margin: 0; font-size: 13px; }
.evidence-list p { margin: 7px 0; color: #747f77; font-size: 11px; line-height: 1.72; }
.evidence-list small { color: #3e7153; font-size: 9px; }

.version-list { display: grid; gap: 0; }
.version-list article { position: relative; display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 12px; padding-bottom: 18px; }
.version-list article:not(:last-child)::before { position: absolute; top: 12px; bottom: 0; left: 5px; width: 1px; background: #d8e3db; content: ""; }
.version-dot { position: relative; z-index: 1; width: 11px; height: 11px; margin-top: 3px; border: 3px solid #e6efe9; border-radius: 50%; background: #2e7750; }
.version-list strong { color: #344b3e; font-size: 12px; }
.version-list p { margin: 5px 0; color: #768178; font-size: 11px; }
.version-list small { color: #959d97; font-size: 9px; }

.risk-section { display: flex; gap: 16px; background: #fbf4e8; color: #916c35; }
.risk-section p { margin: 11px 0 0; color: #806e54; line-height: 1.75; }
.empty-copy { margin: 0; color: #89928c; }

@media (max-width: 980px) {
  .kpi-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kpi-strip article { border-bottom: 1px solid rgba(219, 225, 218, 0.8); }
  .detail-grid { grid-template-columns: 1fr; }
  .section-nav { position: static; display: flex; overflow-x: auto; }
  .section-nav button { flex: 0 0 auto; }
}

@media (max-width: 720px) {
  .detail-head { align-items: flex-start; flex-direction: column; }
  .head-actions { width: 100%; flex-wrap: wrap; }
  .kpi-strip,
  .feature-grid,
  .advice-grid { grid-template-columns: 1fr; }
  .content-section { padding: 20px; }
}
</style>
