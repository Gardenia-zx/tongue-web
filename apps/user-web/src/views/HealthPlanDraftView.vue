<template>
  <section class="draft-page">
    <header class="draft-head">
      <div class="head-left">
        <button class="back-button" type="button" @click="router.back()">
          <ArrowLeft :size="17" />
        </button>
        <div>
          <span class="page-kicker">CUSTOM HEALTH PLAN</span>
          <h1>自定义我的 7 天计划</h1>
          <p>系统先提供一份推荐草稿，你可以逐日修改饮食、运动和睡眠安排，确认后再正式开始。</p>
        </div>
      </div>
      <div class="head-actions">
        <button class="secondary-button" type="button" :disabled="loading || saving" @click="saveDraft">
          <Save :size="16" />
          {{ saving ? "保存中" : "保存草稿" }}
        </button>
        <button class="primary-button" type="button" :disabled="loading || activating" @click="activatePlan">
          <PlayCircle :size="17" />
          {{ activating ? "正在启用" : "确认并开始计划" }}
        </button>
      </div>
    </header>

    <el-skeleton v-if="loading" :rows="10" animated />

    <template v-else-if="plan && days.length">
      <section class="draft-notice">
        <Sparkles :size="20" />
        <div>
          <strong>这是一份可编辑草稿</strong>
          <p>开始计划前可以自由修改。启用后，健康计划首页会按当天日期展示你保存的具体安排。</p>
        </div>
        <span>来自报告 #{{ plan.sourceReportId }}</span>
      </section>

      <nav class="day-tabs" aria-label="选择计划日期">
        <button
          v-for="day in days"
          :key="day.dayIndex"
          type="button"
          :class="{ active: day.dayIndex === activeDayIndex }"
          @click="activeDayIndex = day.dayIndex"
        >
          <span>第 {{ day.dayIndex }} 天</span>
          <small>{{ shortDate(day.date) }}</small>
        </button>
      </nav>

      <section v-if="currentDay" class="editor-grid">
        <article class="editor-card diet-card">
          <div class="card-heading">
            <span class="card-icon"><Utensils :size="20" /></span>
            <div>
              <span class="card-kicker">DIET</span>
              <h2>饮食安排</h2>
            </div>
          </div>

          <div class="field-group">
            <label>早餐</label>
            <EditableStringList
              v-model="currentDay.diet.breakfast"
              placeholder="例如：小米粥一碗"
              add-label="添加早餐食物"
            />
          </div>
          <div class="field-group">
            <label>午餐</label>
            <EditableStringList
              v-model="currentDay.diet.lunch"
              placeholder="例如：清炒青菜一份"
              add-label="添加午餐食物"
            />
          </div>
          <div class="field-group">
            <label>晚餐</label>
            <EditableStringList
              v-model="currentDay.diet.dinner"
              placeholder="例如：杂粮粥一小碗"
              add-label="添加晚餐食物"
            />
          </div>
          <div class="field-group">
            <label>今天尽量避免</label>
            <EditableStringList
              v-model="currentDay.diet.avoid"
              placeholder="例如：夜宵"
              add-label="添加避免项"
            />
          </div>
        </article>

        <div class="right-column">
          <article class="editor-card exercise-card">
            <div class="card-heading">
              <span class="card-icon"><Dumbbell :size="20" /></span>
              <div>
                <span class="card-kicker">EXERCISE</span>
                <h2>运动安排</h2>
              </div>
            </div>

            <div class="two-column-fields">
              <label>
                <span>运动项目</span>
                <el-input v-model="currentDay.exercise.activity" maxlength="80" placeholder="例如：晚饭后快走" />
              </label>
              <label>
                <span>时长（分钟）</span>
                <el-input-number v-model="currentDay.exercise.durationMinutes" :min="5" :max="180" />
              </label>
            </div>
            <label class="block-field">
              <span>运动强度</span>
              <el-input v-model="currentDay.exercise.intensity" maxlength="120" placeholder="例如：可以正常说话，不追求大汗" />
            </label>
            <div class="field-group compact">
              <label>热身</label>
              <EditableStringList v-model="currentDay.exercise.warmup" add-label="添加热身动作" />
            </div>
            <div class="field-group compact">
              <label>放松</label>
              <EditableStringList v-model="currentDay.exercise.cooldown" add-label="添加放松动作" />
            </div>
          </article>

          <article class="editor-card sleep-card">
            <div class="card-heading">
              <span class="card-icon"><MoonStar :size="20" /></span>
              <div>
                <span class="card-kicker">SLEEP</span>
                <h2>睡眠安排</h2>
              </div>
            </div>
            <div class="two-column-fields">
              <label>
                <span>目标入睡时间</span>
                <el-time-select
                  v-model="currentDay.sleep.targetBedtime"
                  start="21:00"
                  step="00:15"
                  end="02:00"
                  placeholder="选择时间"
                />
              </label>
              <label>
                <span>目标起床时间</span>
                <el-time-select
                  v-model="currentDay.sleep.targetWakeTime"
                  start="05:00"
                  step="00:15"
                  end="10:00"
                  placeholder="选择时间"
                />
              </label>
            </div>
            <div class="field-group compact">
              <label>睡前行动</label>
              <EditableStringList v-model="currentDay.sleep.actions" add-label="添加睡前行动" />
            </div>
          </article>

          <article class="editor-card observation-card">
            <div class="card-heading">
              <span class="card-icon"><ClipboardList :size="20" /></span>
              <div>
                <span class="card-kicker">OBSERVE</span>
                <h2>当天观察</h2>
              </div>
            </div>
            <EditableStringList
              v-model="currentDay.observations"
              placeholder="例如：饭后是否腹胀"
              add-label="添加观察项"
            />
          </article>
        </div>
      </section>

      <footer class="sticky-actions">
        <div>
          <strong>第 {{ activeDayIndex }} 天已编辑</strong>
          <span>建议逐日检查后再启用，避免出现吃不到或不适合的安排。</span>
        </div>
        <button class="secondary-button" type="button" :disabled="saving" @click="saveDraft">
          <Save :size="16" />保存草稿
        </button>
        <button class="primary-button" type="button" :disabled="activating" @click="activatePlan">
          <PlayCircle :size="17" />确认并开始计划
        </button>
      </footer>
    </template>

    <section v-else class="empty-panel">
      <ClipboardList :size="30" />
      <h2>没有找到计划草稿</h2>
      <p>请从舌象报告页面重新生成一份可编辑的 7 天计划。</p>
      <button class="primary-button" type="button" @click="router.push('/reports')">返回报告中心</button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  ClipboardList,
  Dumbbell,
  MoonStar,
  PlayCircle,
  Save,
  Sparkles,
  Utensils,
} from "lucide-vue-next";
import {
  healthPlanApi,
  type HealthPlan,
  type HealthPlanDay,
} from "@tongue/shared";
import EditableStringList from "../components/health/EditableStringList.vue";

const route = useRoute();
const router = useRouter();
const planId = Number(route.params.planId);
const loading = ref(false);
const saving = ref(false);
const activating = ref(false);
const plan = ref<HealthPlan | null>(null);
const days = ref<HealthPlanDay[]>([]);
const activeDayIndex = ref(1);

const currentDay = computed(() => days.value.find((day) => day.dayIndex === activeDayIndex.value));

onMounted(load);

async function load() {
  if (!Number.isFinite(planId)) return;
  loading.value = true;
  try {
    const result = await healthPlanApi.detail(planId);
    if (result.status === "ACTIVE") {
      await router.replace("/health-plan");
      return;
    }
    plan.value = result;
    days.value = cloneDays(result.days || []);
    activeDayIndex.value = days.value[0]?.dayIndex || 1;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "计划草稿加载失败");
  } finally {
    loading.value = false;
  }
}

async function saveDraft(showMessage = true) {
  if (!plan.value) return false;
  saving.value = true;
  try {
    const result = await healthPlanApi.updateDraft(plan.value.planId, {
      schemaVersion: "2.0",
      days: days.value,
    });
    plan.value = result;
    days.value = cloneDays(result.days || days.value);
    if (showMessage) ElMessage.success("计划草稿已保存");
    return true;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存计划草稿失败");
    return false;
  } finally {
    saving.value = false;
  }
}

async function activatePlan() {
  if (!plan.value || activating.value) return;
  try {
    await ElMessageBox.confirm(
      "启用后将从今天开始执行，并创建第 3 天和第 7 天复拍提醒。确认开始吗？",
      "开始 7 天健康计划",
      { confirmButtonText: "确认开始", cancelButtonText: "继续编辑", type: "success" },
    );
  } catch {
    return;
  }

  activating.value = true;
  try {
    const saved = await saveDraft(false);
    if (!saved) return;
    await healthPlanApi.activate(plan.value.planId);
    ElMessage.success("健康计划已开始，今天的安排已经生效");
    await router.replace("/health-plan");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "启用健康计划失败");
  } finally {
    activating.value = false;
  }
}

function cloneDays(value: HealthPlanDay[]) {
  return JSON.parse(JSON.stringify(value)) as HealthPlanDay[];
}

function shortDate(value?: string) {
  if (!value) return "待启用";
  const date = new Date(`${value}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
</script>

<style scoped>
.draft-page{display:grid;gap:20px;width:min(1220px,100%);margin:0 auto;padding-bottom:96px}.draft-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.head-left{display:flex;align-items:flex-start;gap:14px}.back-button{display:grid;width:40px;height:40px;place-items:center;border:1px solid #d8e2db;border-radius:12px;background:#fff;color:#42614f;cursor:pointer}.page-kicker,.card-kicker{display:block;color:#3f7058;font-size:10px;font-weight:800;letter-spacing:.16em}.draft-head h1{margin:8px 0 0;color:#263a2f;font-family:"Noto Serif SC","Source Han Serif SC",serif;font-size:clamp(34px,4vw,52px);font-weight:580;letter-spacing:-.045em}.draft-head p{max-width:700px;margin:9px 0 0;color:#748078;font-size:13px;line-height:1.75}.head-actions,.sticky-actions{display:flex;align-items:center;gap:10px}.primary-button,.secondary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 16px;border-radius:13px;cursor:pointer;font-size:12px;font-weight:680}.primary-button{border:0;background:#245d3d;color:#fff;box-shadow:0 9px 20px rgba(36,93,61,.18)}.secondary-button{border:1px solid #d4dfd7;background:#fff;color:#41604e}.primary-button:disabled,.secondary-button:disabled{opacity:.55;cursor:not-allowed}.draft-notice{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:13px;align-items:center;padding:17px 19px;border:1px solid #d6e4da;border-radius:18px;background:linear-gradient(135deg,#f6fbf7,#edf6f0);color:#315b43}.draft-notice>svg{padding:9px;box-sizing:content-box;border-radius:12px;background:#fff}.draft-notice>div{display:grid;gap:4px}.draft-notice p{margin:0;color:#66786d;font-size:12px}.draft-notice>span{color:#64806e;font-size:11px}.day-tabs{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;padding:8px;border:1px solid rgba(183,194,184,.64);border-radius:18px;background:rgba(255,254,249,.9)}.day-tabs button{display:grid;gap:4px;min-height:64px;place-items:center;border:1px solid transparent;border-radius:13px;background:transparent;color:#718078;cursor:pointer}.day-tabs button span{font-size:13px;font-weight:650}.day-tabs button small{font-size:10px}.day-tabs button.active{border-color:#6f9f82;background:#eaf4ed;color:#245d3d;box-shadow:0 8px 18px rgba(55,100,73,.08)}.editor-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:16px}.right-column{display:grid;gap:16px}.editor-card,.empty-panel{padding:23px;border:1px solid rgba(183,194,184,.66);border-radius:23px;background:rgba(255,254,249,.95);box-shadow:0 16px 42px rgba(54,75,63,.06)}.card-heading{display:flex;align-items:center;gap:12px;margin-bottom:20px}.card-icon{display:grid;width:44px;height:44px;place-items:center;border-radius:14px}.diet-card .card-icon{background:#f6ead8;color:#95652f}.exercise-card .card-icon{background:#e2f0e7;color:#32704d}.sleep-card .card-icon{background:#ece8f3;color:#6d648b}.observation-card .card-icon{background:#edf1e9;color:#5d755f}.card-heading h2{margin:3px 0 0;color:#2b4034;font-size:22px}.field-group{display:grid;gap:9px;margin-top:17px;padding-top:17px;border-top:1px solid #edf0ed}.field-group:first-of-type{margin-top:0;padding-top:0;border-top:0}.field-group>label,.block-field>span,.two-column-fields label>span{color:#53665b;font-size:12px;font-weight:680}.field-group.compact{margin-top:15px;padding-top:15px}.two-column-fields{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:12px}.two-column-fields label,.block-field{display:grid;gap:8px}.block-field{margin-top:14px}.sticky-actions{position:sticky;bottom:14px;z-index:5;padding:14px 16px;border:1px solid rgba(181,193,183,.75);border-radius:18px;background:rgba(255,254,250,.94);box-shadow:0 18px 44px rgba(40,62,50,.14);backdrop-filter:blur(14px)}.sticky-actions>div{display:grid;gap:3px;margin-right:auto}.sticky-actions strong{color:#304a3a;font-size:13px}.sticky-actions span{color:#7d8981;font-size:11px}.empty-panel{display:grid;justify-items:center;gap:14px;padding:54px 24px;text-align:center}.empty-panel svg{color:#3f7058}.empty-panel h2{margin:0;color:#2d4135}.empty-panel p{max-width:520px;margin:0;color:#738078;line-height:1.7}@media(max-width:960px){.draft-head{align-items:flex-start;flex-direction:column}.editor-grid{grid-template-columns:1fr}.day-tabs{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:640px){.head-actions{width:100%;display:grid;grid-template-columns:1fr 1fr}.day-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.two-column-fields{grid-template-columns:1fr}.sticky-actions{align-items:stretch;flex-direction:column}.sticky-actions>div{margin-right:0}.sticky-actions button{width:100%}.draft-page{padding-bottom:150px}}
</style>
