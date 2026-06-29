<template>
  <section class="plan-page">
    <header class="plan-head">
      <div>
        <span class="page-kicker">DAILY CARE</span>
        <h1>健康计划</h1>
        <p>把报告里的饮食、睡眠、运动建议变成今天能完成的行动。</p>
      </div>
      <button v-if="plan" class="ghost-button" type="button" @click="load">
        <RefreshCw :size="15" />
        刷新
      </button>
    </header>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="plan">
      <section class="status-strip">
        <article>
          <span>计划周期</span>
          <strong>{{ shortDate(plan.startDate) }} - {{ shortDate(plan.endDate) }}</strong>
          <small>来自报告 #{{ plan.sourceReportId }}</small>
        </article>
        <article>
          <span>今日打卡</span>
          <strong>{{ plan.todayCheckin ? "已记录" : "待完成" }}</strong>
          <small>{{ todayStatusText }}</small>
        </article>
        <article>
          <span>近 7 天打卡率</span>
          <strong>{{ percent(summary?.checkinRate) }}</strong>
          <small>饮食 {{ percent(summary?.dietRate) }} / 运动 {{ percent(summary?.exerciseRate) }}</small>
        </article>
        <article>
          <span>下次复拍</span>
          <strong>{{ plan.nextRetakeDate ? shortDate(plan.nextRetakeDate) : "已完成" }}</strong>
          <small>{{ summary?.retakeCompleted ? "已完成复拍记录" : "按提醒复拍更利于趋势观察" }}</small>
        </article>
      </section>

      <section class="plan-grid">
        <article class="plan-block food">
          <span class="plan-icon"><Utensils :size="18" /></span>
          <h2>饮食计划</h2>
          <p>{{ plan.dietGoal?.goal || "保持清淡、规律、易消化。" }}</p>
          <ul>
            <li v-for="item in plan.dietGoal?.actions || []" :key="item">{{ item }}</li>
          </ul>
          <small>{{ plan.dietGoal?.frequency || "每天" }} · {{ plan.dietGoal?.duration || "连续 7 天" }}</small>
        </article>
        <article class="plan-block sleep">
          <span class="plan-icon"><MoonStar :size="18" /></span>
          <h2>睡眠计划</h2>
          <p>{{ plan.sleepGoal?.goal || "保持稳定作息和恢复。" }}</p>
          <ul>
            <li v-for="item in plan.sleepGoal?.actions || []" :key="item">{{ item }}</li>
          </ul>
          <small>{{ plan.sleepGoal?.frequency || "每天" }} · {{ plan.sleepGoal?.duration || "连续 7 天" }}</small>
        </article>
        <article class="plan-block move">
          <span class="plan-icon"><Dumbbell :size="18" /></span>
          <h2>运动计划</h2>
          <p>{{ plan.exerciseGoal?.goal || "选择温和、可持续的活动。" }}</p>
          <ul>
            <li v-for="item in plan.exerciseGoal?.actions || []" :key="item">{{ item }}</li>
          </ul>
          <small>{{ plan.exerciseGoal?.frequency || "每天" }} · {{ plan.exerciseGoal?.duration || "连续 7 天" }}</small>
        </article>
      </section>

      <section class="checkin-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">TODAY</span>
            <h2>今日执行情况</h2>
          </div>
          <button class="primary-button" type="button" :disabled="saving" @click="saveCheckin">
            <CheckCircle2 :size="16" />
            {{ saving ? "保存中" : "保存打卡" }}
          </button>
        </div>

        <div class="check-grid">
          <label><input v-model="form.dietDone" type="checkbox" /> 饮食已按计划执行</label>
          <label><input v-model="form.sleepDone" type="checkbox" /> 睡眠/作息已记录</label>
          <label><input v-model="form.exerciseDone" type="checkbox" /> 运动已完成</label>
        </div>

        <div v-if="plan.observationItems?.length" class="observation-list">
          <strong>今日观察</strong>
          <label v-for="item in plan.observationItems" :key="item">
            <input v-model="selectedObservations" :value="item" type="checkbox" />
            {{ item }}
          </label>
        </div>

        <textarea v-model="form.note" maxlength="500" placeholder="补充今天的饮食、睡眠、身体感受..." />
      </section>

      <section class="history-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">RECENT</span>
            <h2>最近打卡</h2>
          </div>
          <button class="ghost-button" type="button" @click="closePlan">关闭当前计划</button>
        </div>
        <div v-if="checkins.length" class="checkin-list">
          <article v-for="item in checkins" :key="item.checkinId">
            <strong>{{ shortDate(item.checkinDate) }}</strong>
            <span>饮食 {{ item.dietDone ? "完成" : "未记" }}</span>
            <span>睡眠 {{ item.sleepDone ? "完成" : "未记" }}</span>
            <span>运动 {{ item.exerciseDone ? "完成" : "未记" }}</span>
          </article>
        </div>
        <p v-else class="empty-copy">还没有打卡记录，从今天开始就行。</p>
      </section>
    </template>

    <section v-else class="empty-panel">
      <ClipboardList :size="30" />
      <h2>还没有进行中的健康计划</h2>
      <p>打开一份新版舌象报告，点击“生成健康计划”，就能把饮食、睡眠和运动建议变成每日任务。</p>
      <button class="primary-button" type="button" @click="router.push('/reports')">去报告中心</button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { CheckCircle2, ClipboardList, Dumbbell, MoonStar, RefreshCw, Utensils } from "lucide-vue-next";
import { healthPlanApi, type CheckinSummary, type DailyCheckin, type HealthPlan } from "@tongue/shared";

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const plan = ref<HealthPlan | null>(null);
const summary = ref<CheckinSummary | null>(null);
const checkins = ref<DailyCheckin[]>([]);
const selectedObservations = ref<string[]>([]);
const form = reactive({
  dietDone: false,
  sleepDone: false,
  exerciseDone: false,
  note: "",
});

const todayStatusText = computed(() => {
  if (!plan.value?.todayCheckin) return "完成后记录一下";
  const done = [form.dietDone, form.sleepDone, form.exerciseDone].filter(Boolean).length;
  return `已完成 ${done}/3 项`;
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    const [current, summaryData, checkinData] = await Promise.all([
      healthPlanApi.current(),
      healthPlanApi.summary(7),
      healthPlanApi.checkins(14),
    ]);
    plan.value = current;
    summary.value = summaryData;
    checkins.value = checkinData;
    applyTodayCheckin();
  } finally {
    loading.value = false;
  }
}

function applyTodayCheckin() {
  const today = plan.value?.todayCheckin;
  form.dietDone = Boolean(today?.dietDone);
  form.sleepDone = Boolean(today?.sleepDone);
  form.exerciseDone = Boolean(today?.exerciseDone);
  form.note = today?.note || "";
  const observation = today?.observation as Record<string, unknown> | undefined;
  const items = observation?.checkedItems || observation?.checked_items;
  selectedObservations.value = Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : [];
}

async function saveCheckin() {
  saving.value = true;
  try {
    await healthPlanApi.checkinToday({
      dietDone: form.dietDone,
      sleepDone: form.sleepDone,
      exerciseDone: form.exerciseDone,
      observation: { checked_items: selectedObservations.value },
      note: form.note,
    });
    ElMessage.success("今日打卡已保存");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

async function closePlan() {
  if (!plan.value) return;
  try {
    await ElMessageBox.confirm("关闭后不会删除历史打卡，但今日计划会停止显示。", "关闭健康计划", { type: "warning" });
  } catch {
    return;
  }
  await healthPlanApi.close(plan.value.planId);
  ElMessage.success("健康计划已关闭");
  await load();
}

function percent(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function shortDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
</script>

<style scoped>
.plan-page { display: grid; gap: 18px; width: min(1180px, 100%); margin: 0 auto; }
.plan-head, .panel-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
.page-kicker { display: block; color: #3f7058; font-size: 9px; font-weight: 760; letter-spacing: .16em; }
.plan-head h1 { margin: 8px 0 0; font-family: "Noto Serif SC", "Source Han Serif SC", serif; font-size: clamp(40px, 5vw, 62px); font-weight: 520; letter-spacing: -.055em; }
.plan-head p, .panel-heading p { margin: 10px 0 0; color: #7a857d; font-size: 12px; line-height: 1.7; }
.status-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.status-strip article, .plan-block, .checkin-panel, .history-panel, .empty-panel { border: 1px solid rgba(183,194,184,.66); border-radius: 22px; background: rgba(255,254,249,.88); box-shadow: 0 14px 38px rgba(54,75,63,.05); }
.status-strip article { display: grid; gap: 7px; min-height: 118px; padding: 18px; }
.status-strip span, .status-strip small, .plan-block small, .empty-copy { color: #7f8a83; font-size: 11px; }
.status-strip strong { color: #2d5540; font-size: 22px; }
.plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.plan-block { display: grid; gap: 12px; padding: 22px; }
.plan-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; }
.plan-block.food .plan-icon { background: #f6ead9; color: #9c6c36; }
.plan-block.sleep .plan-icon { background: #ece8f3; color: #71688f; }
.plan-block.move .plan-icon { background: #e4f0e8; color: #357350; }
.plan-block h2, .panel-heading h2, .empty-panel h2 { margin: 0; color: #2c3930; font-size: 21px; font-weight: 650; }
.plan-block p { margin: 0; color: #54645a; line-height: 1.7; }
.plan-block ul { display: grid; gap: 8px; margin: 0; padding-left: 18px; color: #657269; font-size: 13px; line-height: 1.65; }
.checkin-panel, .history-panel, .empty-panel { padding: 24px; }
.check-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 20px; }
.check-grid label, .observation-list label { display: flex; align-items: center; gap: 8px; min-height: 40px; color: #40584a; font-size: 13px; }
.observation-list { display: grid; gap: 8px; margin-top: 18px; }
.observation-list strong { color: #2d5540; font-size: 13px; }
textarea { width: 100%; min-height: 96px; margin-top: 16px; padding: 12px; border: 1px solid rgba(183,194,184,.66); border-radius: 14px; resize: vertical; color: #36453b; font: inherit; line-height: 1.6; }
.primary-button, .ghost-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 14px; border-radius: 12px; cursor: pointer; font-size: 12px; }
.primary-button { border: 0; background: #245d3d; color: #fff; }
.primary-button:disabled { opacity: .62; cursor: not-allowed; }
.ghost-button { border: 1px solid rgba(75,101,86,.15); background: #f8faf7; color: #45614f; }
.checkin-list { display: grid; gap: 8px; margin-top: 18px; }
.checkin-list article { display: grid; grid-template-columns: 90px repeat(3, 1fr); gap: 10px; padding: 12px 0; border-top: 1px solid rgba(183,194,184,.36); color: #647168; font-size: 12px; }
.checkin-list strong { color: #315d43; }
.empty-panel { display: grid; justify-items: center; gap: 14px; padding: 52px 24px; text-align: center; }
.empty-panel svg { color: #3f7058; }
.empty-panel p { max-width: 520px; margin: 0; color: #6f7b72; line-height: 1.8; }
@media (max-width: 900px) {
  .status-strip, .plan-grid, .check-grid { grid-template-columns: 1fr; }
  .plan-head, .panel-heading { align-items: flex-start; flex-direction: column; }
  .checkin-list article { grid-template-columns: 1fr 1fr; }
}
</style>
