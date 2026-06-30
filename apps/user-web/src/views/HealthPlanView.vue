<template>
  <section class="health-plan-page">
    <header class="plan-hero">
      <div class="hero-copy">
        <span class="page-kicker">DAILY CARE</span>
        <h1>把健康建议，<span>变成每天都能完成的小行动</span></h1>
        <p>围绕饮食、睡眠与运动建立连续计划，通过每日打卡和身体观察，逐步形成可回顾的健康记录。</p>

        <div class="hero-actions">
          <button v-if="plan" class="primary-action" type="button" @click="scrollToCheckin">
            <CheckCircle2 :size="17" />
            {{ todayRecorded ? "查看今日成果" : "开始今日打卡" }}
            <ArrowRight :size="16" />
          </button>
          <RouterLink v-else class="primary-action" to="/reports">
            <FileText :size="17" />
            从报告生成计划
            <ArrowRight :size="16" />
          </RouterLink>
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新计划
          </button>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="care-spark spark-one" />
        <span class="care-spark spark-two" />

        <div class="care-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="care-glass">
            <div class="care-symbol">
              <Target :size="65" :stroke-width="1.65" />
            </div>
            <span class="activity-orbit"><Activity :size="21" /></span>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loading && !plan" class="page-skeleton" aria-label="正在加载健康计划">
      <section class="skeleton-overview">
        <span v-for="index in 4" :key="index" />
      </section>
      <section class="skeleton-plan-grid">
        <span v-for="index in 3" :key="index" />
      </section>
      <section class="skeleton-large" />
    </div>

    <template v-else-if="plan">
      <section class="plan-overview" aria-label="健康计划概览">
        <article class="overview-card overview-period">
          <span class="overview-icon"><CalendarDays :size="21" /></span>
          <span class="overview-copy">
            <small>计划周期</small>
            <strong class="date-value">{{ shortDate(plan.startDate) }} - {{ shortDate(plan.endDate) }}</strong>
            <span>来自报告 #{{ plan.sourceReportId }}</span>
          </span>
        </article>

        <article :class="[ 'overview-card overview-today', { completed: todayRecorded } ]">
          <span class="overview-icon"><CheckCircle2 :size="21" /></span>
          <span class="overview-copy">
            <small>今日打卡</small>
            <strong>{{ todayRecorded ? "已记录" : `${completedCount}/3 项` }}</strong>
            <span>{{ todayStatusText }}</span>
          </span>
        </article>

        <article class="overview-card overview-rate">
          <span class="overview-icon"><Sparkles :size="21" /></span>
          <span class="overview-copy">
            <small>近 7 天打卡率</small>
            <strong>{{ percent(summary?.checkinRate) }}</strong>
            <span>饮食 {{ percent(summary?.dietRate) }} · 运动 {{ percent(summary?.exerciseRate) }}</span>
          </span>
        </article>

        <article class="overview-card overview-retake">
          <span class="overview-icon"><Camera :size="21" /></span>
          <span class="overview-copy">
            <small>下次复拍</small>
            <strong>{{ plan.nextRetakeDate ? shortDate(plan.nextRetakeDate) : "已完成" }}</strong>
            <span>{{ summary?.retakeCompleted ? "已完成本周期复拍" : "保持相似光线便于趋势观察" }}</span>
          </span>
        </article>
      </section>

      <section class="progress-panel">
        <div class="progress-copy">
          <span class="progress-icon"><TrendingUp :size="22" /></span>
          <div>
            <span class="page-kicker">PLAN PROGRESS</span>
            <strong>当前处于第 {{ currentDayNumber }} 天</strong>
            <p>计划共 {{ totalPlanDays }} 天，已记录 {{ summary?.checkinCount || 0 }} 天，剩余约 {{ remainingDays }} 天。</p>
          </div>
        </div>

        <div class="progress-visual">
          <div class="progress-track">
            <i :style="{ width: `${planProgressPercent}%` }" />
          </div>
          <div class="progress-labels">
            <span>开始</span>
            <strong>{{ planProgressPercent }}%</strong>
            <span>完成</span>
          </div>
        </div>

        <RouterLink class="progress-link" to="/trends">
          查看趋势
          <ArrowRight :size="15" />
        </RouterLink>
      </section>

      <section class="plan-section">
        <div class="section-heading">
          <div>
            <span class="page-kicker">TODAY'S CARE PLAN</span>
            <h2>今日健康安排</h2>
            <p>计划内容来自报告建议和个性化信号，请以可持续完成为优先。</p>
          </div>
          <span class="day-badge">DAY {{ currentDayNumber }}</span>
        </div>

        <div class="care-grid">
          <article class="care-card diet-card">
            <header class="care-card-header">
              <span class="care-icon"><Utensils :size="21" /></span>
              <div>
                <span class="care-label">DIET</span>
                <h3>饮食计划</h3>
              </div>
              <span class="care-state"><Leaf :size="14" /> 清淡规律</span>
            </header>

            <p class="care-goal">{{ plan.dietGoal?.goal || "保持清淡、规律、易消化。" }}</p>

            <ul class="care-actions">
              <li v-for="item in dietActions" :key="item">
                <span><Check :size="13" /></span>
                {{ item }}
              </li>
            </ul>

            <footer class="care-card-footer">
              <span><Clock3 :size="14" /> {{ plan.dietGoal?.frequency || "每天" }}</span>
              <span>{{ plan.dietGoal?.duration || "连续 7 天" }}</span>
            </footer>
          </article>

          <article class="care-card sleep-card">
            <header class="care-card-header">
              <span class="care-icon"><MoonStar :size="21" /></span>
              <div>
                <span class="care-label">SLEEP</span>
                <h3>睡眠计划</h3>
              </div>
              <span class="care-state"><Clock3 :size="14" /> 稳定作息</span>
            </header>

            <p class="care-goal">{{ sleepGoalText }}</p>

            <ul class="care-actions">
              <li v-for="item in sleepActions" :key="item">
                <span><Check :size="13" /></span>
                {{ item }}
              </li>
            </ul>

            <footer class="care-card-footer">
              <span><Clock3 :size="14" /> {{ plan.sleepGoal?.frequency || "每天" }}</span>
              <span>{{ plan.sleepGoal?.duration || "连续 7 天" }}</span>
            </footer>
          </article>

          <article class="care-card exercise-card">
            <header class="care-card-header">
              <span class="care-icon"><Dumbbell :size="21" /></span>
              <div>
                <span class="care-label">MOVE</span>
                <h3>运动计划</h3>
              </div>
              <span class="care-state"><Activity :size="14" /> 温和持续</span>
            </header>

            <p class="care-goal">{{ exerciseGoalText }}</p>

            <ul class="care-actions">
              <li v-for="item in exerciseActions" :key="item">
                <span><Check :size="13" /></span>
                {{ item }}
              </li>
            </ul>

            <footer class="care-card-footer">
              <span><Clock3 :size="14" /> {{ plan.exerciseGoal?.frequency || "每天" }}</span>
              <span>{{ plan.exerciseGoal?.duration || "连续 7 天" }}</span>
            </footer>
          </article>
        </div>
      </section>

      <section ref="checkinPanel" :class="[ 'checkin-panel', { recorded: todayRecorded } ]">
        <template v-if="todayRecorded">
          <div class="completion-celebration">
            <div class="celebration-confetti" aria-hidden="true">
              <i v-for="index in 12" :key="index" :class="`confetti-${index}`" />
            </div>

            <div class="celebration-copy">
              <span class="page-kicker">TODAY COMPLETE · {{ todayLabel }}</span>
              <h2>{{ celebrationTitle }}</h2>
              <p>{{ celebrationMessage }}</p>

              <div class="celebration-actions">
                <RouterLink class="celebration-primary" to="/trends">
                  <TrendingUp :size="16" />
                  查看健康趋势
                  <ArrowRight :size="15" />
                </RouterLink>
                <button class="celebration-secondary" type="button" @click="scrollToHistory">
                  <History :size="16" />
                  查看最近记录
                </button>
              </div>
            </div>

            <div class="celebration-emblem" aria-hidden="true">
              <span class="emblem-halo" />
              <span class="emblem-ring ring-outer" />
              <span class="emblem-ring ring-inner" />
              <div class="emblem-core">
                <CheckCircle2 :size="64" :stroke-width="1.65" />
              </div>
              <span class="emblem-spark spark-a" />
              <span class="emblem-spark spark-b" />
              <span class="emblem-spark spark-c" />
            </div>
          </div>

          <div class="completion-metrics" aria-label="今日完成摘要">
            <article>
              <span class="metric-icon"><ShieldCheck :size="18" /></span>
              <div><small>记录状态</small><strong>已安全保存</strong></div>
            </article>
            <article>
              <span class="metric-icon"><CheckCircle2 :size="18" /></span>
              <div><small>计划执行</small><strong>{{ completedCount }}/3 项</strong></div>
            </article>
            <article>
              <span class="metric-icon"><History :size="18" /></span>
              <div><small>累计记录</small><strong>{{ summary?.checkinCount || 0 }} 天</strong></div>
            </article>
            <article>
              <span class="metric-icon"><Leaf :size="18" /></span>
              <div><small>身体观察</small><strong>{{ selectedObservations.length }} 项</strong></div>
            </article>
          </div>

          <div class="record-review">
            <div class="record-review-heading">
              <div>
                <span class="page-kicker">TODAY'S RECORD</span>
                <h3>今天留下了这些记录</h3>
              </div>
              <span>真实记录比勉强满分更有价值</span>
            </div>

            <div class="recorded-task-grid">
              <article :class="{ done: form.dietDone }">
                <span><Utensils :size="18" /></span>
                <div>
                  <strong>饮食执行</strong>
                  <small>{{ form.dietDone ? "已完成" : "今日未勾选" }}</small>
                </div>
                <Check v-if="form.dietDone" :size="15" />
              </article>
              <article :class="{ done: form.sleepDone }">
                <span><MoonStar :size="18" /></span>
                <div>
                  <strong>睡眠记录</strong>
                  <small>{{ form.sleepDone ? "已完成" : "今日未勾选" }}</small>
                </div>
                <Check v-if="form.sleepDone" :size="15" />
              </article>
              <article :class="{ done: form.exerciseDone }">
                <span><Dumbbell :size="18" /></span>
                <div>
                  <strong>运动完成</strong>
                  <small>{{ form.exerciseDone ? "已完成" : "今日未勾选" }}</small>
                </div>
                <Check v-if="form.exerciseDone" :size="15" />
              </article>
            </div>

            <div v-if="selectedObservations.length" class="recorded-observations">
              <div class="record-subheading">
                <span><Leaf :size="17" /></span>
                <div><strong>身体观察</strong><small>今天留意到的身体变化</small></div>
              </div>
              <div class="recorded-chips">
                <span v-for="item in selectedObservations" :key="item">
                  <Check :size="12" />
                  {{ item }}
                </span>
              </div>
            </div>

            <div v-if="form.note" class="recorded-note">
              <span><ClipboardList :size="18" /></span>
              <div>
                <strong>补充记录</strong>
                <p>{{ form.note }}</p>
              </div>
            </div>

            <div
              v-if="completedCount === 0 && !selectedObservations.length && !form.note"
              class="honest-record"
            >
              <span><Sparkles :size="20" /></span>
              <div>
                <strong>今天选择了如实记录</strong>
                <p>没有勾选具体任务也没关系。承认今天的真实状态，是建立长期健康习惯的重要一步。</p>
              </div>
            </div>
          </div>

          <div class="tomorrow-message">
            <span class="tomorrow-icon"><Sparkles :size="20" /></span>
            <div>
              <span class="page-kicker">KEEP GOING</span>
              <strong>明天继续，不必追求每一天都满分</strong>
              <p>长期变化来自稳定而真实的记录。保持自己的节奏，坚持会让趋势越来越清晰。</p>
            </div>
            <span class="tomorrow-day">DAY {{ Math.min(currentDayNumber + 1, totalPlanDays) }}</span>
          </div>
        </template>

        <template v-else>
          <div class="checkin-heading">
            <div>
              <span class="page-kicker">TODAY · {{ todayLabel }}</span>
              <h2>记录今天的执行情况</h2>
              <p>勾选真实完成的内容即可，不需要为了满分而勉强执行。</p>
            </div>

            <div class="completion-badge">
              <strong>{{ completedCount }}/3</strong>
              <span>已完成</span>
            </div>
          </div>

          <div class="completion-track" aria-hidden="true">
            <i :style="{ width: `${completionPercent}%` }" />
          </div>

          <div class="check-grid">
            <button
              type="button"
              :class="[ 'check-item diet', { active: form.dietDone } ]"
              :aria-pressed="form.dietDone"
              @click="toggleTask('dietDone')"
            >
              <span class="task-icon"><Utensils :size="20" /></span>
              <span class="task-copy">
                <strong>饮食执行</strong>
                <small>按计划完成今天主要饮食安排</small>
              </span>
              <span class="task-check"><Check :size="15" /></span>
            </button>

            <button
              type="button"
              :class="[ 'check-item sleep', { active: form.sleepDone } ]"
              :aria-pressed="form.sleepDone"
              @click="toggleTask('sleepDone')"
            >
              <span class="task-icon"><MoonStar :size="20" /></span>
              <span class="task-copy">
                <strong>睡眠记录</strong>
                <small>记录作息和睡眠恢复情况</small>
              </span>
              <span class="task-check"><Check :size="15" /></span>
            </button>

            <button
              type="button"
              :class="[ 'check-item move', { active: form.exerciseDone } ]"
              :aria-pressed="form.exerciseDone"
              @click="toggleTask('exerciseDone')"
            >
              <span class="task-icon"><Dumbbell :size="20" /></span>
              <span class="task-copy">
                <strong>运动完成</strong>
                <small>完成今天适合自己的活动</small>
              </span>
              <span class="task-check"><Check :size="15" /></span>
            </button>
          </div>

          <div v-if="plan.observationItems?.length" class="observation-section">
            <div class="subsection-heading">
              <span class="subsection-icon"><Leaf :size="17" /></span>
              <div>
                <strong>今日身体观察</strong>
                <small>选择今天有留意的身体变化，可多选</small>
              </div>
            </div>

            <div class="observation-chips">
              <button
                v-for="item in plan.observationItems"
                :key="item"
                type="button"
                :class="{ active: selectedObservations.includes(item) }"
                @click="toggleObservation(item)"
              >
                <Check v-if="selectedObservations.includes(item)" :size="13" />
                {{ item }}
              </button>
            </div>
          </div>

          <div class="note-section">
            <div class="subsection-heading">
              <span class="subsection-icon"><ClipboardList :size="17" /></span>
              <div>
                <strong>补充记录</strong>
                <small>写下饮食、睡眠、运动或身体感受</small>
              </div>
            </div>

            <div class="textarea-wrap">
              <textarea
                v-model="form.note"
                maxlength="500"
                placeholder="例如：午饭后有些腹胀，晚饭后快走了 20 分钟，今晚准备 23:30 前睡觉。"
              />
              <span>{{ form.note.length }}/500</span>
            </div>
          </div>

          <footer class="checkin-footer">
            <div class="save-tip">
              <ShieldCheck :size="17" />
              <span>提交后今日记录将锁定，并自动切换到今日完成页。</span>
            </div>

            <button class="save-button" type="button" :disabled="saving" @click="saveCheckin">
              <RefreshCw v-if="saving" class="spinning" :size="17" />
              <CheckCircle2 v-else :size="17" />
              {{ saving ? "正在保存" : "保存今日打卡" }}
            </button>
          </footer>
        </template>
      </section>

      <section ref="historyPanel" class="history-panel">
        <div class="section-heading history-heading">
          <div>
            <span class="page-kicker">RECENT CHECK-INS</span>
            <h2>最近打卡记录</h2>
            <p>关注持续性和真实感受，而不是追求每天全部完成。</p>
          </div>
          <span class="history-count"><History :size="15" /> {{ checkins.length }} 条记录</span>
        </div>

        <div v-if="recentCheckins.length" class="history-list">
          <article v-for="item in recentCheckins" :key="item.checkinId" class="history-card">
            <div class="history-date">
              <span>{{ formatWeekday(item.checkinDate) }}</span>
              <strong>{{ shortDate(item.checkinDate) }}</strong>
              <small>{{ item.checkinDate === todayIso ? "今天" : "已记录" }}</small>
            </div>

            <div class="history-progress">
              <div>
                <span>完成度</span>
                <strong>{{ checkinCompletedCount(item) }}/3</strong>
              </div>
              <i><b :style="{ width: `${checkinCompletionPercent(item)}%` }" /></i>
            </div>

            <div class="history-statuses">
              <span :class="{ done: item.dietDone }"><Utensils :size="14" /> 饮食</span>
              <span :class="{ done: item.sleepDone }"><MoonStar :size="14" /> 睡眠</span>
              <span :class="{ done: item.exerciseDone }"><Dumbbell :size="14" /> 运动</span>
            </div>

            <p>{{ item.note || "当天未填写补充说明。" }}</p>
          </article>
        </div>

        <div v-else class="history-empty">
          <span><History :size="24" /></span>
          <div>
            <strong>还没有打卡记录</strong>
            <p>从今天开始记录即可，连续完成几天后这里会形成执行轨迹。</p>
          </div>
        </div>

        <footer class="plan-management">
          <div>
            <span><ShieldCheck :size="16" /> 计划管理</span>
            <p>关闭计划不会删除已经保存的历史打卡记录。</p>
          </div>
          <button class="close-plan-button" type="button" @click="closePlan">
            <XCircle :size="16" />
            关闭当前计划
          </button>
        </footer>
      </section>
    </template>

    <section v-else class="empty-plan-state">
      <div class="empty-visual" aria-hidden="true">
        <span class="empty-halo" />
        <span class="empty-orbit orbit-a" />
        <span class="empty-orbit orbit-b" />
        <div class="empty-icon"><ClipboardList :size="42" :stroke-width="1.65" /></div>
      </div>
      <span class="page-kicker">START DAILY CARE</span>
      <h2>还没有进行中的健康计划</h2>
      <p>打开一份新版舌象报告，生成专属 7 天计划，把饮食、睡眠和运动建议转化为每天可以完成的小任务。</p>
      <div class="empty-actions">
        <RouterLink class="empty-primary" to="/reports">
          去报告中心
          <ArrowRight :size="15" />
        </RouterLink>
        <RouterLink class="empty-secondary" to="/analysis">开始新的分析</RouterLink>
      </div>
    </section>

    <footer class="health-plan-note">
      <ShieldCheck :size="15" />
      <span>健康计划仅用于日常记录和生活方式管理，不替代医生诊断、治疗或紧急医疗服务。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Dumbbell,
  FileText,
  History,
  Leaf,
  MoonStar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  XCircle,
} from "lucide-vue-next";
import {
  healthPlanApi,
  type CheckinSummary,
  type DailyCheckin,
  type HealthPlan,
} from "@tongue/shared";

type TaskKey = "dietDone" | "sleepDone" | "exerciseDone";

const loading = ref(false);
const saving = ref(false);
const plan = ref<HealthPlan | null>(null);
const summary = ref<CheckinSummary | null>(null);
const checkins = ref<DailyCheckin[]>([]);
const selectedObservations = ref<string[]>([]);
const checkinPanel = ref<HTMLElement | null>(null);
const historyPanel = ref<HTMLElement | null>(null);
const form = reactive({
  dietDone: false,
  sleepDone: false,
  exerciseDone: false,
  note: "",
});

const todayIso = new Date().toISOString().slice(0, 10);
const todayLabel = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
}).format(new Date());

const todayRecorded = computed(() => Boolean(plan.value?.todayCheckin));
const completedCount = computed(() => [form.dietDone, form.sleepDone, form.exerciseDone].filter(Boolean).length);
const completionPercent = computed(() => Math.round((completedCount.value / 3) * 100));
const todayStatusText = computed(() => todayRecorded.value
  ? `完成 ${completedCount.value}/3 项，今日记录已保存`
  : `当前完成 ${completedCount.value}/3 项，等待保存`);
const celebrationTitle = computed(() => {
  if (completedCount.value === 3) return "太棒了，今天的计划全部完成";
  if (completedCount.value > 0) return "今天的记录已完成，持续比完美更重要";
  return "今天的真实记录已经保存";
});
const celebrationMessage = computed(() => {
  if (completedCount.value === 3) {
    return "你完成了饮食、睡眠和运动三项记录。保持这样的节奏，长期变化会越来越清晰。";
  }
  if (completedCount.value > 0) {
    return `你完成了 ${completedCount.value} 项计划，也如实记录了今天的状态。每一次稳定积累都值得肯定。`;
  }
  return "今天没有勉强勾选未完成的任务，而是留下了真实状态。真实记录本身，就是建立健康习惯的重要一步。";
});

const todayPlanDay = computed(() => {
  const days = plan.value?.days || [];
  return days.find((item) => item.date === todayIso) || days[0] || null;
});

const totalPlanDays = computed(() => {
  if (plan.value?.days?.length) return plan.value.days.length;
  const start = dateAtMidnight(plan.value?.startDate);
  const end = dateAtMidnight(plan.value?.endDate);
  if (!start || !end) return 7;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
});

const currentDayNumber = computed(() => {
  if (todayPlanDay.value?.dayIndex) return todayPlanDay.value.dayIndex;
  const start = dateAtMidnight(plan.value?.startDate);
  const today = dateAtMidnight(todayIso);
  if (!start || !today) return 1;
  return Math.max(1, Math.min(totalPlanDays.value, Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1));
});

const remainingDays = computed(() => Math.max(0, totalPlanDays.value - currentDayNumber.value));
const planProgressPercent = computed(() => Math.max(0, Math.min(100, Math.round((currentDayNumber.value / totalPlanDays.value) * 100))));

const dietActions = computed(() => {
  const day = todayPlanDay.value?.diet;
  const dailyActions = [
    day?.breakfast?.length ? `早餐：${day.breakfast.join("、")}` : "",
    day?.lunch?.length ? `午餐：${day.lunch.join("、")}` : "",
    day?.dinner?.length ? `晚餐：${day.dinner.join("、")}` : "",
    day?.avoid?.length ? `今日尽量避免：${day.avoid.join("、")}` : "",
  ].filter(Boolean);
  return dailyActions.length ? dailyActions.slice(0, 4) : fallbackActions(plan.value?.dietGoal?.actions, [
    "保持三餐规律，避免过饥或过饱。",
    "优先选择清淡、温和、易消化的食物。",
    "减少高油、高糖及过度刺激性饮食。",
  ]);
});

const sleepGoalText = computed(() => {
  const day = todayPlanDay.value?.sleep;
  if (day?.targetBedtime && day?.targetWakeTime) {
    return `建议 ${day.targetBedtime} 入睡，${day.targetWakeTime} 起床`;
  }
  return plan.value?.sleepGoal?.goal || "保持稳定作息和充分恢复。";
});

const sleepActions = computed(() => {
  const actions = todayPlanDay.value?.sleep?.actions;
  return fallbackActions(actions?.length ? actions : plan.value?.sleepGoal?.actions, [
    "尽量固定入睡和起床时间。",
    "睡前减少高强度工作和屏幕刺激。",
    "记录夜醒、晨起感受和口干等变化。",
  ]);
});

const exerciseGoalText = computed(() => {
  const exercise = todayPlanDay.value?.exercise;
  if (exercise?.activity) {
    const duration = exercise.durationMinutes ? ` · ${exercise.durationMinutes} 分钟` : "";
    const intensity = exercise.intensity ? ` · ${exercise.intensity}` : "";
    return `${exercise.activity}${duration}${intensity}`;
  }
  return plan.value?.exerciseGoal?.goal || "选择温和、可持续的活动。";
});

const exerciseActions = computed(() => {
  const exercise = todayPlanDay.value?.exercise;
  const actions = [
    ...(exercise?.warmup || []).map((item) => `热身：${item}`),
    ...(exercise?.cooldown || []).map((item) => `放松：${item}`),
  ];
  return fallbackActions(actions.length ? actions : plan.value?.exerciseGoal?.actions, [
    "从低到中等强度开始，不追求大汗。",
    "活动前进行简单热身。",
    "结束后缓慢放松并补充水分。",
  ]);
});

const recentCheckins = computed(() => [...checkins.value]
  .sort((left, right) => String(right.checkinDate).localeCompare(String(left.checkinDate)))
  .slice(0, 7));

onMounted(() => load());

async function load(showSuccess = false) {
  if (loading.value) return;
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
    if (showSuccess) ElMessage.success("健康计划已刷新");
  } catch (error) {
    console.error("load health plan failed", error);
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

function scrollToCheckin() {
  checkinPanel.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToHistory() {
  historyPanel.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleTask(key: TaskKey) {
  form[key] = !form[key];
}

function toggleObservation(item: string) {
  selectedObservations.value = selectedObservations.value.includes(item)
    ? selectedObservations.value.filter((value) => value !== item)
    : [...selectedObservations.value, item];
}

async function saveCheckin() {
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
    ElMessage.success("今日记录已保存，继续保持自己的节奏");
    await load();
    window.setTimeout(() => scrollToCheckin(), 80);
  } catch (error) {
    console.error("save health plan checkin failed", error);
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
    await load();
  } finally {
    saving.value = false;
  }
}

async function closePlan() {
  if (!plan.value) return;
  try {
    await ElMessageBox.confirm(
      "关闭后不会删除历史打卡，但当前计划将停止显示。确认继续吗？",
      "关闭健康计划",
      {
        type: "warning",
        confirmButtonText: "确认关闭",
        cancelButtonText: "保留计划",
      },
    );
  } catch {
    return;
  }

  try {
    await healthPlanApi.close(plan.value.planId);
    ElMessage.success("健康计划已关闭");
    await load();
  } catch (error) {
    console.error("close health plan failed", error);
    ElMessage.error(error instanceof Error ? error.message : "计划关闭失败");
  }
}

function fallbackActions(actions: string[] | undefined, fallback: string[]) {
  return actions?.length ? actions.slice(0, 4) : fallback;
}

function checkinCompletedCount(item: DailyCheckin) {
  return [item.dietDone, item.sleepDone, item.exerciseDone].filter(Boolean).length;
}

function checkinCompletionPercent(item: DailyCheckin) {
  return Math.round((checkinCompletedCount(item) / 3) * 100);
}

function percent(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function dateAtMidnight(value?: string) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(value?: string) {
  const date = dateAtMidnight(value);
  if (!date) return "--";
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatWeekday(value?: string) {
  const date = dateAtMidnight(value);
  return date ? new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date) : "--";
}
</script>

<style scoped>
.health-plan-page {
  --plan-ink: #182820;
  --plan-muted: #79857d;
  --plan-line: rgba(137, 155, 143, 0.22);
  --plan-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.plan-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 64%) minmax(290px, 36%);
  align-items: center;
  min-height: 258px;
  overflow: hidden;
  padding: 40px 44px;
  border: 1px solid var(--plan-line);
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 28%, rgba(179, 226, 191, 0.31), transparent 29%),
    radial-gradient(circle at 97% 95%, rgba(211, 237, 212, 0.72), transparent 34%),
    linear-gradient(96deg, #fffefa 0%, #fcfdfb 56%, #eef8ef 100%);
  box-shadow: 0 22px 52px rgba(37, 71, 49, 0.07);
  animation: reveal-up 520ms ease-out both;
}

.hero-copy {
  position: relative;
  z-index: 3;
  min-width: 0;
}

.page-kicker,
.care-label {
  display: block;
  color: #43805f;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.plan-hero h1 {
  max-width: 790px;
  margin: 13px 0 0;
  color: var(--plan-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(38px, 4vw, 55px);
  font-weight: 520;
  line-height: 1.2;
  letter-spacing: -0.055em;
}

.plan-hero h1 span {
  color: var(--plan-green);
}

.plan-hero p {
  max-width: 730px;
  margin: 18px 0 0;
  color: var(--plan-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.primary-action,
.ghost-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 41px;
  padding: 0 15px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.primary-action {
  border: 1px solid #267c50;
  background: linear-gradient(150deg, #3d9364, #276f4c);
  color: white;
  box-shadow: 0 10px 20px rgba(38, 124, 80, 0.2);
}

.ghost-action {
  border: 1px solid rgba(72, 116, 88, 0.18);
  background: rgba(255, 255, 255, 0.74);
  color: #526d5e;
  box-shadow: 0 7px 18px rgba(39, 74, 51, 0.04);
}

.primary-action:hover,
.ghost-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.ghost-action:disabled {
  cursor: wait;
  opacity: 0.55;
}

.hero-visual {
  position: relative;
  min-height: 192px;
}

.visual-grid {
  position: absolute;
  inset: -48px -54px -48px 3%;
  background-image:
    linear-gradient(rgba(56, 133, 82, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 133, 82, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, black 24%);
  animation: grid-drift 18s linear infinite alternate;
}

.visual-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(53, 142, 84, 0.2);
  border-radius: 50%;
  transform-origin: center;
}

.orbit-one {
  width: 306px;
  height: 132px;
  animation: orbit-one 9s ease-in-out infinite;
}

.orbit-two {
  width: 250px;
  height: 178px;
  animation: orbit-two 11s ease-in-out infinite;
}

.visual-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #8fcda2;
  box-shadow: 0 0 0 7px rgba(143, 205, 162, 0.14);
  animation: dot-pulse 3.2s ease-in-out infinite;
}

.dot-one { top: 24px; left: 23px; }
.dot-two { right: 17px; bottom: 32px; animation-delay: 1.1s; }

.care-spark {
  position: absolute;
  width: 17px;
  height: 17px;
}

.care-spark::before,
.care-spark::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999px;
  background: rgba(74, 151, 98, 0.3);
  content: "";
  transform: translate(-50%, -50%);
}

.care-spark::before { width: 3px; height: 17px; }
.care-spark::after { width: 17px; height: 3px; }
.spark-one { top: 31px; right: 36px; animation: sparkle 4s ease-in-out infinite; }
.spark-two { bottom: 29px; left: 32px; animation: sparkle 4.6s 1.1s ease-in-out infinite; }

.care-stage {
  position: absolute;
  top: 8px;
  right: 10%;
  width: 270px;
  height: 190px;
  animation: stage-float 5.7s ease-in-out infinite;
}

.stage-halo {
  position: absolute;
  top: 21px;
  left: 50%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(66, 177, 103, 0.18);
  filter: blur(30px);
  transform: translateX(-50%);
}

.stage-platform {
  position: absolute;
  left: 50%;
  border-radius: 50%;
  transform: translateX(-50%);
}

.platform-back {
  bottom: 5px;
  width: 252px;
  height: 69px;
  border: 1px solid rgba(68, 155, 94, 0.22);
  background: linear-gradient(180deg, rgba(250, 253, 250, 0.86), rgba(225, 242, 227, 0.9));
  box-shadow: inset 0 10px 20px rgba(87, 166, 106, 0.1);
}

.platform-front {
  bottom: 18px;
  width: 205px;
  height: 39px;
  border: 1px solid rgba(68, 155, 94, 0.17);
  background: rgba(255, 255, 255, 0.68);
}

.care-glass {
  position: absolute;
  top: 2px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 145px;
  height: 165px;
  place-items: center;
  overflow: visible;
  border: 1px solid rgba(77, 163, 101, 0.23);
  border-radius: 54px 54px 39px 39px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.95), rgba(215, 241, 219, 0.82));
  box-shadow:
    0 20px 30px rgba(49, 139, 78, 0.16),
    inset 14px 16px 20px rgba(255, 255, 255, 0.76),
    inset -12px -15px 20px rgba(94, 166, 111, 0.12);
  transform: translateX(-50%) perspective(560px) rotateY(-8deg);
}

.care-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.care-symbol {
  position: relative;
  z-index: 2;
  display: grid;
  width: 88px;
  height: 88px;
  place-items: center;
  border-radius: 30px;
  background: linear-gradient(155deg, #52b978, #248653);
  color: white;
  box-shadow:
    0 14px 22px rgba(38, 135, 74, 0.25),
    inset 10px 10px 15px rgba(255, 255, 255, 0.15),
    inset -12px -13px 18px rgba(17, 97, 52, 0.28);
}

.activity-orbit {
  position: absolute;
  right: -10px;
  bottom: 25px;
  z-index: 4;
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 4px solid rgba(245, 251, 246, 0.95);
  border-radius: 50%;
  background: #fffefa;
  color: #288653;
  box-shadow: 0 8px 17px rgba(39, 115, 68, 0.17);
}

.plan-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.overview-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 116px;
  padding: 19px 20px;
  overflow: hidden;
  border: 1px solid var(--plan-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 70ms; }
.overview-card:nth-child(3) { animation-delay: 130ms; }
.overview-card:nth-child(4) { animation-delay: 190ms; }

.overview-card::after {
  position: absolute;
  right: -28px;
  bottom: -44px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  content: "";
  opacity: 0.55;
}

.overview-icon {
  position: relative;
  z-index: 2;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
}

.overview-period .overview-icon { background: #eaf4ec; color: #2f8757; }
.overview-period::after { background: #edf7ef; }
.overview-today .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-today::after { background: #edf4f8; }
.overview-today.completed { border-color: rgba(47, 139, 88, 0.26); background: linear-gradient(135deg, #f6fbf7, #edf7ef); }
.overview-today.completed .overview-icon { background: #2f8a59; color: white; }
.overview-rate .overview-icon { background: #f0ecf7; color: #746097; }
.overview-rate::after { background: #f5f0fa; }
.overview-retake .overview-icon { background: #fbefd8; color: #ad7412; }
.overview-retake::after { background: #fcf4e4; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 9px; }
.overview-copy strong { margin-top: 5px; color: #21342a; font-size: 23px; font-weight: 700; line-height: 1.1; }
.overview-copy .date-value { font-size: 18px; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.progress-panel {
  display: grid;
  grid-template-columns: minmax(290px, 0.95fr) minmax(320px, 1.1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 20px 22px;
  border: 1px solid rgba(92, 161, 113, 0.28);
  border-radius: 20px;
  background: linear-gradient(120deg, #edf6ef, #f9fcf8 64%, #f2f8f1);
  box-shadow: 0 10px 26px rgba(35, 77, 49, 0.035);
  animation: reveal-up 560ms 160ms ease-out both;
}

.progress-copy {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.progress-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #dceee2;
  color: #2c8554;
}

.progress-copy strong { display: block; margin-top: 6px; color: #2d4838; font-size: 14px; }
.progress-copy p { margin: 5px 0 0; color: #758179; font-size: 10px; line-height: 1.6; }

.progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #dce8df;
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #62b77f, #2f8959);
  box-shadow: 0 0 12px rgba(47, 137, 89, 0.18);
  transition: width 350ms ease;
}

.progress-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: #849087;
  font-size: 8px;
}

.progress-labels strong { color: #2e8253; font-size: 10px; }

.progress-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2d7e50;
  font-size: 11px;
  font-weight: 680;
  text-decoration: none;
  white-space: nowrap;
}

.plan-section,
.checkin-panel,
.history-panel {
  padding: 26px 27px;
  border: 1px solid var(--plan-line);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
}

.plan-section { animation: reveal-up 560ms 210ms ease-out both; }
.checkin-panel { scroll-margin-top: 24px; animation: reveal-up 560ms 260ms ease-out both; }
.history-panel { scroll-margin-top: 24px; animation: reveal-up 560ms 310ms ease-out both; }

.section-heading,
.checkin-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2,
.checkin-heading h2 {
  margin: 8px 0 0;
  color: #26382e;
  font-size: 23px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.section-heading p,
.checkin-heading p {
  margin: 7px 0 0;
  color: #89938d;
  font-size: 10px;
  line-height: 1.65;
}

.day-badge,
.history-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  background: #edf5ef;
  color: #3f7554;
  font-size: 9px;
  font-weight: 680;
}

.care-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 21px;
}

.care-card {
  position: relative;
  display: flex;
  min-height: 350px;
  flex-direction: column;
  overflow: hidden;
  padding: 21px;
  border: 1px solid rgba(145, 162, 151, 0.2);
  border-radius: 20px;
  background: #fffefa;
  box-shadow: 0 11px 27px rgba(35, 66, 47, 0.04);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.care-card::after {
  position: absolute;
  top: -48px;
  right: -48px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  content: "";
  opacity: 0.48;
}

.diet-card::after { background: #f9eddc; }
.sleep-card::after { background: #f0ecf8; }
.exercise-card::after { background: #e8f4eb; }

.care-card:hover {
  border-color: rgba(55, 139, 86, 0.3);
  box-shadow: 0 18px 38px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.care-card-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.care-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
}

.diet-card .care-icon { background: #f8ead7; color: #9b682f; }
.sleep-card .care-icon { background: #ece8f5; color: #71658f; }
.exercise-card .care-icon { background: #e4f1e8; color: #33714e; }

.care-card-header h3 {
  margin: 4px 0 0;
  color: #293b31;
  font-size: 18px;
  font-weight: 710;
}

.care-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 27px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f3f6f3;
  color: #65766c;
  font-size: 8px;
  white-space: nowrap;
}

.care-goal {
  position: relative;
  z-index: 2;
  margin: 17px 0 0;
  padding: 12px 13px;
  border-radius: 13px;
  background: #f7f9f6;
  color: #4c6155;
  font-size: 11px;
  line-height: 1.7;
}

.care-actions {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 10px;
  margin: 17px 0 0;
  padding: 0;
  list-style: none;
}

.care-actions li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  color: #66746b;
  font-size: 10px;
  line-height: 1.65;
}

.care-actions li > span {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 8px;
  background: #edf4ef;
  color: #3d8058;
}

.care-card-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(145, 162, 151, 0.16);
  color: #89938d;
  font-size: 8px;
}

.care-card-footer span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.checkin-panel {
  background:
    radial-gradient(circle at 100% 0%, rgba(210, 234, 215, 0.42), transparent 31%),
    rgba(255, 255, 253, 0.96);
}

.checkin-panel.recorded {
  overflow: hidden;
  border-color: rgba(47, 139, 88, 0.28);
  background:
    radial-gradient(circle at 90% 9%, rgba(182, 227, 194, 0.28), transparent 30%),
    radial-gradient(circle at 6% 100%, rgba(224, 241, 227, 0.55), transparent 31%),
    linear-gradient(145deg, #fffefa, #f8fcf8);
}

.completion-celebration {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  align-items: center;
  gap: 30px;
  min-height: 270px;
  overflow: hidden;
  padding: 34px 38px;
  border: 1px solid rgba(62, 147, 91, 0.2);
  border-radius: 22px;
  background:
    radial-gradient(circle at 83% 36%, rgba(178, 229, 193, 0.38), transparent 25%),
    linear-gradient(115deg, rgba(255, 255, 253, 0.98), rgba(239, 249, 241, 0.96));
}

.celebration-copy {
  position: relative;
  z-index: 3;
}

.celebration-copy h2 {
  max-width: 720px;
  margin: 11px 0 0;
  color: #1f3a2b;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(31px, 3.2vw, 44px);
  font-weight: 570;
  letter-spacing: -0.045em;
  line-height: 1.28;
}

.celebration-copy > p {
  max-width: 680px;
  margin: 16px 0 0;
  color: #6f8076;
  font-size: 12px;
  line-height: 1.8;
}

.celebration-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 22px;
}

.celebration-primary,
.celebration-secondary {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
  border-radius: 11px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.celebration-primary {
  border: 1px solid #27764e;
  background: linear-gradient(150deg, #3e9866, #27764e);
  color: white;
  box-shadow: 0 9px 19px rgba(39, 118, 78, 0.18);
}

.celebration-secondary {
  border: 1px solid rgba(71, 112, 84, 0.18);
  background: rgba(255, 255, 255, 0.78);
  color: #4e6959;
}

.celebration-primary:hover,
.celebration-secondary:hover {
  transform: translateY(-2px);
}

.celebration-emblem {
  position: relative;
  width: 230px;
  height: 210px;
  justify-self: end;
}

.emblem-halo {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(69, 178, 104, 0.24);
  filter: blur(28px);
  transform: translateX(-50%);
}

.emblem-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px dashed rgba(54, 147, 84, 0.24);
  border-radius: 50%;
}

.ring-outer {
  width: 210px;
  height: 92px;
  animation: celebration-orbit 8s ease-in-out infinite;
}

.ring-inner {
  width: 166px;
  height: 132px;
  animation: celebration-orbit-alt 9.5s ease-in-out infinite;
}

.emblem-core {
  position: absolute;
  top: 30px;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 134px;
  height: 148px;
  place-items: center;
  border: 1px solid rgba(61, 151, 89, 0.22);
  border-radius: 47px 47px 37px 37px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.96), rgba(211, 240, 218, 0.9));
  color: #268653;
  box-shadow:
    0 18px 31px rgba(40, 132, 76, 0.17),
    inset 12px 13px 17px rgba(255, 255, 255, 0.7),
    inset -10px -12px 16px rgba(76, 157, 96, 0.11);
  animation: emblem-float 5s ease-in-out infinite;
}

.emblem-spark {
  position: absolute;
  z-index: 4;
  width: 17px;
  height: 17px;
}

.emblem-spark::before,
.emblem-spark::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999px;
  background: #7bbd90;
  content: "";
  transform: translate(-50%, -50%);
}

.emblem-spark::before { width: 3px; height: 17px; }
.emblem-spark::after { width: 17px; height: 3px; }
.spark-a { top: 27px; right: 11px; animation: sparkle 3.4s ease-in-out infinite; }
.spark-b { left: 8px; bottom: 39px; animation: sparkle 4.1s 0.8s ease-in-out infinite; }
.spark-c { right: 31px; bottom: 13px; animation: sparkle 3.8s 1.4s ease-in-out infinite; }

.celebration-confetti i {
  position: absolute;
  z-index: 1;
  display: block;
  width: 7px;
  height: 13px;
  border-radius: 3px;
  opacity: 0.45;
  animation: confetti-float 7s ease-in-out infinite;
}

.confetti-1 { top: 16%; left: 4%; background: #66ad7f; transform: rotate(18deg); }
.confetti-2 { top: 22%; left: 47%; background: #e0ad62; animation-delay: 0.7s !important; }
.confetti-3 { top: 74%; left: 9%; background: #899dcc; animation-delay: 1.3s !important; }
.confetti-4 { top: 12%; left: 68%; background: #9a82bd; transform: rotate(55deg); }
.confetti-5 { top: 83%; left: 43%; background: #71b894; animation-delay: 1.8s !important; }
.confetti-6 { top: 67%; left: 73%; background: #df9869; transform: rotate(-30deg); }
.confetti-7 { top: 28%; left: 91%; background: #68b586; animation-delay: 2.1s !important; }
.confetti-8 { top: 84%; left: 88%; background: #8b9fc7; transform: rotate(35deg); }
.confetti-9 { top: 44%; left: 3%; background: #d9a45f; animation-delay: 0.4s !important; }
.confetti-10 { top: 9%; left: 29%; background: #75b98a; transform: rotate(-40deg); }
.confetti-11 { top: 51%; left: 57%; background: #a28bbb; animation-delay: 1.6s !important; }
.confetti-12 { top: 72%; left: 96%; background: #df9a6d; transform: rotate(66deg); }

.completion-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.completion-metrics article {
  display: grid;
  grid-template-columns: 39px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 76px;
  padding: 12px;
  border: 1px solid rgba(137, 155, 143, 0.17);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.76);
}

.metric-icon {
  display: grid;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 12px;
  background: #e8f3eb;
  color: #347d54;
}

.completion-metrics small { display: block; color: #8a958e; font-size: 8px; }
.completion-metrics strong { display: block; margin-top: 4px; color: #334b3d; font-size: 11px; }

.record-review {
  display: grid;
  gap: 15px;
  margin-top: 14px;
  padding: 21px;
  border: 1px solid rgba(137, 155, 143, 0.17);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.72);
}

.record-review-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.record-review-heading h3 {
  margin: 7px 0 0;
  color: #2e4236;
  font-size: 18px;
}

.record-review-heading > span {
  color: #87928b;
  font-size: 8px;
}

.recorded-task-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.recorded-task-grid article {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  min-height: 70px;
  padding: 11px;
  border: 1px solid rgba(145, 162, 151, 0.18);
  border-radius: 14px;
  background: #f7f9f7;
  color: #869089;
}

.recorded-task-grid article.done {
  border-color: rgba(53, 137, 83, 0.23);
  background: #edf6ef;
  color: #2f7950;
}

.recorded-task-grid article > span {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  background: #eef1ef;
}

.recorded-task-grid article.done > span {
  background: white;
}

.recorded-task-grid strong { display: block; color: #4b5d52; font-size: 10px; }
.recorded-task-grid article.done strong { color: #2f6245; }
.recorded-task-grid small { display: block; margin-top: 4px; font-size: 8px; }

.recorded-observations,
.recorded-note,
.honest-record {
  display: grid;
  gap: 11px;
  padding-top: 15px;
  border-top: 1px solid rgba(145, 162, 151, 0.16);
}

.record-subheading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.record-subheading > span,
.recorded-note > span,
.honest-record > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #eaf3ec;
  color: #397e55;
}

.record-subheading strong,
.recorded-note strong,
.honest-record strong { color: #384f41; font-size: 10px; }
.record-subheading small { display: block; margin-top: 3px; color: #89938d; font-size: 8px; }

.recorded-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recorded-chips span {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  background: #edf6ef;
  color: #396f50;
  font-size: 8px;
}

.recorded-note,
.honest-record {
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: start;
}

.recorded-note p,
.honest-record p {
  margin: 5px 0 0;
  color: #748078;
  font-size: 9px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.honest-record {
  padding: 14px;
  border-top: 0;
  border-radius: 14px;
  background: #f4f8f4;
}

.tomorrow-message {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  margin-top: 14px;
  padding: 16px;
  border: 1px solid rgba(67, 144, 90, 0.2);
  border-radius: 17px;
  background: linear-gradient(110deg, #eaf5ed, #f8fcf8);
}

.tomorrow-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  background: white;
  color: #347d54;
  box-shadow: 0 8px 17px rgba(48, 117, 76, 0.08);
}

.tomorrow-message strong { display: block; margin-top: 5px; color: #315b42; font-size: 11px; }
.tomorrow-message p { margin: 5px 0 0; color: #728078; font-size: 8px; line-height: 1.55; }

.tomorrow-day {
  min-height: 31px;
  padding: 0 10px;
  border-radius: 999px;
  background: #2f7a50;
  color: white;
  font-size: 8px;
  font-weight: 700;
  line-height: 31px;
  white-space: nowrap;
}

.completion-badge {
  display: grid;
  min-width: 94px;
  justify-items: center;
  padding: 12px 16px;
  border: 1px solid #d9e5dd;
  border-radius: 16px;
  background: white;
}

.completion-badge strong { color: #2f6849; font-size: 25px; }
.completion-badge span { color: #849087; font-size: 9px; }

.completion-track {
  height: 7px;
  margin-top: 20px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2ebe5;
}

.completion-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #32704d, #79ad8a);
  transition: width 250ms ease;
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.check-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 12px;
  min-height: 94px;
  padding: 15px;
  border: 1px solid #dce6df;
  border-radius: 17px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.check-item:hover {
  border-color: #8bb39a;
  box-shadow: 0 10px 24px rgba(51, 103, 73, 0.09);
  transform: translateY(-2px);
}

.task-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: #f2f5f2;
  color: #5d7567;
}

.task-copy {
  display: grid;
  gap: 4px;
}

.task-copy strong { color: #32473b; font-size: 13px; }
.task-copy small { color: #859087; font-size: 9px; line-height: 1.45; }

.task-check {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid #ccd9d0;
  border-radius: 50%;
  color: transparent;
}

.check-item.active {
  border-color: #73a287;
  background: #f1f8f3;
}

.check-item.active .task-check {
  border-color: #347451;
  background: #347451;
  color: white;
}

.check-item.diet.active .task-icon { background: #f6ead9; color: #95652f; }
.check-item.sleep.active .task-icon { background: #ece8f3; color: #6d648b; }
.check-item.move.active .task-icon { background: #e2f0e7; color: #32704d; }

.observation-section,
.note-section {
  display: grid;
  gap: 13px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(183, 194, 184, 0.45);
}

.subsection-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subsection-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #eef4ef;
  color: #3e7356;
}

.subsection-heading > div {
  display: grid;
  gap: 2px;
}

.subsection-heading strong { color: #31483b; font-size: 13px; }
.subsection-heading small { color: #879189; font-size: 9px; }

.observation-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.observation-chips button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #d7e2da;
  border-radius: 999px;
  background: white;
  color: #53665b;
  font-size: 10px;
  cursor: pointer;
}

.observation-chips button.active {
  border-color: #5e9474;
  background: #eaf5ed;
  color: #285d3f;
  font-weight: 650;
}

.textarea-wrap {
  position: relative;
}

.textarea-wrap textarea {
  width: 100%;
  min-height: 115px;
  padding: 14px 15px 30px;
  border: 1px solid #d6e1da;
  border-radius: 16px;
  outline: 0;
  resize: vertical;
  background: white;
  color: #34483c;
  font: inherit;
  font-size: 11px;
  line-height: 1.65;
}

.textarea-wrap textarea:focus {
  border-color: #78a58a;
  box-shadow: 0 0 0 3px rgba(78, 137, 101, 0.1);
}

.textarea-wrap > span {
  position: absolute;
  right: 13px;
  bottom: 10px;
  color: #9aa29d;
  font-size: 9px;
}

.checkin-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(183, 194, 184, 0.45);
}

.save-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718078;
  font-size: 10px;
}

.save-tip svg { color: #4d8062; }

.save-button {
  display: inline-flex;
  min-width: 168px;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid #245d3d;
  border-radius: 13px;
  background: linear-gradient(150deg, #398d5e, #245d3d);
  color: white;
  box-shadow: 0 9px 20px rgba(36, 93, 61, 0.18);
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
  box-shadow: none;
}

.history-list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.history-card {
  display: grid;
  grid-template-columns: 84px 150px auto minmax(180px, 1fr);
  align-items: center;
  gap: 18px;
  min-height: 88px;
  padding: 13px 15px;
  border: 1px solid rgba(145, 162, 151, 0.17);
  border-radius: 15px;
  background: #fafcf9;
  transition: border-color 180ms ease, transform 180ms ease;
}

.history-card:hover {
  border-color: rgba(53, 135, 83, 0.27);
  transform: translateX(3px);
}

.history-date {
  display: grid;
  gap: 3px;
}

.history-date span { color: #4b7b5d; font-size: 8px; font-weight: 680; }
.history-date strong { color: #315d43; font-size: 14px; }
.history-date small { color: #909a94; font-size: 8px; }

.history-progress > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.history-progress span { color: #89938d; font-size: 8px; }
.history-progress strong { color: #315d43; font-size: 10px; }

.history-progress > i {
  display: block;
  height: 5px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e9e4;
}

.history-progress b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #62b77f, #2f8959);
}

.history-statuses {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.history-statuses span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  background: #f0f3f1;
  color: #89928d;
  font-size: 8px;
}

.history-statuses span.done {
  background: #e7f2ea;
  color: #2f704d;
}

.history-card > p {
  margin: 0;
  overflow: hidden;
  color: #7b867f;
  font-size: 9px;
  line-height: 1.6;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-empty {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  margin-top: 20px;
  padding: 18px;
  border: 1px dashed rgba(119, 143, 127, 0.25);
  border-radius: 15px;
  background: #f8faf8;
}

.history-empty > span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background: #e9f2eb;
  color: #3c8057;
}

.history-empty strong { color: #385244; font-size: 11px; }
.history-empty p { margin: 5px 0 0; color: #7b867f; font-size: 9px; }

.plan-management {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 21px;
  padding-top: 18px;
  border-top: 1px solid rgba(145, 162, 151, 0.18);
}

.plan-management > div > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4b6d59;
  font-size: 10px;
  font-weight: 680;
}

.plan-management p { margin: 5px 0 0; color: #89938d; font-size: 9px; }

.close-plan-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(177, 76, 67, 0.16);
  border-radius: 11px;
  background: #fff5f3;
  color: #b34f47;
  cursor: pointer;
  font-size: 10px;
  font-weight: 680;
}

.empty-plan-state {
  display: grid;
  min-height: 500px;
  place-items: center;
  align-content: center;
  padding: 42px 22px;
  border: 1px solid var(--plan-line);
  border-radius: 25px;
  background:
    radial-gradient(circle at 50% 30%, rgba(218, 238, 222, 0.5), transparent 27%),
    linear-gradient(180deg, #fffefa, #fbfdfb);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
  text-align: center;
}

.empty-plan-state h2 {
  margin: 13px 0 0;
  color: #293b31;
  font-size: 21px;
}

.empty-plan-state > p {
  max-width: 570px;
  margin: 9px 0 0;
  color: #7c8780;
  font-size: 11px;
  line-height: 1.75;
}

.empty-visual {
  position: relative;
  width: 150px;
  height: 125px;
  margin-bottom: 10px;
}

.empty-halo {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(72, 169, 103, 0.15);
  filter: blur(23px);
  transform: translateX(-50%);
}

.empty-orbit {
  position: absolute;
  left: 50%;
  border: 1px dashed rgba(56, 145, 86, 0.22);
  border-radius: 50%;
  transform: translateX(-50%);
}

.orbit-a { bottom: 10px; width: 142px; height: 45px; animation: empty-orbit 6s ease-in-out infinite; }
.orbit-b { bottom: 17px; width: 105px; height: 29px; animation: empty-orbit 7s 0.8s ease-in-out infinite reverse; }

.empty-icon {
  position: absolute;
  top: 8px;
  left: 50%;
  z-index: 2;
  display: grid;
  width: 76px;
  height: 84px;
  place-items: center;
  border: 1px solid rgba(64, 149, 91, 0.18);
  border-radius: 27px 27px 22px 22px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(224, 242, 228, 0.86));
  color: #357f55;
  box-shadow: 0 14px 25px rgba(43, 125, 75, 0.13);
  transform: translateX(-50%);
  animation: empty-float 4.8s ease-in-out infinite;
}

.empty-actions {
  display: flex;
  gap: 9px;
  margin-top: 20px;
}

.empty-primary,
.empty-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 14px;
  border-radius: 11px;
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
}

.empty-primary {
  border: 1px solid #286f49;
  background: #28774d;
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
}

.empty-secondary {
  border: 1px solid rgba(70, 98, 82, 0.17);
  background: #fffefa;
  color: #52655a;
}

.page-skeleton {
  display: grid;
  gap: 16px;
}

.skeleton-overview,
.skeleton-plan-grid {
  display: grid;
  gap: 13px;
}

.skeleton-overview { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.skeleton-plan-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.skeleton-overview span,
.skeleton-plan-grid span,
.skeleton-large {
  border: 1px solid rgba(145, 162, 151, 0.14);
  border-radius: 20px;
  background: linear-gradient(90deg, #edf1ed 25%, #f8faf8 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.skeleton-overview span { height: 116px; }
.skeleton-plan-grid span { height: 350px; }
.skeleton-large { height: 420px; }

.health-plan-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  color: #849088;
  font-size: 10px;
  text-align: center;
}

button:focus-visible,
a:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stage-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes orbit-one {
  0%, 100% { transform: translate(-50%, -50%) rotate(11deg); }
  50% { transform: translate(-50%, -54%) rotate(16deg); }
}

@keyframes orbit-two {
  0%, 100% { transform: translate(-50%, -50%) rotate(-18deg); }
  50% { transform: translate(-50%, -46%) rotate(-23deg); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.72; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(0.72) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(1) rotate(45deg); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@keyframes celebration-orbit {
  0%, 100% { transform: translate(-50%, -50%) rotate(10deg); }
  50% { transform: translate(-50%, -54%) rotate(16deg); }
}

@keyframes celebration-orbit-alt {
  0%, 100% { transform: translate(-50%, -50%) rotate(-16deg); }
  50% { transform: translate(-50%, -46%) rotate(-22deg); }
}

@keyframes emblem-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-7px); }
}

@keyframes confetti-float {
  0%, 100% { opacity: 0.25; transform: translateY(0) rotate(0deg); }
  50% { opacity: 0.62; transform: translateY(-12px) rotate(110deg); }
}

@keyframes empty-orbit {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(8deg) scale(1.04); }
}

@keyframes empty-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

@keyframes skeleton {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1120px) {
  .plan-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .plan-hero h1 { font-size: clamp(36px, 3.8vw, 48px); }
  .care-stage { right: 3%; }
  .plan-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .progress-panel {
    grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  }

  .progress-link { grid-column: 1 / -1; justify-self: end; }

  .completion-celebration {
    grid-template-columns: minmax(0, 1fr) 220px;
  }

  .completion-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .history-card {
    grid-template-columns: 78px 140px minmax(250px, 1fr);
  }

  .history-card > p {
    grid-column: 2 / -1;
  }
}

@media (max-width: 900px) {
  .plan-hero {
    grid-template-columns: 1fr;
    min-height: 245px;
  }

  .hero-copy { max-width: 76%; }

  .hero-visual {
    position: absolute;
    right: -30px;
    bottom: -35px;
    width: 330px;
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.8);
  }

  .care-grid {
    grid-template-columns: 1fr;
  }

  .care-card {
    min-height: auto;
  }

  .completion-celebration {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .celebration-emblem {
    position: absolute;
    right: -24px;
    bottom: -45px;
    opacity: 0.28;
    transform: scale(0.82);
  }

  .recorded-task-grid,
  .check-grid {
    grid-template-columns: 1fr;
  }

  .history-card {
    grid-template-columns: 80px minmax(180px, 0.6fr) minmax(260px, 1fr);
  }
}

@media (max-width: 720px) {
  .health-plan-page { gap: 14px; }

  .plan-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .plan-hero h1 { font-size: clamp(34px, 10vw, 47px); }
  .plan-hero p { font-size: 13px; }
  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }

  .plan-overview { grid-template-columns: 1fr; }

  .progress-panel {
    grid-template-columns: 1fr;
  }

  .progress-link {
    grid-column: auto;
    justify-self: start;
  }

  .plan-section,
  .checkin-panel,
  .history-panel {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .section-heading,
  .checkin-heading,
  .record-review-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .completion-celebration {
    padding: 27px 23px;
  }

  .celebration-copy h2 {
    font-size: clamp(29px, 8vw, 38px);
  }

  .completion-metrics {
    grid-template-columns: 1fr;
  }

  .completion-badge {
    min-width: 100%;
    grid-template-columns: auto auto;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .care-card-header {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .care-state {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .checkin-footer,
  .plan-management {
    align-items: flex-start;
    flex-direction: column;
  }

  .save-button,
  .close-plan-button {
    width: 100%;
  }

  .tomorrow-message {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .tomorrow-day {
    grid-column: 2;
    justify-self: start;
  }

  .history-card {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .history-statuses,
  .history-card > p {
    grid-column: 1 / -1;
  }

  .skeleton-overview,
  .skeleton-plan-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .plan-hero { padding: 26px 20px; }
  .hero-actions button,
  .hero-actions a { flex: 1; }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 17px;
  }

  .overview-icon { width: 44px; height: 44px; }

  .progress-copy {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .progress-icon { width: 42px; height: 42px; }

  .plan-section,
  .checkin-panel,
  .history-panel {
    padding: 18px 15px;
  }

  .care-card { padding: 17px; }

  .celebration-actions {
    flex-direction: column;
  }

  .celebration-primary,
  .celebration-secondary {
    width: 100%;
  }

  .record-review {
    padding: 16px;
  }

  .check-item {
    grid-template-columns: 42px minmax(0, 1fr) 27px;
    padding: 13px;
  }

  .task-icon { width: 40px; height: 40px; }

  .save-tip {
    align-items: flex-start;
  }

  .history-card {
    grid-template-columns: 1fr;
  }

  .history-progress,
  .history-statuses,
  .history-card > p {
    grid-column: 1;
  }

  .history-date {
    grid-template-columns: auto auto auto;
    align-items: baseline;
    justify-content: start;
    gap: 8px;
  }

  .empty-actions {
    width: 100%;
    flex-direction: column;
  }

  .empty-primary,
  .empty-secondary {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .plan-hero,
  .overview-card,
  .progress-panel,
  .plan-section,
  .checkin-panel,
  .history-panel,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .care-spark,
  .care-stage,
  .emblem-ring,
  .emblem-core,
  .emblem-spark,
  .celebration-confetti i,
  .empty-icon,
  .empty-orbit,
  .skeleton-overview span,
  .skeleton-plan-grid span,
  .skeleton-large,
  .spinning {
    animation: none;
  }

  .primary-action,
  .ghost-action,
  .care-card,
  .check-item,
  .history-card,
  .progress-track i,
  .celebration-primary,
  .celebration-secondary {
    transition: none;
  }

  .primary-action:hover,
  .ghost-action:hover,
  .care-card:hover,
  .check-item:hover,
  .history-card:hover,
  .celebration-primary:hover,
  .celebration-secondary:hover {
    transform: none;
  }
}
</style>
