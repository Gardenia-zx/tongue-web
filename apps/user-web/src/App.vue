<template>
  <RouterView v-if="$route.meta.public" />
  <AppShell
    v-else
    title="舌象健康管理"
    subtitle="用户端"
    home-path="/analysis"
    :nav-items="navItems"
  >
    <RouterView />
  </AppShell>
</template>

<script setup lang="ts">
import { AppShell, type NavItem } from "@tongue/shared";

const navItems: NavItem[] = [
  { label: "舌象分析", to: "/analysis" },
  { label: "历史报告", to: "/reports" },
  { label: "趋势分析", to: "/trends" },
  { label: "医生审核", to: "/reviews" },
  { label: "医生列表", to: "/doctors" },
  { label: "通知", to: "/notifications" },
  { label: "个人资料", to: "/profile" },
  { label: "隐私", to: "/privacy" },
];
</script>
