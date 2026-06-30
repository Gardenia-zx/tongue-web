<template>
  <div class="premium-report-page" @click.capture="capturePlanButton">
    <ReportDetailView />

    <section class="plan-recommendation">
      <div class="recommendation-icon"><CalendarCheck2 :size="24" /></div>
      <div class="recommendation-copy">
        <span>下一步建议</span>
        <h2>把本次报告变成可以每天执行的 7 天计划</h2>
        <p>系统会先生成一份饮食、运动和睡眠草稿。你可以逐日修改，再提交 AI 评估，确认后才正式开始。</p>
      </div>
      <button class="recommendation-button" type="button" :disabled="creating" @click="createDraft">
        <WandSparkles :size="17" />
        {{ creating ? "正在生成" : "生成我的7天健康计划" }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { CalendarCheck2, WandSparkles } from "lucide-vue-next";
import { healthPlanApi } from "@tongue/shared";
import ReportDetailView from "./ReportDetailView.vue";

const route = useRoute();
const router = useRouter();
const creating = ref(false);

function capturePlanButton(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const button = target?.closest("button");
  if (!button || !button.textContent?.includes("生成我的7天健康计划")) return;
  if (button.classList.contains("recommendation-button")) return;
  event.preventDefault();
  event.stopPropagation();
  void createDraft();
}

async function createDraft() {
  const reportId = Number(route.params.reportId);
  if (!Number.isFinite(reportId) || creating.value) return;
  creating.value = true;
  try {
    const plan = await healthPlanApi.draftFromReport(reportId);
    ElMessage.success("7 天计划草稿已生成，可以开始自定义");
    await router.push(`/health-plan/draft/${plan.planId}`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "生成计划草稿失败");
  } finally {
    creating.value = false;
  }
}
</script>

<style scoped>
.premium-report-page{display:grid;gap:22px}
:deep(.detail-layout){width:min(1120px,100%);max-width:none;margin:0 auto}
:deep(.detail-layout>.th-panel){overflow:hidden;border:1px solid rgba(185,194,184,.7);border-radius:26px;background:rgba(251,250,247,.92);box-shadow:var(--th-shadow-sm)}
:deep(.detail-layout .th-title){font-size:clamp(30px,4vw,44px);font-weight:590;letter-spacing:-.055em}
:deep(.detail-layout .th-subtitle){max-width:58ch;margin-top:10px;line-height:1.75}
:deep(.detail-layout .el-button--primary){min-height:44px;border-radius:13px;box-shadow:0 10px 24px rgba(41,72,58,.16)}
:deep(.detail-section){margin-top:28px;padding-top:24px;border-top:1px solid rgba(216,221,213,.9)}
:deep(.detail-section h3){margin:0 0 16px;font-size:18px;font-weight:650;letter-spacing:-.025em}
:deep(.feature-tags){gap:9px}
:deep(.feature-tags .el-tag){min-height:32px;padding:0 11px;border-color:rgba(63,101,82,.18);border-radius:9px;background:var(--th-primary-soft);color:var(--th-primary-dark);font-weight:620}
:deep(.rag-query){display:inline-flex;margin:0 0 16px;padding:8px 11px;border-radius:10px;background:var(--th-surface-soft);color:var(--th-text-muted);font-family:"SFMono-Regular",Consolas,monospace;font-size:11px}
:deep(.evidence-list){grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
:deep(.evidence-list article){padding:18px;border:1px solid rgba(185,194,184,.66);border-radius:17px;background:rgba(255,254,253,.76);transition:border-color var(--th-transition),box-shadow var(--th-transition),transform var(--th-transition)}
:deep(.evidence-list article:hover){border-color:rgba(63,101,82,.32);box-shadow:var(--th-shadow-sm);transform:translateY(-2px)}
:deep(.evidence-list p){color:var(--th-text-muted);font-size:13px;line-height:1.78;text-wrap:pretty}
:deep(.evidence-list span){color:var(--th-primary);font-family:"SFMono-Regular",Consolas,monospace;font-size:10px}
:deep(.el-alert){margin-top:26px;border:1px solid rgba(139,112,64,.18);border-radius:14px;background:rgba(245,239,225,.72)}
:deep(.raw-json){margin-top:22px;padding:12px 14px;border:1px solid var(--th-border);border-radius:13px;background:rgba(233,237,231,.46)}
:deep(.raw-json pre){max-height:360px;margin:12px 0 0;border-radius:12px;background:#253129;color:#e9eee9;font-size:12px}
.plan-recommendation{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:18px;align-items:center;width:min(1180px,100%);margin:0 auto;padding:24px 26px;border:1px solid rgba(92,137,108,.28);border-radius:24px;background:linear-gradient(135deg,#f7fbf8,#eaf4ed);box-shadow:0 16px 42px rgba(45,84,59,.08)}
.recommendation-icon{display:grid;width:54px;height:54px;place-items:center;border-radius:17px;background:#fff;color:#2f704d;box-shadow:0 8px 20px rgba(55,100,73,.09)}
.recommendation-copy{display:grid;gap:6px}.recommendation-copy>span{color:#3f7058;font-size:10px;font-weight:800;letter-spacing:.16em}.recommendation-copy h2{margin:0;color:#293d31;font-size:22px}.recommendation-copy p{max-width:760px;margin:0;color:#66776d;font-size:13px;line-height:1.72}
.recommendation-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border:0;border-radius:14px;background:#245d3d;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(36,93,61,.18)}.recommendation-button:disabled{opacity:.6;cursor:not-allowed}
@media(max-width:760px){:deep(.detail-layout>.th-panel){border-radius:22px}:deep(.detail-layout .th-toolbar){flex-direction:column}:deep(.evidence-list){grid-template-columns:1fr}.plan-recommendation{grid-template-columns:48px minmax(0,1fr);padding:20px}.recommendation-icon{width:46px;height:46px}.recommendation-button{grid-column:1/-1;width:100%}}
</style>
