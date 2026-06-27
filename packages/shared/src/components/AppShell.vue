<template>
  <div class="app-layout" :class="{ 'nav-open': mobileNavOpen }">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <button v-if="mobileNavOpen" class="nav-backdrop" type="button" aria-label="关闭导航" @click="mobileNavOpen = false" />

    <aside class="app-sidebar" aria-label="主导航">
      <div class="sidebar-head">
        <RouterLink class="brand" :to="homePath" @click="mobileNavOpen = false">
          <span class="brand-mark" aria-hidden="true"><Activity :size="20" :stroke-width="1.7" /></span>
          <span class="brand-copy">
            <strong>{{ title }}</strong>
            <small>{{ subtitle }}</small>
          </span>
        </RouterLink>
        <button class="sidebar-close" type="button" aria-label="关闭导航" @click="mobileNavOpen = false">
          <X :size="19" :stroke-width="1.7" />
        </button>
      </div>

      <nav class="app-nav">
        <span class="nav-label">健康空间</span>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          @click="mobileNavOpen = false"
        >
          <component :is="navIcon(item.to)" :size="18" :stroke-width="1.7" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <ChevronRight class="nav-chevron" :size="15" :stroke-width="1.7" aria-hidden="true" />
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <div class="privacy-note">
          <ShieldCheck :size="17" :stroke-width="1.7" aria-hidden="true" />
          <span>健康数据仅用于当前账号的分析与管理</span>
        </div>
      </div>
    </aside>

    <section class="app-main">
      <header class="topbar">
        <div class="topbar-start">
          <button class="menu-button" type="button" aria-label="打开导航" @click="mobileNavOpen = true">
            <Menu :size="20" :stroke-width="1.7" />
          </button>
          <div class="page-heading">
            <span class="page-kicker">个人健康空间</span>
            <h1>{{ currentTitle }}</h1>
            <p>{{ currentSubtitle }}</p>
          </div>
        </div>

        <div v-if="auth.user" class="user-area">
          <span class="user-avatar" aria-hidden="true"><UserRound :size="17" :stroke-width="1.7" /></span>
          <span class="user-copy">
            <strong>{{ auth.user.nickname || auth.user.phone }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
          <button class="logout-button" type="button" aria-label="退出登录" title="退出登录" @click="handleLogout">
            <LogOut :size="18" :stroke-width="1.7" />
          </button>
        </div>
      </header>

      <main id="main-content" class="content">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-vue-next";
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
const mobileNavOpen = ref(false);

const currentTitle = computed(() => String(route.meta.title || props.title));
const currentSubtitle = computed(() => String(route.meta.subtitle || props.subtitle));
const roleLabel = computed(() => {
  const role = auth.user?.role;
  if (role === "DOCTOR") return "医生账号";
  if (role === "ADMIN") return "管理账号";
  return "个人账号";
});

const icons: Record<string, Component> = {
  "/analysis": Activity,
  "/reports": FileText,
  "/trends": BarChart3,
  "/reviews": ClipboardCheck,
  "/doctors": Stethoscope,
  "/notifications": Bell,
  "/profile": UserRound,
  "/privacy": LockKeyhole,
};

function navIcon(path: string) {
  return icons[path] || UsersRound;
}

async function handleLogout() {
  await auth.logout();
  await router.replace("/login");
}
</script>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  min-height: 100dvh;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: 12px;
  left: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--th-primary-dark);
  color: white;
  transform: translateY(-160%);
  transition: transform var(--th-transition);
}

.skip-link:focus {
  transform: translateY(0);
}

.app-sidebar {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  height: 100dvh;
  flex-direction: column;
  padding: 22px 16px 18px;
  border-right: 1px solid rgba(185, 194, 184, 0.7);
  background: rgba(247, 247, 242, 0.93);
  backdrop-filter: blur(20px);
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 5px 7px;
  border-radius: 14px;
}

.brand-mark {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border: 1px solid rgba(41, 72, 58, 0.15);
  border-radius: 13px;
  background: var(--th-primary-dark);
  color: #f8faf7;
  box-shadow: 0 10px 24px rgba(41, 72, 58, 0.18);
}

.brand-copy {
  min-width: 0;
}

.brand strong,
.brand small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand strong {
  font-size: 14px;
  font-weight: 680;
  letter-spacing: -0.025em;
}

.brand small {
  margin-top: 3px;
  color: var(--th-text-muted);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.sidebar-close,
.menu-button,
.logout-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--th-text-muted);
  cursor: pointer;
  transition: color var(--th-transition), background var(--th-transition), transform var(--th-transition);
}

.sidebar-close {
  display: none;
}

.sidebar-close:hover,
.menu-button:hover,
.logout-button:hover {
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
}

.sidebar-close:active,
.menu-button:active,
.logout-button:active {
  transform: scale(0.96);
}

.app-nav {
  display: grid;
  gap: 5px;
  margin-top: 34px;
}

.nav-label {
  padding: 0 12px 9px;
  color: #839087;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.nav-link {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 11px;
  border-radius: 13px;
  color: var(--th-text-muted);
  font-size: 14px;
  font-weight: 560;
  transition: color var(--th-transition), background var(--th-transition), transform var(--th-transition);
}

.nav-link:hover {
  background: rgba(226, 235, 229, 0.66);
  color: var(--th-primary-dark);
  transform: translateX(2px);
}

.nav-link.router-link-active {
  background: var(--th-primary-soft);
  color: var(--th-primary-dark);
  box-shadow: 0 0 0 1px rgba(63, 101, 82, 0.08) inset;
}

.nav-chevron {
  opacity: 0;
  transition: opacity var(--th-transition), transform var(--th-transition);
}

.nav-link:hover .nav-chevron,
.nav-link.router-link-active .nav-chevron {
  opacity: 0.72;
  transform: translateX(1px);
}

.sidebar-foot {
  margin-top: auto;
  padding: 18px 7px 2px;
}

.privacy-note {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 9px;
  padding: 13px;
  border: 1px solid rgba(185, 194, 184, 0.56);
  border-radius: 14px;
  background: rgba(255, 254, 253, 0.58);
  color: var(--th-text-muted);
  font-size: 11px;
  line-height: 1.55;
}

.app-main {
  min-width: 0;
}

.topbar {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  min-height: 88px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 15px clamp(22px, 3vw, 42px);
  border-bottom: 1px solid rgba(185, 194, 184, 0.55);
  background: rgba(247, 247, 243, 0.82);
  backdrop-filter: blur(22px) saturate(120%);
}

.topbar-start {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
}

.menu-button {
  display: none;
  flex: 0 0 40px;
}

.page-heading {
  min-width: 0;
}

.page-kicker {
  display: block;
  margin-bottom: 3px;
  color: var(--th-primary);
  font-size: 10px;
  font-weight: 720;
  letter-spacing: 0.13em;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(19px, 2vw, 24px);
  font-weight: 660;
  letter-spacing: -0.035em;
  line-height: 1.2;
}

.topbar p {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--th-text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-area {
  display: grid;
  grid-template-columns: 36px minmax(0, auto) 40px;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--th-border);
  border-radius: 12px;
  background: var(--th-surface);
  color: var(--th-primary-dark);
}

.user-copy strong,
.user-copy small {
  display: block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-copy strong {
  font-size: 13px;
  font-weight: 650;
}

.user-copy small {
  margin-top: 2px;
  color: var(--th-text-muted);
  font-size: 11px;
}

.content {
  width: min(100%, calc(var(--th-content) + 80px));
  margin: 0 auto;
  padding: 28px clamp(18px, 3vw, 40px) 48px;
}

.nav-backdrop {
  display: none;
}

@media (max-width: 960px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-sidebar {
    position: fixed;
    left: 0;
    width: min(290px, calc(100vw - 48px));
    transform: translateX(-105%);
    transition: transform 280ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .nav-open .app-sidebar {
    transform: translateX(0);
  }

  .sidebar-close,
  .menu-button {
    display: grid;
  }

  .nav-backdrop {
    position: fixed;
    z-index: 25;
    inset: 0;
    display: block;
    border: 0;
    background: rgba(30, 40, 34, 0.32);
    backdrop-filter: blur(3px);
  }

  .topbar {
    min-height: 76px;
  }
}

@media (max-width: 640px) {
  .topbar {
    min-height: 70px;
    padding: 12px 14px;
  }

  .page-kicker,
  .topbar p,
  .user-copy {
    display: none;
  }

  .topbar h1 {
    font-size: 19px;
  }

  .user-area {
    grid-template-columns: 34px 38px;
    gap: 5px;
  }

  .user-avatar {
    width: 34px;
    height: 34px;
  }

  .content {
    padding: 18px 12px 32px;
  }
}
</style>
