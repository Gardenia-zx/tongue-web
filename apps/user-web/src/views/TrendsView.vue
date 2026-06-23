<template>
  <div class="trend-page">
    <section class="metrics-row">
      <MetricCard label="近 30 天报告" :value="overview?.report_count || 0" :icon="FileText" />
      <MetricCard label="近 30 天特征" :value="overview?.feature_count || 0" :icon="Activity" />
      <MetricCard label="最新报告" :value="overview?.latest_report_id || '-'" :icon="Clock3" />
    </section>

    <section class="th-panel th-section">
      <div class="th-toolbar">
        <div>
          <h2 class="th-title">特征频率</h2>
          <p class="th-subtitle">统计近 90 天内结构化舌象特征出现次数。</p>
        </div>
        <el-button @click="load">刷新</el-button>
      </div>
      <div ref="chartRef" class="chart"></div>
    </section>

    <section class="th-panel th-section">
      <h2 class="th-title">报告时间线</h2>
      <el-timeline class="timeline">
        <el-timeline-item v-for="item in timeline" :key="item.report_id" :timestamp="formatDateTime(item.created_at)">
          <RouterLink :to="`/reports/${item.report_id}`">
            报告 {{ item.report_id }} · {{ item.feature_summary || "暂无摘要" }}
          </RouterLink>
        </el-timeline-item>
      </el-timeline>
      <EmptyState v-if="timeline.length === 0" title="暂无趋势数据" description="完成多次分析后，这里会形成趋势。" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { Activity, Clock3, FileText } from "lucide-vue-next";
import { EmptyState, MetricCard, featureLabel, formatDateTime, trendApi, type FeatureTrend, type TimelineItem, type TrendOverview } from "@tongue/shared";

const overview = ref<TrendOverview | null>(null);
const features = ref<FeatureTrend[]>([]);
const timeline = ref<TimelineItem[]>([]);
const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

async function load() {
  const [overviewData, featureData, timelineData] = await Promise.all([
    trendApi.overview(30),
    trendApi.features(90),
    trendApi.timeline(),
  ]);
  overview.value = overviewData;
  features.value = featureData;
  timeline.value = timelineData;
  renderChart();
}

function renderChart() {
  if (!chartRef.value) return;
  chart ||= echarts.init(chartRef.value);
  chart.setOption({
    tooltip: {},
    grid: { left: 48, right: 20, top: 24, bottom: 42 },
    xAxis: { type: "category", data: features.value.map((item) => featureLabel(item.feature_code)) },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        type: "bar",
        data: features.value.map((item) => item.count),
        itemStyle: { color: "#0f8a6b" },
        barMaxWidth: 42,
      },
    ],
  });
}

onMounted(load);
</script>

<style scoped>
.trend-page {
  display: grid;
  gap: 18px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.chart {
  width: 100%;
  height: 320px;
}

.timeline {
  margin-top: 18px;
}

@media (max-width: 900px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>
