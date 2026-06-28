<template>
  <section class="trend-page">
    <header class="trend-head">
      <div>
        <span class="page-kicker">健康趋势</span>
        <h1>趋势分析</h1>
        <p>基于历史报告观察舌象特征的出现频率与记录节奏。</p>
      </div>
      <div class="range-switch">
        <button
          v-for="item in ranges"
          :key="item.days"
          type="button"
          :class="{ active: activeDays === item.days }"
          @click="changeRange(item.days)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <section class="metrics-row">
      <article>
        <span class="metric-icon green"><CalendarCheck2 :size="18" /></span>
        <div><small>连续记录</small><strong>{{ overview?.days || activeDays }}<em>天</em></strong><p>当前统计观察周期</p></div>
      </article>
      <article>
        <span class="metric-icon blue"><FileText :size="18" /></span>
        <div><small>分析次数</small><strong>{{ overview?.report_count || 0 }}<em>次</em></strong><p>周期内完成的报告</p></div>
      </article>
      <article>
        <span class="metric-icon purple"><ScanLine :size="18" /></span>
        <div><small>特征记录</small><strong>{{ overview?.feature_count || 0 }}<em>项</em></strong><p>结构化识别结果</p></div>
      </article>
      <article>
        <span class="metric-icon warm"><Sparkles :size="18" /></span>
        <div><small>最新报告</small><strong>{{ overview?.latest_report_id || "--" }}</strong><p>最近一次报告编号</p></div>
      </article>
    </section>

    <div class="trend-content-grid">
      <section class="chart-panel">
        <div class="panel-heading">
          <div>
            <span class="page-kicker">特征变化</span>
            <h2>特征出现频率</h2>
            <p>展示所选周期内各类结构化特征的累计出现次数。</p>
          </div>
          <button class="refresh-button" type="button" @click="load">
            <RefreshCw :size="15" />
            刷新
          </button>
        </div>
        <div ref="chartRef" class="chart" />
      </section>

      <aside class="ai-summary">
        <div class="summary-illustration" aria-hidden="true">
          <span class="leaf leaf-one" />
          <span class="leaf leaf-two" />
          <span class="leaf leaf-three" />
        </div>
        <span class="page-kicker">智能趋势总结</span>
        <h2>{{ summaryTitle }}</h2>
        <p>{{ summaryText }}</p>
        <div class="summary-facts">
          <span><strong>{{ topFeature?.label || "暂无" }}</strong> 高频特征</span>
          <span><strong>{{ timeline.length }}</strong> 条时间记录</span>
          <span><strong>{{ disappearedCount }}</strong> 消失特征</span>
          <span><strong>{{ unsupportedCount }}</strong> 暂不支持</span>
        </div>
      </aside>
    </div>

    <section class="timeline-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">报告时间</span>
          <h2>报告时间轴</h2>
          <p>按时间回顾每一次舌象记录。</p>
        </div>
      </div>

      <div v-if="timeline.length" class="timeline-track">
        <RouterLink
          v-for="item in timeline"
          :key="item.report_id"
          :to="`/reports/${item.report_id}`"
          class="timeline-item"
        >
          <span class="timeline-dot" />
          <strong>{{ shortDate(item.created_at) }}</strong>
          <p>{{ item.feature_summary || "舌象分析报告" }}</p>
          <small>报告 #{{ item.report_id }}</small>
        </RouterLink>
      </div>
      <EmptyState v-else title="暂无趋势数据" description="完成多次分析后，这里会形成趋势。" />
    </section>

    <section class="compare-panel">
      <div class="panel-heading">
        <div>
          <span class="page-kicker">报告对比</span>
          <h2>历史报告对比</h2>
          <p>选择两份报告，后端计算确定性差异，Agent 负责解释。</p>
        </div>
      </div>
      <div class="compare-controls">
        <select v-model.number="baseReportId">
          <option :value="0">选择基准报告</option>
          <option v-for="item in timeline" :key="`base_${reportIdOf(item)}`" :value="reportIdOf(item)">
            #{{ reportIdOf(item) }} {{ shortDate(createdAtOf(item)) }}
          </option>
        </select>
        <select v-model.number="targetReportId">
          <option :value="0">选择对比报告</option>
          <option v-for="item in timeline" :key="`target_${reportIdOf(item)}`" :value="reportIdOf(item)">
            #{{ reportIdOf(item) }} {{ shortDate(createdAtOf(item)) }}
          </option>
        </select>
        <button class="refresh-button" type="button" :disabled="compareDisabled" @click="compareReports">
          <RefreshCw :size="15" />
          对比
        </button>
      </div>
      <div v-if="compareResult" class="compare-result">
        <p>{{ compareResult.explanation }}</p>
        <div class="compare-counts">
          <span>新增 {{ compareResult.added.length }}</span>
          <span>消失 {{ compareResult.removed.length }}</span>
          <span>持续 {{ compareResult.persistent.length }}</span>
          <span>变化 {{ compareResult.changed.length }}</span>
          <span>不支持 {{ compareResult.unsupported.length }}</span>
        </div>
        <ul>
          <li v-for="item in compareResult.observationSuggestions" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { CalendarCheck2, FileText, RefreshCw, ScanLine, Sparkles } from "lucide-vue-next";
import {
  EmptyState,
  featureLabel,
  tongueApi,
  trendApi,
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
const baseReportId = ref(0);
const targetReportId = ref(0);
const compareLoading = ref(false);
const compareResult = ref<ReportCompareResult | null>(null);
const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const topFeature = computed(() => {
  if (series.value.length) {
    const counts = new Map<string, number>();
    for (const item of series.value) {
      if (item.status !== "DETECTED") continue;
      const code = item.featureCode || item.feature_code;
      counts.set(code, (counts.get(code) || 0) + 1);
    }
    const entry = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return entry ? { label: featureLabel(entry[0]), count: entry[1] } : null;
  }
  const item = [...features.value].sort((a, b) => b.count - a.count)[0];
  return item ? { label: featureLabel(item.featureCode || item.feature_code), count: item.count } : null;
});
const summaryTitle = computed(() => {
  if (!timeline.value.length) return "从第一份报告开始建立趋势";
  if (timeline.value.length < 3) return "正在积累更稳定的观察样本";
  return "你的舌象记录正在形成连续趋势";
});
const summaryText = computed(() => {
  if (!timeline.value.length) return "完成舌象分析后，系统会在这里生成按时间排列的特征变化。";
  if (!topFeature.value) return `当前周期共有 ${timeline.value.length} 条报告记录，建议保持相似拍摄条件继续观察。`;
  return `当前周期内“${topFeature.value.label}”出现 ${topFeature.value.count} 次。趋势变化仅用于日常健康观察，不作为诊断结论。`;
});
const compareDisabled = computed(() => compareLoading.value || !baseReportId.value || !targetReportId.value || baseReportId.value === targetReportId.value);
const disappearedCount = computed(() => series.value.filter((item) => item.changeType === "DISAPPEARED" || item.change_type === "DISAPPEARED").length);
const unsupportedCount = computed(() => series.value.filter((item) => item.status === "UNSUPPORTED").length);

async function load() {
  const [overviewData, featureData, timelineData, seriesData] = await Promise.all([
    trendApi.overview(activeDays.value),
    trendApi.features(activeDays.value),
    trendApi.timeline(),
    trendApi.series(activeDays.value),
  ]);
  overview.value = overviewData;
  features.value = featureData;
  timeline.value = timelineData;
  series.value = seriesData;
  if (!baseReportId.value && timeline.value.length >= 2) {
    targetReportId.value = reportIdOf(timeline.value[0]);
    baseReportId.value = reportIdOf(timeline.value[1]);
  }
  await nextTick();
  renderChart();
}

async function changeRange(days: number) {
  activeDays.value = days;
  await load();
}

function renderChart() {
  if (!chartRef.value) return;
  chart ||= echarts.init(chartRef.value);
  const labels = [...new Set(series.value.map((item) => shortDate(item.createdAt || item.created_at)))];
  const codes = [...new Set(series.value.filter((item) => item.status === "DETECTED").map((item) => item.featureCode || item.feature_code))].slice(0, 5);
  const chartSeries = codes.map((code) => ({
    name: featureLabel(code),
    type: "line",
    data: labels.map((label) => {
      const point = series.value.find((item) => shortDate(item.createdAt || item.created_at) === label && (item.featureCode || item.feature_code) === code);
      return point?.status === "DETECTED" && typeof point.confidence === "number" ? Math.round(point.confidence * 100) : null;
    }),
    smooth: 0.35,
    symbol: "circle",
    symbolSize: 7,
  }));
  chart.setOption({
    animationDuration: 700,
    tooltip: { trigger: "axis", backgroundColor: "rgba(38, 55, 45, 0.94)", borderWidth: 0, textStyle: { color: "#f6f8f5", fontSize: 11 } },
    grid: { left: 40, right: 22, top: 34, bottom: 52, containLabel: true },
    xAxis: { type: "category", data: labels, boundaryGap: false, axisLine: { lineStyle: { color: "#d9e2db" } }, axisTick: { show: false }, axisLabel: { color: "#7b877f", fontSize: 10, interval: 0, rotate: labels.length > 6 ? 22 : 0 } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "#edf1ed" } }, axisLabel: { color: "#8b958e", fontSize: 10 } },
    series: chartSeries.length ? chartSeries : [{ type: "line", data: [] }],
  });
}

function reportIdOf(item: TimelineItem) {
  return item.reportId || item.report_id;
}

function createdAtOf(item: TimelineItem) {
  return item.createdAt || item.created_at;
}

async function compareReports() {
  if (compareDisabled.value) return;
  compareLoading.value = true;
  try {
    compareResult.value = await tongueApi.compareReports(baseReportId.value, targetReportId.value);
  } finally {
    compareLoading.value = false;
  }
}

function shortDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
.trend-page {
  display: grid;
  gap: 18px;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.trend-head,
.panel-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-kicker {
  display: block;
  color: #3f7058;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.trend-head h1 {
  margin: 9px 0 0;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 500;
  letter-spacing: -0.055em;
}

.trend-head p,
.panel-heading p {
  margin: 10px 0 0;
  color: #7a857d;
  font-size: 12px;
  line-height: 1.7;
}

.range-switch {
  display: inline-flex;
  gap: 5px;
  padding: 5px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 12px;
  background: rgba(255, 254, 249, 0.82);
}

.range-switch button {
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #7b867f;
  cursor: pointer;
  font-size: 10px;
}

.range-switch button.active { background: #e7efe9; color: #2e6849; font-weight: 700; }

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metrics-row article {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  min-height: 128px;
  padding: 18px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 18px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 12px 32px rgba(54, 75, 63, 0.045);
}

.metric-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; }
.metric-icon.green { background: #e4f0e8; color: #357350; }
.metric-icon.blue { background: #e5eff2; color: #487582; }
.metric-icon.purple { background: #ece8f3; color: #71688f; }
.metric-icon.warm { background: #f6ead9; color: #9c6c36; }
.metrics-row article div { display: grid; }
.metrics-row small { color: #858f88; font-size: 9px; }
.metrics-row strong { margin-top: 5px; color: #2d5540; font-size: 25px; }
.metrics-row em { margin-left: 4px; font-size: 10px; font-style: normal; font-weight: 500; }
.metrics-row p { margin: 4px 0 0; color: #959d97; font-size: 9px; }

.trend-content-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(270px, 0.5fr); gap: 16px; }
.chart-panel,
.ai-summary,
.timeline-panel,
.compare-panel {
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 22px;
  background: rgba(255, 254, 249, 0.88);
  box-shadow: 0 14px 38px rgba(54, 75, 63, 0.05);
}
.chart-panel,
.timeline-panel,
.compare-panel { padding: 24px; }
.panel-heading h2,
.ai-summary h2 { margin: 8px 0 0; color: #2c3930; font-size: 22px; font-weight: 620; letter-spacing: -0.035em; }
.refresh-button { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 11px; border: 1px solid rgba(75, 101, 86, 0.15); border-radius: 10px; background: #f8faf7; color: #45614f; cursor: pointer; font-size: 10px; }
.chart { width: 100%; height: 350px; }

.ai-summary {
  position: relative;
  overflow: hidden;
  padding: 26px;
  background:
    radial-gradient(circle at 100% 100%, rgba(212, 229, 206, 0.85), transparent 48%),
    linear-gradient(150deg, #f8faf5, #eef4e9);
}
.ai-summary p { margin: 15px 0 0; color: #667269; font-size: 12px; line-height: 1.85; }
.summary-facts { display: grid; gap: 9px; margin-top: 24px; }
.summary-facts span { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid rgba(128, 151, 135, 0.17); color: #7c877f; font-size: 10px; }
.summary-facts strong { color: #315d43; }
.summary-illustration { position: absolute; right: -12px; bottom: -8px; width: 150px; height: 120px; opacity: 0.3; }
.leaf { position: absolute; width: 40px; height: 72px; border: 2px solid #5f8a6c; border-radius: 80% 0 80% 0; transform-origin: bottom center; }
.leaf-one { left: 50px; bottom: 0; transform: rotate(-20deg); }
.leaf-two { left: 78px; bottom: 2px; transform: rotate(20deg) scale(0.8); }
.leaf-three { left: 25px; bottom: -8px; transform: rotate(-45deg) scale(0.65); }

.timeline-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 28px;
}
.timeline-track::before { position: absolute; top: 9px; right: 0; left: 0; height: 1px; background: #dbe5de; content: ""; }
.timeline-item { position: relative; z-index: 1; display: grid; justify-items: start; min-height: 132px; padding: 0 10px 12px; color: inherit; text-decoration: none; }
.timeline-dot { width: 12px; height: 12px; margin: 3px 0 18px; border: 3px solid #e9f1eb; border-radius: 50%; background: #2e7750; box-shadow: 0 0 0 1px #2e7750; }
.timeline-item strong { color: #314d3d; font-size: 12px; }
.timeline-item p { margin: 7px 0; color: #768179; font-size: 10px; line-height: 1.55; }
.timeline-item small { color: #3d7052; font-size: 9px; }

.compare-controls { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.compare-controls select {
  min-height: 38px;
  min-width: 180px;
  border: 1px solid rgba(183, 194, 184, 0.66);
  border-radius: 10px;
  background: #fffef9;
  color: #40584a;
  font-size: 12px;
}
.compare-result { display: grid; gap: 12px; margin-top: 18px; color: #667269; font-size: 12px; line-height: 1.75; }
.compare-counts { display: flex; flex-wrap: wrap; gap: 8px; }
.compare-counts span { padding: 6px 9px; border-radius: 999px; background: #edf3ee; color: #315d43; font-size: 10px; }

@media (max-width: 980px) {
  .metrics-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .trend-content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 700px) {
  .trend-head,
  .panel-heading { align-items: flex-start; flex-direction: column; }
  .metrics-row { grid-template-columns: 1fr; }
  .range-switch { width: 100%; overflow-x: auto; }
}
</style>
