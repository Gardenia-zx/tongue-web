<template>
  <div class="analysis-page">
    <section class="assistant-shell replacement-assistant">
      <div class="replacement-heading">
        <div><span>健康助手</span><h2>继续提问或上传新的舌象照片</h2></div>
        <small><i></i> 在线</small>
      </div>
      <AnalysisChatView />
    </section>
    <PremiumAnalysisView class="legacy-dashboard" />
  </div>
</template>

<script setup lang="ts">
import PremiumAnalysisView from './PremiumAnalysisView.vue';
import AnalysisChatView from './AnalysisChatView.vue';
</script>

<style scoped>
.analysis-page { display: flex; flex-direction: column; }
.legacy-dashboard { order: 1; }
.replacement-assistant { order: 2; width: min(1180px,100%); margin: 20px auto 0; overflow: hidden; border: 1px solid rgba(183,194,184,.65); border-radius: 24px; background: #fff; box-shadow: 0 18px 48px rgba(54,75,63,.08); }
.analysis-page :deep(.legacy-dashboard > .assistant-shell) { display: none; }
.replacement-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 28px 14px; }
.replacement-heading span { display: block; color: #3f7058; font-size: 10px; font-weight: 750; letter-spacing: .16em; }
.replacement-heading h2 { margin: 8px 0 0; color: #2f3a31; font-size: 22px; }
.replacement-heading small { display: inline-flex; align-items: center; gap: 7px; color: #668072; }
.replacement-heading small i { width: 8px; height: 8px; border-radius: 50%; background: #42a66d; box-shadow: 0 0 0 4px rgba(66,166,109,.12); }
</style>
