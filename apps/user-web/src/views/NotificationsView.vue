<template>
  <section class="th-panel th-section">
    <div class="th-toolbar">
      <div>
        <h2 class="th-title">通知</h2>
        <p class="th-subtitle">分析完成、审核状态变化会在这里提醒。</p>
      </div>
      <div>
        <el-button @click="load">刷新</el-button>
        <el-button type="primary" @click="readAll">全部已读</el-button>
      </div>
    </div>

    <EmptyState v-if="items.length === 0" title="暂无通知" description="任务和审核状态变化后会生成通知。" />
    <div v-else class="notice-list">
      <article v-for="item in items" :key="item.id" :class="{ unread: !item.readAt }">
        <header>
          <strong>{{ item.title || item.type || "系统通知" }}</strong>
          <span>{{ formatDateTime(item.createdAt) }}</span>
        </header>
        <p>{{ item.content }}</p>
        <el-button v-if="!item.readAt" link type="primary" @click="read(item.id)">标记已读</el-button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EmptyState, formatDateTime, notificationApi, type NotificationItem } from "@tongue/shared";

const items = ref<NotificationItem[]>([]);

async function load() {
  items.value = await notificationApi.list();
}

async function read(id: number) {
  await notificationApi.read(id);
  await load();
}

async function readAll() {
  await notificationApi.readAll();
  await load();
}

onMounted(load);
</script>

<style scoped>
.notice-list {
  display: grid;
  gap: 10px;
}

.notice-list article {
  padding: 14px;
  border: 1px solid var(--th-border);
  border-radius: var(--th-radius);
}

.notice-list article.unread {
  border-color: var(--th-primary);
  background: var(--th-primary-soft);
}

.notice-list header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.notice-list span,
.notice-list p {
  color: var(--th-text-muted);
}
</style>
