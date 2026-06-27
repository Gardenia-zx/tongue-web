<template>
  <ReportDetailView />
</template>

<script setup lang="ts">
import ReportDetailView from "./ReportDetailView.vue";
</script>

<style scoped>
:deep(.detail-layout) {
  width: min(1120px, 100%);
  max-width: none;
  margin: 0 auto;
}

:deep(.detail-layout > .th-panel) {
  overflow: hidden;
  border: 1px solid rgba(185, 194, 184, 0.7);
  border-radius: 26px;
  background: rgba(251, 250, 247, 0.92);
  box-shadow: var(--th-shadow-sm);
}

:deep(.detail-layout .th-title) {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 590;
  letter-spacing: -0.055em;
}

:deep(.detail-layout .th-subtitle) {
  max-width: 58ch;
  margin-top: 10px;
  line-height: 1.75;
}

:deep(.detail-layout .el-button--primary) {
  min-height: 44px;
  border-radius: 13px;
  box-shadow: 0 10px 24px rgba(41, 72, 58, 0.16);
}

:deep(.detail-section) {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(216, 221, 213, 0.9);
}

:deep(.detail-section h3) {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.025em;
}

:deep(.feature-tags) {
  gap: 9px;
}

:deep(.feature-tags .el-tag) {
  min-height: 32px;
  padding: 0 11px;
  border-color: rgba(63, 101, 82, 0.18);
  border-radius: 9px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
  font-weight: 620;
}

:deep(.rag-query) {
  display: inline-flex;
  margin: 0 0 16px;
  padding: 8px 11px;
  border-radius: 10px;
  background: var(--th-surface-soft);
  color: var(--th-text-muted);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
}

:deep(.evidence-list) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

:deep(.evidence-list article) {
  padding: 18px;
  border: 1px solid rgba(185, 194, 184, 0.66);
  border-radius: 17px;
  background: rgba(255, 254, 253, 0.76);
  transition: border-color var(--th-transition), box-shadow var(--th-transition), transform var(--th-transition);
}

:deep(.evidence-list article:hover) {
  border-color: rgba(63, 101, 82, 0.32);
  box-shadow: var(--th-shadow-sm);
  transform: translateY(-2px);
}

:deep(.evidence-list p) {
  color: var(--th-text-muted);
  font-size: 13px;
  line-height: 1.78;
  text-wrap: pretty;
}

:deep(.evidence-list span) {
  color: var(--th-primary);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
}

:deep(.el-alert) {
  margin-top: 26px;
  border: 1px solid rgba(139, 112, 64, 0.18);
  border-radius: 14px;
  background: rgba(245, 239, 225, 0.72);
}

:deep(.raw-json) {
  margin-top: 22px;
  padding: 12px 14px;
  border: 1px solid var(--th-border);
  border-radius: 13px;
  background: rgba(233, 237, 231, 0.46);
}

:deep(.raw-json pre) {
  max-height: 360px;
  margin: 12px 0 0;
  border-radius: 12px;
  background: #253129;
  color: #e9eee9;
  font-size: 12px;
}

@media (max-width: 760px) {
  :deep(.detail-layout > .th-panel) {
    border-radius: 22px;
  }

  :deep(.detail-layout .th-toolbar) {
    flex-direction: column;
  }

  :deep(.evidence-list) {
    grid-template-columns: 1fr;
  }
}
</style>
