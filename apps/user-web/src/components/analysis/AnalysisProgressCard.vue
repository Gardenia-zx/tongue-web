<template>
  <div class="process-card">
    <div class="process-head">
      <div>
        <span class="process-kicker">TONGUE ANALYSIS</span>
        <strong>{{ label }}</strong>
      </div>
      <span>{{ percent }}%</span>
    </div>
    <div class="progress-track"><i :style="{ width: `${percent}%` }"></i></div>
    <div class="process-steps">
      <div v-for="step in steps" :key="step.key" :class="['process-step', step.state]">
        <span class="step-icon">
          <Check v-if="step.state === 'done'" :size="14" />
          <LoaderCircle v-else-if="step.state === 'active'" :size="15" class="spin" />
          <Circle v-else :size="12" />
        </span>
        <div><strong>{{ step.title }}</strong><small>{{ step.description }}</small></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, Circle, LoaderCircle } from 'lucide-vue-next';
import type { TaskStatus } from '@tongue/shared';

const props = defineProps<{ phase?: string; task?: TaskStatus }>();
const stage = computed(() => String(props.phase || props.task?.currentStage || props.task?.status || 'PENDING').toUpperCase());
const rank = computed(() => {
  if (stage.value === 'MODEL_ANALYZING' || stage.value === 'RUNNING') return 1;
  if (stage.value === 'REPORT_GENERATING' || stage.value === 'REPORT_READY' || stage.value === 'COMPLETED') return 3;
  return 0;
});
const label = computed(() => {
  if (props.phase === 'UPLOADING') return '正在上传并校验舌象图片';
  if (rank.value === 0) return '图片已接收，等待开始分析';
  if (rank.value === 1) return '舌象模型正在识别图像特征';
  return '正在分析结果并生成健康管理建议';
});
const percent = computed(() => {
  if (props.phase === 'UPLOADING') return 5;
  if (typeof props.task?.progress === 'number') return Math.max(8, Math.min(99, Math.round(props.task.progress * 100)));
  return rank.value === 1 ? 15 : rank.value === 3 ? 85 : 8;
});
const steps = computed(() => [
  { key: 'upload', title: '图片上传与校验', description: '检查图片和任务上下文' },
  { key: 'model', title: '舌象模型分析', description: '识别舌质、舌苔与局部特征' },
  { key: 'result', title: '结果分析', description: '结合识别结果与用户描述' },
  { key: 'report', title: '建议生成', description: '整理饮食、睡眠和运动建议' },
].map((item, index) => ({ ...item, state: index < rank.value ? 'done' : index === rank.value ? 'active' : 'waiting' })));
</script>

<style scoped>
.process-card{display:grid;gap:15px;width:min(590px,calc(100vw - 92px));padding:18px;border:1px solid #d9e7df;border-radius:16px;background:linear-gradient(145deg,#fbfdfc,#f3f8f5)}
.process-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.process-head>div{display:grid;gap:5px}.process-kicker{color:#56806a;font-size:9px;font-weight:750;letter-spacing:.14em}.process-head strong{color:#294638;font-size:15px}.process-head>span{color:#347253;font-size:22px;font-weight:750}
.progress-track{overflow:hidden;height:6px;border-radius:999px;background:#e0eae4}.progress-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#347253,#7caf8d);transition:width .35s ease}
.process-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.process-step{display:grid;grid-template-columns:27px minmax(0,1fr);gap:8px;padding:9px 7px;border-radius:11px;color:#8a948e}.process-step.active{background:#eaf4ed;color:#2f6d4c}.process-step.done{color:#4c765f}.step-icon{display:grid;width:25px;height:25px;place-items:center;border-radius:50%;background:#e7ece8}.process-step strong{display:block;font-size:11px}.process-step small{display:block;margin-top:3px;font-size:9px;line-height:1.4}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.spin{animation:none}}@media(max-width:760px){.process-card{width:min(100%,calc(100vw - 76px));padding:14px}.process-steps{grid-template-columns:1fr}}
</style>
