<template>
  <RouterView v-if="$route.meta.public" />
  <AppShell
    v-else
    title="医生审核工作台"
    subtitle="医生端"
    home-path="/workbench"
    :nav-items="navItems"
  >
    <RouterView />
  </AppShell>
</template>

<script setup lang="ts">
import { AppShell, type NavItem } from "@tongue/shared";

const navItems: NavItem[] = [
  { label: "工作台", to: "/workbench" },
  { label: "审核队列", to: "/reviews" },
  { label: "医生资料", to: "/profile" },
];
</script>
