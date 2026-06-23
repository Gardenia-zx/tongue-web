<template>
  <div class="metric-card">
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
    <component :is="icon" v-if="icon" :size="26" stroke-width="1.8" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  icon?: unknown;
}>();
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
  padding: 18px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
  background: var(--th-surface);
}

.metric-card span {
  display: block;
  color: var(--th-text-muted);
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
}

.metric-card svg {
  color: var(--th-primary);
}
</style>
