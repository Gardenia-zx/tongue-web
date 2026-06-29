<template>
  <section class="plan-page">
    <header class="plan-head">
      <div>
        <span class="page-kicker">DAILY CARE</span>
        <h1>健康计划</h1>
        <p>把报告里的建议拆成每天可以完成的小行动，并持续记录身体变化。</p>
      </div>
      <button v-if="plan" class="ghost-button" type="button" :disabled="loading" @click="load">
        <RefreshCw :size="15" :class="{ spin: loading }" />
        刷新数据
      </button>
    </header>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="plan">
      <section class="status-strip">
        <article class="status-card period-card">
          <span class="status-icon"><CalendarDays :size="18" /></span>
          <div>
            <small>计划周期</small>
            <strong>{{ shortDate(plan.startDate) }} - {{ shortDate(plan.endDate) }}</strong>
            <p>来自报告 #{{ plan.sourceReportId }}</p>
          </div>
        </article>
        <article class="status-card check-card" :class="{ completed: todayRecorded }">
          <span class="status-icon"><CheckCircle2 :size="18" /></span>
          <div>
            <small>今日打卡</small>
            <strong>{{ todayRecorded ? "已完成记录" : "等待记录" }}</strong>
            <p>{{ todayStatusText }}</p>
          </div>
        </article>
        <article class="status-card rate-card">
          <span class="status-icon"><Sparkles :size="18" /></span>
          <div>
            <small>近 7 天打卡率</small>
            <strong>{{ percent(summary?.checkinRate) }}</strong>
            <p>饮食 {{ percent(summary?.dietRate) }} · 运动 {{ percent(summary?.exerciseRate) }}</p>
          </div>
        </article>
        <article class="status-card retake-card">
          <span class="status-icon"><RefreshCw :size="18" /></span>
          <div>
            <small>下次复拍</small>
            <strong>{{ plan.nextRetakeDate ? shortDate(plan.nextRetakeDate) : "已完成" }}</strong>
            <p>{{ summary?.retakeCompleted ? "已完成复拍记录" : "保持相似光线更利于趋势观察" }}</p>
          </div>
        </article>
      </section>

      <section class="plan-grid">
        <article class="plan-block food">
          <div class="plan-title-row">
            <span class="plan-icon"><Utensils :size="19" /></span>
            <div>
              <span class="plan-label">DIET</span>
              <h2>饮食计划</h2>
            </div>
          </div>
          <p class="plan-goal">{{ plan.dietGoal?.goal || "保持清淡、规律、易消化。" }}</p>
          <ul>
            <li v-for="item in plan.dietGoal?.actions || []" :key="item"><Check :size="14" />{{ item }}</li>
          </ul>
          <small>{{ plan.dietGoal?.frequency || "每天" }} · {{ plan.dietGoal?.duration || "连续 7 天" }}</small>
        </article>

        <article class="plan-block sleep">
          <div class="plan-title-row">
            <span class="plan-icon"><MoonStar :size="19" /></span>
            <div>
              <span class="plan-label">SLEEP</span>
              <h2>睡眠计划</h2>
            </div>
          </div>
          <p class="plan-goal">{{ plan.sleepGoal?.goal || "保持稳定作息和恢复。" }}</p>
          <ul>
            <li v-for="item in plan.sleepGoal?.actions || []" :key="item"><Check :size="14" />{{ item }}</li>
          </ul>
          <small>{{ plan.sleepGoal?.frequency || "每天" }} · {{ plan.sleepGoal?.duration || "连续 7 天" }}</small>
        </article>

        <article class="plan-block move">
          <div class="plan-title-row">
            <span class="plan-icon"><Dumbbell :size="19" /></span>
            <div>
              <span class="plan-label">MOVE</span>
              <h2>运动计划</h2>
            </div>
          </div>
          <p class="plan-goal">{{ plan.exerciseGoal?.goal || "选择温和、可持续的活动。" }}</p>
          <ul>
            <li v-for="item in plan.exerciseGoal?.actions || []" :key="item"><Check :size="14" />{{ item }}</li>
          </ul>
          <small>{{ plan.exerciseGoal?.frequency || "每天" }} · {{ plan.exerciseGoal?.duration || "连续 7 天" }}</small>
        </article>
      </section>

      <section class="checkin-panel" :class="{ recorded: todayRecorded }">
        <div class="checkin-heading">
          <div>
            <span class="page-kicker">TODAY · {{ todayLabel }}</span>
            <h2>{{ todayRecorded ? "今天已经记录完成" : "记录今天的执行情况" }}</h2>
            <p v-if="todayRecorded">今日打卡已锁定，明天可以继续记录新的执行情况。</p>
            <p v-else>勾选今天实际完成的内容，不需要为了满分而勉强完成。</p>
          </div>
          <div class="completion-badge" :class="{ done: todayRecorded }">
            <strong>{{ completedCount }}/3</strong>
            <span>{{ todayRecorded ? "已记录" : "已完成" }}</span>
          </div>
        </div>

        <div class="completion-track" aria-hidden="true">
          <i :style="{ width: `${completionPercent}%` }"></i>
        </div>

        <div class="check-grid">
          <button
            type="button"
            class="check-item diet"
            :class="{ active: form.dietDone }"
            :disabled="todayRecorded"
            :aria-pressed="form.dietDone"
            @click="toggleTask('dietDone')"
          >
            <span class="task-icon"><Utensils :size="20" /></span>
            <span class="task-copy"><strong>饮食执行</strong><small>按计划完成主要饮食安排</small></span>
            <span class="task-check"><Check :size="15" /></span>
          </button>
          <button
            type="button"
            class="check-item sleep"
            :class="{ active: form.sleepDone }"
            :disabled="todayRecorded"
            :aria-pressed="form.sleepDone"
            @click="toggleTask('sleepDone')"
          >
            <span class="task-icon"><MoonStar :size="20" /></span>
            <span class="task-copy"><strong>睡眠记录</strong><small>记录作息和睡眠恢复情况</small></span>
            <span class="task-check"><Check :size="15" /></span>
          </button>
          <button
            type="button"
            class="check-item move"
            :class="{ active: form.exerciseDone }"
            :disabled="todayRecorded"
            :aria-pressed="form.exerciseDone"
            @click="toggleTask('exerciseDone')"
          >
            <span class="task-icon"><Dumbbell :size="20" /></span>
            <span class="task-copy"><strong>运动完成</strong><small>完成今天适合自己的活动</small></span>
            <span class="task-check"><Check :size="15" /></span>
          </button>
        </div>

        <div v-if="plan.observationItems?.length" class="observation-section">
          <div class="section-copy">
            <span class="section-icon"><Leaf :size="17" /></span>
            <div><strong>今日观察</strong><small>选择今天有留意的身体变化</small></div>
          </div>
          <div class="observation-chips">
            <button
              v-for="item in plan.observationItems"
              :key="item"
              type="button"
              :class="{ active: selectedObservations.includes(item) }"
              :disabled="todayRecorded"
              @click="toggleObservation(item)"
            >
              <Check v-if="selectedObservations.includes(item)" :size="13" />
              {{ item }}
            </button>
          </div>
        </div>

        <div class="note-section">
          <div class="section-copy">
            <span class="section-icon"><ClipboardList :size="17" /></span>
            <div><strong>补充记录</strong><small>写下饮食、睡眠或身体感受</small></div>
          </div>
          <textarea
            v-model="form.note"
            maxlength="500"
            :disabled="todayRecorded"
            placeholder="例如：午饭后有些腹胀，晚饭后快走了 20 分钟，今晚准备 23:30 前睡觉。"
          />
          <span class="note-count">{{ form.note.length }}/500</span>
        </div>

        <div class="checkin-footer">
          <div class="save-tip">
            <CheckCircle2 :size="17" />
            <span>{{ todayRecorded ? "今天的记录已保存，不能重复提交。" : "提交后今天的记录将锁定，避免重复打卡。" }}</span>
          </div>
          <button
            class="primary-button save-button"
            type="button"
            :disabled="saving || todayRecorded"
            @click="saveCheckin"
          >
            <CheckCircle2 :size="17" />
            {{ saving ? "正在保存" : todayRecorded ? "今日已记录" : "保存今日打卡" }}
          </button>
        </div>
      </section>

      <section class="history-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">RECENT</span>
            <h2>最近打卡</h2>
            <p>回顾近期执行情况，重点关注持续性而不是单日满分。</p>
          </div>
          <button class="ghost-button danger-button" type="button" @click="closePlan">关闭当前计划</button>
        </div>
        <div v-if="checkins.length" class="checkin-list">
          <article v-for="item in checkins" :key="item.checkinId">
            <div class="history-date">
              <strong>{{ shortDate(item.checkinDate) }}</strong>
              <small>{{ item.checkinDate === todayIso ? "今天" : "已记录" }}</small>
            </div>
            <span :class="['history-status', { done: item.dietDone }]">饮食 {{ item.dietDone ? "完成" : "未完成" }}</span>
            <span :class="['history-status', { done: item.sleepDone }]">睡眠 {{ item.sleepDone ? "完成" : "未完成" }}</span>
            <span :class="['history-status', { done: item.exerciseDone }]">运动 {{ item.exerciseDone ? "完成" : "未完成" }}</span>
          </article>
        </div>
        <p v-else class="empty-copy">还没有打卡记录，从今天开始就行。</p>
      </section>
    </template>

    <section v-else class="empty-panel">
      <ClipboardList :size="30" />
      <h2>还没有进行中的健康计划</h2>
      <p>打开一份新版舌象报告，点击“生成我的 7 天健康计划”，就能把饮食、睡眠和运动建议变成每日任务。</p>
      <button class="primary-button" type="button" @click="router.push('/reports')">去报告中心</button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Leaf,
  MoonStar,
  RefreshCw,
  Sparkles,
  Utensils,
} from "lucide-vue-next";
import { healthPlanApi, type CheckinSummary, type DailyCheckin, type HealthPlan } from "@tongue/shared";

type TaskKey = "dietDone" | "sleepDone" | "exerciseDone";

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

const todayRecorded = computed(() => Boolean(plan.value?.todayCheckin));
const completedCount = computed(() => [form.dietDone, form.sleepDone, form.exerciseDone].filter(Boolean).length);
const completionPercent = computed(() => Math.round((completedCount.value / 3) * 100));
const todayStatusText = computed(() => todayRecorded.value
  ? `已完成 ${completedCount.value}/3 项，今天不能重复提交`
  : `当前完成 ${completedCount.value}/3 项`);
const todayIso = new Date().toISOString().slice(0, 10);
const todayLabel = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(new Date());

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
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "健康计划加载失败");
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
  selectedObservations.value = Array.isArray(items)
    ? items.filter((item): item is string => typeof item === "string")
    : [];
}

function toggleTask(key: TaskKey) {
  if (todayRecorded.value) {
    ElMessage.info("今天已经记录了，明天再来打卡吧");
    return;
  }
  form[key] = !form[key];
}

function toggleObservation(item: string) {
  if (todayRecorded.value) {
    ElMessage.info("今天已经记录了，不能再次修改");
    return;
  }
  selectedObservations.value = selectedObservations.value.includes(item)
    ? selectedObservations.value.filter((value) => value !== item)
    : [...selectedObservations.value, item];
}

async function saveCheckin() {
  if (todayRecorded.value) {
    ElMessage.info("今天已经记录了，明天再来打卡吧");
    return;
  }
  if (saving.value) return;

  saving.value = true;
  try {
    await healthPlanApi.checkinToday({
      dietDone: form.dietDone,
      sleepDone: form.sleepDone,
      exerciseDone: form.exerciseDone,
      observation: { checked_items: selectedObservations.value },
      note: form.note,
    });
    ElMessage.success("今日打卡已记录，明天可以继续打卡");
    await load();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
    await load();
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
  const date = new Date(`${value}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
</script>

<style scoped>
.plan-page{display:grid;gap:20px;width:min(1180px,100%);margin:0 auto;padding-bottom:28px}.plan-head,.panel-heading,.checkin-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.page-kicker,.plan-label{display:block;color:#3f7058;font-size:10px;font-weight:800;letter-spacing:.16em}.plan-head h1{margin:8px 0 0;font-family:"Noto Serif SC","Source Han Serif SC",serif;font-size:clamp(38px,4.5vw,58px);font-weight:560;letter-spacing:-.045em;color:#24372d}.plan-head p,.panel-heading p,.checkin-heading p{margin:9px 0 0;color:#77827b;font-size:13px;line-height:1.75}.status-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.status-card{display:grid;grid-template-columns:44px minmax(0,1fr);gap:13px;align-items:start;min-height:116px;padding:18px;border:1px solid rgba(183,194,184,.62);border-radius:20px;background:rgba(255,254,249,.92);box-shadow:0 14px 38px rgba(54,75,63,.055)}.status-card .status-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:13px;background:#edf4ef;color:#32644a}.status-card>div{display:grid;gap:5px}.status-card small{color:#88928c;font-size:11px}.status-card strong{color:#2d5540;font-size:20px;line-height:1.2}.status-card p{margin:0;color:#7a867e;font-size:11px;line-height:1.45}.status-card.completed{border-color:rgba(48,119,77,.3);background:linear-gradient(145deg,#f7fbf8,#edf7f0)}.status-card.completed .status-icon{background:#2f754d;color:white}.plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.plan-block,.checkin-panel,.history-panel,.empty-panel{border:1px solid rgba(183,194,184,.66);border-radius:24px;background:rgba(255,254,249,.93);box-shadow:0 16px 42px rgba(54,75,63,.06)}.plan-block{display:flex;min-height:300px;flex-direction:column;gap:14px;padding:23px}.plan-title-row{display:flex;align-items:center;gap:12px}.plan-icon{display:grid;width:44px;height:44px;place-items:center;border-radius:14px}.plan-block.food .plan-icon{background:#f7ead8;color:#9a6a34}.plan-block.sleep .plan-icon{background:#ede9f5;color:#71688f}.plan-block.move .plan-icon{background:#e4f1e8;color:#33714e}.plan-title-row h2,.panel-heading h2,.checkin-heading h2,.empty-panel h2{margin:2px 0 0;color:#283a30;font-size:22px;font-weight:700}.plan-goal{margin:0;padding:12px 14px;border-radius:13px;background:#f7f9f6;color:#4c6155;line-height:1.7}.plan-block ul{display:grid;gap:10px;margin:0;padding:0;list-style:none;color:#607067;font-size:13px;line-height:1.65}.plan-block li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;align-items:start}.plan-block li svg{margin-top:4px;color:#56806a}.plan-block>small{margin-top:auto;color:#89928d;font-size:11px}.checkin-panel,.history-panel,.empty-panel{padding:26px}.checkin-panel{background:linear-gradient(145deg,rgba(255,254,249,.98),rgba(246,250,247,.95))}.checkin-panel.recorded{border-color:rgba(47,117,77,.28)}.completion-badge{display:grid;min-width:96px;justify-items:center;padding:12px 17px;border:1px solid #d9e5dd;border-radius:16px;background:#fff}.completion-badge strong{color:#2f6849;font-size:26px}.completion-badge span{color:#849087;font-size:11px}.completion-badge.done{background:#2f704d;border-color:#2f704d}.completion-badge.done strong,.completion-badge.done span{color:#fff}.completion-track{overflow:hidden;height:7px;margin-top:20px;border-radius:999px;background:#e2ebe5}.completion-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#32704d,#79ad8a);transition:width .25s ease}.check-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}.check-item{display:grid;grid-template-columns:44px minmax(0,1fr) 28px;gap:12px;align-items:center;min-height:92px;padding:15px;border:1px solid #dce6df;border-radius:17px;background:#fff;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.check-item:hover:not(:disabled){transform:translateY(-2px);border-color:#8bb39a;box-shadow:0 10px 24px rgba(51,103,73,.09)}.check-item:disabled{cursor:default}.task-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:13px;background:#f2f5f2;color:#5d7567}.task-copy{display:grid;gap:4px}.task-copy strong{color:#32473b;font-size:14px}.task-copy small{color:#859087;font-size:11px;line-height:1.45}.task-check{display:grid;width:26px;height:26px;place-items:center;border:1px solid #ccd9d0;border-radius:50%;color:transparent}.check-item.active{border-color:#73a287;background:#f1f8f3}.check-item.active .task-check{border-color:#347451;background:#347451;color:#fff}.check-item.diet.active .task-icon{background:#f6ead9;color:#95652f}.check-item.sleep.active .task-icon{background:#ece8f3;color:#6d648b}.check-item.move.active .task-icon{background:#e2f0e7;color:#32704d}.observation-section,.note-section{display:grid;gap:13px;margin-top:22px;padding-top:20px;border-top:1px solid rgba(183,194,184,.45)}.section-copy{display:flex;align-items:center;gap:10px}.section-icon{display:grid;width:34px;height:34px;place-items:center;border-radius:10px;background:#eef4ef;color:#3e7356}.section-copy>div{display:grid;gap:2px}.section-copy strong{color:#31483b;font-size:14px}.section-copy small{color:#879189;font-size:11px}.observation-chips{display:flex;flex-wrap:wrap;gap:9px}.observation-chips button{display:inline-flex;align-items:center;gap:6px;padding:9px 12px;border:1px solid #d7e2da;border-radius:999px;background:#fff;color:#53665b;font-size:12px;cursor:pointer}.observation-chips button.active{border-color:#5e9474;background:#eaf5ed;color:#285d3f;font-weight:650}.observation-chips button:disabled{cursor:default}.note-section{position:relative}.note-section textarea{width:100%;min-height:112px;padding:14px 15px 30px;border:1px solid #d6e1da;border-radius:16px;resize:vertical;background:#fff;color:#34483c;font:inherit;line-height:1.65;outline:none}.note-section textarea:focus{border-color:#78a58a;box-shadow:0 0 0 3px rgba(78,137,101,.1)}.note-section textarea:disabled{background:#f4f6f3;color:#657169}.note-count{position:absolute;right:13px;bottom:10px;color:#9aa29d;font-size:10px}.checkin-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:22px;padding-top:20px;border-top:1px solid rgba(183,194,184,.45)}.save-tip{display:flex;align-items:center;gap:8px;color:#718078;font-size:12px}.save-tip svg{color:#4d8062}.primary-button,.ghost-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 16px;border-radius:13px;cursor:pointer;font-size:12px;font-weight:650}.primary-button{border:0;background:#245d3d;color:#fff;box-shadow:0 9px 20px rgba(36,93,61,.18)}.primary-button:disabled{opacity:.58;cursor:not-allowed;box-shadow:none}.save-button{min-width:168px}.ghost-button{border:1px solid rgba(75,101,86,.15);background:#f8faf7;color:#45614f}.ghost-button:disabled{opacity:.55;cursor:not-allowed}.danger-button{color:#6c706d}.checkin-list{display:grid;gap:8px;margin-top:18px}.checkin-list article{display:grid;grid-template-columns:110px repeat(3,minmax(0,1fr));gap:12px;align-items:center;padding:13px 0;border-top:1px solid rgba(183,194,184,.4)}.history-date{display:grid;gap:3px}.history-date strong{color:#315d43;font-size:14px}.history-date small{color:#909a94;font-size:10px}.history-status{display:inline-flex;width:fit-content;align-items:center;padding:6px 10px;border-radius:999px;background:#f1f3f1;color:#8a938e;font-size:11px}.history-status.done{background:#e7f2ea;color:#2f704d}.empty-copy{color:#7f8a83;font-size:12px}.empty-panel{display:grid;justify-items:center;gap:14px;padding:52px 24px;text-align:center}.empty-panel svg{color:#3f7058}.empty-panel p{max-width:520px;margin:0;color:#6f7b72;line-height:1.8}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:900px){.status-strip,.plan-grid,.check-grid{grid-template-columns:1fr 1fr}.plan-head,.panel-heading{align-items:flex-start;flex-direction:column}.checkin-list article{grid-template-columns:1fr 1fr}}@media(max-width:640px){.status-strip,.plan-grid,.check-grid{grid-template-columns:1fr}.checkin-heading,.checkin-footer{align-items:flex-start;flex-direction:column}.completion-badge{justify-items:start}.save-button{width:100%}.checkin-list article{grid-template-columns:1fr}.plan-page{gap:14px}}
</style>
