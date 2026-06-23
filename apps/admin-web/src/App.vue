<template>
  <RouterView v-if="$route.meta.public" />
  <AppShell
    v-else
    title="舌诊管理后台"
    subtitle="管理端"
    home-path="/dashboard"
    :nav-items="navItems"
  >
    <RouterView />
  </AppShell>
</template>

<script setup lang="ts">
import { AppShell, type NavItem } from "@tongue/shared";

const navItems: NavItem[] = [
  { label: "总览", to: "/dashboard" },
  { label: "用户", to: "/users" },
  { label: "医生审核", to: "/doctors" },
  { label: "报告", to: "/reports" },
  { label: "任务", to: "/tasks" },
  { label: "审核订单", to: "/reviews" },
  { label: "系统配置", to: "/system-config" },
  { label: "审计日志", to: "/audit-logs" },
  { label: "指标", to: "/metrics" },
];
</script>
