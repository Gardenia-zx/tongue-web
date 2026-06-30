<template>
  <section class="trends-page">
    <header class="trends-hero">
      <div class="hero-copy">
        <span class="page-kicker">HEALTH TRENDS</span>
        <h1>看见变化，<span>理解每一次健康记录</span></h1>
        <p>基于历史报告观察舌象特征、健康计划执行和记录节奏，形成连续而审慎的趋势视图。</p>

        <div class="hero-actions">
          <RouterLink class="primary-action" to="/analysis">
            <ScanLine :size="17" />
            开始新的分析
            <ArrowRight :size="16" />
          </RouterLink>
          <button class="ghost-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="17" />
            刷新趋势
          </button>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <span class="visual-grid" />
        <span class="visual-orbit orbit-one" />
        <span class="visual-orbit orbit-two" />
        <span class="visual-dot dot-one" />
        <span class="visual-dot dot-two" />
        <span class="trend-spark spark-one" />
        <span class="trend-spark spark-two" />

        <div class="trend-stage">
          <span class="stage-halo" />
          <span class="stage-platform platform-back" />
          <span class="stage-platform platform-front" />
          <div class="trend-glass">
            <div class="trend-symbol">
              <TrendingUp :size="65" :stroke-width="1.65" />
            </div>
            <span class="insight-orbit"><Sparkles :size="21" /></span>
          </div>
        </div>
      </div>
    </header>

    <section class="range-bar">
      <div>
        <span class="page-kicker">OBSERVATION WINDOW</span>
        <strong>选择观察周期</strong>
        <p>周期切换会重新计算报告、特征和趋势序列。</p>
      </div>
      <div class="range-switch" role="tablist" aria-label="趋势观察周期">
        <button
          v-for="item in ranges"
          :key="item.days"
          type="button"
          :class="{ active: activeDays === item.days }"
          :disabled="loading"
          role="tab"
          :aria-selected="activeDays === item.days"
          @click="changeRange(item.days)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="trend-overview" aria-label="趋势数据概览">
      <article class="overview-card overview-period">
        <span class="overview-icon"><CalendarCheck2 :size="21" /></span>
        <span class="overview-copy">
          <small>观察周期</small>
          <strong>{{ overview?.days || activeDays }}<em>天</em></strong>
          <span>当前趋势统计窗口</span>
        </span>
      </article>

      <article class="overview-card overview-reports">
        <span class="overview-icon"><FileText :size="21" /></span>
        <span class="overview-copy">
          <small>分析报告</small>
          <strong>{{ overview?.report_count || 0 }}<em>次</em></strong>
          <span>周期内完成的舌象分析</span>
        </span>
      </article>

      <article class="overview-card overview-features">
        <span class="overview-icon"><ScanLine :size="21" /></span>
        <span class="overview-copy">
          <small>特征记录</small>
          <strong>{{ overview?.feature_count || 0 }}<em>项</em></strong>
          <span>结构化舌象识别结果</span>
        </span>
      </article>

      <article class="overview-card overview-latest">
        <span class="overview-icon"><Sparkles :size="21" /></span>
        <span class="overview-copy">
          <small>最新报告</small>
          <strong>{{ overview?.latest_report_id || "--" }}</strong>
          <span>最近一次健康分析编号</span>
        </span>
      </article>
    </section>

    <section class="execution-panel">
      <div class="execution-heading">
        <span class="execution-icon"><Target :size="23" /></span>
        <div>
          <span class="page-kicker">PLAN FOLLOW-THROUGH</span>
          <h2>近 7 天健康计划执行情况</h2>
          <p>仅统计用户主动打卡，用于帮助回顾计划执行情况，不作为诊断或健康评分。</p>
        </div>
      </div>

      <div class="execution-grid">
        <article
          v-for="item in executionItems"
          :key="item.key"
          :class="[ 'execution-card', { complete: item.complete } ]"
        >
          <span class="execution-card-icon"><component :is="item.icon" :size="17" /></span>
          <span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.label }}</small>
          </span>
          <i v-if="item.numeric" :style="{ '--rate': item.rate }"><b /></i>
          <CircleCheck v-else-if="item.complete" :size="16" class="execution-state" />
          <Clock3 v-else :size="16" class="execution-state pending" />
        </article>
      </div>
    </section>

    <div class="trend-main-grid">
      <section class="chart-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">FEATURE EVOLUTION</span>
            <h2>特征置信度趋势</h2>
            <p>展示所选周期内高频结构化特征随报告时间变化的置信度。</p>
          </div>
          <button class="panel-action" type="button" :disabled="loading" @click="load(true)">
            <RefreshCw :class="{ spinning: loading }" :size="15" />
            刷新图表
          </button>
        </div>

        <div class="chart-legend-note">
          <span><Info :size="14" /> 图表仅用于观察记录变化，不代表疾病风险或诊断结果。</span>
          <small>{{ chartSeriesCount }} 个特征序列</small>
        </div>

        <div v-if="loading && !series.length" class="chart-skeleton">
          <span v-for="index in 6" :key="index" />
        </div>
        <div v-else ref="chartRef" class="trend-chart" />
      </section>

      <aside class="insight-panel">
        <div class="insight-visual" aria-hidden="true">
          <span class="insight-halo" />
          <span class="insight-ring ring-small" />
          <span class="insight-ring ring-large" />
          <div class="insight-icon"><Leaf :size="32" :stroke-width="1.6" /></div>
        </div>

        <span class="page-kicker">SMART SUMMARY</span>
        <h2>{{ summaryTitle }}</h2>
        <p>{{ summaryText }}</p>

        <div class="insight-facts">
          <article>
            <span><Activity :size="15" /></span>
            <div><small>高频特征</small><strong>{{ topFeature?.label || "暂无" }}</strong></div>
          </article>
          <article>
            <span><Clock3 :size="15" /></span>
            <div><small>时间记录</small><strong>{{ timeline.length }} 条</strong></div>
          </article>
          <article>
            <span><TrendingDown :size="15" /></span>
            <div><small>消失特征</small><strong>{{ disappearedCount }} 项</strong></div>
          </article>
          <article>
            <span><ShieldAlert :size="15" /></span>
            <div><small>暂不支持</small><strong>{{ unsupportedCount }} 项</strong></div>
          </article>
        </div>

        <RouterLink class="insight-link" to="/analysis">
          继续积累新记录
          <ArrowRight :size="15" />
        </RouterLink>
      </aside>
    </div>

    <section class="timeline-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">REPORT TIMELINE</span>
          <h2>健康记录时间轴</h2>
          <p>按时间回顾每一次分析，点击记录可进入对应报告详情。</p>
        </div>
        <span class="panel-count">{{ timeline.length }} 条记录</span>
      </div>

      <div v-if="loading && !timeline.length" class="timeline-skeleton">
        <span v-for="index in 4" :key="index" />
      </div>

      <div v-else-if="timeline.length" class="timeline-track">
        <RouterLink
          v-for="(item, index) in timeline"
          :key="reportIdOf(item)"
          :to="`/reports/${reportIdOf(item)}`"
          class="timeline-item"
          :style="{ animationDelay: `${Math.min(index, 8) * 55}ms` }"
        >
          <span class="timeline-marker"><FileText :size="15" /></span>
          <time>{{ shortDate(createdAtOf(item)) }}</time>
          <h3>{{ item.feature_summary || "舌象分析报告" }}</h3>
          <p>{{ timelineDescription(item) }}</p>
          <footer>
            <span>报告 #{{ reportIdOf(item) }}</span>
            <ArrowRight :size="15" />
          </footer>
        </RouterLink>
      </div>

      <div v-else class="empty-trend-state">
        <div class="empty-visual" aria-hidden="true">
          <span class="empty-halo" />
          <span class="empty-orbit orbit-a" />
          <span class="empty-orbit orbit-b" />
          <div class="empty-icon"><TrendingUp :size="40" :stroke-width="1.65" /></div>
        </div>
        <span class="page-kicker">START YOUR TREND</span>
        <h3>从第一份报告开始建立趋势</h3>
        <p>完成多次舌象分析后，这里会形成连续的时间轴、特征曲线和报告对比。</p>
        <RouterLink class="empty-action" to="/analysis">
          开始舌象分析
          <ArrowRight :size="15" />
        </RouterLink>
      </div>
    </section>

    <section class="compare-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">REPORT COMPARISON</span>
          <h2>历史报告对比</h2>
          <p>选择两个不同时间点，查看新增、消失、持续和变化的结构化特征。</p>
        </div>
        <span class="compare-badge"><GitCompareArrows :size="15" /> 确定性差异计算</span>
      </div>

      <div class="compare-workspace">
        <div class="compare-selector">
          <label>
            <span><b>01</b> 基准报告</span>
            <select v-model.number="baseReportId" @change="compareResult = null">
              <option :value="0">选择较早的基准报告</option>
              <option v-for="item in timeline" :key="`base_${reportIdOf(item)}`" :value="reportIdOf(item)">
                #{{ reportIdOf(item) }} · {{ fullDate(createdAtOf(item)) }}
              </option>
            </select>
          </label>

          <span class="compare-arrow"><ArrowRight :size="20" /></span>

          <label>
            <span><b>02</b> 对比报告</span>
            <select v-model.number="targetReportId" @change="compareResult = null">
              <option :value="0">选择较新的对比报告</option>
              <option v-for="item in timeline" :key="`target_${reportIdOf(item)}`" :value="reportIdOf(item)">
                #{{ reportIdOf(item) }} · {{ fullDate(createdAtOf(item)) }}
              </option>
            </select>
          </label>

          <button class="compare-button" type="button" :disabled="compareDisabled" @click="compareReports">
            <RefreshCw v-if="compareLoading" class="spinning" :size="15" />
            <GitCompareArrows v-else :size="15" />
            {{ compareLoading ? "对比中" : "生成对比" }}
          </button>
        </div>

        <div v-if="compareResult" class="compare-result">
          <header>
            <span class="result-icon"><CircleCheck :size="20" /></span>
            <div>
              <span class="page-kicker">COMPARISON READY</span>
              <h3>报告差异已生成</h3>
            </div>
          </header>

          <p>{{ compareResult.explanation }}</p>

          <div class="compare-counts">
            <article><span class="count-added">{{ compareResult.added.length }}</span><small>新增特征</small></article>
            <article><span class="count-removed">{{ compareResult.removed.length }}</span><small>消失特征</small></article>
            <article><span class="count-persistent">{{ compareResult.persistent.length }}</span><small>持续特征</small></article>
            <article><span class="count-changed">{{ compareResult.changed.length }}</span><small>发生变化</small></article>
            <article><span>{{ compareResult.unsupported.length }}</span><small>暂不支持</small></article>
          </div>

          <div v-if="compareResult.observationSuggestions.length" class="suggestion-list">
            <span><Lightbulb :size="16" /> 后续观察建议</span>
            <ul>
              <li v-for="item in compareResult.observationSuggestions" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div v-else class="compare-placeholder">
          <span><GitCompareArrows :size="25" /></span>
          <div>
            <strong>选择两份不同报告开始对比</strong>
            <p>建议选择拍摄条件相近、时间间隔合理的报告，以获得更稳定的观察结果。</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="trend-note">
      <ShieldCheck :size="15" />
      <span>趋势与报告对比仅用于日常健康记录和观察，不构成疾病诊断或治疗建议。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  Check,
  CircleCheck,
  Clock3,
  Dumbbell,
  FileText,
  GitCompareArrows,
  Info,
  Leaf,
  Lightbulb,
  RefreshCw,
  Salad,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  MoonStar,
  Camera,
} from "lucide-vue-next";
import {
  featureLabel,
  healthPlanApi,
  tongueApi,
  trendApi,
  type CheckinSummary,
  type FeatureTrend,
  type ReportCompareResult,
  type TimelineItem,
  type TrendOverview,
  type TrendSeriesPoint,
} from "@tongue/shared";

const ranges = [
  { label: "近 30 天", days: 30 },
  { label: "近 90 天", days: 90 },
  { label: "近 6 个月", days: 180 },
];

const activeDays = ref(90);
const overview = ref<TrendOverview | null>(null);
const features = ref<FeatureTrend[]>([]);
const series = ref<TrendSeriesPoint[]>([]);
const timeline = ref<TimelineItem[]>([]);
const checkinSummary = ref<CheckinSummary | null>(null);
const baseReportId = ref(0);
const targetReportId = ref(0);
const loading = ref(false);
const compareLoading = ref(false);
const compareResult = ref<ReportCompareResult | null>(null);
const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const topFeature = computed(() => {
  if (series.value.length) {
    const counts = new Map<string, number>();
    for (const item of series.value) {
      if (item.status !== "DETECTED") continue;
      const code = item.featureCode || item.feature_code || "unknown";
      counts.set(code, (counts.get(code) || 0) + 1);
    }
    const entry = [...counts.entries()].sort((left, right) => right[1] - left[1])[0];
    return entry ? { label: featureLabel(entry[0]), count: entry[1] } : null;
  }

  const item = [...features.value].sort((left, right) => right.count - left.count)[0];
  const code = item?.featureCode || item?.feature_code;
  return item && code ? { label: featureLabel(code), count: item.count } : null;
});

const summaryTitle = computed(() => {
  if (!timeline.value.length) return "从第一份报告开始建立趋势";
  if (timeline.value.length < 3) return "正在积累更稳定的观察样本";
  if (disappearedCount.value > 0) return "部分特征正在发生可观察变化";
  return "您的健康记录正在形成连续趋势";
});

const summaryText = computed(() => {
  if (!timeline.value.length) {
    return "完成舌象分析后，系统会在这里生成按时间排列的特征变化和报告记录。";
  }
  if (!topFeature.value) {
    return `当前周期共有 ${timeline.value.length} 条报告记录。建议保持相似光照、拍摄距离和时间条件继续观察。`;
  }
  return `当前周期内“${topFeature.value.label}”出现 ${topFeature.value.count} 次。该结果只说明记录中的出现情况，不代表疾病判断。`;
});

const compareDisabled = computed(() => (
  compareLoading.value
  || !baseReportId.value
  || !targetReportId.value
  || baseReportId.value === targetReportId.value
));

const disappearedCount = computed(() => series.value.filter((item) => (
  item.changeType === "DISAPPEARED" || item.change_type === "DISAPPEARED"
)).length);

const unsupportedCount = computed(() => series.value.filter((item) => item.status === "UNSUPPORTED").length);

const chartSeriesCount = computed(() => new Set(
  series.value
    .filter((item) => item.status === "DETECTED")
    .map((item) => item.featureCode || item.feature_code)
    .filter(Boolean),
).size);

const executionItems = computed(() => [
  {
    key: "checkin",
    label: "总体打卡率",
    value: percent(checkinSummary.value?.checkinRate),
    rate: numericPercent(checkinSummary.value?.checkinRate),
    numeric: true,
    complete: false,
    icon: Check,
  },
  {
    key: "diet",
    label: "饮食任务",
    value: percent(checkinSummary.value?.dietRate),
    rate: numericPercent(checkinSummary.value?.dietRate),
    numeric: true,
    complete: false,
    icon: Salad,
  },
  {
    key: "sleep",
    label: "睡眠任务",
    value: percent(checkinSummary.value?.sleepRate),
    rate: numericPercent(checkinSummary.value?.sleepRate),
    numeric: true,
    complete: false,
    icon: MoonStar,
  },
  {
    key: "exercise",
    label: "运动任务",
    value: percent(checkinSummary.value?.exerciseRate),
    rate: numericPercent(checkinSummary.value?.exerciseRate),
    numeric: true,
    complete: false,
    icon: Dumbbell,
  },
  {
    key: "retake",
    label: "周期复拍",
    value: checkinSummary.value?.retakeCompleted ? "已完成" : "未完成",
    rate: "0%",
    numeric: false,
    complete: Boolean(checkinSummary.value?.retakeCompleted),
    icon: Camera,
  },
]);

async function load(showSuccess = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const [overviewData, featureData, timelineData, seriesData, checkinSummaryData] = await Promise.all([
      trendApi.overview(activeDays.value),
      trendApi.features(activeDays.value),
      trendApi.timeline(),
      trendApi.series(activeDays.value),
      healthPlanApi.summary(7),
    ]);

    overview.value = overviewData;
    features.value = featureData;
    timeline.value = timelineData;
    series.value = seriesData;
    checkinSummary.value = checkinSummaryData;

    if (!baseReportId.value && timeline.value.length >= 2) {
      targetReportId.value = reportIdOf(timeline.value[0]);
      baseReportId.value = reportIdOf(timeline.value[1]);
    }

    await nextTick();
    renderChart();
    if (showSuccess) ElMessage.success("趋势数据已刷新");
  } catch (error) {
    console.error("load trend data failed", error);
    ElMessage.error("趋势数据加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

async function changeRange(days: number) {
  if (loading.value || activeDays.value === days) return;
  activeDays.value = days;
  compareResult.value = null;
  await load();
}

function renderChart() {
  if (!chartRef.value) return;
  chart ||= echarts.init(chartRef.value);

  const labels = [...new Set(series.value.map((item) => shortDate(item.createdAt || item.created_at)))];
  const codes = [...new Set(
    series.value
      .filter((item) => item.status === "DETECTED")
      .map((item) => item.featureCode || item.feature_code)
      .filter((code): code is string => Boolean(code)),
  )].slice(0, 5);

  const colors = ["#2f8c59", "#4c7f9b", "#8870a6", "#b78235", "#5d9a8a"];
  const chartSeries = codes.map((code, index) => ({
    name: featureLabel(code),
    type: "line",
    data: labels.map((label) => {
      const point = series.value.find((item) => (
        shortDate(item.createdAt || item.created_at) === label
        && (item.featureCode || item.feature_code) === code
      ));
      return point?.status === "DETECTED" && typeof point.confidence === "number"
        ? Math.round(point.confidence * 100)
        : null;
    }),
    smooth: 0.38,
    connectNulls: false,
    symbol: "circle",
    symbolSize: 7,
    showSymbol: labels.length <= 12,
    lineStyle: { width: 2.5, color: colors[index] },
    itemStyle: { color: colors[index], borderColor: "#fffefa", borderWidth: 2 },
    areaStyle: index === 0
      ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(47, 140, 89, 0.18)" },
            { offset: 1, color: "rgba(47, 140, 89, 0.01)" },
          ]),
        }
      : undefined,
    emphasis: { focus: "series" },
  }));

  chart.setOption({
    animationDuration: 760,
    animationEasing: "cubicOut",
    color: colors,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(34, 52, 41, 0.95)",
      borderWidth: 0,
      padding: [10, 12],
      textStyle: { color: "#f7faf7", fontSize: 11 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(66, 139, 91, 0.35)", type: "dashed" } },
    },
    legend: {
      top: 3,
      left: 0,
      itemWidth: 18,
      itemHeight: 8,
      textStyle: { color: "#6f7c74", fontSize: 10 },
    },
    grid: { left: 18, right: 18, top: 52, bottom: 28, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dbe4dd" } },
      axisTick: { show: false },
      axisLabel: { color: "#7b877f", fontSize: 10, interval: 0, rotate: labels.length > 7 ? 22 : 0 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      splitNumber: 5,
      splitLine: { lineStyle: { color: "#edf2ee", type: "dashed" } },
      axisLabel: { color: "#8b958e", fontSize: 10, formatter: "{value}%" },
    },
    graphic: chartSeries.length
      ? []
      : [{
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "完成更多分析后，这里会形成特征趋势曲线",
            fill: "#8a958e",
            fontSize: 12,
          },
        }],
    series: chartSeries.length ? chartSeries : [{ type: "line", data: [] }],
  }, true);
}

function reportIdOf(item: TimelineItem) {
  return Number(item.reportId || item.report_id || 0);
}

function createdAtOf(item: TimelineItem) {
  return item.createdAt || item.created_at;
}

async function compareReports() {
  if (compareDisabled.value) return;
  compareLoading.value = true;

  try {
    compareResult.value = await tongueApi.compareReports(baseReportId.value, targetReportId.value);
    ElMessage.success("报告对比已生成");
  } catch (error) {
    console.error("compare reports failed", error);
    ElMessage.error("报告对比失败，请稍后重试");
  } finally {
    compareLoading.value = false;
  }
}

function timelineDescription(item: TimelineItem) {
  const summary = String(item.feature_summary || "").trim();
  if (!summary) return "查看本次分析中的舌象特征、解释和健康建议。";
  return summary.length > 46 ? `${summary.slice(0, 46)}…` : summary;
}

function shortDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fullDate(value?: string) {
  if (!value) return "时间未知";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "时间未知";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function percent(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "--";
}

function numericPercent(value?: number) {
  const normalized = typeof value === "number" ? Math.max(0, Math.min(1, value)) : 0;
  return `${Math.round(normalized * 100)}%`;
}

function resizeChart() {
  chart?.resize();
}

onMounted(() => {
  load();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chart?.dispose();
});
</script>

<style scoped>
.trends-page {
  --trend-ink: #182820;
  --trend-muted: #79857d;
  --trend-line: rgba(137, 155, 143, 0.22);
  --trend-green: #268b58;
  display: grid;
  gap: 18px;
  width: min(1220px, 100%);
  margin: 0 auto;
  padding-bottom: 8px;
}

.trends-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 62%) minmax(300px, 38%);
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 39px 44px;
  border: 1px solid var(--trend-line);
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

.page-kicker {
  display: block;
  color: #43805f;
  font-size: 10px;
  font-weight: 760;
  letter-spacing: 0.18em;
}

.trends-hero h1 {
  margin: 13px 0 0;
  color: var(--trend-ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(40px, 4.15vw, 57px);
  font-weight: 520;
  line-height: 1.17;
  letter-spacing: -0.055em;
  white-space: nowrap;
}

.trends-hero h1 span {
  color: var(--trend-green);
}

.trends-hero p {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--trend-muted);
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

.trend-spark {
  position: absolute;
  width: 17px;
  height: 17px;
}

.trend-spark::before,
.trend-spark::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999px;
  background: rgba(74, 151, 98, 0.3);
  content: "";
  transform: translate(-50%, -50%);
}

.trend-spark::before { width: 3px; height: 17px; }
.trend-spark::after { width: 17px; height: 3px; }
.spark-one { top: 31px; right: 36px; animation: sparkle 4s ease-in-out infinite; }
.spark-two { bottom: 29px; left: 32px; animation: sparkle 4.6s 1.1s ease-in-out infinite; }

.trend-stage {
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

.trend-glass {
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

.trend-glass::before {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(66, 150, 91, 0.16);
  border-radius: 44px 44px 32px 32px;
  content: "";
}

.trend-glass::after {
  position: absolute;
  top: -45%;
  left: -75%;
  width: 48%;
  height: 195%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.62), transparent);
  content: "";
  transform: rotate(18deg);
  animation: glass-shine 4.8s ease-in-out infinite;
}

.trend-symbol {
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

.insight-orbit {
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

.range-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 21px;
  border: 1px solid var(--trend-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.93);
  box-shadow: 0 10px 26px rgba(35, 66, 47, 0.04);
  animation: reveal-up 520ms 50ms ease-out both;
}

.range-bar strong {
  display: block;
  margin-top: 5px;
  color: #30453a;
  font-size: 13px;
}

.range-bar p {
  margin: 4px 0 0;
  color: #89938d;
  font-size: 9px;
}

.range-switch {
  display: inline-flex;
  gap: 6px;
  padding: 5px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 14px;
  background: #f3f7f4;
}

.range-switch button {
  min-height: 35px;
  padding: 0 13px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #758179;
  cursor: pointer;
  font-size: 10px;
  font-weight: 620;
  transition: background 180ms ease, box-shadow 180ms ease, color 180ms ease;
}

.range-switch button.active {
  background: white;
  color: #267e50;
  box-shadow: 0 6px 16px rgba(35, 66, 47, 0.08);
}

.range-switch button:disabled { cursor: wait; opacity: 0.55; }

.trend-overview {
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
  border: 1px solid var(--trend-line);
  border-radius: 19px;
  background: rgba(255, 255, 253, 0.94);
  box-shadow: 0 11px 28px rgba(35, 66, 47, 0.045);
  animation: reveal-up 520ms ease-out both;
}

.overview-card:nth-child(2) { animation-delay: 80ms; }
.overview-card:nth-child(3) { animation-delay: 140ms; }
.overview-card:nth-child(4) { animation-delay: 200ms; }

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
.overview-reports .overview-icon { background: #eaf1f7; color: #4d7998; }
.overview-reports::after { background: #edf4f8; }
.overview-features .overview-icon { background: #f0ecf7; color: #746097; }
.overview-features::after { background: #f5f0fa; }
.overview-latest .overview-icon { background: #fbefd8; color: #ad7412; }
.overview-latest::after { background: #fcf4e4; }

.overview-copy {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
}

.overview-copy small { color: #858f89; font-size: 9px; }
.overview-copy strong { margin-top: 5px; color: #21342a; font-size: 25px; font-weight: 700; line-height: 1; }
.overview-copy em { margin-left: 4px; font-size: 9px; font-style: normal; font-weight: 520; }
.overview-copy > span { margin-top: 8px; overflow: hidden; color: #949d97; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.execution-panel,
.chart-panel,
.insight-panel,
.timeline-panel,
.compare-panel {
  border: 1px solid var(--trend-line);
  border-radius: 23px;
  background: rgba(255, 255, 253, 0.95);
  box-shadow: 0 16px 38px rgba(35, 66, 47, 0.05);
}

.execution-panel {
  display: grid;
  grid-template-columns: minmax(300px, 0.85fr) minmax(500px, 1.15fr);
  align-items: center;
  gap: 23px;
  padding: 24px 26px;
  animation: reveal-up 560ms 170ms ease-out both;
}

.execution-heading {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.execution-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: #e7f2e9;
  color: #2f8757;
}

.execution-heading h2,
.panel-heading h2,
.insight-panel h2 {
  margin: 7px 0 0;
  color: #26382e;
  font-size: 22px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.execution-heading p,
.panel-heading p {
  margin: 7px 0 0;
  color: #89938d;
  font-size: 10px;
  line-height: 1.65;
}

.execution-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.execution-card {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 70px;
  padding: 10px;
  border: 1px solid rgba(137, 155, 143, 0.14);
  border-radius: 14px;
  background: #f1f6f2;
}

.execution-card-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: white;
  color: #3d7f58;
}

.execution-card > span:nth-child(2) {
  display: grid;
  min-width: 0;
}

.execution-card strong { color: #315d43; font-size: 14px; }
.execution-card small { margin-top: 3px; color: #77827a; font-size: 8px; white-space: nowrap; }

.execution-card i {
  --rate: 0%;
  position: relative;
  width: 5px;
  height: 38px;
  overflow: hidden;
  border-radius: 999px;
  background: #dce7df;
}

.execution-card i b {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--rate);
  border-radius: inherit;
  background: linear-gradient(180deg, #63b780, #2f8959);
  transition: height 400ms ease;
}

.execution-state { color: #318857; }
.execution-state.pending { color: #9aa39d; }
.execution-card.complete { background: #eaf5ed; border-color: rgba(61, 145, 91, 0.21); }

.trend-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(285px, 0.5fr);
  gap: 17px;
}

.chart-panel {
  padding: 25px 27px 20px;
  animation: reveal-up 560ms 210ms ease-out both;
}

.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.panel-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid rgba(75, 101, 86, 0.15);
  border-radius: 10px;
  background: #f8faf7;
  color: #45614f;
  cursor: pointer;
  font-size: 10px;
}

.panel-action:disabled { cursor: wait; opacity: 0.55; }

.chart-legend-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 17px;
  padding: 9px 11px;
  border-radius: 11px;
  background: #f6f9f6;
  color: #7e8982;
  font-size: 9px;
}

.chart-legend-note span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chart-legend-note small { color: #42805d; }

.trend-chart {
  width: 100%;
  height: 370px;
  margin-top: 4px;
}

.chart-skeleton {
  display: grid;
  align-items: end;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
  height: 350px;
  padding: 45px 30px 30px;
}

.chart-skeleton span {
  border-radius: 12px 12px 3px 3px;
  background: linear-gradient(180deg, #e1eee4, #f1f6f2);
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

.chart-skeleton span:nth-child(1) { height: 32%; }
.chart-skeleton span:nth-child(2) { height: 58%; animation-delay: 0.1s; }
.chart-skeleton span:nth-child(3) { height: 42%; animation-delay: 0.2s; }
.chart-skeleton span:nth-child(4) { height: 72%; animation-delay: 0.3s; }
.chart-skeleton span:nth-child(5) { height: 54%; animation-delay: 0.4s; }
.chart-skeleton span:nth-child(6) { height: 82%; animation-delay: 0.5s; }

.insight-panel {
  position: relative;
  overflow: hidden;
  padding: 26px;
  background:
    radial-gradient(circle at 100% 100%, rgba(211, 232, 207, 0.88), transparent 48%),
    linear-gradient(150deg, #fafcf8, #eef5ea);
  animation: reveal-up 560ms 260ms ease-out both;
}

.insight-panel > * { position: relative; z-index: 2; }
.insight-panel p { margin: 15px 0 0; color: #68736b; font-size: 11px; line-height: 1.85; }

.insight-visual {
  position: relative;
  z-index: 1 !important;
  width: 124px;
  height: 106px;
  margin: -4px auto 19px;
}

.insight-halo {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: rgba(68, 159, 98, 0.18);
  filter: blur(22px);
  transform: translateX(-50%);
}

.insight-ring {
  position: absolute;
  left: 50%;
  border: 1px dashed rgba(61, 133, 84, 0.22);
  border-radius: 50%;
  transform: translateX(-50%);
}

.ring-small { bottom: 13px; width: 88px; height: 28px; }
.ring-large { bottom: 7px; width: 122px; height: 42px; animation: insight-orbit 6s ease-in-out infinite; }

.insight-icon {
  position: absolute;
  top: 7px;
  left: 50%;
  display: grid;
  width: 67px;
  height: 72px;
  place-items: center;
  border: 1px solid rgba(66, 150, 91, 0.18);
  border-radius: 24px 24px 19px 19px;
  background: linear-gradient(155deg, #fff, #dfeee1);
  color: #397e55;
  box-shadow: 0 12px 22px rgba(43, 125, 75, 0.13);
  transform: translateX(-50%);
  animation: insight-float 4.8s ease-in-out infinite;
}

.insight-facts {
  display: grid;
  gap: 8px;
  margin-top: 21px;
}

.insight-facts article {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid rgba(128, 151, 135, 0.17);
}

.insight-facts article > span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.65);
  color: #3c8057;
}

.insight-facts article > div { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.insight-facts small { color: #7c877f; font-size: 9px; }
.insight-facts strong { color: #315d43; font-size: 10px; text-align: right; }

.insight-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  margin-top: 18px;
  border: 1px solid rgba(47, 129, 80, 0.16);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.64);
  color: #2f7e50;
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
}

.timeline-panel,
.compare-panel {
  padding: 25px 27px;
  animation: reveal-up 560ms 290ms ease-out both;
}

.panel-count {
  color: #89938d;
  font-size: 10px;
}

.timeline-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.timeline-track::before {
  position: absolute;
  top: 24px;
  right: 15px;
  left: 15px;
  height: 1px;
  background: #dbe5de;
  content: "";
}

.timeline-item {
  position: relative;
  z-index: 1;
  display: grid;
  min-height: 174px;
  padding: 17px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 17px;
  background: #fffefa;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(35, 66, 47, 0.035);
  animation: card-enter 430ms ease-out both;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.timeline-item:hover {
  border-color: rgba(47, 134, 81, 0.3);
  box-shadow: 0 14px 29px rgba(35, 66, 47, 0.08);
  transform: translateY(-3px);
}

.timeline-marker {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 4px solid #fffefa;
  border-radius: 14px;
  background: #e6f1e9;
  color: #2f8254;
  box-shadow: 0 0 0 1px #dce8df, 0 7px 13px rgba(49, 130, 84, 0.1);
}

.timeline-item time { margin-top: 14px; color: #3b7150; font-size: 9px; font-weight: 680; }
.timeline-item h3 { margin: 7px 0 0; color: #30443a; font-size: 13px; }
.timeline-item p { margin: 8px 0 0; color: #78837c; font-size: 9px; line-height: 1.65; }
.timeline-item footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 13px; color: #5f7c6a; font-size: 9px; }

.timeline-skeleton {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.timeline-skeleton span {
  height: 174px;
  border-radius: 17px;
  background: linear-gradient(90deg, #edf1ed 25%, #f8faf8 50%, #edf1ed 75%);
  background-size: 200% 100%;
  animation: skeleton 1.4s linear infinite;
}

.empty-trend-state {
  display: grid;
  min-height: 340px;
  margin-top: 22px;
  place-items: center;
  align-content: center;
  padding: 34px 20px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 19px;
  background:
    radial-gradient(circle at 50% 30%, rgba(218, 238, 222, 0.5), transparent 27%),
    linear-gradient(180deg, #fffefa, #fbfdfb);
  text-align: center;
}

.empty-trend-state h3 { margin: 12px 0 0; color: #293b31; font-size: 19px; }
.empty-trend-state > p { max-width: 510px; margin: 8px 0 0; color: #7c8780; font-size: 10px; line-height: 1.7; }

.empty-visual { position: relative; width: 145px; height: 118px; margin-bottom: 9px; }
.empty-halo { position: absolute; top: 10px; left: 50%; width: 98px; height: 98px; border-radius: 50%; background: rgba(72, 169, 103, 0.15); filter: blur(23px); transform: translateX(-50%); }
.empty-orbit { position: absolute; left: 50%; border: 1px dashed rgba(56, 145, 86, 0.22); border-radius: 50%; transform: translateX(-50%); }
.orbit-a { bottom: 10px; width: 140px; height: 44px; animation: empty-orbit 6s ease-in-out infinite; }
.orbit-b { bottom: 17px; width: 104px; height: 28px; animation: empty-orbit 7s 0.8s ease-in-out infinite reverse; }
.empty-icon { position: absolute; top: 8px; left: 50%; z-index: 2; display: grid; width: 74px; height: 82px; place-items: center; border: 1px solid rgba(64, 149, 91, 0.18); border-radius: 26px 26px 21px 21px; background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(224, 242, 228, 0.86)); color: #357f55; box-shadow: 0 14px 25px rgba(43, 125, 75, 0.13); transform: translateX(-50%); animation: empty-float 4.8s ease-in-out infinite; }

.empty-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  margin-top: 18px;
  padding: 0 13px;
  border-radius: 10px;
  background: #28774d;
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
  font-size: 10px;
  font-weight: 680;
  text-decoration: none;
}

.compare-panel { animation-delay: 330ms; }

.compare-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: #edf5ef;
  color: #3f7554;
  font-size: 9px;
}

.compare-workspace {
  margin-top: 21px;
  padding: 17px;
  border: 1px solid rgba(137, 155, 143, 0.18);
  border-radius: 18px;
  background: #f7f9f7;
}

.compare-selector {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 38px minmax(220px, 1fr) auto;
  align-items: end;
  gap: 12px;
}

.compare-selector label {
  display: grid;
  gap: 8px;
}

.compare-selector label > span {
  color: #536a5c;
  font-size: 9px;
  font-weight: 680;
}

.compare-selector label b {
  margin-right: 5px;
  color: #2f8958;
  font-size: 9px;
}

.compare-selector select {
  width: 100%;
  min-height: 42px;
  padding: 0 11px;
  border: 1px solid rgba(144, 161, 150, 0.27);
  border-radius: 12px;
  outline: 0;
  background: white;
  color: #40584a;
  font-size: 10px;
}

.compare-selector select:focus { border-color: rgba(43, 137, 83, 0.42); box-shadow: 0 0 0 3px rgba(48, 143, 88, 0.08); }

.compare-arrow {
  display: grid;
  width: 38px;
  height: 42px;
  place-items: center;
  color: #72907e;
}

.compare-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #286f49;
  border-radius: 12px;
  background: linear-gradient(150deg, #398d5e, #246b46);
  color: white;
  box-shadow: 0 8px 17px rgba(37, 111, 72, 0.16);
  cursor: pointer;
  font-size: 10px;
  font-weight: 680;
}

.compare-button:disabled { cursor: not-allowed; opacity: 0.44; box-shadow: none; }

.compare-placeholder {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  margin-top: 15px;
  padding: 15px;
  border: 1px dashed rgba(119, 143, 127, 0.25);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
}

.compare-placeholder > span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background: #e9f2eb;
  color: #3c8057;
}

.compare-placeholder strong { color: #385244; font-size: 11px; }
.compare-placeholder p { margin: 5px 0 0; color: #7b867f; font-size: 9px; line-height: 1.6; }

.compare-result {
  display: grid;
  gap: 15px;
  margin-top: 15px;
  padding: 18px;
  border: 1px solid rgba(63, 143, 90, 0.2);
  border-radius: 16px;
  background: linear-gradient(135deg, #f4faf5, #fffefa);
}

.compare-result header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: #dfeee2;
  color: #2f8757;
}

.compare-result h3 { margin: 5px 0 0; color: #30443a; font-size: 14px; }
.compare-result > p { margin: 0; color: #68756d; font-size: 10px; line-height: 1.75; }

.compare-counts {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.compare-counts article {
  display: grid;
  gap: 4px;
  padding: 11px;
  border-radius: 12px;
  background: white;
  text-align: center;
}

.compare-counts span { color: #53685c; font-size: 16px; font-weight: 700; }
.compare-counts small { color: #8a958e; font-size: 8px; }
.count-added { color: #2f8958 !important; }
.count-removed { color: #b45b50 !important; }
.count-persistent { color: #4c7d98 !important; }
.count-changed { color: #956eae !important; }

.suggestion-list {
  padding: 14px;
  border-radius: 13px;
  background: rgba(235, 244, 237, 0.72);
}

.suggestion-list > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3e6f53;
  font-size: 9px;
  font-weight: 680;
}

.suggestion-list ul { display: grid; gap: 7px; margin: 10px 0 0; padding-left: 17px; }
.suggestion-list li { color: #6e7a72; font-size: 9px; line-height: 1.6; }

.trend-note {
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
select:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(54, 150, 96, 0.2);
  outline-offset: 2px;
}

.spinning { animation: spin 0.9s linear infinite; }

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stage-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes glass-shine {
  0%, 58% { left: -75%; opacity: 0; }
  66% { opacity: 1; }
  83%, 100% { left: 135%; opacity: 0; }
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
  50% { opacity: 0.42; transform: scale(1) rotate(45deg); }
}

@keyframes grid-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 22px 15px, 22px 15px; }
}

@keyframes insight-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

@keyframes insight-orbit {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(9deg) scale(1.04); }
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

@keyframes skeleton-pulse {
  from { opacity: 0.55; transform: scaleY(0.96); }
  to { opacity: 1; transform: scaleY(1); }
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .trends-hero {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-inline: 34px;
  }

  .trends-hero h1 { font-size: clamp(37px, 3.9vw, 49px); }
  .trend-stage { right: 3%; }
  .trend-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .execution-panel {
    grid-template-columns: 1fr;
  }

  .execution-grid {
    grid-template-columns: repeat(5, minmax(100px, 1fr));
  }

  .compare-selector {
    grid-template-columns: 1fr 34px 1fr;
  }

  .compare-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .trends-hero {
    grid-template-columns: 1fr;
    min-height: 235px;
  }

  .trends-hero h1 { white-space: normal; }
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

  .trend-main-grid {
    grid-template-columns: 1fr;
  }

  .execution-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .insight-panel {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    column-gap: 22px;
  }

  .insight-panel .page-kicker,
  .insight-panel h2,
  .insight-panel > p,
  .insight-facts,
  .insight-link {
    grid-column: 2;
  }

  .insight-visual {
    grid-row: 1 / 7;
    align-self: center;
  }
}

@media (max-width: 720px) {
  .trends-page { gap: 14px; }

  .trends-hero {
    min-height: auto;
    padding: 29px 23px;
    border-radius: 22px;
  }

  .trends-hero h1 { font-size: clamp(34px, 10vw, 47px); }
  .hero-copy { max-width: 100%; }
  .hero-visual { display: none; }

  .range-bar,
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .range-switch {
    width: 100%;
  }

  .range-switch button {
    flex: 1;
  }

  .trend-overview {
    grid-template-columns: 1fr;
  }

  .execution-panel,
  .chart-panel,
  .insight-panel,
  .timeline-panel,
  .compare-panel {
    padding: 21px 20px;
    border-radius: 20px;
  }

  .execution-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insight-panel {
    display: block;
  }

  .timeline-track {
    grid-template-columns: 1fr;
  }

  .timeline-track::before {
    display: none;
  }

  .timeline-skeleton {
    grid-template-columns: 1fr;
  }

  .compare-badge {
    margin-top: 4px;
  }

  .compare-selector {
    grid-template-columns: 1fr;
  }

  .compare-arrow {
    width: 100%;
    height: 26px;
    transform: rotate(90deg);
  }

  .compare-counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .trends-hero { padding: 26px 20px; }
  .trends-hero p { font-size: 13px; }
  .hero-actions a,
  .hero-actions button { flex: 1; }

  .range-bar { padding: 16px; }
  .range-switch { overflow-x: auto; }
  .range-switch button { min-width: 92px; }

  .overview-card {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 17px;
  }

  .overview-icon { width: 44px; height: 44px; }

  .execution-heading {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .execution-icon { width: 42px; height: 42px; }

  .execution-grid {
    grid-template-columns: 1fr;
  }

  .execution-card {
    min-height: 62px;
  }

  .trend-chart {
    height: 310px;
  }

  .chart-legend-note {
    align-items: flex-start;
    flex-direction: column;
  }

  .compare-counts {
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .trends-hero,
  .range-bar,
  .overview-card,
  .execution-panel,
  .chart-panel,
  .insight-panel,
  .timeline-panel,
  .compare-panel,
  .timeline-item,
  .visual-grid,
  .visual-orbit,
  .visual-dot,
  .trend-spark,
  .trend-stage,
  .trend-glass::after,
  .insight-icon,
  .insight-ring,
  .empty-icon,
  .empty-orbit,
  .timeline-skeleton span,
  .chart-skeleton span,
  .spinning {
    animation: none;
  }

  .primary-action,
  .ghost-action,
  .range-switch button,
  .timeline-item,
  .compare-button {
    transition: none;
  }

  .primary-action:hover,
  .ghost-action:hover,
  .timeline-item:hover {
    transform: none;
  }
}
</style>
