<template>
  <div class="empty-state">
    <component :is="icon" :size="36" stroke-width="1.8" />
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
  place-items: center;
  min-height: 220px;
  padding: 32px 20px;
  border: 1px dashed var(--th-border-strong);
  border-radius: var(--th-radius);
  color: var(--th-text-muted);
  text-align: center;
}

.empty-state h3 {
  margin: 14px 0 4px;
  color: var(--th-text);
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  max-width: 420px;
  line-height: 1.7;
}
</style>
