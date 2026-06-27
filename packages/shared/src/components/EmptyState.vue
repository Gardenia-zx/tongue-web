<template>
  <div class="empty-state">
    <span class="empty-icon" aria-hidden="true">
      <component :is="icon" :size="24" :stroke-width="1.7" />
    </span>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { FileSearch } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    icon?: unknown;
  }>(),
  {
    title: "暂无数据",
    description: "当前还没有可展示的内容。",
    icon: () => FileSearch,
  },
);
</script>

<style scoped>
.empty-state {
  display: grid;
  min-height: 290px;
  place-items: center;
  align-content: center;
  padding: 48px 24px;
  border: 1px solid rgba(185, 194, 184, 0.68);
  border-radius: var(--th-radius-lg);
  background:
    radial-gradient(circle at 50% 0, rgba(226, 235, 229, 0.78), transparent 20rem),
    rgba(255, 254, 253, 0.72);
  color: var(--th-text-muted);
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 16px;
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.empty-state h3 {
  margin: 18px 0 7px;
  color: var(--th-text);
  font-size: 20px;
  font-weight: 640;
  letter-spacing: -0.03em;
}

.empty-state p {
  max-width: 46ch;
  margin: 0;
  font-size: 13px;
  line-height: 1.75;
  text-wrap: pretty;
}
</style>
