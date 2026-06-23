<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <RouterLink class="brand" :to="homePath">
        <span class="brand-mark">舌</span>
        <span>
          <strong>{{ title }}</strong>
          <small>{{ subtitle }}</small>
        </span>
      </RouterLink>

      <nav class="app-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link">
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <section class="app-main">
      <header class="topbar">
        <div>
          <h1>{{ currentTitle }}</h1>
          <p>{{ currentSubtitle }}</p>
        </div>
        <div class="user-area">
          <el-tag v-if="auth.user" effect="light">{{ auth.user.role }}</el-tag>
          <span v-if="auth.user">{{ auth.user.nickname || auth.user.phone }}</span>
          <el-button v-if="auth.user" size="small" @click="handleLogout">退出</el-button>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import type { NavItem } from "../types";

const props = defineProps<{
  title: string;
  subtitle: string;
  homePath: string;
  navItems: NavItem[];
}>();

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const currentTitle = computed(() => String(route.meta.title || props.title));
const currentSubtitle = computed(() => String(route.meta.subtitle || props.subtitle));

async function handleLogout() {
  await auth.logout();
  await router.replace("/login");
}
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
}

.app-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 20px 16px;
  border-right: 1px solid var(--th-border);
  background: var(--th-surface);
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--th-radius);
  background: var(--th-primary);
  color: #fff;
  font-weight: 700;
}

.brand strong,
.brand small {
  display: block;
}

.brand small {
  margin-top: 2px;
  color: var(--th-text-muted);
  font-size: 12px;
}

.app-nav {
  display: grid;
  gap: 4px;
  margin-top: 24px;
}

.nav-link {
  padding: 11px 12px;
  border-radius: var(--th-radius);
  color: var(--th-text-muted);
  font-weight: 600;
}

.nav-link.router-link-active {
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.app-main {
  min-width: 0;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 28px;
  border-bottom: 1px solid var(--th-border);
  background: rgba(255, 255, 255, 0.92);
}

.topbar h1 {
  margin: 0;
  font-size: 24px;
}

.topbar p {
  margin: 4px 0 0;
  color: var(--th-text-muted);
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--th-text-muted);
}

.content {
  padding: 24px 28px 40px;
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--th-border);
  }

  .app-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }

  .content {
    padding: 18px;
  }
}
</style>
