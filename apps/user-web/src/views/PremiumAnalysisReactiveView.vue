<template>
  <div class="analysis-page">
    <section class="assistant-shell replacement-assistant">
      <div class="replacement-heading">
        <div><span>健康助手</span><h2>继续提问或上传新的舌象照片</h2></div>
        <small><i></i> 在线</small>
      </div>
      <AnalysisChatView />
      <div v-if="latestReportId" class="chat-plan-action">
        <div>
          <strong>本次舌象报告已生成</strong>
          <span>可以把报告建议整理成一份可编辑、可由 AI 评估的 7 天健康计划。</span>
        </div>
        <button type="button" :disabled="creatingPlan" @click="createPlanDraft">
          <CalendarCheck2 :size="17" />
          {{ creatingPlan ? "正在生成" : "生成我的7天健康计划" }}
        </button>
      </div>
    </section>
    <PremiumAnalysisView class="legacy-dashboard" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CalendarCheck2 } from 'lucide-vue-next';
import { healthPlanApi, USER_KEY, type UserMe } from '@tongue/shared';
import PremiumAnalysisView from './PremiumAnalysisView.vue';
import AnalysisChatView from './AnalysisChatView.vue';

const router = useRouter();
const latestReportId = ref<number>();
const creatingPlan = ref(false);
let reportWatcher: number | undefined;

function currentUserId() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return 'guest';
  try {
    const user = JSON.parse(raw) as UserMe;
    return user.userId ? String(user.userId) : 'guest';
  } catch {
    return 'guest';
  }
}

function refreshLatestReport() {
  const raw = localStorage.getItem(`tongue_user_chat_session_${currentUserId()}`);
  if (!raw) {
    latestReportId.value = undefined;
    return;
  }
  try {
    const session = JSON.parse(raw) as { messages?: Array<Record<string, unknown>> };
    const completed = (session.messages || [])
      .filter((message) => message.role === 'assistant' && message.status === 'COMPLETED' && typeof message.reportId === 'number')
      .reverse()[0];
    latestReportId.value = completed?.reportId as number | undefined;
  } catch {
    latestReportId.value = undefined;
  }
}

async function createPlanDraft() {
  if (!latestReportId.value || creatingPlan.value) return;
  creatingPlan.value = true;
  try {
    const plan = await healthPlanApi.draftFromReport(latestReportId.value);
    ElMessage.success('7 天计划草稿已生成，可以开始自定义');
    await router.push(`/health-plan/draft/${plan.planId}`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '生成计划草稿失败');
  } finally {
    creatingPlan.value = false;
  }
}

onMounted(() => {
  refreshLatestReport();
  reportWatcher = window.setInterval(refreshLatestReport, 1000);
});

onBeforeUnmount(() => {
  if (reportWatcher) window.clearInterval(reportWatcher);
});
</script>

<style scoped>
.analysis-page{display:flex;flex-direction:column}.legacy-dashboard{order:1}.replacement-assistant{order:2;width:min(1180px,100%);margin:20px auto 0;overflow:hidden;border:1px solid rgba(183,194,184,.65);border-radius:24px;background:#fff;box-shadow:0 18px 48px rgba(54,75,63,.08)}.analysis-page :deep(.legacy-dashboard>.assistant-shell){display:none}.replacement-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 28px 14px}.replacement-heading span{display:block;color:#3f7058;font-size:10px;font-weight:750;letter-spacing:.16em}.replacement-heading h2{margin:8px 0 0;color:#2f3a31;font-size:22px}.replacement-heading small{display:inline-flex;align-items:center;gap:7px;color:#668072}.replacement-heading small i{width:8px;height:8px;border-radius:50%;background:#42a66d;box-shadow:0 0 0 4px rgba(66,166,109,.12)}.chat-plan-action{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:-142px auto 86px;position:relative;z-index:3;width:min(860px,calc(100% - 42px));padding:15px 17px;border:1px solid #cfe0d5;border-radius:16px;background:linear-gradient(135deg,#f7fbf8,#edf6f0);box-shadow:0 12px 30px rgba(45,84,59,.1)}.chat-plan-action>div{display:grid;gap:4px}.chat-plan-action strong{color:#2f4d3b;font-size:13px}.chat-plan-action span{color:#6b7b71;font-size:11px}.chat-plan-action button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 15px;border:0;border-radius:13px;background:#245d3d;color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}.chat-plan-action button:disabled{opacity:.6;cursor:not-allowed}@media(max-width:720px){.chat-plan-action{align-items:stretch;flex-direction:column;margin:-148px auto 90px}.chat-plan-action button{width:100%}}
</style>
