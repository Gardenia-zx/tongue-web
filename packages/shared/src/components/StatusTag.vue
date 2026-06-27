<template>
  <span class="status-badge" :class="tone">
    <span class="status-dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { statusText } from "../utils/format";

const props = defineProps<{
  status?: string;
}>();

const label = computed(() => statusText(props.status));

const tone = computed(() => {
  const value = String(props.status || "").toUpperCase();
  if (["COMPLETED", "APPROVED", "SUCCESS", "ACTIVE", "PAID"].includes(value)) return "success";
  if (["FAILED", "REJECTED", "CANCELED", "ERROR"].includes(value)) return "danger";
  if (["PROCESSING", "RUNNING", "PENDING", "WAITING"].includes(value)) return "warning";
  return "neutral";
});
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  border: 1px solid var(--th-border);
  border-radius: 8px;
  background: rgba(255, 254, 253, 0.72);
  color: var(--th-text-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.success {
  border-color: rgba(71, 116, 91, 0.22);
  background: rgba(226, 235, 229, 0.78);
  color: var(--th-success);
}

.status-badge.warning {
  border-color: rgba(139, 112, 64, 0.22);
  background: rgba(245, 239, 225, 0.82);
  color: var(--th-warning);
}

.status-badge.danger {
  border-color: rgba(157, 81, 76, 0.2);
  background: rgba(249, 232, 229, 0.72);
  color: var(--th-danger);
}
</style>
