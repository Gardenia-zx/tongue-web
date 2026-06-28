<template>
  <RouterView v-if="$route.meta.public" />
  <AppShell
    v-else
    title="舌知健康"
    subtitle="TONGUE WELLNESS"
    home-path="/analysis"
    :nav-items="navItems"
  >
    <RouterView />
  </AppShell>
</template>

<script setup lang="ts">
import { AppShell, type NavItem } from "@tongue/shared";

const navItems: NavItem[] = [
  { label: "首页", to: "/analysis" },
  { label: "我的报告", to: "/reports" },
  { label: "趋势分析", to: "/trends" },
  { label: "医生复核", to: "/reviews" },
  { label: "医生列表", to: "/doctors" },
  { label: "通知中心", to: "/notifications" },
  { label: "个人中心", to: "/profile" },
  { label: "隐私设置", to: "/privacy" },
];
</script>
